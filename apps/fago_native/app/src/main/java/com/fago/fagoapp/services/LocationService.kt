package com.fago.fagoapp.services

import android.annotation.SuppressLint
import android.content.Context
import android.location.Geocoder
import android.location.Location
import android.os.Build
import com.google.android.gms.location.LocationServices
import com.google.android.gms.maps.model.LatLng
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import java.util.Locale
import kotlin.coroutines.resume

/**
 * Native Android LocationService — parity with Flutter's location_service.dart.
 * Fetches high-precision device GPS location and provides clean reverse geocoding.
 */
class LocationService(private val context: Context) {

    private val fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)

    companion object {
        fun cleanAddressString(rawAddress: String): String {
            if (rawAddress.isBlank()) return "GPS Location Active"
            var cleaned = rawAddress
            cleaned = cleaned.replace(Regex("(?i)^Unnamed Road,\\s*"), "")
            cleaned = cleaned.replace(Regex("(?i)^Unnamed Road\\s*"), "")
            cleaned = cleaned.replace(Regex("(?i)Unnamed Road,\\s*"), "")
            cleaned = cleaned.trim()
            if (cleaned.endsWith(",")) {
                cleaned = cleaned.substring(0, cleaned.length - 1).trim()
            }
            return if (cleaned.isNotBlank()) cleaned else "GPS Location Active"
        }
    }

    @SuppressLint("MissingPermission")
    suspend fun getCurrentLocation(): LatLng? = suspendCancellableCoroutine { cont ->
        try {
            fusedLocationClient.lastLocation.addOnSuccessListener { location: Location? ->
                if (location != null) {
                    cont.resume(LatLng(location.latitude, location.longitude))
                } else {
                    fusedLocationClient.getCurrentLocation(
                        com.google.android.gms.location.Priority.PRIORITY_HIGH_ACCURACY,
                        null
                    ).addOnSuccessListener { loc ->
                        if (loc != null) {
                            cont.resume(LatLng(loc.latitude, loc.longitude))
                        } else {
                            cont.resume(null)
                        }
                    }.addOnFailureListener {
                        cont.resume(null)
                    }
                }
            }.addOnFailureListener {
                cont.resume(null)
            }
        } catch (e: Exception) {
            cont.resume(null)
        }
    }

    suspend fun getAddressFromLatLng(latLng: LatLng): String = withContext(Dispatchers.IO) {
        try {
            val geocoder = Geocoder(context, Locale.getDefault())
            @Suppress("DEPRECATION")
            val addresses = geocoder.getFromLocation(latLng.latitude, latLng.longitude, 1)
            if (!addresses.isNullOrEmpty()) {
                val addr = addresses[0]
                val line = addr.getAddressLine(0)
                if (!line.isNullOrEmpty()) return@withContext cleanAddressString(line)
                val locality = addr.locality ?: addr.subAdminArea ?: ""
                val adminArea = addr.adminArea ?: ""
                if (locality.isNotEmpty()) return@withContext cleanAddressString("$locality, $adminArea")
            }
        } catch (e: Exception) {
            android.util.Log.w("LocationService", "Geocoder error: ${e.message}")
        }
        return@withContext "GPS Location (${String.format("%.4f", latLng.latitude)}, ${String.format("%.4f", latLng.longitude)})"
    }

    suspend fun getLatLngFromAddress(addressQuery: String): LatLng? = withContext(Dispatchers.IO) {
        try {
            val geocoder = Geocoder(context, Locale.getDefault())
            @Suppress("DEPRECATION")
            val addresses = geocoder.getFromLocationName(addressQuery, 1)
            if (!addresses.isNullOrEmpty()) {
                val addr = addresses[0]
                return@withContext LatLng(addr.latitude, addr.longitude)
            }
        } catch (e: Exception) {
            android.util.Log.w("LocationService", "Geocode query error: ${e.message}")
        }
        return@withContext null
    }
}
