package com.fago.fagoapp.services

import android.app.*
import android.content.Context
import android.content.Intent
import android.location.Location
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat
import com.fago.fagoapp.MainActivity
import com.fago.fagoapp.R
import com.google.android.gms.location.*
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.coroutines.*
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import org.koin.android.ext.android.inject

/**
 * FAGO Driver Location Foreground Service.
 *
 * This is the #1 advantage of Native Android over Flutter.
 * Runs as a persistent foreground service — stays alive even when:
 *   - App is minimized
 *   - Screen is off
 *   - Battery optimization is ON
 *   - Device has been idle for hours
 *
 * Flutter's background_location plugin cannot guarantee this.
 * Updates driver's GPS to Supabase `driver_locations` table every 5 seconds.
 */
class DriverLocationService : Service() {

    private val supabase: SupabaseClient by inject()
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback
    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    companion object {
        const val CHANNEL_ID = "fago_driver_location"
        const val NOTIFICATION_ID = 1001
        const val EXTRA_DRIVER_ID = "driver_id"
        const val EXTRA_DRIVER_NAME = "driver_name"

        fun startService(context: Context, driverId: String, driverName: String) {
            val intent = Intent(context, DriverLocationService::class.java).apply {
                putExtra(EXTRA_DRIVER_ID, driverId)
                putExtra(EXTRA_DRIVER_NAME, driverName)
            }
            context.startForegroundService(intent)
        }

        fun stopService(context: Context) {
            context.stopService(Intent(context, DriverLocationService::class.java))
        }
    }

    override fun onCreate() {
        super.onCreate()
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val driverId = intent?.getStringExtra(EXTRA_DRIVER_ID) ?: return START_NOT_STICKY
        val driverName = intent.getStringExtra(EXTRA_DRIVER_NAME) ?: "Driver"

        startForeground(NOTIFICATION_ID, buildNotification(driverName))
        startLocationUpdates(driverId)

        return START_STICKY // Restart if killed by system
    }

    private fun startLocationUpdates(driverId: String) {
        val locationRequest = LocationRequest.Builder(
            Priority.PRIORITY_HIGH_ACCURACY,
            5_000L // Update every 5 seconds
        ).apply {
            setMinUpdateDistanceMeters(10f) // Only update if moved 10m
            setWaitForAccurateLocation(false)
        }.build()

        locationCallback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                result.lastLocation?.let { location ->
                    pushLocationToSupabase(driverId, location)
                }
            }
        }

        try {
            fusedLocationClient.requestLocationUpdates(
                locationRequest,
                locationCallback,
                Looper.getMainLooper()
            )
        } catch (e: SecurityException) {
            Log.e("DriverLocationService", "Location permission denied: ${e.message}")
            stopSelf()
        }
    }

    private fun pushLocationToSupabase(driverId: String, location: Location) {
        serviceScope.launch {
            try {
                // Upsert to driver_locations table (shared with Flutter app)
                supabase.postgrest["driver_locations"].upsert(
                    buildJsonObject {
                        put("driver_id", driverId)
                        put("latitude", location.latitude)
                        put("longitude", location.longitude)
                        put("accuracy", location.accuracy.toDouble())
                        put("speed", location.speed.toDouble())
                        put("bearing", location.bearing.toDouble())
                        put("updated_at", java.time.Instant.now().toString())
                    }
                )
                Log.d("DriverLocationService",
                    "GPS updated: ${location.latitude}, ${location.longitude}")
            } catch (e: Exception) {
                Log.e("DriverLocationService", "Supabase update error: ${e.message}")
            }
        }
    }

    private fun buildNotification(driverName: String): Notification {
        val pendingIntent = PendingIntent.getActivity(
            this, 0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE
        )
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("🚗 FAGO — $driverName is Active")
            .setContentText("Location tracking ON • Tap to open FAGO")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "FAGO Driver Location",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "Shows while you are active as a FAGO driver"
        }
        getSystemService(NotificationManager::class.java)
            .createNotificationChannel(channel)
    }

    override fun onDestroy() {
        super.onDestroy()
        fusedLocationClient.removeLocationUpdates(locationCallback)
        serviceScope.cancel()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
