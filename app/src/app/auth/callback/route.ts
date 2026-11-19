import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}/`)
  }
  // Closing the Google window is not a refusal; anything else means the account was turned away.
  if (searchParams.get('error') === 'access_denied') return NextResponse.redirect(`${origin}/entrar`)
  return NextResponse.redirect(`${origin}/sem-acesso`)
}
