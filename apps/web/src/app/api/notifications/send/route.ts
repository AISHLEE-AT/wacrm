import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * Push Notification Sender
 *
 * Looks up a driver's FCM token from the `drivers` table and dispatches a
 * push notification via Firebase Cloud Messaging (legacy HTTP API).
 *
 * POST /api/notifications/send
 * Body: { driverId: string, title?: string, body?: string, data?: Record<string, string> }
 * Returns: { success, fcm_response }
 */
export async function POST(request: Request) {
  try {
    const { driverId, title, body, data } = await request.json()

    if (!driverId) {
      return NextResponse.json(
        { error: 'Missing driverId' },
        { status: 400 }
      )
    }

    const firebaseServerKey = process.env.FIREBASE_SERVER_KEY
    if (!firebaseServerKey) {
      console.error('FIREBASE_SERVER_KEY is not set')
      return NextResponse.json(
        { error: 'Push notifications are not configured' },
        { status: 503 }
      )
    }

    // ── 1. Look up the driver's FCM token ────────────────────────────
    const supabase = supabaseAdmin()

    const { data: driver, error: driverErr } = await supabase
      .from('drivers')
      .select('fcm_token, name')
      .eq('id', driverId)
      .single()

    if (driverErr || !driver) {
      console.error('Driver lookup failed:', driverErr)
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      )
    }

    if (!driver.fcm_token) {
      return NextResponse.json(
        { error: 'Driver has no FCM token registered' },
        { status: 404 }
      )
    }

    // ── 2. Send the push notification via FCM (legacy HTTP API) ──────
    const fcmRes = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=${firebaseServerKey}`,
      },
      body: JSON.stringify({
        to: driver.fcm_token,
        notification: {
          title: title || 'New Ride Request!',
          body: body || 'A passenger is looking for a ride near you.',
        },
        data: data || {},
      }),
    })

    if (!fcmRes.ok) {
      const errText = await fcmRes.text()
      console.error('FCM send failed:', errText)
      return NextResponse.json(
        { error: 'FCM request failed', details: errText },
        { status: 502 }
      )
    }

    const fcmData = await fcmRes.json()

    return NextResponse.json({ success: true, fcm_response: fcmData })
  } catch (error: any) {
    console.error('Push notification error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
