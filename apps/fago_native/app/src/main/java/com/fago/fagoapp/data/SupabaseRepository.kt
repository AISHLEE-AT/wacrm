package com.fago.fagoapp.data

import android.util.Log
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.realtime.realtime
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.serialization.json.*

data class RideRequestItem(
    val id: String,
    val riderId: String,
    val riderPhone: String,
    val pickupAddress: String,
    val dropoffAddress: String,
    val pickupLat: Double,
    val pickupLng: Double,
    val dropoffLat: Double,
    val dropoffLng: Double,
    val vehicleCategory: String,
    val estimatedFare: Double,
    val status: String,
    val driverId: String? = null,
    val driverPhone: String? = null
)

/**
 * Supabase Data Repository for FAGO Native Android App.
 * Parity with Flutter's SupabaseBackendService.
 * Connects directly to Supabase PostgreSQL database tables:
 *   - whatsapp_otps
 *   - profiles
 *   - contacts
 *   - drivers
 *   - driver_profiles
 *   - ride_requests
 *   - driver_locations
 */
class SupabaseRepository(private val supabase: SupabaseClient) {

    /** Save Lead / Contact to CRM database for marketing & follow-ups */
    suspend fun saveCrmContact(
        userId: String?,
        name: String,
        phone: String,
        role: String = "Rider",
        city: String = "Tamil Nadu",
        category: String = "General"
    ): Boolean {
        return try {
            val cleanPhone = phone.filter { it.isDigit() }
            supabase.postgrest["contacts"].upsert(
                buildJsonObject {
                    if (userId != null) put("user_id", userId)
                    put("name", name.ifBlank { "App User" })
                    put("phone", cleanPhone)
                    put("role", role)
                    put("city", city)
                    put("last_vehicle_category", category)
                    put("source", "FAGO Native Android App")
                    put("updated_at", java.time.Instant.now().toString())
                }
            )
            true
        } catch (e: Exception) {
            Log.e("SupabaseRepo", "Save contact error: ${e.message}")
            false
        }
    }

    /** Save 6-digit OTP to Supabase whatsapp_otps table (resilient dual key format: 10-digit & 91-10digit) */
    suspend fun saveWhatsAppOtp(tenDigit: String, otp: String, expiresAtIso: String): Boolean {
        return try {
            val ninetyOne = "91$tenDigit"
            supabase.postgrest["whatsapp_otps"].upsert(
                buildJsonArray {
                    add(buildJsonObject {
                        put("phone_number", tenDigit)
                        put("otp", otp)
                        put("expires_at", expiresAtIso)
                    })
                    add(buildJsonObject {
                        put("phone_number", ninetyOne)
                        put("otp", otp)
                        put("expires_at", expiresAtIso)
                    })
                }
            )
            true
        } catch (e: Exception) {
            Log.d("SupabaseRepo", "OTP save note: ${e.message}")
            false
        }
    }

    /** Create a new ride request in Supabase ride_requests table */
    suspend fun createRideRequest(ride: RideRequestItem): Boolean {
        return try {
            supabase.postgrest["ride_requests"].insert(
                buildJsonObject {
                    put("id", ride.id)
                    put("rider_id", ride.riderId)
                    put("rider_phone", ride.riderPhone)
                    put("pickup_address", ride.pickupAddress)
                    put("dropoff_address", ride.dropoffAddress)
                    put("pickup_lat", ride.pickupLat)
                    put("pickup_lng", ride.pickupLng)
                    put("dropoff_lat", ride.dropoffLat)
                    put("dropoff_lng", ride.dropoffLng)
                    put("vehicle_category", ride.vehicleCategory)
                    put("estimated_fare", ride.estimatedFare)
                    put("status", "requested")
                    put("created_at", java.time.Instant.now().toString())
                }
            )
            true
        } catch (e: Exception) {
            Log.e("SupabaseRepo", "Create ride request error: ${e.message}")
            false
        }
    }

    /** Driver accepts a ride request */
    suspend fun acceptRideRequest(rideId: String, driverId: String, driverPhone: String): Boolean {
        return try {
            supabase.postgrest["ride_requests"].update(
                buildJsonObject {
                    put("status", "accepted")
                    put("driver_id", driverId)
                    put("driver_phone", driverPhone)
                    put("updated_at", java.time.Instant.now().toString())
                }
            ) { filter { eq("id", rideId) } }
            true
        } catch (e: Exception) {
            Log.e("SupabaseRepo", "Accept ride error: ${e.message}")
            false
        }
    }

    /** Update ride status: accepted -> arrived -> in_progress -> completed -> cancelled */
    suspend fun updateRideStatus(rideId: String, newStatus: String): Boolean {
        return try {
            supabase.postgrest["ride_requests"].update(
                buildJsonObject {
                    put("status", newStatus)
                    put("updated_at", java.time.Instant.now().toString())
                }
            ) { filter { eq("id", rideId) } }
            true
        } catch (e: Exception) {
            Log.e("SupabaseRepo", "Update ride status error: ${e.message}")
            false
        }
    }

    /** Check if driver is verified in drivers or driver_profiles table */
    suspend fun checkDriverVerification(userId: String?, phone: String?): Boolean {
        if (userId == null && phone == null) return true // default trial
        return try {
            val cleanPhone = phone?.filter { it.isDigit() } ?: ""
            val records = supabase.postgrest["drivers"]
                .select {
                    filter {
                        if (userId != null) eq("user_id", userId)
                        else eq("mobile_number", cleanPhone)
                    }
                    limit(1)
                }
                .decodeList<JsonObject>()
            
            if (records.isNotEmpty()) {
                true
            } else {
                val profileRecords = supabase.postgrest["driver_profiles"]
                    .select {
                        filter { eq("phone", cleanPhone) }
                        limit(1)
                    }
                    .decodeList<JsonObject>()
                profileRecords.isNotEmpty()
            }
        } catch (e: Exception) {
            Log.d("SupabaseRepo", "Driver verification check note: ${e.message}")
            true // Auto-approve trial fallback
        }
    }

    /** Fast approve driver profile */
    suspend fun fastApproveDriver(userId: String, driverName: String): Boolean {
        return try {
            supabase.postgrest["drivers"].upsert(
                buildJsonObject {
                    put("user_id", userId)
                    put("driver_name", driverName)
                    put("is_verified", true)
                    put("verification_status", "approved")
                    put("updated_at", java.time.Instant.now().toString())
                }
            )
            true
        } catch (e: Exception) {
            Log.e("SupabaseRepo", "Fast approve driver error: ${e.message}")
            false
        }
    }
}
