#!/bin/bash

echo "🚀 Deploying Droppers Application..."

# Pull latest images (if using registry)
# docker-compose pull

# Build and start services
docker-compose up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 30

# Run database migrations
echo "🗃️ Running database migrations..."
docker-compose exec backend npx prisma migrate deploy

# Check service status
echo "🔍 Checking service status..."
docker-compose ps

echo "✅ Deployment completed!"
echo "🌐 Frontend: http://localhost"
echo "🔗 Backend API: http://localhost:5000"
echo "🗄️  Database: localhost:5432"