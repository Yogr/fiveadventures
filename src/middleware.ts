import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { COOKIE_NAMES } from '@/lib/constants'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired and get user info - required for Server Components
  const { data: { user } } = await supabase.auth.getUser()

  // Handle character creation - if the URL contains a characterId query param,
  // set it as a cookie for future requests
  const url = new URL(request.url)
  const characterId = url.searchParams.get('characterId')
  if (characterId) {
    response.cookies.set({
      name: COOKIE_NAMES.CHARACTER_ID,
      value: characterId,
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      httpOnly: true,
      sameSite: 'strict'
    })

    // If user is authenticated, link the character to the user
    if (user?.id) {
      // We can't directly call server actions from middleware,
      // so we'll add a header to indicate that this character
      // should be linked to the user
      response.headers.set('X-Link-Character', 'true')
    }

    // Redirect to the same URL without the characterId query param
    url.searchParams.delete('characterId')
    return NextResponse.redirect(url)
  }

  // We don't need to redirect users since we allow unauthenticated play
  // But we'll keep the middleware for session refreshing and cookie handling

  // Redirect /dungeon to /adventure with tab=dungeon query param
  if (request.nextUrl.pathname === '/dungeon') {
    const adventureUrl = new URL('/adventure', request.url)
    adventureUrl.searchParams.set('tab', 'dungeon')
    return NextResponse.redirect(adventureUrl)
  }

  // Redirect /character to home page
  if (request.nextUrl.pathname === '/character' && !request.nextUrl.pathname.startsWith('/character/create')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Check if user is trying to access the data editor but doesn't have admin privileges
  if (request.nextUrl.pathname.startsWith('/editGameData')) {
    if (!user) {
      // If not logged in, redirect to login page
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check if the user has admin status
    const { data: userData, error } = await supabase
      .from('users')
      .select('status')
      .eq('id', user.id)
      .single()

    if (error || !userData || userData.status !== 'admin') {
      // If not an admin, redirect to homepage
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

// Only run middleware on auth-related paths
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
