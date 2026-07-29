package com.fago.fagoapp.services

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log

object WhatsAppService {
    private const val TAG = "WhatsAppService"

    /**
     * Opens WhatsApp natively on Android with pre-filled message.
     */
    fun openWhatsApp(context: Context, phone: String, message: String): Boolean {
        var cleanPhone = phone.replace(Regex("[^0-9]"), "")
        if (cleanPhone.length == 10) {
            cleanPhone = "91$cleanPhone"
        }
        val encodedMessage = Uri.encode(message)

        val nativeAppUri = Uri.parse("whatsapp://send?phone=$cleanPhone&text=$encodedMessage")
        val webUri = Uri.parse("https://wa.me/$cleanPhone?text=$encodedMessage")

        return try {
            val intent = Intent(Intent.ACTION_VIEW, nativeAppUri).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            Log.d(TAG, "Native WhatsApp intent failed, falling back to HTTPS wa.me: ${e.message}")
            try {
                val webIntent = Intent(Intent.ACTION_VIEW, webUri).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                context.startActivity(webIntent)
                true
            } catch (ex: Exception) {
                Log.e(TAG, "Failed to launch WhatsApp link: ${ex.message}")
                false
            }
        }
    }

    /**
     * Auto-links newly registered user's WhatsApp number to local Area Admin & WhatsApp Group.
     */
    fun autoLinkToAreaAdminWhatsAppGroup(
        context: Context,
        userPhone: String,
        userName: String,
        adminPhone: String = "919486335870",
        pincode: String = "641001"
    ) {
        val message = """
            👋 *NEW USER QR REGISTERED ON FAGO APP* 👋
            
            👤 *User Name:* $userName
            📱 *Registered WhatsApp Cell:* $userPhone
            📮 *Pincode Area:* $pincode
            
            👉 *Please add me to the official Pincode $pincode Area Admin WhatsApp Group and send my local welcome guide!*
        """.trimIndent()

        openWhatsApp(context, adminPhone, message)
    }

    /**
     * Launch Native Google Maps App for Turn-by-Turn Navigation ($0 API Cost)
     */
    fun openGoogleMapsApp(
        context: Context,
        destinationLat: Double,
        destinationLng: Double,
        originLat: Double? = null,
        originLng: Double? = null
    ): Boolean {
        val googleNavUri = Uri.parse("google.navigation:q=$destinationLat,$destinationLng&mode=d")
        val mapsWebUri = if (originLat != null && originLng != null) {
            Uri.parse("https://www.google.com/maps/dir/?api=1&origin=$originLat,$originLng&destination=$destinationLat,$destinationLng&travelmode=driving")
        } else {
            Uri.parse("https://www.google.com/maps/search/?api=1&query=$destinationLat,$destinationLng")
        }

        return try {
            val intent = Intent(Intent.ACTION_VIEW, googleNavUri).apply {
                setPackage("com.google.android.apps.maps")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            try {
                val webIntent = Intent(Intent.ACTION_VIEW, mapsWebUri).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                context.startActivity(webIntent)
                true
            } catch (ex: Exception) {
                Log.e(TAG, "Error launching Google Maps: ${ex.message}")
                false
            }
        }
    }

    /**
     * Launch 1-Tap UPI Payment Intent (GPay, PhonePe, Paytm, BHIM)
     */
    fun openUpiPayment(
        context: Context,
        upiId: String,
        name: String,
        amount: Double,
        note: String
    ): Boolean {
        val encodedName = Uri.encode(name)
        val encodedNote = Uri.encode(note)
        val formattedAmount = String.format("%.2f", amount)
        val upiUri = Uri.parse(
            "upi://pay?pa=$upiId&pn=$encodedName&am=$formattedAmount&cu=INR&tn=$encodedNote"
        )

        return try {
            val intent = Intent(Intent.ACTION_VIEW, upiUri).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            Log.e(TAG, "Error launching UPI payment intent: ${e.message}")
            false
        }
    }

    /**
     * Automated Ride Confirmation Message Template for WhatsApp with Auto Live GPS Pin & Security OTP
     */
    fun getRideConfirmationTemplate(
        vehicleCategory: String,
        pickupAddress: String,
        dropoffAddress: String,
        fare: Double,
        pincode: String? = null,
        lat: Double? = null,
        lng: Double? = null,
        riderName: String? = null,
        riderPhone: String? = null,
        otpCode: String? = null
    ): String {
        val cleanName = if (!riderName.isNullOrEmpty() && riderName.lowercase() != "user") riderName else "FAGO Rider"
        val cleanPhone = if (!riderPhone.isNullOrEmpty()) riderPhone else "Registered Mobile"

        val sb = StringBuilder()
        sb.appendLine("🚗 *RideO Booking Request*")
        sb.appendLine("👤 *Rider*: $cleanName ($cleanPhone)")
        sb.appendLine("• *Vehicle*: $vehicleCategory")
        sb.appendLine("• *Pickup*: $pickupAddress")
        if (!pincode.isNullOrEmpty()) {
            sb.appendLine("• *Pincode*: $pincode")
        }
        sb.appendLine("• *Dropoff*: $dropoffAddress")
        sb.appendLine("• *Estimated Fare*: ₹${fare.toInt()} (0% Commission)")
        if (!otpCode.isNullOrEmpty()) {
            sb.appendLine("🔑 *START TRIP SECURITY PIN*: $otpCode")
        }

        if (lat != null && lng != null) {
            sb.appendLine("\n📍 *Live GPS Location Pin*: https://maps.google.com/?q=$lat,$lng")
        }
        sb.appendLine("\nPlease confirm availability!")
        return sb.toString()
    }
}
