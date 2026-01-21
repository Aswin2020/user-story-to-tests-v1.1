import { useState } from 'react'
import { generateTests, generateMultiTests, fetchJiraStories, fetchJiraSprints } from './api'
import { GenerateRequest, GenerateResponse, TestCase, GenerateMultiRequest } from './types'
import { downloadAsCSV, downloadAsXLS } from './downloadUtils'

interface JiraConnection {
  baseUrl: string
  email: string
  apiKey: string
  projectKey?: string
}

interface JiraUserStory {
  id: string
  key: string
  title: string
  description: string
}

interface JiraSprint {
  id: number
  name: string
  state: string
  startDate?: string
  endDate?: string
}

function App() {
  const [formData, setFormData] = useState<GenerateRequest>({
    storyTitle: '',
    acceptanceCriteria: '',
    description: '',
    additionalInfo: ''
  })
  const [results, setResults] = useState<GenerateResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedTestCases, setExpandedTestCases] = useState<Set<string>>(new Set())
  const [selectedStoryIds, setSelectedStoryIds] = useState<Set<string>>(new Set())
  
  // Jira Connection States - Always start disconnected
  const [jiraConnection, setJiraConnection] = useState<JiraConnection | null>(null)
  const [showJiraModal, setShowJiraModal] = useState<boolean>(false)
  const [jiraFormData, setJiraFormData] = useState<JiraConnection>({
    baseUrl: '',
    email: '',
    apiKey: '',
    projectKey: ''
  })
  const [jiraUserStories, setJiraUserStories] = useState<JiraUserStory[]>([])
  const [jiraLoading, setJiraLoading] = useState<boolean>(false)
  const [jiraError, setJiraError] = useState<string | null>(null)
  
  // Sprint states
  const [jiraSprints, setJiraSprints] = useState<JiraSprint[]>([])
  const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null)
  const [sprintsLoading, setSprintsLoading] = useState<boolean>(false)
  const [manualSprintId, setManualSprintId] = useState<string>('')

  // Jira Connection Handlers
  const handleJiraInputChange = (field: keyof JiraConnection, value: string) => {
    setJiraFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleOpenJiraModal = () => {
    // Load saved credentials when opening modal (for convenience)
    try {
      const saved = localStorage.getItem('jiraConnection')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && parsed.baseUrl && parsed.email && parsed.apiKey && parsed.projectKey) {
          setJiraFormData(parsed)
        }
      }
    } catch (e) {
      // Ignore errors, just use empty form
    }
    setShowJiraModal(true)
  }

  const handleConnectJira = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!jiraFormData.baseUrl.trim() || !jiraFormData.email.trim() || !jiraFormData.apiKey.trim() || !jiraFormData.projectKey?.trim()) {
      setJiraError('All Jira connection fields are required')
      return
    }

    setJiraLoading(true)
    setJiraError(null)
    
    try {
      console.log('🔗 Attempting to connect to Jira...', {
        baseUrl: jiraFormData.baseUrl,
        email: jiraFormData.email,
        apiKey: '***'
      })

      // Try fetching user stories first to validate connection with timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timed out after 30 seconds')), 30000)
      )
      
      await Promise.race([
        fetchJiraUserStories(jiraFormData),
        timeoutPromise
      ])

      console.log('✅ Jira connection successful, saving...')
      
      // If successful, persist connection
      localStorage.setItem('jiraConnection', JSON.stringify(jiraFormData))
      setJiraConnection(jiraFormData)

      console.log('✅ Connection saved, closing modal')
      setShowJiraModal(false)
      setJiraFormData({ baseUrl: '', email: '', apiKey: '', projectKey: '' })
    } catch (err) {
      console.error('❌ Connection error:', err)
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect to Jira'
      setJiraError(errorMsg)
    } finally {
      setJiraLoading(false)
    }
  }

  const fetchJiraUserStories = async (connection: JiraConnection, sprintId?: number) => {
    try {
      console.log('📋 Starting fetchJiraUserStories...')
      console.log(`📝 Fetching stories from Jira${sprintId ? ` for sprint ${sprintId}` : ''}...`)
      console.log('🔗 Using connection:', { baseUrl: connection.baseUrl, email: connection.email, projectKey: connection.projectKey })
      console.log('📊 Sprint ID being passed:', sprintId)
      
      setJiraLoading(true)
      setJiraError(null)
      
      // Call backend API to fetch from real Jira
      const stories = await fetchJiraStories({
        baseUrl: connection.baseUrl,
        email: connection.email,
        apiKey: connection.apiKey,
        projectKey: connection.projectKey
      }, sprintId)
      
      console.log('✅ Stories fetched successfully:', stories.length)
      console.log('📋 Stories data:', stories)
      setJiraUserStories(stories)
      
      // Extract project key from first story if available (for sprint fetching)
      if (stories.length > 0 && jiraSprints.length === 0) {
        const projectKey = stories[0].key.split('-')[0]
        console.log(`📅 Extracted project key: ${projectKey}`)
        // Auto-fetch sprints with extracted project key
        fetchJiraSprintsData(connection, projectKey).catch((err) => {
          console.log('ℹ️ Sprints not available for this project')
        })
      }
      
      if (stories.length === 0) {
        console.warn('⚠️ No stories found')
        const msg = '⚠️ No user stories found in Jira. Make sure your project has issues with type Story or Task.'
        setJiraError(msg)
        alert(msg)
      }
    } catch (err) {
      console.error('❌ Error fetching stories:', err)
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch user stories from Jira'
      console.error('Full error:', errorMsg)
      setJiraError(errorMsg)
      setJiraUserStories([])
      alert(`❌ Error: ${errorMsg}`)
    } finally {
      console.log('✅ fetchJiraUserStories completed')
      setJiraLoading(false)
    }
  }

  const fetchJiraSprintsData = async (connection: JiraConnection, projectKey?: string) => {
    try {
      console.log('📅 Starting fetchJiraSprintsData...')
      setSprintsLoading(true)
      
      // If no project key provided, we'll try to get sprints anyway (it might work depending on Jira setup)
      // In most cases, if the user has done sprint-based work, they'll have a default project
      let key = projectKey || 'DEFAULT' // Try with a common default
      
      console.log(`📝 Fetching sprints for project: ${key}...`)
      
      // Call backend API to fetch sprints
      const sprints = await fetchJiraSprints({
        baseUrl: connection.baseUrl,
        email: connection.email,
        apiKey: connection.apiKey
      }, key)
      
      console.log('✅ Sprints fetched successfully:', sprints.length)
      console.log('📅 Sprints list:')
      sprints.forEach((sprint, idx) => {
        console.log(`   ${idx}. [ID: ${sprint.id}] ${sprint.name} (${sprint.state})`)
      })
      setJiraSprints(sprints)
      
      // Reset sprint selection
      setSelectedSprintId(null)
    } catch (err) {
      console.error('❌ Error fetching sprints:', err)
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch sprints'
      console.warn(errorMsg)
      setJiraSprints([]) // Empty list if error (sprints might not be enabled or project key wrong)
    } finally {
      console.log('✅ fetchJiraSprintsData completed')
      setSprintsLoading(false)
    }
  }

  const handleSprintChange = async (sprintId: number | null) => {
    console.log(`📅 Sprint selected: ${sprintId}`)
    setSelectedSprintId(sprintId)
    
    if (jiraConnection) {
      // Find the selected sprint to log details
      if (sprintId) {
        const selectedSprint = jiraSprints.find(s => s.id === sprintId)
        console.log(`📅 Selected Sprint Details:`, selectedSprint)
      }
      // Fetch stories for selected sprint
      await fetchJiraUserStories(jiraConnection, sprintId || undefined)
    }
  }

  const handleDisconnectJira = () => {
    localStorage.removeItem('jiraConnection')
    setJiraConnection(null)
    setJiraUserStories([])
    setJiraError(null)
    setJiraSprints([])
    setSelectedSprintId(null)
    setManualSprintId('')
  }

  const handleSelectJiraStory = (story: JiraUserStory) => {
    setFormData(prev => ({
      ...prev,
      storyTitle: story.title,
      description: story.description,
      acceptanceCriteria: `Story: ${story.key}\n\n${story.description}`
    }))
  }

  const toggleStorySelection = (storyId: string) => {
    const newSelected = new Set(selectedStoryIds)
    if (newSelected.has(storyId)) {
      newSelected.delete(storyId)
    } else {
      newSelected.add(storyId)
    }
    setSelectedStoryIds(newSelected)
  }

  const handleSelectAllStories = () => {
    const allStoryIds = new Set(jiraUserStories.map(story => story.id))
    setSelectedStoryIds(allStoryIds)
  }

  const handleDeselectAllStories = () => {
    setSelectedStoryIds(new Set())
  }

  const handleClearForm = () => {
    setFormData({
      storyTitle: '',
      acceptanceCriteria: '',
      description: '',
      additionalInfo: ''
    })
    setResults(null)
    setError(null)
  }

  const handleGenerateMulti = async () => {
    if (selectedStoryIds.size === 0) {
      setError('Please select at least one user story')
      return
    }

    const selectedStories = jiraUserStories.filter(story => selectedStoryIds.has(story.id))
    
    setIsLoading(true)
    setError(null)
    
    try {
      const multiRequest: GenerateMultiRequest = {
        stories: selectedStories,
        additionalInfo: formData.additionalInfo
      }
      const response = await generateMultiTests(multiRequest)
      setResults(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate tests for multiple stories')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTestCaseExpansion = (testCaseId: string) => {
    const newExpanded = new Set(expandedTestCases)
    if (newExpanded.has(testCaseId)) {
      newExpanded.delete(testCaseId)
    } else {
      newExpanded.add(testCaseId)
    }
    setExpandedTestCases(newExpanded)
  }

  const handleInputChange = (field: keyof GenerateRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.storyTitle.trim() || !formData.acceptanceCriteria.trim()) {
      setError('Story Title and Acceptance Criteria are required')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const response = await generateTests(formData)
      setResults(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate tests')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          background-color: #f5f5f5;
          color: #333;
          line-height: 1.6;
        }
        
        .container {
          max-width: 95%;
          width: 100%;
          margin: 0 auto;
          padding: 20px;
          min-height: 100vh;
        }
        
        @media (min-width: 768px) {
          .container {
            max-width: 90%;
            padding: 30px;
          }
        }
        
        @media (min-width: 1024px) {
          .container {
            max-width: 85%;
            padding: 40px;
          }
        }
        
        @media (min-width: 1440px) {
          .container {
            max-width: 1800px;
            padding: 50px;
          }
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }
        
        .jira-status {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
        }
        
        .jira-status.connected {
          background: #d4edda;
          color: #155724;
        }
        
        .jira-status.disconnected {
          background: #f8d7da;
          color: #721c24;
        }
        
        .jira-status-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
        }
        
        .jira-status.connected .jira-status-indicator {
          background: #28a745;
        }
        
        .jira-status.disconnected .jira-status-indicator {
          background: #dc3545;
        }
        
        .jira-btn {
          background: #0052cc;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .jira-btn:hover {
          background: #0047b3;
        }
        
        .jira-btn.disconnect {
          background: #dc3545;
        }
        
        .jira-btn.disconnect:hover {
          background: #c82333;
        }
        
        .sprint-selector {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #e1e8ed;
          margin-bottom: 20px;
        }
        
        .sprint-selector-label {
          font-weight: 600;
          color: #2c3e50;
          white-space: nowrap;
        }
        
        .sprint-selector-dropdown {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #d1d5da;
          border-radius: 6px;
          font-size: 14px;
          background: white;
          color: #2c3e50;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        
        .sprint-selector-dropdown:hover {
          border-color: #0052cc;
        }
        
        .sprint-selector-dropdown:focus {
          outline: none;
          border-color: #0052cc;
          box-shadow: 0 0 0 3px rgba(0, 82, 204, 0.1);
        }
        
        .sprint-selector-dropdown option {
          padding: 8px;
          color: #2c3e50;
        }
        
        .modal {
          display: none;
          position: fixed;
          z-index: 1000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0,0,0,0.4);
        }
        
        .modal.show {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e1e8ed;
        }
        
        .modal-title {
          font-size: 1.5rem;
          color: #2c3e50;
          margin: 0;
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          transition: color 0.2s;
        }
        
        .modal-close:hover {
          color: #333;
        }
        
        .jira-stories-section {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }
        
        .jira-stories-header {
          font-size: 1.2rem;
          color: #2c3e50;
          margin-bottom: 15px;
          font-weight: 600;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .jira-stories-list {
          display: grid;
          gap: 10px;
        }
        
        .jira-story-item {
          background: #f8f9fa;
          border: 1px solid #e1e8ed;
          border-radius: 6px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 10px;
        }
        
        .jira-story-item:hover {
          background: #e3f2fd;
          border-color: #3498db;
          box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
        }
        
        .jira-story-content {
          flex: 1;
        }
        
        .jira-story-key {
          font-weight: 600;
          color: #0052cc;
          font-size: 12px;
          margin-bottom: 4px;
        }
        
        .jira-story-title {
          color: #2c3e50;
          font-weight: 500;
          margin-bottom: 4px;
        }
        
        .jira-story-description {
          color: #666;
          font-size: 13px;
          line-height: 1.4;
        }
        
        .jira-story-select-btn {
          background: #3498db;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: background-color 0.2s;
        }
        
        .jira-story-select-btn:hover {
          background: #2980b9;
        }
          font-size: 2.5rem;
          color: #2c3e50;
          margin-bottom: 10px;
        }
        
        .subtitle {
          color: #666;
          font-size: 1.1rem;
        }
        
        .form-container {
          background: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #2c3e50;
        }
        
        .form-input, .form-textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e1e8ed;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
        }
        
        .form-input:focus, .form-textarea:focus {
          outline: none;
          border-color: #3498db;
        }
        
        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }
        
        .submit-btn {
          background: #3498db;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .submit-btn:hover:not(:disabled) {
          background: #2980b9;
        }
        
        .submit-btn:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }
        
        .error-banner {
          background: #e74c3c;
          color: white;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
          font-size: 18px;
        }
        
        .results-container {
          background: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .results-header {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e1e8ed;
        }
        
        .results-header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .results-info {
          flex: 1;
          min-width: 300px;
        }
        
        .download-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        .download-btn {
          background: #27ae60;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .download-btn:hover {
          background: #229954;
        }
        
        .download-btn:active {
          transform: scale(0.98);
        }
        
        .download-btn-csv {
          background: #3498db;
        }
        
        .download-btn-csv:hover {
          background: #2980b9;
        }
        
        .download-btn-xls {
          background: #27ae60;
        }
        
        .download-btn-xls:hover {
          background: #229954;
        }
        
        .results-title {
          font-size: 1.8rem;
          color: #2c3e50;
          margin-bottom: 10px;
        }
        
        .results-meta {
          color: #666;
          font-size: 14px;
        }
        
        .table-container {
          overflow-x: auto;
        }
        
        .results-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        
        .results-table th,
        .results-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e1e8ed;
        }
        
        .results-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .results-table tr:hover {
          background: #f8f9fa;
        }
        
        .category-positive { color: #27ae60; font-weight: 600; }
        .category-negative { color: #e74c3c; font-weight: 600; }
        .category-edge { color: #f39c12; font-weight: 600; }
        .category-authorization { color: #9b59b6; font-weight: 600; }
        .category-non-functional { color: #34495e; font-weight: 600; }
        
        .test-case-id {
          cursor: pointer;
          color: #3498db;
          font-weight: 600;
          padding: 8px 12px;
          border-radius: 4px;
          transition: background-color 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        
        .test-case-id:hover {
          background: #f8f9fa;
        }
        
        .test-case-id.expanded {
          background: #e3f2fd;
          color: #1976d2;
        }
        
        .expand-icon {
          font-size: 10px;
          transition: transform 0.2s;
        }
        
        .expand-icon.expanded {
          transform: rotate(90deg);
        }
        
        .expanded-details {
          margin-top: 15px;
          background: #fafbfc;
          border: 1px solid #e1e8ed;
          border-radius: 8px;
          padding: 20px;
        }
        
        .step-item {
          background: white;
          border: 1px solid #e1e8ed;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .step-header {
          display: grid;
          grid-template-columns: 80px 1fr 1fr 1fr;
          gap: 15px;
          align-items: start;
        }
        
        .step-id {
          font-weight: 600;
          color: #2c3e50;
          background: #f8f9fa;
          padding: 4px 8px;
          border-radius: 4px;
          text-align: center;
          font-size: 12px;
        }
        
        .step-description {
          color: #2c3e50;
          line-height: 1.5;
        }
        
        .step-test-data {
          color: #666;
          font-style: italic;
          font-size: 14px;
        }
        
        .step-expected {
          color: #27ae60;
          font-weight: 500;
          font-size: 14px;
        }
        
        .step-labels {
          display: grid;
          grid-template-columns: 80px 1fr 1fr 1fr;
          gap: 15px;
          margin-bottom: 10px;
          font-weight: 600;
          color: #666;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      `}</style>
      
      <div className="container">
        <div className="header">
          <div className="header-top">
            <div>
              <h1 className="title">User Story to Tests</h1>
              <p className="subtitle">Generate comprehensive test cases from your user stories</p>
            </div>
            <div>
              <div className={`jira-status ${jiraConnection && jiraConnection.baseUrl ? 'connected' : 'disconnected'}`}>
                <span className="jira-status-indicator"></span>
                {jiraConnection && jiraConnection.baseUrl ? 'Jira Connected' : 'Jira Disconnected'}
              </div>
              {jiraConnection && jiraConnection.baseUrl ? (
                <>
                  <button 
                    className="jira-btn" 
                    onClick={handleOpenJiraModal}
                    title="Reconnect to Jira"
                  >
                    ⚙ Reconnect Jira
                  </button>
                  <button 
                    className="jira-btn disconnect" 
                    onClick={handleDisconnectJira}
                    title="Disconnect from Jira"
                    style={{ marginLeft: '8px' }}
                  >
                    ✕ Disconnect
                  </button>
                </>
              ) : (
                <button 
                  className="jira-btn" 
                  onClick={handleOpenJiraModal}
                  title="Connect to Jira"
                >
                  🔗 Connect Jira
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Jira Connection Modal */}
        <div className={`modal ${showJiraModal ? 'show' : ''}`}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Connect to Jira</h2>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowJiraModal(false)
                  setJiraError(null)
                }}
              >
                ×
              </button>
            </div>
            
            {jiraError && (
              <div className="error-banner" style={{ marginBottom: '15px' }}>
                {jiraError}
              </div>
            )}
            
            <form onSubmit={handleConnectJira}>
              <div className="form-group">
                <label htmlFor="jiraBaseUrl" className="form-label">
                  Jira Base URL *
                </label>
                <input
                  type="text"
                  id="jiraBaseUrl"
                  className="form-input"
                  value={jiraFormData.baseUrl}
                  onChange={(e) => handleJiraInputChange('baseUrl', e.target.value)}
                  placeholder="https://your-jira-instance.atlassian.net"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="jiraEmail" className="form-label">
                  Email ID *
                </label>
                <input
                  type="email"
                  id="jiraEmail"
                  className="form-input"
                  value={jiraFormData.email}
                  onChange={(e) => handleJiraInputChange('email', e.target.value)}
                  placeholder="your-email@example.com"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="jiraApiKey" className="form-label">
                  Jira API Key *
                </label>
                <input
                  type="password"
                  id="jiraApiKey"
                  className="form-input"
                  value={jiraFormData.apiKey}
                  onChange={(e) => handleJiraInputChange('apiKey', e.target.value)}
                  placeholder="Enter your API key"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="jiraProjectKey" className="form-label">
                  Project Key (e.g., WP) *
                </label>
                <input
                  type="text"
                  id="jiraProjectKey"
                  className="form-input"
                  value={jiraFormData.projectKey || ''}
                  onChange={(e) => handleJiraInputChange('projectKey', e.target.value)}
                  placeholder="Enter your project key"
                  required
                />
                <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                  Find this in your Jira URL, e.g., aswink1205.atlassian.net/jira/software/projects/<strong>WP</strong>/boards/2
                </small>
              </div>
              
              <button
                type="submit"
                className="submit-btn"
                disabled={jiraLoading}
                style={{ width: '100%' }}
              >
                {jiraLoading ? 'Connecting...' : 'Connect to Jira'}
              </button>
            </form>
          </div>
        </div>
        
        {/* Jira User Stories Section */}
        {jiraConnection && jiraUserStories.length > 0 && (
          <div className="jira-stories-section">
            {/* Sprint Selector - Always visible when stories exist */}
            <div className="sprint-selector">
              <label className="sprint-selector-label">📅 Sprint:</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                {jiraSprints.length > 0 ? (
                  <select 
                    className="sprint-selector-dropdown"
                    value={selectedSprintId || ''}
                    onChange={(e) => handleSprintChange(e.target.value ? parseInt(e.target.value) : null)}
                    disabled={sprintsLoading}
                  >
                    <option value="">All Stories (No Sprint Filter)</option>
                    {jiraSprints.map((sprint) => (
                      <option key={sprint.id} value={sprint.id}>
                        {sprint.name} ({sprint.state})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1 }}>
                    <input
                      type="number"
                      placeholder="Enter Sprint ID"
                      value={manualSprintId}
                      onChange={(e) => setManualSprintId(e.target.value)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        fontSize: '14px'
                      }}
                    />
                    <button
                      className="jira-btn"
                      onClick={() => {
                        if (manualSprintId.trim() && jiraConnection) {
                          handleSprintChange(parseInt(manualSprintId))
                        }
                      }}
                      disabled={!manualSprintId.trim() || sprintsLoading}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Filter Sprint
                    </button>
                    <button
                      className="jira-btn"
                      onClick={() => {
                        setManualSprintId('')
                        handleSprintChange(null)
                      }}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Clear Filter
                    </button>
                  </div>
                )}
                {sprintsLoading && <span style={{ fontSize: '12px', color: '#666' }}>Loading sprints...</span>}
              </div>
              {jiraSprints.length === 0 && <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>💡 Tip: If sprints list didn't load, enter the sprint ID manually or try refreshing</p>}
            </div>
            
            <div className="jira-stories-header">
              <span>📋 Jira User Stories ({jiraUserStories.length})</span>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                {jiraUserStories.length > 0 && (
                  <>
                    <button
                      className="jira-btn"
                      onClick={handleSelectAllStories}
                      title="Select all stories"
                      style={{ background: '#3498db', fontSize: '13px', padding: '6px 12px' }}
                    >
                      ☑ Select All
                    </button>
                    <button
                      className="jira-btn"
                      onClick={handleDeselectAllStories}
                      title="Deselect all stories"
                      style={{ background: '#95a5a6', fontSize: '13px', padding: '6px 12px' }}
                    >
                      ☐ Deselect All
                    </button>
                  </>
                )}
                {selectedStoryIds.size > 0 && (
                  <button
                    className="jira-btn"
                    onClick={handleGenerateMulti}
                    disabled={isLoading}
                    title={`Generate tests for ${selectedStoryIds.size} selected story/ies`}
                    style={{ background: '#27ae60' }}
                  >
                    ⚡ Generate for {selectedStoryIds.size} Selected
                  </button>
                )}
                <button 
                  className="jira-btn"
                  onClick={() => fetchJiraUserStories(jiraConnection, selectedSprintId || undefined)}
                  disabled={jiraLoading}
                >
                  🔄 Refresh
                </button>
              </div>
            </div>
            
            {jiraError && (
              <div className="error-banner" style={{ marginBottom: '15px' }}>
                {jiraError}
              </div>
            )}
            
            <div className="jira-stories-list">
              {jiraUserStories.map((story) => (
                <div key={story.id} className="jira-story-item">
                  <input
                    type="checkbox"
                    style={{ marginRight: '10px', marginTop: '4px' }}
                    checked={selectedStoryIds.has(story.id)}
                    onChange={() => toggleStorySelection(story.id)}
                  />
                  <div className="jira-story-content">
                    <div className="jira-story-key">{story.key}</div>
                    <div className="jira-story-title">{story.title}</div>
                    <div className="jira-story-description">{story.description}</div>
                  </div>
                  <button
                    type="button"
                    className="jira-story-select-btn"
                    onClick={() => handleSelectJiraStory(story)}
                    title="Load this story into the single-story form"
                  >
                    Load
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#2c3e50' }}>📝 Story Details</h3>
          <button
            type="button"
            onClick={handleClearForm}
            className="jira-btn"
            title="Clear all form fields"
            style={{ background: '#e74c3c', color: 'white', fontSize: '13px', padding: '6px 12px' }}
          >
            🗑️ Clear All Fields
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label htmlFor="storyTitle" className="form-label">
              Story Title *
            </label>
            <input
              type="text"
              id="storyTitle"
              className="form-input"
              value={formData.storyTitle}
              onChange={(e) => handleInputChange('storyTitle', e.target.value)}
              placeholder="Enter the user story title..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              className="form-textarea"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Additional description (optional)..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="acceptanceCriteria" className="form-label">
              Acceptance Criteria *
            </label>
            <textarea
              id="acceptanceCriteria"
              className="form-textarea"
              value={formData.acceptanceCriteria}
              onChange={(e) => handleInputChange('acceptanceCriteria', e.target.value)}
              placeholder="Enter the acceptance criteria..."
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="additionalInfo" className="form-label">
              Additional Info
            </label>
            <textarea
              id="additionalInfo"
              className="form-textarea"
              value={formData.additionalInfo}
              onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
              placeholder="Any additional information (optional)..."
            />
          </div>
          
          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </form>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="loading">
            Generating test cases...
          </div>
        )}

        {results && (
          <div className="results-container">
            <div className="results-header">
              <div className="results-header-content">
                <div className="results-info">
                  <h2 className="results-title">Generated Test Cases</h2>
                  <div className="results-meta">
                    {results.cases.length} test case(s) generated
                    {results.model && ` • Model: ${results.model}`}
                    {results.promptTokens > 0 && ` • Tokens: ${results.promptTokens + results.completionTokens}`}
                  </div>
                </div>
                <div className="download-buttons">
                  <button
                    type="button"
                    className="download-btn download-btn-csv"
                    onClick={() => downloadAsCSV(results.cases, formData.storyTitle)}
                    title="Download as CSV file"
                  >
                    ↓ CSV
                  </button>
                  <button
                    type="button"
                    className="download-btn download-btn-xls"
                    onClick={() => downloadAsXLS(results.cases, formData.storyTitle)}
                    title="Download as Excel file"
                  >
                    ↓ XLS
                  </button>
                </div>
              </div>
            </div>
            
            <div className="table-container">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Test Case ID</th>
                    <th>Story Name</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Expected Result</th>
                  </tr>
                </thead>
                <tbody>
                  {results.cases.map((testCase: TestCase) => (
                    <>
                      <tr key={testCase.id}>
                        <td>
                          <div 
                            className={`test-case-id ${expandedTestCases.has(testCase.id) ? 'expanded' : ''}`}
                            onClick={() => toggleTestCaseExpansion(testCase.id)}
                          >
                            <span className={`expand-icon ${expandedTestCases.has(testCase.id) ? 'expanded' : ''}`}>
                              ▶
                            </span>
                            {testCase.id}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '13px', color: '#666', fontStyle: 'italic' }}>
                            {testCase.storyName || 'N/A'}
                          </span>
                        </td>
                        <td>{testCase.title}</td>
                        <td>
                          <span className={`category-${testCase.category.toLowerCase()}`}>
                            {testCase.category}
                          </span>
                        </td>
                        <td>{testCase.expectedResult}</td>
                      </tr>
                      {expandedTestCases.has(testCase.id) && (
                        <tr key={`${testCase.id}-details`}>
                          <td colSpan={5}>
                            <div className="expanded-details">
                              <h4 style={{marginBottom: '15px', color: '#2c3e50'}}>Test Steps for {testCase.id}</h4>
                              <div className="step-labels">
                                <div>Step ID</div>
                                <div>Step Description</div>
                                <div>Test Data</div>
                                <div>Expected Result</div>
                              </div>
                              {testCase.steps.map((step, index) => (
                                <div key={index} className="step-item">
                                  <div className="step-header">
                                    <div className="step-id">S{String(index + 1).padStart(2, '0')}</div>
                                    <div className="step-description">{step}</div>
                                    <div className="step-test-data">{testCase.testData || 'N/A'}</div>
                                    <div className="step-expected">
                                      {index === testCase.steps.length - 1 ? testCase.expectedResult : 'Step completed successfully'}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App