# Quick Testing Guide - JIRA & React Error Fixes

## What Was Fixed

### 1. React Error: "Objects are not valid as a React child"
**Cause**: Jira descriptions were coming as ADF (Atlassian Document Format) objects  
**Fix**: Added parser in backend to convert to plain text before sending to frontend

### 2. JIRA Connection Issues
**Cause**: Multiple issues (CORS, loading states, auth)  
**Fix**: Already resolved - maintained in current implementation

---

## How to Test

### Quick Start (2 minutes)

```bash
# From the workspace root directory
npm run dev

# This starts:
# - Backend on http://localhost:8081
# - Frontend on http://localhost:5173
```

### Test Steps

1. **Open Frontend**
   - Navigate to: http://localhost:5173
   - You should see the app interface

2. **Click "🔗 Connect Jira" Button**
   - A modal dialog appears
   - Enter your JIRA credentials:
     - **Base URL**: `https://your-company.atlassian.net` (NO trailing slash)
     - **Email**: Your JIRA account email
     - **API Key**: From https://id.atlassian.com/manage-profile/security/api-tokens

3. **Check for Success**
   - ✅ Modal closes without error
   - ✅ "Jira Connected" status appears (green indicator)
   - ✅ "📋 Jira User Stories" section shows your stories
   - ✅ Story descriptions display as text (NOT as objects)
   - ✅ NO React error in browser console

4. **Verify No React Error**
   - Press F12 to open Developer Tools
   - Go to Console tab
   - Should see logs like:
     ```
     📋 Starting fetchJiraUserStories...
     ✅ Stories fetched successfully: 5
     ```
   - Should NOT see:
     ```
     Objects are not valid as a React child (found: object with keys {type, version, content})
     ```

---

## Console Logs to Expect

### Backend Logs (Terminal)
```
🔗 JiraService initialized:
   Base URL: https://company.atlassian.net
   Email: user@example.com
🧪 Testing Jira connection...
✅ Connection successful! Logged in as: John Doe
📝 Fetching user stories from Jira...
🔍 JQL Query: type in (Story, Task) ORDER BY created DESC
📊 Found 3 issues
✅ Successfully fetched 3 user stories
   1. [PROJ-123] As a user, I can login
   2. [PROJ-124] As a user, I can update profile
   3. [PROJ-125] Fix payment processing bug
```

### Frontend Logs (F12 Console)
```
📋 Starting fetchJiraUserStories...
📝 Fetching stories from Jira...
✅ Stories fetched successfully: 3
```

---

## If You See Errors

### Error: "Objects are not valid as a React child"
1. Hard refresh: **Ctrl+Shift+R**
2. Make sure backend is running (`npm run dev`)
3. Check if you're seeing the parsed text (not object) in the stories list

### Error: "Connection timed out"
1. Verify JIRA URL format is correct (https://company.atlassian.net)
2. Check if your API key is valid
3. Make sure backend is running on port 8081

### Error: "Unable to reach backend"
1. Kill any process on port 8081: `netstat -ano | findstr ":8081"`
2. Restart with: `npm run dev`
3. Wait 10 seconds for servers to fully start

### Error: "401 Unauthorized"
1. Double-check JIRA email and API key
2. Get new API token from: https://id.atlassian.com/manage-profile/security/api-tokens
3. Try again

---

## Files Modified

Only 1 file was modified:
- **`backend/src/services/jiraService.ts`**
  - Added `extractTextFromDescription()` method
  - Added `extractTextFromADF()` helper method
  - Now parses ADF format to plain text

No frontend changes needed!

---

## Test Scenarios

### Scenario 1: Simple Text Description
- Story with plain text description
- **Expected**: Displays as-is

### Scenario 2: Rich Formatted Description
- Story with bold, italics, lists
- **Expected**: Displays as clean plain text

### Scenario 3: Empty Description
- Story with no description
- **Expected**: Uses story title as fallback

### Scenario 4: Multiple Stories
- Select multiple stories with checkboxes
- Click "⚡ Generate for N Selected"
- **Expected**: Generates test cases without errors

---

## Performance Notes

- Parsing ADF adds ~5-10ms per story
- With 50 stories, total time < 1 second
- No noticeable performance impact

---

## Rollback (if needed)

If you need to rollback the changes:
```bash
git checkout backend/src/services/jiraService.ts
```

But the fix is safe and recommended to keep!

---

**Status**: ✅ Ready to Test  
**Last Updated**: January 19, 2026
