# Database Setup Guide

This guide will help you set up the PostgreSQL database for the TOEIC Learning Assistant.

## Prerequisites

1. **PostgreSQL** installed and running
2. **Node.js** 18+ installed
3. **npm** or **yarn** package manager

## Step 1: Install PostgreSQL

### macOS (using Homebrew)
```bash
brew install postgresql
brew services start postgresql
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Windows
Download and install from: https://www.postgresql.org/download/windows/

## Step 2: Create Database

```bash
# Connect to PostgreSQL as postgres user
sudo -u postgres psql

# Create database
CREATE DATABASE toeic_learning_assistant;

# Create user (optional)
CREATE USER toeic_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE toeic_learning_assistant TO toeic_user;

# Exit PostgreSQL
\q
```

## Step 3: Environment Configuration

Create a `.env` file in the backend directory:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/toeic_learning_assistant"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
```

**Update the DATABASE_URL with your actual PostgreSQL credentials.**

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

## Step 6: Seed Database (Optional)

```bash
# Seed with sample data
npm run db:seed
```

This will create:
- 15 sample TOEIC vocabulary flashcards
- Demo user (email: demo@example.com, password: DemoPass123)
- Sample quiz

## Step 7: Verify Setup

```bash
# Start the development server
npm run dev

# Check health endpoint
curl http://localhost:3001/health

# Check database stats
curl http://localhost:3001/api/stats
```

## Useful Commands

```bash
# Open Prisma Studio (database GUI)
npm run db:studio

# Create new migration
npm run db:migrate

# Reset database (WARNING: deletes all data)
npm run db:reset

# View database in browser
npx prisma studio
```

## Troubleshooting

### Connection Issues
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check database exists: `psql -U postgres -l`
- Verify connection string in `.env`

### Migration Issues
- Reset database: `npx prisma migrate reset`
- Regenerate client: `npx prisma generate`

### Permission Issues
- Ensure PostgreSQL user has proper permissions
- Check firewall settings
- Verify database name and credentials

## Database Schema

The application includes these main tables:
- `users` - User accounts and preferences
- `flashcards` - Vocabulary cards
- `flashcard_reviews` - User review history
- `quizzes` - Quiz definitions
- `quiz_attempts` - User quiz attempts
- `user_progress` - Study progress tracking
- `daily_progress` - Daily statistics
- `study_sessions` - Session tracking
- `notifications` - User notifications

## Next Steps

After database setup:
1. Start the backend server: `npm run dev`
2. Start the frontend server: `cd ../frontend && npm run dev`
3. Test the API endpoints
4. Begin development!
