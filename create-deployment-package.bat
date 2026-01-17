@echo off
echo ========================================
echo Forbes Dashboard - cPanel Deployment Package Creator
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] Creating deployment directory...
if exist "deployment" rmdir /s /q "deployment"
mkdir "deployment"

echo [2/5] Copying server files...
xcopy "server\*" "deployment\" /E /I /Y /EXCLUDE:deployment-exclude.txt

echo [3/5] Creating exclusion list for zip...
(
echo node_modules
echo .env
echo .git
echo .gitignore
echo logs
echo *.log
echo npm-debug.log*
) > deployment-exclude.txt

echo [4/5] Creating ZIP file...
powershell -Command "Compress-Archive -Path .\deployment\* -DestinationPath .\server-deployment.zip -Force"

echo [5/5] Cleaning up...
rmdir /s /q "deployment"
del deployment-exclude.txt

echo.
echo ========================================
echo ✅ SUCCESS! Deployment package created:
echo    server-deployment.zip
echo ========================================
echo.
echo Next steps:
echo 1. Upload server-deployment.zip to cPanel
echo 2. Extract in your Node.js app directory
echo 3. Create .env file on server (DO NOT upload local .env)
echo 4. Run: npm install
echo 5. Configure Node.js app settings
echo 6. Restart the application
echo.
echo See CPANEL_DEPLOYMENT_GUIDE.md for detailed instructions
echo.
pause
