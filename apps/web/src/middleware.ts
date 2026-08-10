import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Bootstrap admin phones (fallback — DB role='admin' is primary)
const BOOTSTRAP_ADMIN_PHONES = [
  '6381029380', '916381029380', '9486335870', '919486335870'
]
const BOOTSTRAP_ADMIN_EMAILS = ['aishleetechnology@gmail.com']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Handle CORS for /api/auth/
  if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    const origin = request.headers.get('origin') ?? ''
    const isAllowedOrigin = origin === 'https://thamizhan.vercel.app' || origin.startsWith('http://localhost')
    
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': isAllowedOrigin ? origin : '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true',
        }
      })
    }
    
    supabaseResponse.headers.set('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*')
    supabaseResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    supabaseResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    supabaseResponse.headers.set('Access-Control-Allow-Credentials', 'true')
  }

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

  // First, check if we already have a valid session via cookies
  const { data: sessionData } = await supabase.auth.getUser()
  if (sessionData?.user) {
    user = sessionData.user
  }

  // If no user from cookies, but we have URL tokens (mobile app inject), try to set session
  if (!user && accessToken && refreshToken) {
    try {
      const { data } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })
      user = data?.user
    } catch (err) {
      console.error('Middleware setSession error:', err)
    }
  } else if (!user && accessToken) {
    try {
      const { data: tokenData } = await supabase.auth.getUser(accessToken)
      if (tokenData?.user) {
        user = tokenData.user
      }
    } catch (err) {
      console.error('Middleware token auth error:', err)
    }
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

        const role = profileData?.role?.toLowerCase() || ''
        const category = profileData?.main_category?.toLowerCase() || ''
        const userText = `${user.email ?? ''} ${user.phone ?? ''}`.toLowerCase()
        const isBootstrapAdmin = [
          ...BOOTSTRAP_ADMIN_PHONES,
          ...BOOTSTRAP_ADMIN_EMAILS
        ].some(id => userText.includes(id.toLowerCase()))

        const isAdmin = role === 'admin' || isBootstrapAdmin
        let isDriver = role.includes('driver') || category.includes('driver')

        if (!isDriver && (user.phone || user.email)) {
          const rawPhone = user.phone || user.email || ''
          const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10)
          if (cleanPhone) {
            const { data: driverData } = await supabase
              .from('drivers')
              .select('id')
              .or(`user_id.eq.${user.id},phone.ilike.%${cleanPhone}%,mobile_number.ilike.%${cleanPhone}%,whatsapp_number.ilike.%${cleanPhone}%`)
              .limit(1)
              .maybeSingle()
            
            if (driverData) {
              isDriver = true;
            }
          }
        }

        if (isAdmin) {
          defaultModule = '/crm'
        } else if (isDriver) {
          defaultModule = '/drivo'
        } else {
          const routeMap: Record<string, string> = {
            Traveller: '/rideo', Driver: '/drivo', 'Driver Partner': '/drivo', Farmer: '/rento',
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
    '/admin', '/profile', '/wallet', '/crm',
    '/rideo', '/moneyo', '/mandi', '/agro', '/rento', '/dealo',
    '/touro', '/tasko', '/gameo', '/tvo', '/tradeo', '/toolso',
    '/ai-assistant', '/teacho', '/testo',
  ]
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  const isEmbed = request.nextUrl.searchParams.get('embed') === 'true';

  // Enforce login wall only for protected paths when not requested in embed/mobile mode
  if (!user && isProtectedPath && !isEmbed) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.search = ''
    return withRefreshedCookies(NextResponse.redirect(loginUrl))
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
