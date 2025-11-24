# Study Sessions Management Scripts

## Step 1: Analyze Your Sessions

Before fixing anything, run the analysis script to see what's in your database:

```bash
cd backend
npx tsx scripts/analyze-study-sessions.ts
```

This will show you:
- Total study time breakdown
- Sessions by type (flashcards, quiz, etc.)
- Problematic sessions (zero duration, negative duration, very long sessions)
- Recent sessions

## Step 2: Fix Invalid Sessions (Recommended)

This script will remove only invalid sessions (zero duration, negative duration, missing endTime) while keeping all valid historical data:

```bash
cd backend
npx tsx scripts/fix-study-sessions.ts
```

This will:
- Delete sessions with zero or negative duration (bad data from before fixes)
- Delete sessions missing endTime (incomplete sessions)
- Keep all valid historical sessions
- Show you the new total study time

**This is the recommended approach** - it fixes the calculation without losing your real study history.

## Reset Study Sessions

This script will delete all study sessions older than today, resetting your total study time.

## Option 1: Using TypeScript Script (Recommended - Safest)

This is the easiest and safest method as it uses Prisma and handles all the details:

```bash
cd backend
npx tsx scripts/reset-study-sessions.ts
```

This will:
- Show you how many sessions will be deleted
- Delete all sessions older than today
- Show you the remaining total study time
- Keep today's sessions intact

## Option 2: Using Supabase SQL Editor

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the SQL from `reset-study-sessions.sql`
4. Run the query

**Note:** You may need to adjust the column names (`startTime` vs `start_time`) depending on your database setup.

## Option 3: Using psql Command Line

```bash
# Connect to your database
psql "your-database-connection-string"

# Run the SQL file
\i scripts/reset-study-sessions.sql
```

## Option 4: Using Prisma Studio (for local development)

1. Run `npx prisma studio`
2. Navigate to `study_sessions` table
3. Manually delete old records

## What This Does

- Deletes all study sessions where `start_time` is before today
- Keeps today's sessions intact
- This will reset your "Total Study Time" on the dashboard to only reflect today's activity

## Warning

⚠️ **This action cannot be undone!** Make sure you want to delete this data before running the script.

If you want to keep some historical data, you can modify the SQL to:
- Delete sessions older than a specific date: `WHERE DATE(start_time) < '2024-01-01'`
- Delete only sessions with unrealistic durations: `WHERE EXTRACT(EPOCH FROM (end_time - start_time)) / 60 > 120` (more than 2 hours)

