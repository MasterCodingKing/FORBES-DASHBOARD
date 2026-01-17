# Quick Fix for "Route not found" Error

## The Issue

You're getting `{"success":false,"message":"Route not found"}` when accessing:

```
https://api.forbesdashboardtemporary.jha.com.ph/api/auth
```

## Why This Happens

1. **Wrong URL** - `/api/auth` is not an endpoint, it's a route group
2. **Missing files** - Routes/controllers not uploaded to cPanel
3. **App not running** - Node.js app crashed or not started

## Quick Fix Steps

### Step 1: Test These URLs First

✅ **Test 1:** https://api.forbesdashboardtemporary.jha.com.ph/

- Should return: `{"success":true,"message":"Dashboard API Server"...}`
- If this works, your app is running!

✅ **Test 2:** https://api.forbesdashboardtemporary.jha.com.ph/api/health

- Should return: `{"success":true,"message":"API is running"}`
- If this works, routes are loaded!

❌ **Wrong URL:** https://api.forbesdashboardtemporary.jha.com.ph/api/auth

- This will ALWAYS give "Route not found" because it's not a valid endpoint

✅ **Correct URL for login:**

```
POST https://api.forbesdashboardtemporary.jha.com.ph/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "your_password"
}
```

### Step 2: If Tests Fail, Upload Complete Server

I've created `server-deployment.zip` for you. Upload it to cPanel:

1. **Go to cPanel → File Manager**
2. Navigate to your Node.js app folder
3. **Delete all old files** (but backup first!)
4. **Upload** `server-deployment.zip`
5. **Extract** the zip file
6. **Verify** all folders exist:
   - config/
   - controllers/
   - middleware/
   - models/
   - routes/
   - utils/
   - validators/

### Step 3: Create .env File on Server

**IMPORTANT:** Don't upload your local .env file!

In cPanel File Manager, create new file `.env` with:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_cpanel_database_name
DB_USER=your_cpanel_database_user
DB_PASSWORD=your_cpanel_database_password

# JWT (USE THIS NEW SECURE SECRET!)
JWT_SECRET=5be23de3e494fdcd944c56b9017a2cf5071a8f450f4cd444df7738567f893aa13e043653500280ba960b0d9006d4d6fca1a49fabcfea23057eb6d4cd6c6d6eb5e
JWT_EXPIRES_IN=24h

# Server
PORT=5000
NODE_ENV=production
CLIENT_URL=https://forbesdashboardtemporary.jha.com.ph

# SSL (leave empty, cPanel handles this)
SSL_KEY_PATH=
SSL_CERT_PATH=

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_gmail_app_password
MAIL_FROM=noreply@jha.com.ph
```

### Step 4: Install Dependencies

In cPanel:

1. Go to **Setup Node.js App**
2. Find your application
3. Click **"Run NPM Install"** button
4. Wait for it to complete

### Step 5: Configure & Restart

In **Setup Node.js App**:

- Application root: `/home/username/your-app-folder`
- Application URL: `api.forbesdashboardtemporary.jha.com.ph`
- Application startup file: `server.js`
- Click **"Restart"**

### Step 6: Check Logs

If still not working:

1. Click **"Open Logs"** in Node.js App Manager
2. Look for specific error messages
3. Common errors:
   - "Cannot find module" → Missing files
   - "ECONNREFUSED" → Database issue
   - "EADDRINUSE" → Port conflict

## Testing with Postman/Thunder Client

Since `/api/auth/login` is a POST endpoint, you can't test it in browser. Use:

**Method:** POST  
**URL:** `https://api.forbesdashboardtemporary.jha.com.ph/api/auth/login`  
**Headers:**

```
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "username": "admin",
  "password": "your_admin_password"
}
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1..."
  }
}
```

## Common Mistakes

❌ Accessing `/api/auth` instead of `/api/auth/login`  
❌ Using GET instead of POST for login  
❌ Forgetting to set Content-Type header  
❌ Not creating .env file on server  
❌ Using local .env file (has wrong database credentials)  
❌ Not running `npm install` on server  
❌ Missing route files in upload

## Files Location

- Deployment package: `server-deployment.zip` (in project root)
- Deployment guide: `CPANEL_DEPLOYMENT_GUIDE.md` (full details)
- This quick fix: `QUICK_FIX_ROUTE_NOT_FOUND.md` (you are here)

## Still Need Help?

Share with me:

1. Screenshot of cPanel File Manager showing your app directory
2. Error logs from cPanel Node.js App Manager
3. Result of accessing the health check URL
4. Response from browser developer tools Network tab
