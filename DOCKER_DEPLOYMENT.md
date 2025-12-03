# Docker Deployment Guide

This guide will help you deploy the Dashboard application using Docker.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

### 1. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and update the following critical values:

```env
# Change these for production!
DB_ROOT_PASSWORD=your-strong-root-password
DB_PASSWORD=your-strong-db-password
JWT_SECRET=your-very-strong-random-secret-key-at-least-32-characters

# Configure your email settings
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=youremail@gmail.com
MAIL_PASS=your-app-specific-password
MAIL_FROM=Your App <noreply@yourdomain.com>
```

### 2. Build and Start Containers

```bash
# Build and start all services
docker-compose up -d --build

# Or without rebuilding
docker-compose up -d
```

### 3. Check Container Status

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api
docker-compose logs -f client
docker-compose logs -f db
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health
- **Database**: localhost:3306

## Container Management

### Stop Containers

```bash
# Stop all services
docker-compose stop

# Stop specific service
docker-compose stop api
```

### Restart Containers

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart api
```

### Remove Containers

```bash
# Stop and remove containers
docker-compose down

# Remove containers and volumes (WARNING: This deletes all data!)
docker-compose down -v

# Remove containers, volumes, and images
docker-compose down -v --rmi all
```

### View Logs

```bash
# Follow all logs
docker-compose logs -f

# View last 100 lines
docker-compose logs --tail=100

# View specific service
docker-compose logs -f api
```

## Database Management

### Access MySQL Container

```bash
# Access MySQL shell
docker-compose exec db mysql -u dashboard_user -p dashboard_db

# Or as root
docker-compose exec db mysql -u root -p
```

### Backup Database

```bash
# Create backup
docker-compose exec db mysqldump -u root -p dashboard_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Or using environment variable
docker-compose exec db mysqldump -u dashboard_user -pdashboard_pass dashboard_db > backup.sql
```

### Restore Database

```bash
# Restore from backup
docker-compose exec -T db mysql -u dashboard_user -pdashboard_pass dashboard_db < backup.sql
```

### Initialize/Seed Database

```bash
# Run seeders
docker-compose exec api npm run seed
```

## Scaling Services

```bash
# Scale API to 3 instances (requires load balancer)
docker-compose up -d --scale api=3
```

## Production Deployment

### 1. Security Checklist

- [ ] Change all default passwords in `.env`
- [ ] Use strong JWT_SECRET (at least 32 characters)
- [ ] Configure proper email credentials
- [ ] Update CORS origins in `server/server.js`
- [ ] Enable HTTPS (use reverse proxy like Nginx or Traefik)
- [ ] Set proper firewall rules
- [ ] Regular database backups

### 2. Performance Optimization

```yaml
# Add to docker-compose.yml for production
services:
  api:
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

### 3. Using Reverse Proxy (Nginx/Traefik)

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. Enable HTTPS with Let's Encrypt

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com
```

## Monitoring and Maintenance

### View Resource Usage

```bash
# Container stats
docker stats

# Specific container
docker stats dashboard_api
```

### Clean Up

```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Complete cleanup
docker system prune -a --volumes
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs api

# Check if port is already in use
netstat -ano | findstr :5000

# Restart specific service
docker-compose restart api
```

### Database Connection Issues

```bash
# Check if database is healthy
docker-compose ps

# Check database logs
docker-compose logs db

# Verify database is accepting connections
docker-compose exec db mysqladmin ping -h localhost
```

### Reset Everything

```bash
# Stop and remove all
docker-compose down -v

# Rebuild from scratch
docker-compose up -d --build --force-recreate
```

## Environment Variables Reference

### Database
- `DB_ROOT_PASSWORD`: MySQL root password
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password

### API
- `NODE_ENV`: Environment (production/development)
- `PORT`: API port (default: 5000)
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRES_IN`: Token expiration time

### Email
- `MAIL_HOST`: SMTP server
- `MAIL_PORT`: SMTP port
- `MAIL_USER`: Email username
- `MAIL_PASS`: Email password
- `MAIL_FROM`: From address

### Client
- `VITE_API_URL`: Backend API URL

## Health Checks

All services have health checks configured:

- **Database**: Checks MySQL ping
- **API**: Checks `/api/health` endpoint
- **Client**: Checks if nginx is serving files

View health status:

```bash
docker-compose ps
```

## Updates and Upgrades

### Update Application Code

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build

# Or for specific service
docker-compose up -d --build api
```

### Update Dependencies

```bash
# Rebuild with no cache
docker-compose build --no-cache

# Restart services
docker-compose up -d
```

## Support

For issues and questions:
- Check logs: `docker-compose logs -f`
- Verify health: `docker-compose ps`
- Restart services: `docker-compose restart`

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MySQL Docker Hub](https://hub.docker.com/_/mysql)
- [Nginx Docker Hub](https://hub.docker.com/_/nginx)
