#!/bin/bash

echo "================================"
echo "Dashboard Docker Deployment"
echo "================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker is not running!"
    echo "Please start Docker and try again."
    exit 1
fi

echo "Docker is running..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "WARNING: .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "IMPORTANT: Please edit .env file and update:"
    echo "  - Database passwords"
    echo "  - JWT_SECRET"
    echo "  - Email configuration"
    echo ""
    read -p "Press enter after updating .env file..."
fi

echo "Starting deployment..."
echo ""

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down

echo ""
echo "Building and starting containers..."
docker-compose up -d --build

echo ""
echo "Waiting for services to be healthy..."
sleep 10

echo ""
echo "================================"
echo "Deployment Status"
echo "================================"
docker-compose ps

echo ""
echo "================================"
echo "Access Points"
echo "================================"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5000/api"
echo "Health Check: http://localhost:5000/api/health"
echo "Database: localhost:3306"
echo ""
echo "================================"
echo "Useful Commands"
echo "================================"
echo "View logs: docker-compose logs -f"
echo "Stop: docker-compose stop"
echo "Restart: docker-compose restart"
echo "Remove: docker-compose down"
echo ""
