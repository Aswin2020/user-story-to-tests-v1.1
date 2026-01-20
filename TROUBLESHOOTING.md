# Jira Connection Troubleshooting Guide

## Issue: Blank Screen After Clicking "Connect to Jira"

### What's Happening
When you click "Connect to Jira" and a blank screen appears, it usually means:
1. An error occurred but wasn't displayed
2. The modal closed unexpectedly
3. Network connectivity issues between frontend and backend
4. Invalid Jira credentials or configuration

---

## Diagnostic Steps

### Step 1: Check Browser Console
1. Open your browser (Chrome, Firefox, Edge)
2. Press **F12** or **Ctrl+Shift+I** to open Developer Tools
3. Go to the **Console** tab
4. Look for any red error messages

**Common errors you might see:**
- `Failed to connect to backend at http://localhost:8081/api`
- `Connection failed: Jira API error: 401`
- `Unable to reach backend`

### Step 2: Check Backend Logs
1. Open the terminal where your backend is running (Port 8081)
2. Look for log messages starting with:
   - 🧪 Test connection request received
   - 🔗 Attempting to connect to: [URL]
   - ✅ Connection successful
   - ❌ Connection failed

**If you see no logs:**
- Backend might not be running
- Run: `npm run dev` from the root folder

### Step 3: Verify Backend is Running
```bash
# In your terminal, you should see:
Backend running on port 8081
Jira endpoints available:
  POST /api/jira/test-connection
  POST /api/jira/stories
  POST /api/jira/projects
```

---

## Common Issues & Solutions

### ❌ Issue 1: Backend Connection Failed
**Error:** `Unable to reach backend at http://localhost:8081/api`

**Solution:**
1. Verify backend is running: `npm run dev`
2. Check if port 8081 is being used by another app
3. Verify frontend `.env` has correct `VITE_API_BASE_URL`:
   ```
   VITE_API_BASE_URL=http://localhost:8081/api
   ```
4. Restart both frontend and backend

---

### ❌ Issue 2: Invalid Jira URL
**Error:** `Validation error: Invalid Jira base URL`

**Solution:**
1. Enter URL in format: `https://your-instance.atlassian.net`
2. **DO NOT include trailing slash**
   - ✅ Correct: `https://mycompany.atlassian.net`
   - ❌ Wrong: `https://mycompany.atlassian.net/`
3. **DO NOT include `/jira` or `/browse`**
   - ✅ Correct: `https://mycompany.atlassian.net`
   - ❌ Wrong: `https://mycompany.atlassian.net/jira`

---

### ❌ Issue 3: Invalid Email or API Key
**Error:** `Connection failed: Jira API error: 401`

**Solution:**
1. Verify email is correct (same as Jira login)
2. Check API Key:
   - Go to: https://id.atlassian.com/manage-profile/security/api-tokens
   - Copy a valid API token (not your password!)
   - Paste in "Jira API Key" field
3. Ensure API token hasn't expired
4. Regenerate if needed and retry

---

### ❌ Issue 4: No Stories Found
**Error:** `⚠️ No user stories found in Jira`

**Solution:**
1. Verify your Jira project has issues with type "Story" or "Task"
2. Create a sample story in Jira:
   - Click "Create" button
   - Select Issue type: "Story"
   - Enter summary and click "Create"
3. Reconnect to Jira and try again

---

### ❌ Issue 5: Blank Screen with No Error Message
**This indicates the modal closed but no error was displayed**

**Solution:**
1. **Open browser console (F12)** and check for errors
2. Check backend logs for error messages
3. Most common: Invalid credentials
4. Try these steps:
   ```
   1. Clear browser data (optional): Settings → Privacy → Clear browsing data
   2. Reload page: Ctrl+Shift+R (hard refresh)
   3. Try connecting again with verified credentials
   ```

---

## Advanced Debugging

### Enable Verbose Logging
If you want to see detailed connection logs:

**Frontend:**
1. Open browser Console (F12)
2. Type: `localStorage.setItem('DEBUG', 'true')`
3. Reload page
4. Try connecting again

**Backend:**
Already logs with emojis:
- 🧪 = Testing
- 🔗 = Connecting
- 📝 = Fetching
- ✅ = Success
- ❌ = Error

### Check API Response
In browser Console, run:
```javascript
fetch('http://localhost:8081/api/jira/test-connection', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    baseUrl: 'https://your-instance.atlassian.net',
    email: 'your-email@company.com',
    apiKey: 'your-api-token'
  })
})
.then(r => r.json())
.then(d => console.log(JSON.stringify(d, null, 2)))
```

---

## Checklist Before Connecting

- [ ] Backend running on port 8081
- [ ] Frontend running on port 5174
- [ ] Jira URL is correct format (no trailing slash)
- [ ] Email matches your Jira account
- [ ] API Key is valid (not password)
- [ ] You have internet connection
- [ ] Jira project has at least one Story or Task
- [ ] No VPN blocking Atlassian cloud

---

## Still Having Issues?

### Restart Everything
```bash
# Kill both processes (Ctrl+C in their terminals)

# Clear everything
rm -rf node_modules/
npm install

# Start fresh
npm run dev
```

### Check Versions
```bash
node --version    # Should be 18+
npm --version     # Should be 8+
```

### Still Stuck?
1. Check browser console for exact error message
2. Screenshot the error or log messages
3. Verify all connection details are correct
4. Try with a different Jira project
5. Ensure Jira API token is active and not expired

---

## Reference

**What the app does when you click "Connect":**

1. ✅ Validates email format
2. ✅ Validates URL format  
3. ✅ Sends credentials to backend
4. ✅ Backend tests connection with `/rest/api/3/myself`
5. ✅ Fetches stories using new `/rest/api/3/search/jql` endpoint
6. ✅ Displays stories in list
7. ✅ Saves connection to localStorage

**If any step fails**, you'll see an error message in red.

---

## Need More Help?

Check the logs with these keywords:
- 🧪 Connection test
- 📝 Fetching stories  
- ❌ Error messages

All should appear in backend terminal output.
