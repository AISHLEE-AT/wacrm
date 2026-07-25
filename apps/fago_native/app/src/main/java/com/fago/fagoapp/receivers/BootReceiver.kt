package com.fago.fagoapp.receivers

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

/**
 * Restart driver location service after device reboot.
 * Requires RECEIVE_BOOT_COMPLETED permission in manifest.
 */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            Log.d("FagoBootReceiver", "Device booted — checking driver session")
            // TODO: Check if user was an active driver before reboot,
            // then restart DriverLocationService.startService(context, ...)
        }
    }
}
