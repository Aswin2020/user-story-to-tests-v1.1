import { GenerateRequest, GenerateResponse, GenerateMultiRequest, UserStory } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api'

export async function generateTests(request: GenerateRequest): Promise<GenerateResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-tests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data: GenerateResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error generating tests:', error)
    if (error instanceof TypeError) {
      throw new Error(`Unable to reach backend at ${API_BASE_URL}. Start the backend or set VITE_API_BASE_URL to the correct URL.`)
    }
    throw error instanceof Error ? error : new Error('Unknown error occurred')
  }
}

export async function generateMultiTests(request: GenerateMultiRequest): Promise<GenerateResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-multi-tests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data: GenerateResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error generating multi tests:', error)
    if (error instanceof TypeError) {
      throw new Error(`Unable to reach backend at ${API_BASE_URL}. Start the backend or set VITE_API_BASE_URL to the correct URL.`)
    }
    throw error instanceof Error ? error : new Error('Unknown error occurred')
  }
}

export interface JiraConnectionRequest {
  baseUrl: string
  email: string
  apiKey: string
  projectKey?: string
}

export async function fetchJiraStories(connection: JiraConnectionRequest, sprintId?: number): Promise<UserStory[]> {
  try {
    console.log('📝 Fetching Jira stories...', { baseUrl: connection.baseUrl, email: connection.email, projectKey: connection.projectKey, sprintId })
    
    const response = await fetch(`${API_BASE_URL}/jira/stories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        baseUrl: connection.baseUrl,
        email: connection.email,
        apiKey: connection.apiKey,
        projectKey: connection.projectKey,
        sprintId: sprintId
      }),
    })

    console.log('📡 Response received:', { status: response.status, ok: response.ok, statusText: response.statusText })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('❌ Error response:', errorData)
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json() as any
    console.log('✅ Data parsed:', { success: data.success, count: data.count, responseKeys: Object.keys(data) })
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch Jira stories')
    }

    console.log('✅ Stories retrieved:', data.stories?.length || 0)
    console.log('📋 Stories data:', data.stories)
    return data.stories || []
  } catch (error) {
    console.error('❌ Error fetching Jira stories:', error)
    if (error instanceof TypeError) {
      throw new Error(`Unable to reach backend at ${API_BASE_URL}. Start the backend or set VITE_API_BASE_URL to the correct URL.`)
    }
    throw error instanceof Error ? error : new Error('Failed to fetch stories from Jira')
  }
}

export interface JiraSprint {
  id: number
  name: string
  state: string
  startDate?: string
  endDate?: string
}

export async function fetchJiraSprints(connection: JiraConnectionRequest, projectKey: string): Promise<JiraSprint[]> {
  try {
    console.log('📅 Fetching Jira sprints...', { baseUrl: connection.baseUrl, projectKey })
    
    const response = await fetch(`${API_BASE_URL}/jira/sprints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        baseUrl: connection.baseUrl,
        email: connection.email,
        apiKey: connection.apiKey,
        projectKey: projectKey
      }),
    })

    console.log('📡 Response received:', { status: response.status, ok: response.ok })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('❌ Error response:', errorData)
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json() as any
    console.log('✅ Data parsed:', { success: data.success, count: data.count })
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch Jira sprints')
    }

    console.log('✅ Sprints retrieved:', data.sprints?.length || 0)
    return data.sprints || []
  } catch (error) {
    console.error('❌ Error fetching Jira sprints:', error)
    if (error instanceof TypeError) {
      throw new Error(`Unable to reach backend at ${API_BASE_URL}. Start the backend or set VITE_API_BASE_URL to the correct URL.`)
    }
    throw error instanceof Error ? error : new Error('Failed to fetch sprints from Jira')
  }
}

export async function testJiraConnection(connection: JiraConnectionRequest): Promise<boolean> {
  try {
    console.log('🧪 Testing Jira connection...')
    const response = await fetch(`${API_BASE_URL}/jira/test-connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(connection),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json() as any
    console.log('✅ Connection test result:', data)
    return data.success === true
  } catch (error) {
    console.error('❌ Error testing connection:', error)
    if (error instanceof TypeError) {
      throw new Error(`Unable to reach backend at ${API_BASE_URL}. Make sure backend is running on port 8081.`)
    }
    throw error instanceof Error ? error : new Error('Failed to test Jira connection')
  }
}