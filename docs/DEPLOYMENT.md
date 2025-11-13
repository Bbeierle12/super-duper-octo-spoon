# Deployment Guide

## Production Deployment

### Prerequisites

- Docker and Docker Compose
- PostgreSQL database (managed service recommended)
- S3-compatible storage for media (AWS S3, MinIO, etc.)
- Domain name and SSL certificate
- Sufficient server resources (minimum 2GB RAM, 2 vCPU)

### Environment Configuration

#### 1. Backend Environment

Create `backend/.env.production`:

```env
NODE_ENV=production
PORT=3001

# Database (use managed PostgreSQL)
DB_HOST=your-postgres-host.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=dreambuild_prod
DB_PASSWORD=strong-secure-password
DB_DATABASE=dreambuild_production

# JWT (generate secure secret)
JWT_SECRET=your-very-long-random-secret-key-min-32-chars
JWT_EXPIRES_IN=7d

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=dreambuild-production-media

# Security
CORS_ORIGIN=https://yourdomain.com
BCRYPT_ROUNDS=12

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

#### 2. Frontend Environment

Create `frontend/.env.production`:

```env
VITE_API_URL=https://api.yourdomain.com/api
```

### Docker Production Deployment

#### 1. Create Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    container_name: dreambuild-backend-prod
    restart: unless-stopped
    env_file:
      - ./backend/.env.production
    ports:
      - '3001:3001'
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: dreambuild-frontend-prod
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
```

#### 2. Build and Deploy

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

### Cloud Platform Deployment

#### AWS (Elastic Beanstalk / ECS)

1. **Setup RDS PostgreSQL**
   - Choose PostgreSQL 15+
   - Enable automated backups
   - Configure security groups

2. **Setup S3 Bucket**
   ```bash
   aws s3 mb s3://dreambuild-production-media
   aws s3api put-bucket-cors --bucket dreambuild-production-media --cors-configuration file://cors.json
   ```

3. **Deploy Backend**
   - Create Elastic Beanstalk application
   - Upload Docker configuration
   - Configure environment variables
   - Deploy application

4. **Deploy Frontend**
   - Build static files: `npm run build`
   - Upload to S3 or CloudFront
   - Configure CDN and caching

#### Google Cloud Platform (Cloud Run)

```bash
# Build and push backend
gcloud builds submit --tag gcr.io/PROJECT-ID/dreambuild-backend ./backend
gcloud run deploy dreambuild-backend \
  --image gcr.io/PROJECT-ID/dreambuild-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Build and deploy frontend
cd frontend && npm run build
gcloud app deploy
```

#### Digital Ocean / Heroku

Similar deployment process using their respective CLI tools and container registries.

### Database Migrations

Run migrations before deploying new code:

```bash
# Inside backend container or server
npm run db:migrate
```

For zero-downtime deployments, migrations should be:
- Backward compatible
- Run before code deployment
- Tested on staging environment

### SSL/TLS Configuration

#### Using Let's Encrypt with Nginx

```bash
# Install certbot
apt-get install certbot python3-certbot-nginx

# Obtain certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
certbot renew --dry-run
```

Add to `frontend/nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # ... rest of configuration
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Monitoring and Logging

#### Application Logging

Configure structured logging:

```typescript
// backend/src/main.ts
import { Logger } from '@nestjs/common';

const logger = new Logger('Application');
logger.log('Application started');
```

#### Health Checks

Backend health endpoint: `GET /api/health`

```typescript
@Get('health')
healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
}
```

#### Monitoring Tools

- **Application Monitoring**: New Relic, Datadog, or Application Insights
- **Infrastructure**: CloudWatch, Stackdriver, or Prometheus
- **Error Tracking**: Sentry
- **Uptime Monitoring**: UptimeRobot, Pingdom

### Backup Strategy

#### Database Backups

```bash
# Automated daily backups
0 2 * * * pg_dump -h localhost -U dreambuild_prod dreambuild_production | gzip > /backups/db-$(date +\%Y\%m\%d).sql.gz

# Retention: Keep 30 days
find /backups -name "db-*.sql.gz" -mtime +30 -delete
```

#### Media Backups

Enable S3 versioning and cross-region replication:

```bash
aws s3api put-bucket-versioning \
  --bucket dreambuild-production-media \
  --versioning-configuration Status=Enabled
```

### Performance Optimization

#### Backend Optimization

1. **Enable gzip compression**
2. **Use connection pooling** (configured in TypeORM)
3. **Implement caching** (Redis recommended)
4. **Enable database query optimization**
5. **Use CDN for static assets**

#### Frontend Optimization

1. **Code splitting** (automatic with Vite)
2. **Image optimization**
3. **Lazy loading**
4. **CDN for assets**
5. **Browser caching**

### Security Checklist

- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] Database credentials rotated
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] SQL injection prevention (using TypeORM)
- [ ] XSS prevention (React automatic escaping)
- [ ] CSRF protection
- [ ] Security headers configured
- [ ] Dependencies updated
- [ ] Secrets not in version control
- [ ] Database backups configured
- [ ] Monitoring and alerting set up

### Scaling

#### Horizontal Scaling

- Load balancer (AWS ALB, GCP Load Balancer, Nginx)
- Multiple backend instances
- Session storage in Redis
- CDN for frontend assets

#### Vertical Scaling

- Increase server resources
- Optimize database queries
- Implement caching
- Database read replicas

### Troubleshooting

#### Container won't start

```bash
# Check logs
docker logs dreambuild-backend-prod

# Check environment variables
docker exec dreambuild-backend-prod env

# Restart container
docker restart dreambuild-backend-prod
```

#### Database connection issues

1. Verify credentials
2. Check security groups/firewall
3. Verify database is accessible
4. Check SSL requirements

#### High memory usage

1. Check for memory leaks
2. Implement connection pooling
3. Optimize queries
4. Scale horizontally

### Rollback Procedure

```bash
# Tag current version
docker tag dreambuild-backend:latest dreambuild-backend:v1.0.0

# Rollback to previous version
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --image dreambuild-backend:v0.9.0
```

### Maintenance

#### Updates

1. Test in staging environment
2. Create database backup
3. Run migrations
4. Deploy new version
5. Monitor for errors
6. Rollback if necessary

#### Database Maintenance

```sql
-- Vacuum and analyze (PostgreSQL)
VACUUM ANALYZE;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```
