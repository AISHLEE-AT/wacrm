import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // getUser() transparently refreshes an expired access token, which
  // ROTATES the refresh token and writes the new cookies onto
  // `supabaseResponse` via setAll() above. Any response we return in
  // place of `supabaseResponse` (every redirect / JSON branch below)
  // is a fresh object that does NOT carry those Set-Cookie headers, so
  // the rotated token never reaches the browser. The next request then
  // replays the old, now-consumed refresh token, the refresh fails, and
  // the session wedges — the user gets a broken reload after idling and
  // can only recover by manually clearing cookies (issue #288). Copy the
  // refreshed cookies onto whatever response we hand back to fix that.
  const withRefreshedCookies = <T extends NextResponse>(response: T): T => {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie)
    })
    return response
  }

  // Auth pages - redirect to dashboard if already logged in.
  // Exception: when an invite token is in the query string we
  // send the already-signed-in user to /join/<token> instead so
  // they can accept the invitation in one click. Without this,
  // a forwarded invite link to someone who's already signed in
  // would silently drop them on /dashboard.
  if (user && (
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/signup' ||
    request.nextUrl.pathname === '/forgot-password'
  )) {
    const url = request.nextUrl.clone()
    const inviteToken = request.nextUrl.searchParams.get('invite')
    if (
      inviteToken &&
      (request.nextUrl.pathname === '/login' ||
        request.nextUrl.pathname === '/signup')
    ) {
      url.pathname = `/join/${encodeURIComponent(inviteToken)}`
      url.search = ''
    } else {
      // Smart Default Module Routing & Onboarding
      let defaultModule = null;
      let profileComplete = false;
      try {
        const { data } = await supabase
          .from('profiles')
          .select('default_module, profile_complete')
          .eq('id', user.id)
          .single();
        defaultModule = data?.default_module;
        profileComplete = data?.profile_complete;
      } catch (err) {
        console.error('Failed to fetch profile status in middleware', err);
      }
      
      if (!profileComplete) {
        url.pathname = '/onboarding';
      } else {
        const isAdmin = user.email === 'aishleetechnology@gmail.com' || user.phone?.includes('9486335870');
        url.pathname = isAdmin ? '/dashboard' : '/rideo';
        supabaseResponse.cookies.set('fago_onboarded', '1', { maxAge: 31536000, path: '/' });
      }
      url.search = ''
    }
    return withRefreshedCookies(NextResponse.redirect(url))
  }

  // Protected pages - redirect to login if not authenticated
  const protectedPaths = [
    '/dashboard', '/inbox', '/contacts', '/pipelines', '/broadcasts',
    '/automations', '/flows', '/settings', '/onboarding',
    '/admin', '/profile', '/wallet',
    '/rideo', '/drivo',
  ]
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path)) || request.nextUrl.pathname === '/';
  
  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return withRefreshedCookies(NextResponse.redirect(url))
  }

  // Onboarding Check - enforce onboarding on protected paths for authenticated users
  if (user && isProtectedPath && !request.nextUrl.pathname.startsWith('/onboarding')) {
    const hasOnboardedCookie = request.cookies.has('fago_onboarded');
    
    if (!hasOnboardedCookie) {
      // Fallback to DB check if cookie is missing but user is logged in
      try {
        const { data } = await supabase
          .from('profiles')
          .select('profile_complete')
          .eq('id', user.id)
          .single();
          
        if (!data?.profile_complete) {
          const url = request.nextUrl.clone();
          url.pathname = '/onboarding';
          return withRefreshedCookies(NextResponse.redirect(url));
        } else {
          // They are complete, set the cookie so we don't query DB next time
          supabaseResponse.cookies.set('fago_onboarded', '1', { maxAge: 31536000, path: '/' });
        }
      } catch (err) {
        console.error('Error verifying onboarding fallback', err);
      }
    }
  }

  // API routes that need auth (not webhooks)
  if (!user && 
      (request.nextUrl.pathname.startsWith('/api/whatsapp/') || request.nextUrl.pathname.startsWith('/api/admin/')) &&
      !request.nextUrl.pathname.includes('/webhook')) {
    return withRefreshedCookies(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    )
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
