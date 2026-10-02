import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function extractJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    let token = request.cookies.get('sb-access-token')?.value || '';
    if (!token) {
      const authHeader = request.headers.get('authorization') || '';
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }
    if (!token) {
      for (const c of request.cookies.getAll()) {
        if (c.name.includes('-auth-token')) {
          try {
            const parsed = JSON.parse(c.value);
            if (Array.isArray(parsed) && parsed[0]) token = parsed[0];
            else if (parsed?.access_token) token = parsed.access_token;
          } catch (_) {
            if (c.value && c.value.includes('.')) token = c.value;
          }
        }
      }
    }

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null, profile: null });
    }

    const payload = extractJwtPayload(token);
    if (!payload || (!payload.id && !payload.phone && !payload.sub)) {
      return NextResponse.json({ authenticated: false, user: null, profile: null });
    }

    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowSec) {
      return NextResponse.json({ authenticated: false, user: null, profile: null, error: 'Token expired' }, { status: 401 });
    }

    const cleanPhone = (payload.phone || '').replace(/\D/g, '').slice(-10);
    const userId = payload.id || payload.sub || (cleanPhone ? `user_${cleanPhone}` : 'user_authenticated');

    const user = {
      id: userId,
      app_metadata: {},
      user_metadata: payload,
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: payload.email || '',
      phone: payload.phone || '',
      role: payload.role || 'user',
    };

    const supabase = await createClient();
    let profile: any = null;

    if (userId && !userId.startsWith('user_')) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      profile = data;
    }

    if (!profile && cleanPhone) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .or(`phone.ilike.%${cleanPhone}%,whatsapp.ilike.%${cleanPhone}%`)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      profile = data;
    }

    if (!profile) {
      profile = {
        id: userId,
        full_name: payload.fullName || payload.name || `User ${cleanPhone.slice(-4)}`,
        phone: cleanPhone,
        whatsapp: cleanPhone,
        role: payload.role || 'user',
        main_category: payload.category || 'Traveller',
        account_id: 'f21e8cdb-e27d-41fa-9aa4-af06ccdc0feb',
        account_role: payload.role === 'admin' ? 'admin' : 'owner',
      };
    }

    return NextResponse.json({
      authenticated: true,
      user,
      profile,
      token,
    });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 });
  }
}
