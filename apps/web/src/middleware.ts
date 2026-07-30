import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Bootstrap admin phones (fallback — DB role='admin' is primary)
const BOOTSTRAP_ADMIN_PHONES = [
  '9486335870', '919486335870',
  '9123596988', '919123596988'
]
const BOOTSTRAP_ADMIN_EMAILS = ['aishleetechnology@gmail.com']

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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Handle access_token in URL (deep-link from mobile apps)
  const accessToken = request.nextUrl.searchParams.get('access_token')
  const refreshToken = request.nextUrl.searchParams.get('refresh_token')

  let user = null

  if (accessToken) {
    try {
      const { data: tokenData } = await supabase.auth.getUser(accessToken)
      if (tokenData?.user) {
        user = tokenData.user
        if (refreshToken) {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        }
      }
    } catch (err) {
      console.error('Middleware token auth error:', err)
    }
  }

  if (!user) {
    const { data } = await supabase.auth.getUser()
    user = data?.user
  }

  // Copy refreshed cookies onto any redirect/JSON response we construct below.
  // This prevents session wedge after token rotation (issue #288).
  const withRefreshedCookies = <T extends NextResponse>(response: T): T => {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie)
    })
    return response
  }

  // ── Redirect logged-in users away from auth pages ──────────────────────────
  const isAuthPage = [
    '/', '/login', '/signup', '/forgot-password'
  ].includes(request.nextUrl.pathname)

  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    const inviteToken = request.nextUrl.searchParams.get('invite')

    if (inviteToken && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
      url.pathname = `/join/${encodeURIComponent(inviteToken)}`
      url.search = ''
    } else {
      // Resolve role from profiles DB
      let defaultModule = '/rideo'
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role, main_category, default_module, profile_complete')
          .eq('id', user.id)
          .single()

        const role = profileData?.role?.toLowerCase()
        const userText = `${user.email ?? ''} ${user.phone ?? ''}`.toLowerCase()
        const isBootstrapAdmin = [
          ...BOOTSTRAP_ADMIN_PHONES,
          ...BOOTSTRAP_ADMIN_EMAILS
        ].some(id => userText.includes(id.toLowerCase()))

        const isAdmin = role === 'admin' || isBootstrapAdmin
        const isDriver = role === 'driver'

        if (isAdmin) {
          defaultModule = '/crm'
        } else if (isDriver) {
          defaultModule = '/drivo'
        } else {
          const routeMap: Record<string, string> = {
            Traveller: '/rideo', Driver: '/drivo', Farmer: '/rento',
            Shopper: '/dealo', Student: '/teacho', Teacher: '/teacho',
            Financier: '/moneyo', JobSeeker: '/teacho', Tourist: '/touro'
          }
          defaultModule = profileData?.default_module
            || routeMap[profileData?.main_category || '']
            || '/rideo'
        }
      } catch (err) {
        console.error('Middleware profile fetch error:', err)
      }

      url.pathname = defaultModule
      url.search = ''
      supabaseResponse.cookies.set('fago_onboarded', '1', { maxAge: 31536000, path: '/' })
    }
    return withRefreshedCookies(NextResponse.redirect(url))
  }

  // ── Protect pages that require auth ────────────────────────────────────────
  const protectedPaths = [
    '/dashboard', '/inbox', '/contacts', '/pipelines', '/broadcasts',
    '/automations', '/flows', '/settings', '/drivo',
    '/admin', '/profile', '/wallet', '/crm'
  ]
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    return withRefreshedCookies(NextResponse.redirect(url))
  }

  // ── Protect API routes (except public auth endpoints) ──────────────────────
  const isPublicApiPath = [
    '/api/auth/whatsapp/send-otp',
    '/api/auth/whatsapp/verify-otp',
    '/api/auth/pin-login',
    '/api/auth/firebase-bridge',
    '/api/auth/callback',
  ].some(p => request.nextUrl.pathname.startsWith(p))
    || request.nextUrl.pathname.includes('/webhook')

  if (!user &&
    (request.nextUrl.pathname.startsWith('/api/whatsapp/') ||
      request.nextUrl.pathname.startsWith('/api/admin/')) &&
    !isPublicApiPath) {
    return withRefreshedCookies(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    )
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
