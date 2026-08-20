# Deployment & Operations Guide

## 1. Environment Setup
Configure the following variables in your hosting environment (e.g. Vercel, Netlify, Cloudflare Pages):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_NAME="ProgramHub Pro"
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 2. Supabase Database Bootstrap
Run the migrations in sequential order against your PostgreSQL database:

```bash
# Apply SQL migrations using Supabase CLI
supabase db push

# Or run files in supabase/migrations/ in numerical order (001 -> 007)
# Seed sample dataset
psql -h your-db.supabase.co -U postgres -d postgres -f supabase/seed.sql
```

## 3. Storage Buckets Setup
In the Supabase Dashboard, create the following storage buckets:
- `student-photos` (Private/Authenticated read)
- `organization-assets` (Public read)
- `posters` (Public read for social media sharing)

## 4. Building for Production
```bash
# Run test suite
npm run test

# Compile production bundle
npm run build

# Start production server
npm run start
```
