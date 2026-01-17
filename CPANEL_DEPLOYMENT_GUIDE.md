# Complete cPanel Deployment Guide

## Current Error Analysis

❌ **Error:** `{"success":false,"message":"Route not found"}`  
✅ **Backend is running** (otherwise you'd get "Cannot connect")  
⚠️ **Issue:** Routes not loading OR accessing wrong URL

---

## Part 1: Test Your Backend URLs

Try these URLs in your browser to diagnose:

### 1. Root URL (Should work)

```
https://api.forbesdashboardtemporary.jha.com.ph/
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Dashboard API Server",
  "version": "1.0.0",
  "endpoints": {...}
}
```

### 2. Health Check (Should work)

```
https://api.forbesdashboardtemporary.jha.com.ph/api/health
```

**Expected Response:**

```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2026-01-17T..."
}
```

### 3. Login Endpoint (POST only - use Postman/Thunder Client)

```
POST https://api.forbesdashboardtemporary.jha.com.ph/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "your_password"
}
```

---

## Part 2: Files You MUST Upload to cPanel

### Server Directory Structure

```
/home/yourusername/your-nodejs-app/
├── server.js
├── package.json
├── .env (CREATE ON SERVER, DON'T UPLOAD)
├── config/
│   ├── database.js
│   ├── jwt.js
│   └── mail.js
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   └── ... (ALL controller files)
├── middleware/
│   ├── authMiddleware.js
│   ├── adminMiddleware.js
│   └── ... (ALL middleware files)
├── models/
│   └── ... (ALL model files)
├── routes/
│   ├── index.js
│   ├── authRoutes.js
│   └── ... (ALL route files)
├── utils/
│   └── generateToken.js
│   └── ... (ALL util files)
└── validators/
    └── ... (ALL validator files)
```

⚠️ **CRITICAL:** If ANY of these folders/files are missing, routes won't work!

---

## Part 3: Create Deployment Package

Run this in PowerShell to create a clean upload package:

```powershell
# Navigate to project
cd c:\Users\ITDev\Desktop\projects\FORBES-DASHBOARD

# Create deployment folder
New-Item -ItemType Directory -Force -Path .\deployment

# Copy server files (excluding node_modules and .env)
Copy-Item -Path .\server\* -Destination .\deployment -Recurse -Exclude node_modules,.env

# Create zip file
Compress-Archive -Path .\deployment\* -DestinationPath .\server-deployment.zip -Force

Write-Host "✅ Deployment package created: server-deployment.zip"
```

---

## Part 4: cPanel Upload & Setup

### Step 1: Upload Files

1. Login to cPanel
2. Go to **File Manager**
3. Navigate to your Node.js app directory (e.g., `/home/username/forbes-api/`)
4. Upload and extract `server-deployment.zip`
5. Verify ALL folders exist (check routes/, controllers/, models/, etc.)

### Step 2: Create .env File on Server

**DO NOT upload your local .env!** Create it directly on server:

1. In cPanel File Manager, click **+ File**
2. Name it `.env`
3. Add this content (update with your real credentials):

```env
# Database - USE YOUR CPANEL DATABASE DETAILS
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_cpanel_db_name
DB_USER=your_cpanel_db_user
DB_PASSWORD=your_strong_db_password

# JWT - GENERATE NEW SECRET!
JWT_SECRET=5be23de3e494fdcd944c56b9017a2cf5071a8f450f4cd444df7738567f893aa13e043653500280ba960b0d9006d4d6fca1a49fabcfea23057eb6d4cd6c6d6eb5e
JWT_EXPIRES_IN=24h

# Server
PORT=5000
NODE_ENV=production
CLIENT_URL=https://forbesdashboardtemporary.jha.com.ph

# SSL - Leave empty if cPanel handles SSL
SSL_KEY_PATH=
SSL_CERT_PATH=

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=noreply@jha.com.ph
```

4. **Save** the file
5. Set permissions to **400** (read-only) for security

### Step 3: Install Dependencies

1. Go to **cPanel → Setup Node.js App**
2. Find your application
3. Click **Run NPM Install** button

   OR use SSH/Terminal:

   ```bash
   cd /home/username/forbes-api
   npm install --production
   ```

### Step 4: Configure Node.js App Settings

In cPanel **Setup Node.js App**:

- **Node.js version:** 18.x or higher
- **Application mode:** Production
- **Application root:** `/home/username/forbes-api`
- **Application URL:** `api.forbesdashboardtemporary.jha.com.ph`
- **Application startup file:** `server.js`
- **Environment variables:** Add all .env variables here too (for redundancy)

### Step 5: Restart Application

Click **Restart** button in cPanel Node.js App Manager

### Step 6: Check Logs

If it doesn't work:

1. Click **Open Logs** in Node.js App Manager
2. Look for errors like:
   - "Cannot find module" → Missing files/folders
   - "ECONNREFUSED" → Database connection issue
   - "EADDRINUSE" → Port conflict

---

## Part 5: Frontend Upload

### Build Frontend Locally

```powershell
cd c:\Users\ITDev\Desktop\projects\FORBES-DASHBOARD\client
npm run build
```

### Upload to cPanel

1. Go to **File Manager**
2. Navigate to `/public_html/forbesdashboardtemporary.jha.com.ph/`
3. **Delete all old files** in that directory
4. Upload **ALL files** from `client/dist/`
5. Ensure `index.html` and `assets/` folder are in root

### Create .htaccess

In the same directory, create `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Security headers
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "SAMEORIGIN"
Header set X-XSS-Protection "1; mode=block"
```

---

## Part 6: Test Everything

### Test Backend

1. **Root:** https://api.forbesdashboardtemporary.jha.com.ph/
2. **Health:** https://api.forbesdashboardtemporary.jha.com.ph/api/health
3. **Login (use Postman):**
   ```
   POST /api/auth/login
   Body: {"username": "admin", "password": "yourpass"}
   ```

### Test Frontend

1. Visit: https://forbesdashboardtemporary.jha.com.ph/
2. Try to login
3. Check browser console for errors

---

## Part 7: Common Issues & Fixes

### Issue: "Route not found" on all endpoints

**Cause:** Routes folder not uploaded or files corrupted  
**Fix:** Re-upload routes/ folder, verify all .js files intact

### Issue: "Cannot find module 'express'"

**Cause:** npm install didn't run  
**Fix:** Run `npm install` in cPanel terminal or use "Run NPM Install"

### Issue: Database connection errors

**Cause:** Wrong DB credentials or database doesn't exist  
**Fix:**

1. Create database in cPanel → MySQL Databases
2. Update .env with correct credentials
3. Ensure user has ALL PRIVILEGES on database

### Issue: CORS errors still appearing

**Cause:** Backend not running or wrong CLIENT_URL  
**Fix:**

1. Verify CLIENT_URL matches frontend domain exactly
2. Check Node.js app is running (green status in cPanel)
3. Restart Node.js app

### Issue: JWT token invalid

**Cause:** JWT_SECRET not set or different than what tokens were signed with  
**Fix:**

1. Ensure JWT_SECRET is set in .env
2. All users need to re-login after changing JWT_SECRET

---

## Part 8: Security Checklist

- [ ] Changed default JWT_SECRET to random 64-character string
- [ ] Set .env file permissions to 400
- [ ] Used strong database password
- [ ] NODE_ENV=production
- [ ] Disabled directory listing in cPanel
- [ ] SSL certificates installed and working
- [ ] Removed all console.log statements with sensitive data
- [ ] Database user has minimum required privileges

---

## Quick Diagnostic Commands

### Check if files uploaded correctly

```bash
ls -la /home/username/forbes-api/
ls -la /home/username/forbes-api/routes/
ls -la /home/username/forbes-api/controllers/
```

### Check if Node.js process is running

```bash
ps aux | grep node
```

### Check application logs

```bash
tail -f /home/username/forbes-api/logs/app.log
```

### Test database connection

```bash
mysql -u your_db_user -p -h localhost your_db_name
```

---

## Need Help?

If you still get "Route not found":

1. Take a screenshot of cPanel File Manager showing your app directory structure
2. Copy the full error log from cPanel Node.js App Manager
3. Test the health endpoint URL and share the result
