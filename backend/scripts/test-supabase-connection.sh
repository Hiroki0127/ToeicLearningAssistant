#!/bin/bash

# Test Supabase connection with different connection string formats

echo "🔍 Testing Supabase connection options..."
echo ""

# Direct connection (port 5432)
echo "1️⃣ Testing Direct Connection (port 5432):"
export DATABASE_URL="postgresql://postgres:Usausa127127%21@db.twxgjefapmsygwydymjt.supabase.co:5432/postgres?sslmode=require"
node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.\$queryRaw\`SELECT 1\`.then(() => { console.log('✅ Direct connection works!'); p.\$disconnect(); }).catch(e => { console.log('❌ Direct connection failed:', e.message); p.\$disconnect(); });"

echo ""
echo "2️⃣ Testing Connection Pooler (port 6543) - Recommended for Render:"
export DATABASE_URL="postgresql://postgres.twxgjefapmsygwydymjt:Usausa127127%21@aws-0-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require"
node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.\$queryRaw\`SELECT 1\`.then(() => { console.log('✅ Pooler connection works!'); p.\$disconnect(); }).catch(e => { console.log('❌ Pooler connection failed:', e.message); p.\$disconnect(); });"

echo ""
echo "💡 For Render, use the Connection Pooler (port 6543) if available in Supabase Dashboard"

