import { NextResponse } from 'next/server'
import * as admin from 'firebase-admin'

// Initialize Firebase Admin (Only once)
if (!admin.apps.length) {
  try {
    // Expected to be a base64 encoded JSON string of the service account key
    // e.g. base64(JSON.stringify(require('./serviceAccountKey.json')))
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
    
    if (serviceAccountBase64) {
      const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'))
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      })
      console.log('Firebase Admin initialized via Base64 ENV')
    } else {
      console.warn('FIREBASE_SERVICE_ACCOUNT_BASE64 is not set. Push notifications will fail.')
    }
  } catch (error) {
    console.error('Firebase Admin initialization error', error)
  }
}

export async function POST(req: Request) {
  try {
    const { token, title, body, data } = await req.json()
    
    if (!token) {
      return NextResponse.json({ error: 'FCM token required' }, { status: 400 })
    }

    if (!admin.apps.length) {
      return NextResponse.json({ error: 'Firebase Admin not initialized on server' }, { status: 500 })
    }

    const message = {
      notification: {
        title: title || 'Fago Update',
        body: body || '',
      },
      data: data || {},
      token: token,
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default'
          }
        }
      }
    }

    const response = await admin.messaging().send(message)
    
    return NextResponse.json({ success: true, messageId: response })
  } catch (error: any) {
    console.error('Send notification error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
