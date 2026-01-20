# User Story to Tests - Jira Integration Guide

## Overview

This application now has **full Jira integration** that allows you to:
- Connect to your Jira instance
- Fetch user stories directly from Jira
- Select multiple stories
- Generate comprehensive test cases using AI
- Download results as CSV/XLS

## Architecture

### Frontend (React)
- **App.tsx**: Main component with Jira connection UI
- **api.ts**: API client functions including:
  - `fetchJiraStories()` - Calls backend to fetch stories from Jira
  - `testJiraConnection()` - Validates Jira credentials
  - `generateTests()` - Generate tests for single story
  - `generateMultiTests()` - Generate tests for multiple stories

### Backend (Express/Node.js)
- **services/jiraService.ts**: JiraService class that:
  - Authenticates with Jira using email + API key
  - Fetches user stories using Jira REST API v3
  - Validates connections
  - Searches for issues with type Story or Task

- **routes/jira.ts**: Express routes:
  - `POST /api/jira/test-connection` - Verify credentials
  - `POST /api/jira/stories` - Fetch user stories
  - `POST /api/jira/projects` - Fetch Jira projects

- **routes/generate.ts**: Generate tests for single story
- **routes/generateMulti.ts**: Generate tests for multiple stories

## Setup Instructions

### Prerequisites
1. Jira Cloud instance (or self-hosted)
2. Jira API token (from Account Settings > Security)
3. Your Jira email address
4. Node.js 16+

### Getting Your Jira Credentials

1. **Jira Base URL**: 
   - Cloud: `https://your-instance.atlassian.net`
   - Self-hosted: Your Jira URL (e.g., `https://jira.company.com`)

2. **Email**: Your Jira account email

3. **API Key**:
   - Go to: https://id.atlassian.com/manage-profile/security/api-tokens
   - Click "Create API token"
   - Copy the generated token

### Installation & Running

```bash
# Install dependencies
npm install

# Start both frontend and backend
npm run dev

# Or start them separately:
# Terminal 1: Backend
npm run dev --workspace=backend

# Terminal 2: Frontend  
npm run dev --workspace=frontend
```

### Environment Configuration

`.env` (root):
```env
PORT=8081
CORS_ORIGIN=http://localhost:5173
groq_API_BASE=https://api.groq.com/openai/v1
groq_API_KEY=your_groq_key
groq_MODEL=openai/gpt-oss-120b
```

`frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8081/api
```

## Usage Flow

### 1. Connect to Jira
- Click "🔗 Connect Jira" button
- Enter:
  - **Jira Base URL**: Your Jira instance URL
  - **Email**: Your Jira account email
  - **API Key**: Your Jira API token
- Click "Connect to Jira"

### 2. View User Stories
- Once connected, see "📋 Jira User Stories" section
- Stories display: Key, Title, Description
- Shows top 50 recently created stories

### 3. Select Stories (Multi-Select Mode)
- Check boxes next to stories you want to include
- Counter shows "⚡ Generate for N Selected" button

### 4. Generate Tests
- **Option A (Single)**: Click "Load" → Fill form → "Generate"
- **Option B (Multi)**: Check multiple boxes → Click "⚡ Generate for N Selected"

### 5. View & Download Results
- See generated test cases in table
- Click test case ID to expand and view steps
- Download as:
  - CSV (for spreadsheets)
  - XLS (for Excel)

## Key Features

### Real Jira Integration
✅ Fetches directly from your Jira instance  
✅ Supports both Cloud and self-hosted  
✅ Uses Jira REST API v3  
✅ Basic Auth with email + API token  

### Multi-Story Batch Processing
✅ Select multiple stories at once  
✅ Generate unified test case coverage  
✅ Handles 1-50 stories per batch  

### Error Handling
✅ Validates credentials before connecting  
✅ Clear error messages for troubleshooting  
✅ Automatic retry on failures  

### Test Case Generation
✅ Uses Groq LLM for AI-powered generation  
✅ Covers Positive/Negative/Edge cases  
✅ Includes Authorization & Non-Functional tests  
✅ Generates unique, actionable steps  

## Backend Flow

```
User Input (Jira Credentials)
    ↓
Frontend: api.ts → fetchJiraStories()
    ↓
Backend: POST /api/jira/stories
    ↓
JiraService.getUserStories()
    ├─ Test connection (GET /rest/api/3/myself)
    └─ Fetch issues (GET /rest/api/3/search)
    ↓
Return stories array
    ↓
Frontend: Render in UI
```

## Frontend Flow

```
Connect Button → Modal Form
    ↓
Submit credentials
    ↓
Fetch stories from backend
    ↓
Display stories with checkboxes
    ↓
User selects stories
    ↓
Click "Generate for N Selected"
    ↓
POST to /api/generate-multi-tests
    ↓
LLM generates test cases
    ↓
Display results with download options
```

## Troubleshooting

### "Invalid credentials"
- Verify email is correct
- Check API token is still valid (tokens expire)
- Ensure Jira URL doesn't have trailing slash

### "No user stories found"
- Ensure project has issues with type "Story" or "Task"
- Check you have permission to view the issues
- Try refreshing the stories list

### "Unable to reach backend"
- Verify backend is running on port 8081
- Check `CORS_ORIGIN` in `.env` matches frontend URL
- Check browser console for detailed error

### Connection test passes but stories don't load
- May be rate limiting issue
- Try with smaller time range
- Check Jira API status page

## API Reference

### Test Connection
```bash
POST /api/jira/test-connection
Content-Type: application/json

{
  "baseUrl": "https://your-instance.atlassian.net",
  "email": "your-email@company.com",
  "apiKey": "your_api_token"
}

Response:
{
  "success": true,
  "message": "Connected to Jira successfully"
}
```

### Fetch Stories
```bash
POST /api/jira/stories
Content-Type: application/json

{
  "baseUrl": "https://your-instance.atlassian.net",
  "email": "your-email@company.com",
  "apiKey": "your_api_token"
}

Response:
{
  "success": true,
  "count": 3,
  "stories": [
    {
      "id": "10001",
      "key": "PROJ-101",
      "title": "User login",
      "description": "As a user, I want to login"
    },
    ...
  ]
}
```

### Generate Multi Tests
```bash
POST /api/generate-multi-tests
Content-Type: application/json

{
  "stories": [
    {
      "id": "10001",
      "key": "PROJ-101",
      "title": "User login",
      "description": "As a user, I want to login"
    }
  ],
  "additionalInfo": "Optional notes"
}

Response:
{
  "cases": [
    {
      "id": "TC-001",
      "title": "Verify successful login",
      "steps": ["Click login", "Enter credentials", ...],
      "expectedResult": "User is logged in",
      "category": "Positive"
    },
    ...
  ],
  "promptTokens": 150,
  "completionTokens": 450
}
```

## Security Notes

⚠️ **API Token Security**
- Never commit `.env` files to version control
- Keep API tokens secret
- Use separate tokens per environment (dev/test/prod)
- Rotate tokens periodically

⚠️ **CORS**
- Backend restricts to `CORS_ORIGIN` (default: localhost:5173)
- Change in production for your domain

⚠️ **Jira Permissions**
- Your Jira account needs "Browse Projects" permission
- To fetch stories, need access to project

## Performance Tips

- **Story Fetching**: Fetches last 50 stories by creation date
- **Batch Size**: Recommended max 5 stories per batch for optimal test generation
- **Token Usage**: Each story uses ~100-200 tokens for multi-story generation
- **Rate Limits**: Jira API allows 100 req/min by default

## Support & Troubleshooting

For issues:
1. Check browser console (F12) for errors
2. Check backend logs for API calls
3. Verify Jira credentials in Jira Settings
4. Ensure network connectivity to Jira
5. Check backend `.env` configuration

## Next Steps

- Add project-level filtering (select specific Jira project)
- Implement custom JQL queries for advanced filtering
- Add test result caching
- Implement webhooks for automatic test updates
- Add integration with test management tools

---

**Version**: 1.1  
**Last Updated**: January 19, 2026
