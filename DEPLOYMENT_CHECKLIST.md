# Deployment Checklist for cPanel

## Fixed Issues:

✅ Added explicit CORS headers for production
✅ Updated CLIENT_URL to production domain
✅ Frontend built with correct API URL

## Deploy Backend (Node.js)

### 1. Upload Files

Upload the entire `server` folder to your cPanel Node.js application directory

### 2. Critical Files to Update

- **`server/.env`** - Make sure it contains:

```env
CLIENT_URL=https://forbesdashboardtemporary.jha.com.ph
NODE_ENV=production
PORT=5000
```

### 3. Install Dependencies

In cPanel terminal or SSH:

```bash
cd /home/your-username/your-app-directory/server
npm install
```

### 4. Restart Node.js Application

- Go to cPanel → Setup Node.js App
- Click "Restart" button for your application
- OR via terminal: `touch tmp/restart.txt`

## Deploy Frontend (Static Files)

### 1. Upload Built Files

Upload ALL files from `client/dist/` to your frontend domain directory:

- Go to: `/home/your-username/public_html/forbesdashboardtemporary.jha.com.ph/`
- Upload: `index.html` and `assets/` folder

### 2. Verify .htaccess (if not exists, create it)

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## Testing

1. **Test Backend:**

   - Visit: `https://api.forbesdashboardtemporary.jha.com.ph/`
   - Should return: `{ "success": true, "message": "Dashboard API Server" }`

2. **Test CORS:**

   - Open browser console on: `https://forbesdashboardtemporary.jha.com.ph`
   - Run: `fetch('https://api.forbesdashboardtemporary.jha.com.ph/').then(r => r.json()).then(console.log)`
   - Should return success without CORS errors

3. **Test Login:**
   - Go to: `https://forbesdashboardtemporary.jha.com.ph/login`
   - Try logging in with valid credentials
   - Should work without "Network Error"

## Troubleshooting

If still getting CORS errors:

1. Verify Node.js app restarted on cPanel
2. Check Node.js app error logs in cPanel
3. Ensure SSL certificates are valid for both domains
4. Check that backend is actually running (should see process in Node.js App manager)

If getting 404 errors:

1. Verify `client/dist` files uploaded correctly
2. Check `.htaccess` file exists in frontend directory
3. Clear browser cache
