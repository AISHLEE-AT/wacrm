import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Bootstrap admin phones (fallback — DB role='admin' is primary)
const BOOTSTRAP_ADMIN_PHONES = [
  '6381029380', '916381029380', '6381029380', '916381029380'
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

function extractJwtPayload(token: string): any {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(base64)
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

  // Handle access_token in URL (deep-link) OR from custom headers (native app WebView)
  const accessToken = request.nextUrl.searchParams.get('access_token') || request.headers.get('x-supro-access-token')
  const refreshToken = request.nextUrl.searchParams.get('refresh_token') || request.headers.get('x-supro-refresh-token')

  let user: any = null

  // First, check if we already have a valid session via cookies
  try {
    const { data: sessionData } = await supabase.auth.getUser()
    if (sessionData?.user) {
      user = sessionData.user
    }
  } catch (_) {}

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

  // Fallback: If Supabase auth server is in PostgREST mode or offline, inspect JWT in cookies/headers
  if (!user) {
    const candidateTokens: string[] = []
    if (accessToken) candidateTokens.push(accessToken)
    const cookieTok = request.cookies.get('sb-access-token')?.value
    if (cookieTok) candidateTokens.push(cookieTok)
    const headerTok = request.headers.get('x-supro-access-token') || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (headerTok) candidateTokens.push(headerTok)

    for (const c of request.cookies.getAll()) {
      if (c.name.includes('-auth-token') || c.name === 'token') {
        try {
          const parsed = JSON.parse(c.value)
          if (Array.isArray(parsed) && parsed[0]) candidateTokens.push(parsed[0])
          else if (parsed?.access_token) candidateTokens.push(parsed.access_token)
          else if (typeof parsed === 'string') candidateTokens.push(parsed)
        } catch (_) {
          if (c.value && c.value.includes('.')) candidateTokens.push(c.value)
        }
      }
    }

    const nowSec = Math.floor(Date.now() / 1000)
    for (const tok of candidateTokens) {
      const payload = extractJwtPayload(tok)
      if (payload && (payload.id || payload.sub || payload.phone)) {
        if (!payload.exp || payload.exp > nowSec) {
          user = {
            id: payload.id || payload.sub || (payload.phone ? `user_${payload.phone}` : 'user_authenticated'),
            phone: payload.phone || '',
            email: payload.email || '',
            role: payload.role || 'user',
            user_metadata: payload,
          }
          break
        }
      }
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
        const rawPhone = user.phone || user.email || user.user_metadata?.phone || ''
        const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10)

        let profileData: any = null
        if (user.id && !user.id.startsWith('user_')) {
          const { data } = await supabase
            .from('profiles')
            .select('role, main_category, default_module, profile_complete')
            .eq('id', user.id)
            .maybeSingle()
          profileData = data
        }
        if (!profileData && cleanPhone) {
          const { data } = await supabase
            .from('profiles')
            .select('role, main_category, default_module, profile_complete')
            .or(`phone.ilike.%${cleanPhone}%,whatsapp.ilike.%${cleanPhone}%`)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          profileData = data
        }

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
          defaultModule = '/admin/tuto'
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
    '/admin', '/profile', '/wallet',
    '/rideo', '/moneyo', '/mandi', '/agro', '/rento', '/dealo',
    '/touro', '/tasko', '/gameo', '/tvo', '/tradeo', '/toolso',
    '/ai-assistant', '/teacho', '/testo', '/groupo',
  ]
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  const isEmbed = 
    request.nextUrl.searchParams.get('embed') === 'true' || 
    request.cookies.get('supro_is_embed')?.value === 'true' ||
    request.headers.get('x-supro-embed') === 'true';

  if (request.nextUrl.searchParams.get('embed') === 'true') {
    supabaseResponse.cookies.set('supro_is_embed', 'true', { maxAge: 86400, path: '/' });
  }

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
