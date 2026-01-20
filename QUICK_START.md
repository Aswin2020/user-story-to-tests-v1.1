# Quick Start Guide - Jira Integration

## 🚀 Get Started in 5 Minutes

### Step 1: Get Your Jira Credentials (2 min)

1. Go to: https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Copy the generated token
4. Note your Jira email and URL:
   - **Email**: Your Jira account email
   - **URL**: `https://your-company.atlassian.net`

### Step 2: Start the Application (1 min)

```bash
# From project root
npm install
npm run dev
```

This starts:
- ✅ Frontend: http://localhost:5174
- ✅ Backend: http://localhost:8081

### Step 3: Connect to Jira (1 min)

1. Open http://localhost:5174 in browser
2. Click **"🔗 Connect Jira"** button
3. Fill in:
   - **Jira Base URL**: `https://your-company.atlassian.net`
   - **Email**: your-email@company.com
   - **API Key**: (paste your token from Step 1)
4. Click **"Connect to Jira"**

### Step 4: Generate Tests (1 min)

**Option A - Single Story**:
1. Click **"Load"** on any story
2. Review the auto-filled form
3. Modify if needed
4. Click **"Generate"**

**Option B - Multiple Stories** (NEW!):
1. Check boxes next to multiple stories
2. Click **"⚡ Generate for N Selected"**
3. View combined test cases

### Step 5: Download Results

- Click **"↓ CSV"** or **"↓ XLS"** button
- File downloads to your computer
- Open in Excel/Google Sheets

---

## 📋 What You'll See

### Connected State
```
✓ Jira Connected [green indicator]
  ⚙ Reconnect Jira    ✕ Disconnect

📋 Jira User Stories (3)
┌─────────────────────────────────────────┐
│ ☐ PROJ-101 | User Login              [Load] │
│   As a user, I want to login...           │
├─────────────────────────────────────────┤
│ ☐ PROJ-102 | User Profile             [Load] │
│   As a user, I want to manage profile...  │
├─────────────────────────────────────────┤
│ ☐ PROJ-103 | Password Reset           [Load] │
│   As a user, I want to reset password...  │
└─────────────────────────────────────────┘

⚡ Generate for 2 Selected    🔄 Refresh
```

---

## 🎯 Common Tasks

### Fetch New Stories from Jira
- Click **"🔄 Refresh"** button in Jira Stories section

### Switch Jira Instance
1. Click **"✕ Disconnect"**
2. Click **"🔗 Connect Jira"**
3. Enter new credentials

### Generate Tests for 5 Stories at Once
1. Check 5 story boxes
2. Click **"⚡ Generate for 5 Selected"**
3. Wait 10-30 seconds (depends on story complexity)
4. See all test cases in one table

### Edit & Regenerate
1. Click **"Load"** to edit single story
2. Modify fields manually
3. Click **"Generate"** for custom test cases

---

## ⚡ Tips & Tricks

**💡 Faster Generation**:
- Generate 3-5 stories at a time for best results
- Avoid generating 10+ stories in one batch

**🎯 Better Test Cases**:
- Edit acceptance criteria before generating
- Add specific requirements in "Additional Info"
- Use "Load" for single story with custom edits

**📊 Export Tips**:
- Use **CSV** for spreadsheets
- Use **XLS** for Excel with formatting
- Download immediately after generation

**🔄 Bulk Operations**:
- Check multiple stories
- Generate once
- Export the combined results
- Much faster than individual generations

---

## 🚨 Troubleshooting

### "Invalid credentials" Error
- ❌ Wrong email/token
- ✅ Double-check Jira email
- ✅ Verify API token is correct
- ✅ Ensure URL has no typos

### "Connection refused"
- ❌ Backend not running
- ✅ Check: `npm run dev` is running
- ✅ Check: http://localhost:8081/api/health returns OK

### "No stories found"
- ❌ Project has no issues
- ✅ Add Story or Task issues to Jira project
- ✅ Try "Refresh" button
- ✅ Check project permissions

### "Slow response"
- ❌ Large batch size
- ✅ Try 3-5 stories instead of 20+
- ✅ Wait 30+ seconds for complex stories

### Cannot generate tests after selecting stories
- ❌ Check boxes not working properly
- ✅ Refresh browser
- ✅ Try single story mode with "Load"

---

## 🔧 Configuration

No additional setup needed! Default settings:
- Backend: http://localhost:8081
- Frontend: http://localhost:5174
- Groq API: Pre-configured

To change ports, edit:
- `backend/package.json` - PORT env var
- `frontend/vite.config.ts` - port setting

---

## 📊 Output Example

### Single Story Test Cases
```
Test Case: TC-001 | User login successful [Positive]
- Step 1: Navigate to login page
- Step 2: Enter valid email
- Step 3: Enter valid password  
- Step 4: Click login button
Expected: User logged in successfully

Test Case: TC-002 | Login with invalid email [Negative]
- Step 1: Navigate to login page
- Step 2: Enter invalid email format
- Step 3: Click login button
Expected: Error message displayed
```

### Multi-Story Test Cases
```
Stories Selected: PROJ-101 (Login), PROJ-102 (Profile), PROJ-103 (Password)

Generated: 18 test cases covering all 3 stories
- 6 test cases for login (positive/negative/edge)
- 6 test cases for profile management
- 6 test cases for password reset
```

---

## 🎓 Learn More

- 📖 [Full Jira Integration Guide](./JIRA_INTEGRATION.md)
- 📋 [Implementation Details](./IMPLEMENTATION_SUMMARY.md)
- 🔗 [Jira REST API Docs](https://developer.atlassian.com/cloud/jira/rest/v3/)

---

## 💪 You're All Set!

Everything is ready to use. Just:
1. Get your Jira token
2. Connect
3. Generate
4. Download

**Questions?** Check the [JIRA_INTEGRATION.md](./JIRA_INTEGRATION.md) for detailed documentation.

**Enjoy generating test cases! 🚀**
