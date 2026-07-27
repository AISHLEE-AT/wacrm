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
    val riderName: String? = "Rider",
    val riderPhone: String,
    val pickupAddress: String,
    val dropoffAddress: String,
    val pickupLat: Double,
    val pickupLng: Double,
    val dropoffLat: Double,
    val dropoffLng: Double,
    val vehicleCategory: String,
    val estimatedFare: Double,
    val status: String, // "requested", "assigned", "arrived", "in_progress", "completed", "cancelled"
    val driverId: String? = null,
    val driverName: String? = "Captain Senthil",
    val driverPhone: String? = "+919486335870",
    val vehicleNumber: String? = "TN 38 BL 9486",
    val otpCode: String? = "4826"
)

data class DriverProfileItem(
    val id: String,
    val name: String,
    val phone: String,
    val whatsappNumber: String,
    val vehicleType: String, // "Bike", "Auto", "Cab", "Sedan", "SUV", "Tractor", "MiniVan"
    val vehicleNumber: String,
    val vehicleModel: String,
    val gender: String = "male", // "male", "female"
    val rating: Double = 4.9,
    val totalTrips: Int = 120,
    val isVerified: Boolean = true,
    val distanceKm: Double = 1.2,
    val etaMinutes: Int = 3,
    val calculatedFare: Double = 0.0
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

    /** Virtual/Test Drivers fallback across ALL categories for area testing */
    fun getVirtualFallbackDrivers(tripDistKm: Double): List<DriverProfileItem> {
        val dist = if (tripDistKm <= 0.5) 3.5 else tripDistKm
        return listOf(
            DriverProfileItem(
                id = "DRV_VIRT_001",
                name = "Captain Senthil Kumar",
                phone = "9486335870",
                whatsappNumber = "9486335870",
                vehicleType = "Bike",
                vehicleNumber = "TN 38 BL 9486",
                vehicleModel = "Honda Activa 6G",
                gender = "male",
                rating = 4.9,
                totalTrips = 342,
                distanceKm = 0.8,
                etaMinutes = 2,
                calculatedFare = (30 + (dist * 10))
            ),
            DriverProfileItem(
                id = "DRV_VIRT_002",
                name = "Driver Anitha R",
                phone = "9123596988",
                whatsappNumber = "9123596988",
                vehicleType = "Auto",
                vehicleNumber = "TN 37 AB 1234",
                vehicleModel = "Bajaj RE Auto",
                gender = "female",
                rating = 5.0,
                totalTrips = 512,
                distanceKm = 1.2,
                etaMinutes = 3,
                calculatedFare = (40 + (dist * 15))
            ),
            DriverProfileItem(
                id = "DRV_VIRT_003",
                name = "Captain Karthik Raja",
                phone = "9876543210",
                whatsappNumber = "9876543210",
                vehicleType = "Cab",
                vehicleNumber = "TN 38 CZ 5678",
                vehicleModel = "Swift Dzire AC",
                gender = "male",
                rating = 4.8,
                totalTrips = 289,
                distanceKm = 1.5,
                etaMinutes = 4,
                calculatedFare = (80 + (dist * 20))
            ),
            DriverProfileItem(
                id = "DRV_VIRT_004",
                name = "Driver Priya Lakshmi",
                phone = "9443322110",
                whatsappNumber = "9443322110",
                vehicleType = "SUV",
                vehicleNumber = "TN 38 EY 9988",
                vehicleModel = "Innova Crysta AC",
                gender = "female",
                rating = 4.9,
                totalTrips = 195,
                distanceKm = 2.1,
                etaMinutes = 5,
                calculatedFare = (150 + (dist * 28))
            ),
            DriverProfileItem(
                id = "DRV_VIRT_005",
                name = "Farmer Murugan",
                phone = "9789012345",
                whatsappNumber = "9789012345",
                vehicleType = "Tractor",
                vehicleNumber = "TN 38 TR 4321",
                vehicleModel = "Mahindra 575 DI",
                gender = "male",
                rating = 4.9,
                totalTrips = 88,
                distanceKm = 3.0,
                etaMinutes = 8,
                calculatedFare = 700.0
            ),
            DriverProfileItem(
                id = "DRV_VIRT_006",
                name = "Driver Rajesh",
                phone = "9894012345",
                whatsappNumber = "9894012345",
                vehicleType = "MiniVan",
                vehicleNumber = "TN 38 MV 8899",
                vehicleModel = "Tata Ace Gold",
                gender = "male",
                rating = 4.7,
                totalTrips = 140,
                distanceKm = 2.5,
                etaMinutes = 6,
                calculatedFare = 500.0
            )
        )
    }

    /** Fetch nearby online verified drivers from drivers table */
    suspend fun getNearbyDrivers(tripDistKm: Double): List<DriverProfileItem> {
        val fallbacks = getVirtualFallbackDrivers(tripDistKm)
        return try {
            val records = supabase.postgrest["drivers"]
                .select {
                    filter {
                        eq("is_verified", true)
                    }
                    limit(20)
                }
                .decodeList<JsonObject>()

            if (records.isEmpty()) return fallbacks

            val dbDrivers = records.mapNotNull { json ->
                try {
                    val name = json["name"]?.jsonPrimitive?.contentOrNull
                        ?: json["driver_name"]?.jsonPrimitive?.contentOrNull
                        ?: "Driver"
                    val phone = json["mobile_number"]?.jsonPrimitive?.contentOrNull ?: "9486335870"
                    val whatsapp = json["whatsapp_number"]?.jsonPrimitive?.contentOrNull ?: phone
                    val type = json["vehicle_type"]?.jsonPrimitive?.contentOrNull ?: "Bike"
                    val vehNum = json["vehicle_number"]?.jsonPrimitive?.contentOrNull
                        ?: json["vehicle_registration"]?.jsonPrimitive?.contentOrNull
                        ?: "TN 38 BL 9486"
                    val vehModel = json["vehicle_model"]?.jsonPrimitive?.contentOrNull ?: "Standard"
                    val gender = json["gender"]?.jsonPrimitive?.contentOrNull ?: if (name.lowercase().contains("anitha") || name.lowercase().contains("priya")) "female" else "male"
                    val rating = json["rating"]?.jsonPrimitive?.doubleOrNull ?: 4.9
                    val dist = (0.5 + (Math.random() * 2.5))
                    val base = when (type.lowercase()) {
                        "auto" -> 40.0
                        "cab", "sedan" -> 80.0
                        "suv" -> 150.0
                        "tractor" -> 700.0
                        "minivan" -> 500.0
                        else -> 30.0
                    }
                    val perKm = when (type.lowercase()) {
                        "auto" -> 15.0
                        "cab", "sedan" -> 20.0
                        "suv" -> 28.0
                        else -> 10.0
                    }
                    val fare = base + (tripDistKm * perKm)

                    DriverProfileItem(
                        id = json["id"]?.jsonPrimitive?.contentOrNull ?: "DRV_${phone}",
                        name = name,
                        phone = phone,
                        whatsappNumber = whatsapp,
                        vehicleType = type,
                        vehicleNumber = vehNum,
                        vehicleModel = vehModel,
                        gender = gender,
                        rating = rating,
                        totalTrips = 120,
                        distanceKm = (dist * 10).toInt() / 10.0,
                        etaMinutes = maxOf(2, (dist * 3).toInt()),
                        calculatedFare = fare
                    )
                } catch (e: Exception) {
                    null
                }
            }

            if (dbDrivers.isEmpty()) fallbacks else (dbDrivers + fallbacks).distinctBy { it.phone }
        } catch (e: Exception) {
            Log.d("SupabaseRepo", "Get nearby drivers note: ${e.message}")
            fallbacks
        }
    }

    /** Save Lead / Contact to CRM database */
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

    /** Save 6-digit OTP to Supabase whatsapp_otps table */
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
                    put("rider_name", ride.riderName ?: "Rider")
                    put("rider_phone", ride.riderPhone)
                    put("pickup_address", ride.pickupAddress)
                    put("dropoff_address", ride.dropoffAddress)
                    put("pickup_lat", ride.pickupLat)
                    put("pickup_lng", ride.pickupLng)
                    put("dropoff_lat", ride.dropoffLat)
                    put("dropoff_lng", ride.dropoffLng)
                    put("vehicle_category", ride.vehicleCategory)
                    put("estimated_fare", ride.estimatedFare)
                    put("otp_code", ride.otpCode ?: "4826")
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
    suspend fun acceptRideRequest(
        rideId: String,
        driverId: String,
        driverName: String,
        driverPhone: String,
        vehicleNumber: String = "TN 38 BL 9486"
    ): Boolean {
        return try {
            supabase.postgrest["ride_requests"].update(
                buildJsonObject {
                    put("status", "accepted")
                    put("driver_id", driverId)
                    put("driver_name", driverName)
                    put("driver_phone", driverPhone)
                    put("vehicle_number", vehicleNumber)
                    put("updated_at", java.time.Instant.now().toString())
                }
            ) { filter { eq("id", rideId) } }
            true
        } catch (e: Exception) {
            Log.e("SupabaseRepo", "Accept ride error: ${e.message}")
            false
        }
    }

    /** Update ride status */
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

    /** Check if driver is verified */
    suspend fun checkDriverVerification(userId: String?, phone: String?): Boolean {
        if (userId == null && phone == null) return true
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

            records.isNotEmpty()
        } catch (e: Exception) {
            Log.d("SupabaseRepo", "Driver verification check note: ${e.message}")
            true
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

    /** Virtual Fallback Machinery for RentO Testing */
    fun getVirtualFallbackMachinery(cat: String = "Tractor"): List<MachineryItem> {
        val list = listOf(
            MachineryItem("MACH_VIRT_01", "Mahindra 575 DI Tractor + Rotavator", "Tractor", "Farmer Murugan", "9789012345", "9789012345", "TN 38 TR 4321", 700.0, "50 HP • 4WD • Rotary Tiller Attachment", 4.9, 1.8, 10, true),
            MachineryItem("MACH_VIRT_02", "Kubota DC68G Paddy Harvester", "Harvester", "Captain Senthil Kumar", "9486335870", "9486335870", "TN 38 HV 9988", 1800.0, "68 HP • Rubber Track Crawler • Paddy & Wheat", 5.0, 3.2, 15, true),
            MachineryItem("MACH_VIRT_03", "Tata Ace Gold Agri Mini-Van", "MiniVan", "Driver Rajesh", "9894012345", "9894012345", "TN 38 MV 8899", 500.0, "750 kg Payload • Crop Transport to Mandi", 4.7, 2.1, 12, true),
            MachineryItem("MACH_VIRT_04", "Kirloskar 5HP Diesel Drip Pump", "Pump", "Selvam Agri Tools", "9123596988", "9123596988", "TN 37 PUMP 12", 350.0, "5 HP High Pressure Diesel • Drip Set Included", 4.8, 1.2, 8, true),
            MachineryItem("MACH_VIRT_05", "JCB 3CX Heavy Excavator & Loader", "JCB", "Operator Velu", "9486335870", "9486335870", "TN 38 JCB 1122", 1500.0, "76 HP Heavy Digging & Farm Leveling", 4.9, 4.5, 20, true)
        )
        return if (cat.equalsIgnoreCase("ALL")) list else list.filter { it.category.equals(cat, ignoreCase = true) || cat.contains(it.category, ignoreCase = true) }.ifEmpty { list }
    }

    suspend fun getNearbyMachinery(cat: String = "Tractor"): List<MachineryItem> {
        val fallbacks = getVirtualFallbackMachinery(cat)
        return try {
            val records = supabase.postgrest["rento_machinery"]
                .select {
                    limit(20)
                }
                .decodeList<JsonObject>()

            val dbMachines = records.mapNotNull { json ->
                try {
                    val name = json["name"]?.jsonPrimitive?.contentOrNull ?: "Farm Tractor"
                    val category = json["category"]?.jsonPrimitive?.contentOrNull ?: "Tractor"
                    val opName = json["operator_name"]?.jsonPrimitive?.contentOrNull ?: "Agri Operator"
                    val phone = json["phone"]?.jsonPrimitive?.contentOrNull ?: "9486335870"
                    val wa = json["whatsapp_number"]?.jsonPrimitive?.contentOrNull ?: phone
                    val vehNo = json["vehicle_number"]?.jsonPrimitive?.contentOrNull ?: "TN 38 TR 1000"
                    val rate = json["hourly_rate"]?.jsonPrimitive?.doubleOrNull ?: 700.0
                    val specs = json["specifications"]?.jsonPrimitive?.contentOrNull ?: "Heavy Agriculture Grade"

                    MachineryItem(
                        id = json["id"]?.jsonPrimitive?.contentOrNull ?: "MACH_${phone}",
                        name = name,
                        category = category,
                        operatorName = opName,
                        phone = phone,
                        whatsappNumber = wa,
                        vehicleNumber = vehNo,
                        hourlyRate = rate,
                        specifications = specs
                    )
                } catch (e: Exception) {
                    null
                }
            }
            if (dbMachines.isEmpty()) fallbacks else (dbMachines + fallbacks).distinctBy { it.name }
        } catch (e: Exception) {
            fallbacks
        }
    }
}

private fun String.equalsIgnoreCase(other: String): Boolean = this.equals(other, ignoreCase = true)

