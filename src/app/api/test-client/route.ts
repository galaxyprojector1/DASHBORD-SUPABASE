/**
 * Test API endpoint to verify client-side Supabase configuration
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...`
      : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
  }

  // Check for newlines
  const hasNewlineInUrl = envVars.NEXT_PUBLIC_SUPABASE_URL.includes('\n')
  const hasNewlineInKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.includes('\n') || false

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: envVars,
    issues: {
      newlineInUrl: hasNewlineInUrl,
      newlineInKey: hasNewlineInKey,
    },
    urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
    urlBytes: Array.from(process.env.NEXT_PUBLIC_SUPABASE_URL || '').map((c) => c.charCodeAt(0)),
  })
}
