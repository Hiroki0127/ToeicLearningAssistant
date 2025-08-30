#!/bin/bash

# TOEIC Learning Assistant - Database Setup Script
# This script helps set up the PostgreSQL database for development

echo "🚀 Setting up TOEIC Learning Assistant Database..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "   Visit: https://www.postgresql.org/download/"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/toeic_learning_assistant"

# JWT Configuration
JWT_SECRET=dev-jwt-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Create database
echo "🗄️  Creating database..."
psql -U postgres -c "CREATE DATABASE toeic_learning_assistant;" 2>/dev/null || echo "Database might already exist"

# Run Prisma migrations
echo "🔄 Running database migrations..."
npx prisma migrate dev --name init

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo "✅ Database setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env with your actual database credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3001/health to check the API"
echo ""
echo "🔗 Useful commands:"
echo "- npx prisma studio    # Open database GUI"
echo "- npx prisma migrate dev --name <migration-name>  # Create new migration"
echo "- npx prisma db reset  # Reset database (WARNING: deletes all data)"
