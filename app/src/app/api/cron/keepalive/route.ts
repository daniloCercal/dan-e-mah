import { timingSafeEqual } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const given = Buffer.from(request.headers.get('authorization') ?? '')
  const want = Buffer.from(`Bearer ${secret}`)
  return given.length === want.length && timingSafeEqual(given, want)
}

/** Called once a day by Vercel Cron (it sends the CRON_SECRET as a bearer token): one trivial query so the free project never pauses. */
export async function GET(request: NextRequest) {
  if (!authorized(request)) return new NextResponse('Unauthorized', { status: 401 })
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { error } = await supabase.rpc('keepalive')
  if (error) return NextResponse.json({ ok: false }, { status: 502, headers: { 'Cache-Control': 'no-store' } })
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
}
