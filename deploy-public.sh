#!/bin/bash
# Forbes Dashboard - Public IP Deployment Script
# This script helps deploy the dashboard for public access via 115.42.122.19:8443

echo "========================================"
echo "Forbes Dashboard - Public IP Deployment"
echo "========================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker is not running!"
    echo "Please start Docker first."
    exit 1
fi

echo "[1/6] Checking Docker status..."
echo "Docker is running OK"
echo ""

echo "[2/6] Stopping existing containers..."
docker-compose down
echo ""

echo "[3/6] Building Docker images..."
docker-compose build
if [ $? -ne 0 ]; then
    echo "ERROR: Build failed!"
    exit 1
fi
echo ""

echo "[4/6] Starting containers..."
docker-compose up -d
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to start containers!"
    exit 1
fi
echo ""

echo "[5/6] Waiting for services to be ready..."
sleep 15
echo ""

echo "[6/6] Checking container status..."
docker-compose ps
echo ""

echo "========================================"
echo "Deployment Complete!"
echo "========================================"
echo ""
echo "Your dashboard is now accessible at:"
echo "  - Public: https://115.42.122.19:8443"
echo "  - Local:  http://localhost:3000"
echo ""
echo "API endpoints:"
echo "  - Public: https://115.42.122.19:5000/api"
echo "  - Local:  http://localhost:5000/api"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop:      docker-compose down"
echo ""
echo "IMPORTANT: Make sure pfSense port forwarding is configured!"
echo "See PUBLIC_IP_SETUP_GUIDE.md for details."
echo ""
