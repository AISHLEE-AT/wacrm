(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push(["chunks/[root-of-the-server]__148v_u1._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/apps/web/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/spec-extension/response.js [middleware-edge] (ecmascript)");
;
;
async function middleware(request) {
    let supabaseResponse = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next({
        request
    });
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://gmahjdzqitbomtmdzlfp.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtYWhqZHpxaXRib210bWR6bGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNTE3MjcsImV4cCI6MjA5NzgyNzcyN30.04eGatbmH8yjtGCE2a2t2xfKAla72RZF7ZDfOevj6RE"), {
        cookies: {
            getAll () {
                return request.cookies.getAll();
            },
            setAll (cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options })=>request.cookies.set(name, value));
                supabaseResponse = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next({
                    request
                });
                cookiesToSet.forEach(({ name, value, options })=>supabaseResponse.cookies.set(name, value, options));
            }
        }
    });
    const { data: { user } } = await supabase.auth.getUser();
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
    const withRefreshedCookies = (response)=>{
        supabaseResponse.cookies.getAll().forEach((cookie)=>{
            response.cookies.set(cookie);
        });
        return response;
    };
    // Auth pages - redirect to dashboard if already logged in.
    // Exception: when an invite token is in the query string we
    // send the already-signed-in user to /join/<token> instead so
    // they can accept the invitation in one click. Without this,
    // a forwarded invite link to someone who's already signed in
    // would silently drop them on /dashboard.
    if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup' || request.nextUrl.pathname === '/forgot-password')) {
        const url = request.nextUrl.clone();
        const inviteToken = request.nextUrl.searchParams.get('invite');
        if (inviteToken && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
            url.pathname = `/join/${encodeURIComponent(inviteToken)}`;
            url.search = '';
        } else {
            url.pathname = '/dashboard';
            url.search = '';
        }
        return withRefreshedCookies(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url));
    }
    // Protected pages - redirect to login if not authenticated
    const protectedPaths = [
        '/dashboard',
        '/inbox',
        '/contacts',
        '/pipelines',
        '/broadcasts',
        '/automations',
        '/settings'
    ];
    if (!user && protectedPaths.some((path)=>request.nextUrl.pathname.startsWith(path))) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return withRefreshedCookies(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url));
    }
    // API routes that need auth (not webhooks)
    if (!user && request.nextUrl.pathname.startsWith('/api/whatsapp/') && !request.nextUrl.pathname.includes('/webhook')) {
        return withRefreshedCookies(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Unauthorized'
        }, {
            status: 401
        }));
    }
    return supabaseResponse;
}
const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__148v_u1._.js.map