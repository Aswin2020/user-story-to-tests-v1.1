import fetch from 'node-fetch'

export interface JiraIssue {
  id: string
  key: string
  fields: {
    summary: string
    description: string | null
  }
}

export interface JiraUserStory {
  id: string
  key: string
  title: string
  description: string
}

export interface JiraSprint {
  id: number
  name: string
  state: string
  startDate?: string
  endDate?: string
}

export class JiraService {
  private baseUrl: string
  private email: string
  private apiKey: string

  constructor(baseUrl: string, email: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '') // Remove trailing slash
    this.email = email
    this.apiKey = apiKey

    console.log(`🔗 JiraService initialized:`)
    console.log(`   Base URL: ${this.baseUrl}`)
    console.log(`   Email: ${this.email}`)
    console.log(`   API Key: ${apiKey.substring(0, 10)}...`)
  }

  private getAuthHeader(): string {
    const credentials = `${this.email}:${this.apiKey}`
    const encoded = Buffer.from(credentials).toString('base64')
    return `Basic ${encoded}`
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log(`🧪 Testing Jira connection...`)
      const response = await fetch(`${this.baseUrl}/rest/api/3/myself`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.error(`❌ Connection test failed: ${response.status} ${response.statusText}`)
        const errorText = await response.text()
        console.error(`Error details: ${errorText}`)
        return false
      }

      const user = await response.json() as any
      console.log(`✅ Connection successful! Logged in as: ${user.displayName}`)
      return true
    } catch (error) {
      console.error(`❌ Connection test error:`, error)
      return false
    }
  }

  async getUserStories(projectKey?: string, sprintId?: number): Promise<JiraUserStory[]> {
    try {
      console.log(`📝 Fetching user stories from Jira...`)
      console.log(`   Project Key: ${projectKey || 'not specified'}`)
      console.log(`   Sprint ID: ${sprintId || 'not specified'}`)
      
      // Build JQL query - fetch issues with type Story or Task
      let jql = 'type in (Story, Task) ORDER BY created DESC'
      
      if (projectKey) {
        jql = `project = ${projectKey} AND type in (Story, Task) ORDER BY created DESC`
      }

      // Add sprint filter if sprintId is provided
      if (sprintId) {
        jql = `sprint = ${sprintId} AND type in (Story, Task) ORDER BY created DESC`
        if (projectKey) {
          jql = `project = ${projectKey} AND sprint = ${sprintId} AND type in (Story, Task) ORDER BY created DESC`
        }
      }

      console.log(`🔍 JQL Query: ${jql}`)

      // Use the new /rest/api/3/search/jql endpoint with POST method
      const response = await fetch(`${this.baseUrl}/rest/api/3/search/jql`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jql: jql,
          maxResults: 50,
          fields: ['summary', 'description']
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Failed to fetch stories: ${response.status} - ${errorText}`)
        throw new Error(`Jira API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json() as any
      console.log(`📊 Found ${data.issues?.length || 0} issues`)

      if (!data.issues || data.issues.length === 0) {
        console.log(`⚠️ No user stories found`)
        return []
      }

      const stories: JiraUserStory[] = data.issues.map((issue: JiraIssue) => ({
        id: issue.id,
        key: issue.key,
        title: issue.fields.summary,
        description: this.formatDescription(issue.fields.description) || issue.fields.summary
      }))

      console.log(`✅ Successfully fetched ${stories.length} user stories`)
      stories.forEach((story, idx) => {
        console.log(`   ${idx + 1}. [${story.key}] ${story.title}`)
      })

      return stories
    } catch (error) {
      console.error(`❌ Error fetching user stories:`, error)
      throw error
    }
  }

  async getProjects(): Promise<Array<{ key: string; name: string }>> {
    try {
      console.log(`📁 Fetching Jira projects...`)
      
      const response = await fetch(`${this.baseUrl}/rest/api/3/project/search?maxResults=100`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch projects: ${response.status} - ${errorText}`)
      }

      const data = await response.json() as any
      const projects = data.values?.map((p: any) => ({
        key: p.key,
        name: p.name
      })) || []

      console.log(`✅ Found ${projects.length} projects`)
      return projects
    } catch (error) {
      console.error(`❌ Error fetching projects:`, error)
      throw error
    }
  }

  async getSprints(projectKey: string): Promise<JiraSprint[]> {
    try {
      console.log(`📅 Fetching sprints for project: ${projectKey}...`)
      
      // Step 1: Get the board ID for the project using Jira Agile API
      console.log(`🔍 Getting board for project ${projectKey}...`)
      const boardResponse = await fetch(`${this.baseUrl}/rest/agile/1.0/board?projectKeyOrId=${projectKey}`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        }
      })

      if (!boardResponse.ok) {
        const errorText = await boardResponse.text()
        console.error(`❌ Failed to fetch board: ${boardResponse.status}`)
        return []
      }

      const boardData = await boardResponse.json() as any
      
      if (!boardData.values || boardData.values.length === 0) {
        console.log(`⚠️ No boards found for project ${projectKey}`)
        return []
      }

      const boardId = boardData.values[0].id
      console.log(`✅ Found board ID: ${boardId} (${boardData.values[0].name})`)

      // Step 2: Get sprints for the board
      const response = await fetch(`${this.baseUrl}/rest/agile/1.0/board/${boardId}/sprint`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Failed to fetch sprints: ${response.status}`)
        return []
      }

      const data = await response.json() as any
      console.log(`📊 Raw sprint response:`, JSON.stringify(data.values?.slice(0, 2), null, 2))
      
      const sprints = data.values?.map((s: any) => ({
        id: s.id,
        name: s.name,
        state: s.state.toLowerCase(),
        startDate: s.startDate,
        endDate: s.endDate
      })) || []

      console.log(`📊 All sprints retrieved:`, sprints.map((s: JiraSprint) => ({ id: s.id, name: s.name, state: s.state })))

      // Filter to active sprints (open/active) but include future sprints
      const filteredSprints = sprints.filter((s: JiraSprint) => 
        s.state === 'active' || s.state === 'future'
      )

      console.log(`✅ Found ${filteredSprints.length} active/future sprints`)
      filteredSprints.forEach((sprint: JiraSprint) => {
        console.log(`   - [ID: ${sprint.id}] ${sprint.name} (${sprint.state})`)
      })

      return filteredSprints
    } catch (error) {
      console.error(`❌ Error fetching sprints:`, error)
      return [] // Return empty array instead of throwing to gracefully handle errors
    }
  }

  private formatDescription(description: any): string {
    if (!description) return ''
    
    // If it's a string, return as-is
    if (typeof description === 'string') {
      return description
    }
    
    // If it's an object (Atlassian Document Format), extract text
    if (typeof description === 'object') {
      // ADF structure: { type: 'doc', version: 1, content: [...] }
      if (description.content && Array.isArray(description.content)) {
        return this.extractTextFromADF(description.content)
      }
    }
    
    return ''
  }

  private extractTextFromADF(content: any[]): string {
    let text = ''
    
    for (const node of content) {
      if (node.type === 'paragraph') {
        // Paragraph nodes contain content array
        if (node.content && Array.isArray(node.content)) {
          for (const child of node.content) {
            if (child.type === 'text') {
              text += child.text || ''
            }
          }
        }
        text += '\n'
      } else if (node.type === 'heading') {
        // Heading nodes
        if (node.content && Array.isArray(node.content)) {
          for (const child of node.content) {
            if (child.type === 'text') {
              text += child.text || ''
            }
          }
        }
        text += '\n'
      } else if (node.type === 'bulletList' || node.type === 'orderedList') {
        // List items
        if (node.content && Array.isArray(node.content)) {
          for (const item of node.content) {
            if (item.type === 'listItem' && item.content) {
              for (const listContent of item.content) {
                if (listContent.type === 'paragraph' && listContent.content) {
                  for (const child of listContent.content) {
                    if (child.type === 'text') {
                      text += child.text || ''
                    }
                  }
                }
              }
            }
            text += '\n'
          }
        }
      }
    }
    
    return text.trim()
  }
}

