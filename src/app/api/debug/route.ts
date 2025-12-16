/**
 * Debug API endpoint to check Supabase configuration in production
 */

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...`
        : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
    },
    supabaseClient: {
      configured: !!supabase,
    },
    tableTest: null as any,
    error: null as any,
  }

  try {
    // Test table access
    const { data, error, count } = await supabase
      .from('NEW-FACEBOOK')
      .select('*', { count: 'exact' })
      .limit(1)

    if (error) {
      diagnostics.error = {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      }
    } else {
      diagnostics.tableTest = {
        success: true,
        totalRows: count,
        sampleRow: data?.[0] || null,
      }
    }
  } catch (err: any) {
    diagnostics.error = {
      type: 'exception',
      message: err.message,
      stack: err.stack,
    }
  }

  return NextResponse.json(diagnostics, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}
