# How to Run Migrations for Supabase

Since Render shell is not available on the free tier, run migrations locally.

## Steps:

1. **Get your Supabase connection string:**
   - Go to Supabase Dashboard → Project Settings → Database
   - Copy the "Connection string" → "URI" (it looks like: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)
   - **Important:** If the connection string doesn't include SSL parameters, add `?sslmode=require` at the end:
     - Example: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres?sslmode=require`

2. **Run migrations locally:**

   **Option A: Using environment variable (recommended)**
   ```bash
   cd backend
   export DATABASE_URL="your-supabase-connection-string-here"
   npx prisma migrate deploy
   ```

   **Option B: Using temporary .env file**
   ```bash
   cd backend
   echo 'DATABASE_URL="your-supabase-connection-string-here"' > .env
   npx prisma migrate deploy
   rm .env  # Clean up after
   ```

3. **Optional: Seed the database**
   ```bash
   export DATABASE_URL="your-supabase-connection-string-here"
   npm run db:seed
   ```

4. **Update Render environment variable:**
   - Go to Render Dashboard → Your backend service → Environment
   - Update `DATABASE_URL` with your Supabase connection string
   - Save (service will restart automatically)

5. **Test the connection:**
   ```bash
   curl https://toeiclearningassistant.onrender.com/health
   ```
   Should show: `"database":{"connected":true}`

## Important Notes:

- The connection string includes your password - keep it secure
- After updating Render, wait 1-2 minutes for the service to restart
- You'll need to create a new account after migration (old data is gone)

