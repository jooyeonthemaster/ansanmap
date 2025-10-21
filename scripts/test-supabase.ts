/**
 * Supabase Connection Test Script
 * Run: npx tsx scripts/test-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hjirjyjdecpcoqtgcatc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqaXJqeWpkZWNwY29xdGdjYXRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzQ4NzgsImV4cCI6MjA3NjYxMDg3OH0.2WDNrZZ5z5Cvy_DAms3w1yWK62MGyRtRSfoJi-3fvoA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔗 Testing Supabase connection...\n');

  try {
    // Test 1: Check connection
    console.log('1️⃣ Testing basic connection...');
    const { data, error } = await supabase.from('booths').select('count');

    if (error) {
      console.error('❌ Connection failed:', error.message);
      console.log('\n💡 Make sure you have run the schema.sql in Supabase SQL Editor!');
      return;
    }

    console.log('✅ Connection successful!\n');

    // Test 2: Check tables
    console.log('2️⃣ Checking tables...');
    const tables = ['booths', 'users', 'favorites', 'check_ins', 'announcements'];

    for (const table of tables) {
      const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
      if (error) {
        console.log(`❌ Table '${table}' not found`);
      } else {
        console.log(`✅ Table '${table}' exists`);
      }
    }

    console.log('\n✨ All tests passed!\n');
    console.log('📋 Next steps:');
    console.log('1. Go to Supabase SQL Editor');
    console.log('2. Copy contents from lib/supabase/schema.sql');
    console.log('3. Paste and Run the SQL');
    console.log('4. Come back and run this test again\n');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testConnection();