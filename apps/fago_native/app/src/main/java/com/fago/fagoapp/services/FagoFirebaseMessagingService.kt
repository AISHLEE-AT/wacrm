package com.fago.fagoapp.services

import android.util.Log
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import org.koin.android.ext.android.inject

/**
 * Firebase Cloud Messaging service — same Firebase project as Flutter app.
 * Handles push notifications for ride requests, admin alerts, OTP notifications.
 * Saves FCM token to Supabase `push_tokens` table so both Flutter & Native
 * users can be targeted by the same push notification system.
 */
class FagoFirebaseMessagingService : FirebaseMessagingService() {

    private val supabase: SupabaseClient by inject()
    private val scope = CoroutineScope(Dispatchers.IO)

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d("FagoFCM", "New FCM token: $token")
        saveFcmTokenToSupabase(token)
    }

    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)
        val title = message.notification?.title ?: message.data["title"] ?: "FAGO"
        val body  = message.notification?.body  ?: message.data["body"]  ?: ""
        val type  = message.data["type"] ?: "general"

        Log.d("FagoFCM", "Message received: type=$type, title=$title")

        when (type) {
            "ride_request"  -> showRideRequestAlert(title, body, message.data)
            "admin_alert"   -> showAdminAlert(title, body)
            "otp"           -> showOtpNotification(title, body)
            else            -> showGeneralNotification(title, body)
        }
    }

    private fun saveFcmTokenToSupabase(token: String) {
        scope.launch {
            try {
                val userId = supabase.auth.currentUserOrNull()?.id ?: return@launch
                supabase.postgrest["push_tokens"].upsert(
                    buildJsonObject {
                        put("user_id", userId)
                        put("token", token)
                        put("platform", "android_native")
                        put("updated_at", java.time.Instant.now().toString())
                    }
                )
            } catch (e: Exception) {
                Log.e("FagoFCM", "Token save error: ${e.message}")
            }
        }
    }

    private fun showRideRequestAlert(title: String, body: String, data: Map<String, String>) {
        // Full-screen intent for incoming ride — like Ola/Uber
        // This uses USE_FULL_SCREEN_INTENT permission declared in manifest
        Log.d("FagoFCM", "Ride request: $data")
        showGeneralNotification("🚗 $title", body)
    }

    private fun showAdminAlert(title: String, body: String) =
        showGeneralNotification("👑 $title", body)

    private fun showOtpNotification(title: String, body: String) =
        showGeneralNotification("🔑 $title", body)

    private fun showGeneralNotification(title: String, body: String) {
        Log.d("FagoFCM", "Notification: $title — $body")
        // NotificationCompat builder would go here for full implementation
    }
}
