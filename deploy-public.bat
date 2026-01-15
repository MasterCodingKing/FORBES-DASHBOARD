@echo off
REM Forbes Dashboard - Public IP Deployment Script
REM This script helps deploy the dashboard for public access via 115.42.122.19:8443

echo ========================================
echo Forbes Dashboard - Public IP Deployment
echo ========================================
echo.

REM Check if Docker is running
docker info > nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop first.
    pause
    exit /b 1
)

echo [1/6] Checking Docker status...
echo Docker is running OK
echo.

echo [2/6] Stopping existing containers...
docker-compose down
echo.

echo [3/6] Building Docker images...
docker-compose build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo.

echo [4/6] Starting containers...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start containers!
    pause
    exit /b 1
)
echo.

echo [5/6] Waiting for services to be ready...
timeout /t 15 /nobreak > nul
echo.

echo [6/6] Checking container status...
docker-compose ps
echo.

echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Your dashboard is now accessible at:
echo   - Public: https://115.42.122.19:8443
echo   - Local:  http://localhost:3000
echo.
echo API endpoints:
echo   - Public: https://115.42.122.19:5000/api
echo   - Local:  http://localhost:5000/api
echo.
echo To view logs: docker-compose logs -f
echo To stop:      docker-compose down
echo.
echo IMPORTANT: Make sure pfSense port forwarding is configured!
echo See PUBLIC_IP_SETUP_GUIDE.md for details.
echo.
pause
