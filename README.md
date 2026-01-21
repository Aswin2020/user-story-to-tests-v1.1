# User Story to Tests Generator

A full-stack application that converts Jira user stories into comprehensive test cases using AI (Groq LLM). Features sprint-based filtering for better test organization.

---

## 🎯 Key Features

- ✅ **Jira Integration**: Connect directly to your Jira Cloud instance
- ✅ **Sprint Filtering**: Fetch stories from specific sprints
- ✅ **AI-Powered Tests**: Generate test cases using Groq API
- ✅ **Multi-Story Generation**: Batch generate tests for multiple stories
- ✅ **Export Options**: Download results as CSV or Excel
- ✅ **Project Key Support**: Filter stories by project
- ✅ **Manual Sprint Input**: If sprints don't load, enter sprint ID manually

---

## 📋 Quick Start

### Prerequisites

- Node.js (v14+)
- npm
- Jira Cloud account with API access
- Groq API key

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables (.env file)
PORT=8081
VITE_API_BASE_URL=http://localhost:8081/api
groq_API_KEY=your_groq_api_key
groq_MODEL=mixtral-8x7b-32768
```

### Running the Application

```bash
# Start development servers (both frontend and backend)
npm run dev

# Frontend: http://localhost:5173
# Backend: http://localhost:8081
```

---

## 🏗️ Architecture

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS3

### Backend Stack
- **Server**: Express.js
- **Language**: TypeScript
- **API**: Jira Cloud REST API v3 + Agile API
- **LLM**: Groq API

### Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/jira/test-connection` | POST | Test Jira connection |
| `/api/jira/stories` | POST | Fetch stories (with optional sprint filter) |
| `/api/jira/sprints` | POST | Get available sprints for project |
| `/api/generate-tests` | POST | Generate tests for single story |
| `/api/generate-multi-tests` | POST | Generate tests for multiple stories |

---

## 🔐 Jira Connection Setup

### Step 1: Get API Credentials
1. Visit: https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Copy the token

### Step 2: Connect in App
1. Click "🔗 Connect Jira" button
2. Enter:
   - **Jira Base URL**: `https://your-instance.atlassian.net`
   - **Email ID**: Your Jira email
   - **API Key**: Your generated token
   - **Project Key**: Your project key (e.g., "WP" from "WP-123")
3. Click "Connect to Jira"

### Step 3: Select Sprint (Optional)
- Sprints auto-load after connection
- Select a sprint from dropdown or enter sprint ID manually
- Stories filter automatically

---

## 🧪 Using the Application

### Generate Tests for Single Story
1. Enter story details:
   - Story Title (required)
   - Description (optional)
   - Acceptance Criteria (required)
   - Additional Info (optional)
2. Click "Generate"
3. Download results as CSV or Excel

### Generate Tests from Jira
1. Connect to Jira
2. Select sprint (optional)
3. Click checkboxes to select stories
4. Use "☑ Select All" / "☐ Deselect All" for quick selection
5. Click "⚡ Generate for X Selected"
6. Download results

### Clear Form
Click "🗑️ Clear All Fields" to reset all input fields at once.

---

## 📊 Form Fields

| Field | Required | Purpose |
|-------|----------|---------|
| Story Title | Yes | Main title/name of the user story |
| Description | No | Additional context about the story |
| Acceptance Criteria | Yes | Conditions the story must meet |
| Additional Info | No | Extra requirements or notes |

---

## 📦 Project Structure

```
project-root/
├── frontend/                      # React frontend
│   ├── src/
│   │   ├── App.tsx               # Main component
│   │   ├── api.ts                # API client functions
│   │   ├── types.ts              # TypeScript interfaces
│   │   ├── downloadUtils.ts      # CSV/Excel export
│   │   └── main.tsx              # Entry point
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                       # Express backend
│   ├── src/
│   │   ├── server.ts             # Main server setup
│   │   ├── routes/
│   │   │   ├── generate.ts       # Test generation endpoints
│   │   │   ├── generateMulti.ts  # Batch generation
│   │   │   └── jira.ts           # Jira integration endpoints
│   │   ├── services/
│   │   │   ├── jiraService.ts    # Jira API service
│   │   │   └── llm/groqClient.ts # Groq API client
│   │   ├── schemas.ts            # Zod validation schemas
│   │   └── prompt.ts             # LLM prompt templates
│   ├── tsconfig.json
│   └── package.json
│
├── README.md                      # This file
└── package.json                   # Root package configuration
```

---

## 🔧 Configuration

### Environment Variables (.env)

```env
# Backend Configuration
PORT=8081                                    # Backend server port
CORS_ORIGIN=http://localhost:5173          # Frontend URL (for CORS)

# Groq LLM Configuration
groq_API_BASE=https://api.groq.com/openai/v1
groq_API_KEY=your_groq_api_key
groq_MODEL=mixtral-8x7b-32768              # or other available models

# Frontend Configuration (in frontend/.env)
VITE_API_BASE_URL=http://localhost:8081/api
```

---

## 🎮 User Workflow

```
┌─────────────────────────────────┐
│   Application Startup           │
│   Shows: "Jira Disconnected"    │
└──────────────┬──────────────────┘
               ↓
      Click "🔗 Connect Jira"
               ↓
┌─────────────────────────────────┐
│   Enter Jira Credentials        │
│   - Base URL                    │
│   - Email                       │
│   - API Key                     │
│   - Project Key                 │
└──────────────┬──────────────────┘
               ↓
      Click "Connect to Jira"
               ↓
┌─────────────────────────────────┐
│   Stories Load                  │
│   Sprints Auto-fetch            │
│   Shows: "Jira Connected"       │
└──────────────┬──────────────────┘
               ↓
  Select Sprint (Optional)
  or Enter Sprint ID
               ↓
┌─────────────────────────────────┐
│   Select Stories               │
│   [☑ Select All]              │
│   [☐ Deselect All]            │
│   [✓] Story 1                 │
│   [✓] Story 2                 │
└──────────────┬──────────────────┘
               ↓
Click "⚡ Generate for X Selected"
               ↓
┌─────────────────────────────────┐
│   AI Generates Test Cases      │
│   Shows progress...            │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│   View & Download Results      │
│   [📥 CSV] [📥 Excel]         │
└─────────────────────────────────┘
```

---

## 🚀 Advanced Features

### Sprint Filtering

**How it works:**
1. User connects to Jira
2. Backend fetches available sprints using Jira Agile API
3. Frontend displays sprint dropdown
4. User selects sprint
5. Stories filtered by sprint ID in JQL query
6. Only selected sprint's stories displayed

**Sprint Selection Options:**
- **Dropdown**: Auto-loaded sprints (if available)
- **Manual Entry**: Enter sprint ID directly
- **No Filter**: "All Stories (No Sprint Filter)" option

### Multi-Story Test Generation

Perfect for generating tests for entire sprints:
1. Select multiple stories using checkboxes
2. Click "Select All" for quick selection
3. Click "⚡ Generate for X Selected"
4. AI generates all test cases in batch
5. Download consolidated results

### Export Formats

| Format | File Type | Use Case |
|--------|-----------|----------|
| CSV | .csv | Excel, Google Sheets, Data Analysis |
| Excel | .xlsx | Professional reports, Presentations |

---

## 🐛 Troubleshooting

### Connection Issues

**"Failed to authenticate with Jira"**
- Verify API key is correct
- Check email matches Jira account
- Ensure Jira base URL is correct format

**"No boards found for project"**
- Verify project key exists
- Check you have access to the project
- Project may not have boards enabled

**"No sprints found"**
- Sprints may not be enabled for project
- Use manual sprint ID entry instead
- Sprint may already be closed

### Generation Issues

**"Please select at least one user story"**
- No stories selected
- Use "☑ Select All" button for quick selection

**"Story Title and Acceptance Criteria are required"**
- Both fields must have content
- Copy from Jira or enter manually

**Test generation is slow**
- Groq API may be rate-limited
- Large stories take longer to process
- Check API usage in Groq dashboard

---

## 📝 Sprint-Based Workflow

### Sprint 1: Initial Setup
- Connect to Jira
- Load available sprints
- View all stories

### Sprint 2: Test Generation
- Select specific sprint
- View sprint-specific stories
- Generate and download tests

**Benefits:**
- Organized test management
- Sprint-aligned testing
- Easy backlog organization

---

## 💾 Local Storage

The app saves your Jira credentials in browser's localStorage:
- **Stored Data**: Base URL, Email, Project Key, API Key
- **Persistence**: Credentials pre-fill when you click "Connect Jira" again
- **Security**: Still requires "Connect" button click to authenticate
- **Clear**: Disconnect button removes saved credentials

---

## 📞 Common Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Format code
npm run format

# Check types
npm run type-check

# Install dependencies
npm install

# Update dependencies
npm update
```

---

## ✅ Feature Checklist

- [x] Jira Cloud integration
- [x] User story fetching
- [x] Sprint-based filtering
- [x] Board/Sprint discovery
- [x] AI test case generation
- [x] Multi-story batch processing
- [x] CSV export
- [x] Excel export
- [x] Form validation
- [x] Error handling
- [x] LocalStorage persistence
- [x] Sprint dropdown with manual entry
- [x] Select All / Deselect All
- [x] Clear Form button
- [x] Jira status indicator
- [x] Connection management

---

## 📚 System Requirements

- **Node.js**: v14 or higher
- **npm**: v6 or higher
- **Browser**: Modern browser with ES6+ support (Chrome, Firefox, Safari, Edge)
- **Jira**: Cloud instance with API access
- **Groq**: Active API account with credits

---

## 🔄 Data Flow

```
Browser
  ↓
React App (Frontend)
  ↓
Express Server (Backend)
  ├→ Jira API (Cloud)
  │  ├→ Get Projects
  │  ├→ Get Boards
  │  ├→ Get Sprints
  │  └→ Search Stories
  ├→ Groq API (LLM)
  │  └→ Generate Tests
  └→ Response to Frontend
  ↓
Display Results → Export (CSV/Excel)
```

---

## 🎓 Best Practices

1. **Always connect with correct Project Key** - Stories won't load otherwise
2. **Use "Select All" for sprint testing** - Faster than manual selection
3. **Save your credentials** - They're encrypted in browser storage
4. **Review generated tests** - AI-generated tests may need refinement
5. **Export regularly** - Don't rely on browser storage for results

---

## 📄 License

This project is proprietary. All rights reserved.

---

## 🤝 Support

For issues or questions:
1. Check the Troubleshooting section above
2. Verify Jira credentials and API access
3. Check browser console for error details
4. Review backend terminal for server logs

---

**Last Updated**: January 22, 2026
**Version**: 1.1
**Status**: Production Ready ✅
