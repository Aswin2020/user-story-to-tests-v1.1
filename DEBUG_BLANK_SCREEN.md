# Debug Blank Screen Issue - Step by Step

## What's Changed
I've added:
1. **Error Boundary** - Catches and displays React errors
2. **Timeout Protection** - 30-second timeout for Jira connection attempts
3. **Detailed Logging** - Every step is logged to browser console

---

## To Find the Root Cause

### Step 1: Open Browser Console
1. Press **F12** (or Ctrl+Shift+I)
2. Go to **Console** tab
3. You should see logs starting with emojis: 🔗 📋 📝 ✅ ❌

### Step 2: Attempt Connection
1. Click "Connect Jira" button
2. Enter your details:
   - URL: `https://your-company.atlassian.net` (NO trailing slash)
   - Email: Your Jira email
   - API Key: From https://id.atlassian.com/manage-profile/security/api-tokens
3. Click "Connect to Jira"

### Step 3: Check Console Logs
Look for this sequence:
```
🔗 Attempting to connect to Jira...
📋 Starting fetchJiraUserStories...
📝 Fetching stories from Jira...
📡 Response received: {status: 200, ok: true}
✅ Data parsed: {success: true, count: X}
✅ Stories retrieved: X
✅ fetchJiraUserStories completed
✅ Jira connection successful, saving...
✅ Connection saved, closing modal
```

---

## Common Issues & What to Look For

### ❌ "Unable to reach backend"
**Console shows:**
```
❌ Error fetching Jira stories: TypeError: fetch failed
```
**Solution:**
- Verify backend is running: `npm run dev`
- Check backend terminal for `🚀 Backend server running on port 8081`

---

### ❌ "401 Unauthorized"
**Console shows:**
```
📡 Response received: {status: 401, ok: false}
❌ Error response: {error: "...auth..."}
```
**Solution:**
- API Key is wrong or expired
- Get new one: https://id.atlassian.com/manage-profile/security/api-tokens
- Email must match your Jira login email

---

### ❌ "410 - API endpoint removed"
**Console shows:**
```
📡 Response received: {status: 410, ok: false}
```
**Solution:**
- Backend is using old Jira API
- Already fixed in code to use `/search/jql`
- Restart backend: Stop (Ctrl+C) and run `npm run dev` again

---

### ❌ "Validation error: Invalid Jira base URL"
**Console shows:**
```
❌ Error response: {error: "Validation error: Invalid..."}
```
**Solution:**
- URL format must be: `https://company.atlassian.net`
- Remove trailing slash: ❌ `https://company.atlassian.net/`
- Remove /jira: ❌ `https://company.atlassian.net/jira`

---

### ❌ No stories found
**Console shows:**
```
✅ Stories retrieved: 0
⚠️ No stories found
```
**Solution:**
- Create a Story or Task in your Jira project
- Go to Jira → Create → Issue Type: Story
- Reconnect to load new stories

---

### ❌ Blank Screen with No Error
If nothing shows in console:
1. **Check if Error Boundary activated** - should see an error page
2. **Check Network tab** (F12 → Network):
   - Look for failed requests to `/api/jira/stories`
   - Check response status and body
3. **Check Backend Terminal** for errors

---

## Complete Troubleshooting Checklist

- [ ] F12 Console shows logging (🔗, 📋, 📝, etc.)
- [ ] Backend running: `npm run dev` works
- [ ] Backend logs show Jira endpoints available
- [ ] Jira URL format: `https://company.atlassian.net` (no trailing slash)
- [ ] API Key is valid (test at https://id.atlassian.com/manage-profile/security/api-tokens)
- [ ] Email matches Jira account email
- [ ] Jira project has at least one Story or Task
- [ ] Network tab shows successful responses (200 status)

---

## If Still Broken

Share with me:
1. **Full console output** - Screenshot or copy entire console
2. **Backend terminal output** - Last 30 lines
3. **Network tab response** - What does `/api/jira/stories` return?
4. **Jira details** - URL, if company has proxy, VPN requirements

---

## Quick Test Commands

Test backend is responding:
```javascript
fetch('http://localhost:8081/api/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

Should show: `{status: "OK", timestamp: "..."`

Test Jira endpoint directly:
```javascript
fetch('http://localhost:8081/api/jira/test-connection', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    baseUrl: 'https://your-company.atlassian.net',
    email: 'your.email@company.com',
    apiKey: 'your-token-here'
  })
})
.then(r => r.json())
.then(d => console.log(JSON.stringify(d, null, 2)))
```

---

## What I've Added to Help Debug

✅ **ErrorBoundary.tsx** - Catches React component errors and displays them  
✅ **Timeout handling** - If Jira doesn't respond in 30 seconds, shows timeout error  
✅ **Console logging** - Every step is logged with emojis for easy tracking  
✅ **Better error messages** - Backend sends detailed errors to frontend  

Now when you connect, you should either:
- See "✅ Jira Connected" and your stories list
- OR see a specific error message saying what went wrong

**Reload the page (Ctrl+Shift+R) to get the updated code, then try again!**
