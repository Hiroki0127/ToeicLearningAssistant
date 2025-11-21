#!/bin/bash

# Script to run Prisma migrations against Supabase database
# Usage: ./scripts/migrate-supabase.sh

echo "🚀 Running Prisma migrations against Supabase..."
echo ""
echo "⚠️  Make sure you have:"
echo "   1. Updated DATABASE_URL in Render Dashboard with your Supabase connection string"
echo "   2. Your Supabase connection string ready"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set it temporarily:"
    echo "  export DATABASE_URL='your-supabase-connection-string'"
    echo "  npm run db:migrate:deploy"
    echo ""
    exit 1
fi

# Run migrations
echo "📦 Running migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migrations completed successfully!"
    echo ""
    echo "Next steps:"
    echo "  1. Make sure DATABASE_URL is set in Render Dashboard"
    echo "  2. Test the connection: curl https://toeiclearningassistant.onrender.com/health"
    echo ""
else
    echo ""
    echo "❌ Migration failed. Please check the error above."
    exit 1
fi

