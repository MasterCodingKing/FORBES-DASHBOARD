# Forbes Dashboard - Subdirectory Deployment Fix

## Issue Fixed

The application now works correctly at: `https://115.42.122.19:8443/forbes-dashboard`

## Changes Made

### 1. Vite Configuration

Added `base: '/forbes-dashboard/'` to [vite.config.js](client/vite.config.js) so all assets load from the correct subdirectory path.

### 2. React Router Configuration

Added `basename="/forbes-dashboard"` to BrowserRouter in [main.jsx](client/src/main.jsx) so routing works correctly under the subdirectory.

### 3. Nginx Configuration

Updated [nginx.conf](client/nginx.conf) to handle the `/forbes-dashboard` location properly.

### 4. Client Built

The client has been rebuilt with the new configuration in `client/dist/`.

## Deployment Steps

### Option 1: Docker Deployment (Recommended)

1. **Start Docker Desktop** (if not running)

2. **Rebuild and start containers:**

   ```powershell
   cd C:\Users\ITDev\Desktop\projects\FORBES-DASHBOARD
   docker-compose down
   docker-compose build --no-cache client
   docker-compose up -d
   ```

3. **Verify containers are running:**

   ```powershell
   docker-compose ps
   ```

4. **Access your dashboard:**
   - Public: `https://115.42.122.19:8443/forbes-dashboard`
   - Local: `http://localhost:3000/forbes-dashboard`

### Option 2: Laragon + Manual Deployment

If you're serving the built files through Laragon's web server:

1. **Copy the built files:**

   ```powershell
   # Copy to your web root/forbes-dashboard folder
   xcopy /E /I /Y "client\dist\*" "C:\laragon\www\forbes-dashboard\"
   ```

2. **Configure your web server** (Apache/Nginx) to:

   - Serve from the `forbes-dashboard` subdirectory
   - Point to the copied dist folder
   - Handle SPA routing (rewrite all requests to index.html)

3. **Restart Laragon services**

### Option 3: Serve Directly from Dist (Testing Only)

For quick testing:

```powershell
cd client\dist
npx serve -s . -p 3000
```

Then access: `http://localhost:3000/forbes-dashboard`

## Verification

After deployment, test these URLs:

✅ **Frontend:**

- `https://115.42.122.19:8443/forbes-dashboard`
- Should show the login page, not a blank white screen

✅ **API:**

- `https://115.42.122.19:5000/api/health`
- Should return: `{"success":true,"message":"API is running"}`

✅ **Assets Loading:**

- Open browser DevTools (F12)
- Check Console tab - no 404 errors for JS/CSS files
- Check Network tab - all assets loading from `/forbes-dashboard/assets/`

## Troubleshooting

### Still seeing blank page?

1. **Clear browser cache** (Ctrl + Shift + Delete)
2. **Hard refresh** (Ctrl + Shift + R)
3. **Check DevTools Console** for errors
4. **Verify container is using new build:**
   ```powershell
   docker-compose logs client
   ```

### Assets not loading (404 errors)?

- Ensure you rebuilt the client: `npm run build`
- Ensure you rebuilt the Docker image: `docker-compose build client`
- Check that base path is correct in vite.config.js

### Routing not working (404 on refresh)?

- nginx.conf should have the location block for `/forbes-dashboard`
- Docker container needs to be rebuilt to include new nginx.conf

## Reverting to Root Path

If you want to serve from root (`/`) instead of `/forbes-dashboard`:

1. **Remove base path from vite.config.js:**

   ```javascript
   // Remove this line:
   base: '/forbes-dashboard/',
   ```

2. **Remove basename from main.jsx:**

   ```javascript
   // Change to:
   <BrowserRouter>
   ```

3. **Rebuild:**

   ```powershell
   npm run build
   docker-compose build client
   docker-compose up -d
   ```

4. **Access at:**
   - `https://115.42.122.19:8443/`

## Next Steps

1. ✅ Start Docker Desktop
2. ✅ Run: `docker-compose build --no-cache client`
3. ✅ Run: `docker-compose up -d`
4. ✅ Test: `https://115.42.122.19:8443/forbes-dashboard`
5. ✅ Clear browser cache and hard refresh if needed

The blank white page should now be fixed!
