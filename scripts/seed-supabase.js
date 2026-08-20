/**
 * Supabase Migration & Seed Assistant
 * Run with: node scripts/seed-supabase.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('=== Supabase Setup & Seeder ===\n');

  if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes('placeholder')) {
    console.log('⚠️  Notice: SUPABASE_SERVICE_ROLE_KEY / URL are not yet configured in .env.local.');
    console.log('\nTo seed your Supabase database in 1-Click:');
    console.log('1. Open your Supabase Project Dashboard: https://supabase.com/dashboard');
    console.log('2. Click on "SQL Editor" in the left sidebar -> "New query".');
    console.log('3. Copy the full contents of: supabase/full_schema_and_seed.sql');
    console.log('4. Click "Run" (Green Button).\n');
    console.log('All 15+ tables, RLS policies, indexes, and academic seed data will be created instantly!');
    return;
  }

  console.log(`Connecting to Supabase at: ${supabaseUrl}`);
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Test Connection
  const { data, error } = await supabase.from('organizations').select('count');
  if (error) {
    console.log('Tables not yet initialized in Supabase.');
    console.log('Please execute supabase/full_schema_and_seed.sql in your Supabase SQL Editor.');
  } else {
    console.log('✅ Connected to Supabase successfully!');
    console.log(`Organizations found: ${JSON.stringify(data)}`);
  }
}

main().catch(console.error);
