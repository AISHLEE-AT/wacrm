import { NextResponse } from 'next/server'
import * as admin from 'firebase-admin'
import { createClient } from '@supabase/supabase-js'

// Initialize Firebase Admin (Only once)
// @ts-ignore
if (!admin.apps.length) {
  try {
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
    if (serviceAccountBase64) {
      const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'))
      admin.initializeApp({
        // @ts-ignore
        credential: admin.credential.cert(serviceAccount)
      })
    }
  } catch (error) {
    console.error('Firebase Admin init error', error)
  }
}

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: Request) {
  try {
    const { pickup_address, dropoff_address, price } = await req.json()
    
    if (!admin.apps.length) {
      return NextResponse.json({ error: 'Firebase not configured' }, { status: 500 })
    }

    const supabase = supabaseAdmin()
    
    // Find online drivers with enough balance and a valid FCM token
    const { data: drivers, error } = await supabase
      .from('drivers')
      .select('fcm_token')
      .eq('status', 'online')
      .gte('wallet_balance', 999)
      .not('fcm_token', 'is', null)

    if (error) throw error

    const tokens = drivers
      .map(d => d.fcm_token)
      .filter(t => t && t.trim().length > 0)

    if (tokens.length === 0) {
      return NextResponse.json({ success: true, message: 'No drivers to notify' })
    }

    const message = {
      notification: {
        title: 'New Ride Request!',
        body: `Pickup: ${pickup_address} | Est: ₹${price}`,
      },
      data: {
        type: 'new_ride',
        pickup_address: String(pickup_address),
        dropoff_address: String(dropoff_address)
      },
      tokens: tokens, // Multicast
      android: {
        priority: 'high' as const,
        notification: { sound: 'default' }
      }
    }

    const response = await admin.messaging().sendEachForMulticast(message)
    
    return NextResponse.json({ success: true, successCount: response.successCount })
  } catch (error: any) {
    console.error('Broadcast notification error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
