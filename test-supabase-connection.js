/**
 * Test script to verify Supabase connection and table access
 * Run with: node test-supabase-connection.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Manually load .env.local
let supabaseUrl = ''
let supabaseAnonKey = ''

try {
  const envContent = fs.readFileSync('.env.local', 'utf8')
  const lines = envContent.split('\n')
  for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim()
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseAnonKey = line.split('=')[1].trim()
    }
  }
} catch (err) {
  console.error('Error reading .env.local:', err.message)
}

console.log('Testing Supabase Connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET')
console.log()

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERROR: Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('1. Testing basic connection...')
    const { data: healthCheck, error: healthError } = await supabase
      .from('NEW-FACEBOOK')
      .select('count', { count: 'exact', head: true })

    if (healthError) {
      console.error('   ERROR:', healthError.message)
      console.error('   Code:', healthError.code)
      console.error('   Details:', healthError.details)
      console.error('   Hint:', healthError.hint)
      return
    }

    console.log('   SUCCESS: Connection established')
    console.log()

    console.log('2. Testing table access (NEW-FACEBOOK)...')
    const { data, error, count } = await supabase
      .from('NEW-FACEBOOK')
      .select('*', { count: 'exact' })
      .limit(1)

    if (error) {
      console.error('   ERROR:', error.message)
      console.error('   Code:', error.code)
      console.error('   Details:', error.details)
      console.error('   Hint:', error.hint)

      if (error.code === 'PGRST116') {
        console.error('\n   DIAGNOSIS: Table does not exist or is not accessible')
        console.error('   - Check if table name is correct (case-sensitive)')
        console.error('   - Verify table exists in Supabase dashboard')
      } else if (error.code === '42501') {
        console.error('\n   DIAGNOSIS: Permission denied (RLS policy issue)')
        console.error('   - Check Row Level Security policies')
        console.error('   - Ensure anon role has read access')
      }
      return
    }

    console.log('   SUCCESS: Table accessible')
    console.log('   Total rows:', count)
    console.log('   Sample row:', JSON.stringify(data[0], null, 2))
    console.log()

    console.log('3. Testing column access...')
    const { data: columnsTest, error: columnsError } = await supabase
      .from('NEW-FACEBOOK')
      .select('compte, activité, date_collecte')
      .limit(5)

    if (columnsError) {
      console.error('   ERROR:', columnsError.message)
      return
    }

    console.log('   SUCCESS: Columns accessible')
    console.log('   Sample data:', JSON.stringify(columnsTest, null, 2))
    console.log()

    console.log('4. Testing aggregation query...')
    const { data: accounts, error: accountsError } = await supabase
      .from('NEW-FACEBOOK')
      .select('compte')

    if (accountsError) {
      console.error('   ERROR:', accountsError.message)
      return
    }

    const uniqueAccounts = [...new Set(accounts.map(a => a.compte))]
    console.log('   SUCCESS: Found', uniqueAccounts.length, 'unique accounts')
    console.log('   Accounts:', uniqueAccounts)
    console.log()

    console.log('ALL TESTS PASSED!')

  } catch (err) {
    console.error('UNEXPECTED ERROR:', err)
  }
}

testConnection()
