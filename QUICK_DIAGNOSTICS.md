# Quick Diagnostic - Blank Screen Issue

## Immediate Actions

### 1️⃣ Check if Backend is Running
Look at your terminal. You should see:
```
✓ Backend running on port 8081
✓ Jira endpoints available
```

**If NOT running:**
```bash
npm run dev
```

---

### 2️⃣ Check Browser Console (F12)
Press **F12** → Console tab → Look for red errors

**Most Common Error:**
```
Unable to reach backend at http://localhost:8081/api
```

**Fix:**
- Restart both backend and frontend
- Wait 5 seconds
- Try again

---

### 3️⃣ Verify Jira Credentials

**Jira Base URL:**
- ✅ `https://your-company.atlassian.net`
- ❌ `https://your-company.atlassian.net/`
- ❌ `https://your-company.atlassian.net/jira`

**Email:**
- Must be exact email you use to log into Jira

**API Key:**
- Go to: https://id.atlassian.com/manage-profile/security/api-tokens
- Click "Create API token"
- Copy the token
- Paste in app (not password!)

---

### 4️⃣ Check Backend Logs

Look for these messages:

✅ **Good signs:**
```
🧪 Test connection request received
🔗 Attempting to connect to: https://...
✅ Connection successful
📋 Fetching stories...
✅ Successfully fetched X stories
```

❌ **Bad signs:**
```
❌ Connection failed
❌ Validation failed
❌ Error testing Jira connection
```

---

### 5️⃣ If Still Blank Screen

Try this in browser Console:
```javascript
// Copy this entire block and paste in console
fetch('http://localhost:8081/api/jira/test-connection', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    baseUrl: 'https://your-company.atlassian.net',
    email: 'your.email@company.com',
    apiKey: 'your-api-token-here'
  })
})
.then(r => r.json())
.then(d => console.log(JSON.stringify(d, null, 2)))
.catch(e => console.error('Error:', e))
```

This will show exactly what the backend is responding with.

---

## Last Resort - Full Reset

```bash
# Kill both processes (Ctrl+C)

# In root folder
npm install
npm run dev

# Wait 10 seconds for everything to start
# Then try connecting again
```

---

## What to Report If Still Broken

Share these:
1. **Backend terminal output** (last 20 lines)
2. **Browser console error** (F12 → Console)
3. **Jira URL you're using**
4. **Whether API token is valid**

This will help identify the exact issue!
