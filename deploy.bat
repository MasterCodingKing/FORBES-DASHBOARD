@echo off
echo ================================
echo Dashboard Docker Deployment
echo ================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo Docker is running...
echo.

REM Check if .env exists
if not exist .env (
    echo WARNING: .env file not found!
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit .env file and update:
    echo   - Database passwords
    echo   - JWT_SECRET
    echo   - Email configuration
    echo.
    echo Press any key after updating .env file...
    pause
)

echo Starting deployment...
echo.

REM Stop existing containers
echo Stopping existing containers...
docker-compose down

echo.
echo Building and starting containers...
docker-compose up -d --build

echo.
echo Waiting for services to be healthy...
timeout /t 10 /nobreak >nul

echo.
echo ================================
echo Deployment Status
echo ================================
docker-compose ps

echo.
echo ================================
echo Access Points
echo ================================
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:5000/api
echo Health Check: http://localhost:5000/api/health
echo Database: localhost:3306
echo.
echo ================================
echo Useful Commands
echo ================================
echo View logs: docker-compose logs -f
echo Stop: docker-compose stop
echo Restart: docker-compose restart
echo Remove: docker-compose down
echo.
pause
