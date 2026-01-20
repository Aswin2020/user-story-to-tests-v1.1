import express from 'express'
import { JiraService } from '../services/jiraService'
import { z } from 'zod'

export const jiraRouter = express.Router()

// Validation schema
const JiraConnectionSchema = z.object({
  baseUrl: z.string().url('Invalid Jira base URL'),
  email: z.string().email('Invalid email'),
  apiKey: z.string().min(1, 'API key is required')
})

// Test Jira connection
jiraRouter.post('/test-connection', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    console.log('🧪 Test connection request received')
    const validation = JiraConnectionSchema.safeParse(req.body)
    
    if (!validation.success) {
      console.error('❌ Validation failed:', validation.error.message)
      res.status(400).json({
        error: `Validation error: ${validation.error.message}`,
        success: false
      })
      return
    }

    const { baseUrl, email, apiKey } = validation.data
    console.log(`🔗 Attempting to connect to: ${baseUrl}`)
    const jiraService = new JiraService(baseUrl, email, apiKey)
    
    const isConnected = await jiraService.testConnection()
    
    if (isConnected) {
      console.log('✅ Connection successful')
    } else {
      console.log('❌ Connection failed')
    }
    
    res.json({
      success: isConnected,
      message: isConnected ? 'Connected to Jira successfully' : 'Failed to connect to Jira'
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Error testing Jira connection:', errorMsg)
    res.status(500).json({
      error: `Connection failed: ${errorMsg}`,
      success: false
    })
  }
})

// Fetch user stories from Jira
jiraRouter.post('/stories', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    console.log('📝 Stories request received')
    const validation = JiraConnectionSchema.safeParse(req.body)
    
    if (!validation.success) {
      console.error('❌ Validation failed:', validation.error.message)
      res.status(400).json({
        error: `Validation error: ${validation.error.message}`,
        stories: [],
        success: false
      })
      return
    }

    const { baseUrl, email, apiKey } = validation.data
    console.log(`🔗 Creating JiraService for: ${baseUrl}`)
    const jiraService = new JiraService(baseUrl, email, apiKey)
    
    // First verify connection
    console.log('🧪 Verifying connection...')
    const isConnected = await jiraService.testConnection()
    if (!isConnected) {
      console.error('❌ Failed to authenticate with Jira')
      res.status(401).json({
        error: 'Failed to authenticate with Jira. Please verify your credentials.',
        stories: [],
        success: false
      })
      return
    }

    // Fetch user stories
    console.log('📋 Fetching stories...')
    const stories = await jiraService.getUserStories()
    
    console.log(`✅ Successfully fetched ${stories.length} stories`)
    res.json({
      success: true,
      stories,
      count: stories.length
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch stories from Jira'
    console.error('❌ Error fetching Jira stories:', errorMsg)
    res.status(500).json({
      error: errorMsg,
      stories: [],
      success: false
    })
  }
})

// Fetch projects from Jira
jiraRouter.post('/projects', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const validation = JiraConnectionSchema.safeParse(req.body)
    
    if (!validation.success) {
      res.status(400).json({
        error: `Validation error: ${validation.error.message}`,
        projects: []
      })
      return
    }

    const { baseUrl, email, apiKey } = validation.data
    const jiraService = new JiraService(baseUrl, email, apiKey)
    
    const projects = await jiraService.getProjects()
    
    res.json({
      success: true,
      projects,
      count: projects.length
    })
  } catch (error) {
    console.error('Error fetching Jira projects:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch projects from Jira'
    res.status(500).json({
      error: errorMessage,
      projects: []
    })
  }
})
