import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import jwt from 'jsonwebtoken'

const FIREBASE_API_KEY = 'AIzaSyB0UIfxvTHXmaiKCg2C5L1Vw8KCFwkVUKs'

/**
 * Firebase → Supabase Auth Bridge
 *
 * Receives a Firebase ID token (from the Flutter app's Firebase Phone Auth),
 * verifies it via the Google Identity Toolkit REST API, extracts the phone
 * number, then looks up or creates the matching Supabase user and returns
 * enough information for the Flutter client to operate against Supabase.
 *
 * POST /api/auth/firebase-bridge
 * Body: { firebaseToken: string }
 * Returns: { success, user_id, phone, firebase_uid }
 */
export async function POST(request: Request) {
  try {
    const { firebaseToken } = await request.json()

    if (!firebaseToken) {
      return NextResponse.json(
        { error: 'Missing firebaseToken' },
        { status: 400 }
      )
    }

    // ── 1. Verify the Firebase ID token via REST ──────────────────────
    const fbRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: firebaseToken }),
      }
    )

    if (!fbRes.ok) {
      const errData = await fbRes.json().catch(() => ({}))
      console.error('Firebase token verification failed:', errData)
      return NextResponse.json(
        { error: 'Invalid Firebase token', details: errData },
        { status: 401 }
      )
    }

    const fbData = await fbRes.json()
    const fbUser = fbData.users?.[0]

    if (!fbUser) {
      return NextResponse.json(
        { error: 'No Firebase user found for this token' },
        { status: 401 }
      )
    }

    const phoneNumber: string | undefined = fbUser.phoneNumber
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Firebase user has no phone number' },
        { status: 400 }
      )
    }

    const firebaseUid: string = fbUser.localId

    // ── 2. Supabase admin client ─────────────────────────────────────
    const supabase = supabaseAdmin()

    // Supabase stores phone numbers without the leading '+'.
    const phoneDigits = phoneNumber.replace('+', '')

    // ── 3. Find or create the Supabase user ──────────────────────────
    // Try to find an existing user whose phone matches.
    const { data: listData } = await supabase.auth.admin.listUsers({
      perPage: 1000,
    })
    let user = listData?.users?.find(
      (u) => u.phone === phoneDigits || u.phone === phoneNumber
    )

    if (!user) {
      // Create a new Supabase user with the phone already confirmed
      // (Firebase already verified it).
      const { data: created, error: createErr } =
        await supabase.auth.admin.createUser({
          phone: phoneDigits,
          phone_confirm: true,
          user_metadata: {
            firebase_uid: firebaseUid,
            full_name: fbUser.displayName || '',
          },
        })

      if (createErr) {
        console.error('Failed to create Supabase user:', createErr)
        return NextResponse.json(
          { error: 'Failed to create Supabase user', details: createErr.message },
          { status: 500 }
        )
      }

      user = created.user
    } else {
      // Ensure the firebase_uid is stored in user_metadata.
      if (!user.user_metadata?.firebase_uid) {
        await supabase.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...user.user_metadata,
            firebase_uid: firebaseUid,
          },
        })
      }
    }

    // ── 4. Generate Supabase Custom JWT ──────────────────────────────
    const jwtSecret = process.env.SUPABASE_JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json(
        { error: 'Server misconfiguration: SUPABASE_JWT_SECRET missing' },
        { status: 500 }
      )
    }

    const payload = {
      aud: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30), // 30 days
      sub: user.id,
      phone: user.phone,
      role: 'authenticated',
      app_metadata: user.app_metadata || {},
      user_metadata: user.user_metadata || {},
    };

    const token = jwt.sign(payload, jwtSecret);

    // ── 5. Return identifiers and tokens ─────────────────────────────
    // The web client uses access_token/refresh_token to set the session.
    // The Flutter client uses user_id for Supabase queries and
    // firebase_uid for Firebase-specific features (push notifications).
    return NextResponse.json({
      success: true,
      user_id: user.id,
      phone: phoneDigits,
      firebase_uid: firebaseUid,
      access_token: token,
      refresh_token: token,
    })
  } catch (error: any) {
    console.error('Firebase bridge error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
