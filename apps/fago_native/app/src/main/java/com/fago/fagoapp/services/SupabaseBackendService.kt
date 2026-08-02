package com.fago.fagoapp.services

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.*

class SupabaseBackendService(private val supabase: SupabaseClient) {

    suspend fun syncProfile(userId: String?, phone: String, fullName: String?): Boolean = withContext(Dispatchers.IO) {
        val cleanPhone = phone.filter { it.isDigit() }.let { if (it.length > 10) it.takeLast(10) else it }
        val targetName = fullName?.ifBlank { null } ?: "User $cleanPhone"
        val isTargetAdmin = cleanPhone.endsWith("9486335870")

        try {
            val profilePayload = buildJsonObject {
                if (!userId.isNullOrBlank()) put("id", userId)
                put("phone", cleanPhone)
                put("whatsapp", cleanPhone)
                put("full_name", if (isTargetAdmin) "Aishlee Technology" else targetName)
                put("role", if (isTargetAdmin) "admin" else "user")
                put("updated_at", java.time.Instant.now().toString())
            }

            supabase.postgrest["profiles"].upsert(profilePayload)

            try {
                supabase.postgrest["contacts"].upsert(
                    buildJsonObject {
                        put("phone", cleanPhone)
                        put("name", targetName)
                        put("role", if (isTargetAdmin) "admin" else "user")
                        put("source", "Native FAGO App")
                    }
                )
            } catch (e: Exception) { }

            true
        } catch (e: Exception) {
            false
        }
    }

    suspend fun registerDriverProfile(
        fullName: String,
        phone: String,
        licenseNumber: String,
        rcNumber: String,
        vehicleCategory: String,
        upiId: String? = null
    ): Boolean = withContext(Dispatchers.IO) {
        val cleanPhone = phone.filter { it.isDigit() }.let { if (it.length > 10) it.takeLast(10) else it }
        try {
            val payload = buildJsonObject {
                put("driver_name", fullName)
                put("name", fullName)
                put("mobile_number", cleanPhone)
                put("whatsapp_number", cleanPhone)
                put("vehicle_number", rcNumber)
                put("vehicle_type", vehicleCategory)
                put("license_number", licenseNumber)
                if (!upiId.isNullOrBlank()) put("upi_id", upiId)
                put("is_verified", true)
                put("verification_status", "approved")
                put("status", "online")
            }

            supabase.postgrest["drivers"].upsert(payload)

            supabase.postgrest["profiles"].upsert(
                buildJsonObject {
                    put("phone", cleanPhone)
                    put("whatsapp", cleanPhone)
                    put("full_name", fullName)
                    put("role", "driver")
                }
            )
            true
        } catch (e: Exception) {
            false
        }
    }

    suspend fun updateDriverVerificationStatus(driverId: String, isVerified: Boolean): Boolean = withContext(Dispatchers.IO) {
        try {
            supabase.postgrest["drivers"].update(
                buildJsonObject {
                    put("is_verified", isVerified)
                    put("verification_status", if (isVerified) "approved" else "pending")
                }
            ) {
                filter { eq("id", driverId) }
            }
            true
        } catch (e: Exception) {
            false
        }
    }
}
