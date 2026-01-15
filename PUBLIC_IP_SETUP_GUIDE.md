# Public IP Access Configuration Guide

## Overview

This guide provides instructions to make the Forbes Dashboard accessible online via public IP **115.42.122.19:8443** using pfSense firewall and Laragon.

---

## 1. pfSense Configuration

### Port Forwarding Rules

Configure the following port forwarding rules in pfSense:

#### Rule 1: Frontend Access (Port 8443 → 3000)

1. Navigate to **Firewall > NAT > Port Forward**
2. Click **Add** (↑ button)
3. Configure:
   - **Interface**: WAN
   - **Protocol**: TCP
   - **Source**: Any
   - **Destination**: WAN address
   - **Destination Port Range**: 8443 to 8443
   - **Redirect Target IP**: [Your Laragon Server Internal IP] (e.g., 192.168.1.100)
   - **Redirect Target Port**: 3000
   - **Description**: Forbes Dashboard - Frontend Access
4. Click **Save** and **Apply Changes**

#### Rule 2: API Access (Port 5000)

1. Click **Add** (↑ button) again
2. Configure:
   - **Interface**: WAN
   - **Protocol**: TCP
   - **Source**: Any
   - **Destination**: WAN address
   - **Destination Port Range**: 5000 to 5000
   - **Redirect Target IP**: [Your Laragon Server Internal IP]
   - **Redirect Target Port**: 5000
   - **Description**: Forbes Dashboard - API Access
3. Click **Save** and **Apply Changes**

### Firewall Rules (WAN Interface)

The port forwarding rules should automatically create associated firewall rules. Verify:

1. Navigate to **Firewall > Rules > WAN**
2. Ensure the following rules exist and are enabled:
   - Allow TCP from Any to [Your IP]:8443 (Frontend)
   - Allow TCP from Any to [Your IP]:5000 (API)

### Optional: Add Firewall Rules for MySQL (if remote access needed)

Only do this if you need direct MySQL access from outside:

1. Add Port Forward for MySQL:
   - **Destination Port Range**: 3306
   - **Redirect Target Port**: 3306
   - **Description**: Forbes Dashboard - MySQL (Use with caution)

**Security Note**: Direct MySQL access should be restricted. Consider VPN access instead.

---

## 2. Laragon Configuration

### Prerequisites

- Laragon installed and running
- Docker Desktop installed (if using Docker deployment)
- MySQL/MariaDB running in Laragon or Docker

### Option A: Running with Laragon (Local Services)

#### Step 1: Configure MySQL in Laragon

1. Open **Laragon**
2. Ensure MySQL is running
3. Import the database:
   ```bash
   mysql -u root -p dashboard_db < backupforbesdashboardsales-5.sql
   ```

#### Step 2: Start Backend Server

1. Open terminal in Laragon
2. Navigate to server directory:
   ```bash
   cd C:\Users\ITDev\Desktop\projects\FORBES-DASHBOARD\server
   ```
3. Install dependencies (if not already done):
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
   The API will run on http://localhost:5000

#### Step 3: Build and Serve Frontend

1. Open another terminal
2. Navigate to client directory:
   ```bash
   cd C:\Users\ITDev\Desktop\projects\FORBES-DASHBOARD\client
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build for production:
   ```bash
   npm run build
   ```
5. Serve the build:
   - You can use a simple HTTP server
   - Or configure Laragon's Apache/Nginx to serve from `client/dist` on port 3000

### Option B: Running with Docker (Recommended for Production)

#### Step 1: Ensure Docker is Running

1. Start Docker Desktop
2. Open PowerShell in the project root:
   ```powershell
   cd C:\Users\ITDev\Desktop\projects\FORBES-DASHBOARD
   ```

#### Step 2: Build and Start Containers

```powershell
# Build and start all containers
docker-compose up -d --build

# Check container status
docker-compose ps

# View logs
docker-compose logs -f
```

#### Step 3: Import Database (First Time Setup)

```powershell
# Copy SQL file to container
docker cp backupforbesdashboardsales-5.sql dashboard_db:/tmp/

# Import database
docker exec -i dashboard_db mysql -uroot -p[your-root-password] dashboard_db < /tmp/backupforbesdashboardsales-5.sql
```

#### Container Ports:

- **Frontend (Nginx)**: 3000 → External 8443 (via pfSense)
- **Backend (Node.js)**: 5000 → External 5000 (via pfSense)
- **Database (MySQL)**: 3306 (internal only)

---

## 3. Windows Firewall Configuration

Ensure Windows Firewall allows incoming connections:

### Allow Ports in Windows Firewall

```powershell
# Run PowerShell as Administrator

# Allow port 3000 (Frontend)
New-NetFirewallRule -DisplayName "Forbes Dashboard Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# Allow port 5000 (API)
New-NetFirewallRule -DisplayName "Forbes Dashboard API" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow

# Allow port 3306 (MySQL) - Optional
New-NetFirewallRule -DisplayName "Forbes Dashboard MySQL" -Direction Inbound -LocalPort 3306 -Protocol TCP -Action Allow
```

---

## 4. Testing Your Setup

### Test Locally First

1. From your local machine:

   - Frontend: http://localhost:3000
   - API: http://localhost:5000/api
   - API Health: http://localhost:5000/api/health

2. From your local network:
   - Frontend: http://[YOUR_LOCAL_IP]:3000
   - API: http://[YOUR_LOCAL_IP]:5000/api

### Test Public Access

1. From an external network (mobile data or different internet):
   - Frontend: https://115.42.122.19:8443
   - API: https://115.42.122.19:5000/api
   - API Health: https://115.42.122.19:5000/api/health

### Troubleshooting Commands

```powershell
# Check if ports are listening
netstat -an | findstr ":3000"
netstat -an | findstr ":5000"
netstat -an | findstr ":3306"

# Test Docker containers
docker-compose ps
docker-compose logs api
docker-compose logs client
docker-compose logs db

# Restart containers
docker-compose restart

# Rebuild containers
docker-compose down
docker-compose up -d --build
```

---

## 5. SSL/HTTPS Configuration (Recommended)

For production use with HTTPS:

### Option 1: Use Cloudflare (Easy)

1. Add your domain to Cloudflare
2. Set DNS A record pointing to 115.42.122.19
3. Enable Cloudflare proxy (orange cloud)
4. Use Cloudflare's free SSL certificate
5. Update CLIENT_URL to use your domain

### Option 2: Use Let's Encrypt + Reverse Proxy

1. Set up Nginx reverse proxy on pfSense or separate server
2. Obtain Let's Encrypt SSL certificate
3. Configure reverse proxy to forward to your services
4. Update configurations to use HTTPS URLs

### Option 3: Use pfSense HAProxy Package

1. Install HAProxy package in pfSense
2. Configure HAProxy to handle SSL termination
3. Forward traffic to backend services
4. More complex but provides better control

---

## 6. Security Recommendations

### Essential Security Measures:

1. **Change Default Credentials**:

   - Update JWT_SECRET in server/.env
   - Change MySQL root password
   - Use strong passwords for all accounts

2. **Firewall Rules**:

   - Limit source IP ranges if possible
   - Enable pfSense logging for WAN rules
   - Monitor access logs regularly

3. **Application Security**:

   - Keep dependencies updated
   - Enable rate limiting (implement in Express)
   - Set up fail2ban or similar

4. **Database Security**:

   - Never expose MySQL port 3306 to public
   - Use strong passwords
   - Regular backups

5. **Monitoring**:
   - Set up logging for API requests
   - Monitor error rates
   - Set up alerts for suspicious activity

---

## 7. Quick Reference

### Server Internal IP

Find your Laragon server's local IP:

```powershell
ipconfig
```

Look for "IPv4 Address" under your active network adapter.

### Verify Public IP

```powershell
# Check current public IP
curl ifconfig.me
```

### URLs After Configuration

**Public Access (External):**

- Frontend: https://115.42.122.19:8443
- API: https://115.42.122.19:5000/api

**Local Access (Internal Network):**

- Frontend: http://[LOCAL_IP]:3000
- API: http://[LOCAL_IP]:5000/api

**Database:**

- Host: localhost (internal only)
- Port: 3306
- Database: dashboard_db

---

## 8. Maintenance

### Regular Updates

```powershell
# Update backend dependencies
cd server
npm update

# Update frontend dependencies
cd client
npm update

# Rebuild Docker containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Backup

```powershell
# Backup database
docker exec dashboard_db mysqldump -uroot -p[password] dashboard_db > backup_$(date +%Y%m%d).sql

# Backup configuration files
# Keep copies of .env files and docker-compose.yml
```

### Monitoring

- Check pfSense logs regularly: **Status > System Logs > Firewall**
- Monitor Docker logs: `docker-compose logs -f`
- Review application audit logs in database

---

## Need Help?

Common issues and solutions are available in the troubleshooting section. For persistent issues:

1. Check pfSense logs
2. Verify Windows Firewall rules
3. Ensure Docker containers are running
4. Test connectivity from local network first
5. Verify port forwarding rules are active
