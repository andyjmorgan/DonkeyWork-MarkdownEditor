# Docker Setup for DonkeyWork Markdown Editor

This guide explains how to run the DonkeyWork Markdown Editor using Docker.

## Prerequisites

- Docker Engine 20.10 or higher
- Docker Compose 2.0 or higher

## Quick Start

### Using Docker Compose (Recommended)

1. Build and start the application:
```bash
docker-compose up -d
```

2. Access the application:
```
http://localhost:3000
```

3. Stop the application:
```bash
docker-compose down
```

### Using Docker CLI

1. Build the image:
```bash
docker build -t donkeywork-markdown-editor .
```

2. Run the container:
```bash
docker run -d \
  --name donkeywork-markdown-editor \
  -p 3000:80 \
  --restart unless-stopped \
  donkeywork-markdown-editor
```

3. Stop the container:
```bash
docker stop donkeywork-markdown-editor
docker rm donkeywork-markdown-editor
```

## Docker Configuration

### Multi-Stage Build

The Dockerfile uses a multi-stage build for optimal image size:

- **Stage 1 (builder)**: Builds the React application using Node.js 20 Alpine
- **Stage 2 (production)**: Serves the static files using Nginx 1.25 Alpine

### Port Mapping

- Container Port: `80` (nginx)
- Host Port: `3000` (configurable in docker-compose.yml)

### Health Check

The container includes a health check that:
- Runs every 30 seconds
- Times out after 10 seconds
- Retries 3 times before marking as unhealthy
- Checks the `/health` endpoint

Check container health:
```bash
docker-compose ps
```

### Nginx Configuration

The custom nginx configuration includes:
- Gzip compression for better performance
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Static asset caching (1 year for images, fonts, etc.)
- SPA routing support (redirects all routes to index.html)
- Health check endpoint at `/health`

## Production Deployment

### Environment Variables

You can add environment variables in `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - CUSTOM_VAR=value
```

### Resource Limits

Add resource limits for production:

```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
    reservations:
      cpus: '0.25'
      memory: 256M
```

### Custom Port

Change the host port in `docker-compose.yml`:

```yaml
ports:
  - "8080:80"  # Change 8080 to your desired port
```

## Troubleshooting

### View Logs

```bash
# Using Docker Compose
docker-compose logs -f

# Using Docker CLI
docker logs -f donkeywork-markdown-editor
```

### Rebuild After Changes

```bash
docker-compose up -d --build
```

### Clean Build (No Cache)

```bash
docker-compose build --no-cache
docker-compose up -d
```

### Container Not Starting

1. Check logs: `docker-compose logs`
2. Verify port availability: `lsof -i :3000`
3. Check disk space: `docker system df`

### Remove All Containers and Images

```bash
docker-compose down --rmi all
```

## Image Size Optimization

The Docker image uses:
- Alpine Linux base images (minimal size)
- Multi-stage builds (only production artifacts in final image)
- `.dockerignore` to exclude unnecessary files
- No development dependencies in production

Expected final image size: ~50-60 MB

## Security Best Practices

The setup follows Docker security best practices:
- Non-root user in nginx container
- Security headers in nginx configuration
- Health checks for container monitoring
- Minimal attack surface with Alpine images
- No sensitive files included (via .dockerignore)

## Monitoring

### Container Stats

```bash
docker stats donkeywork-markdown-editor
```

### Health Status

```bash
docker inspect --format='{{.State.Health.Status}}' donkeywork-markdown-editor
```

## Support

For issues or questions, please check the main repository README or open an issue.
