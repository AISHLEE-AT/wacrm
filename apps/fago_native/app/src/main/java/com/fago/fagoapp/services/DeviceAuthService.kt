package com.fago.fagoapp.services

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

// DataStore extension — replaces Flutter's SharedPreferences
private val Context.dataStore by preferencesDataStore(name = "fago_device_auth")

/**
 * Native Android equivalent of Flutter's DeviceAuthService.
 * Uses DataStore (type-safe, coroutine-friendly) instead of SharedPreferences.
 * Keys and logic are identical to the Flutter app.
 */
class DeviceAuthService(private val context: Context) {

    companion object {
        private val KEY_REGISTERED_PHONE = stringPreferencesKey("registered_phone")
        private val KEY_REGISTERED_NAME  = stringPreferencesKey("registered_name")
        private val KEY_IS_PROFILE_LOCKED = booleanPreferencesKey("is_profile_locked")
        private val KEY_CUSTOM_FAGO_PIN   = stringPreferencesKey("custom_fago_pin")
    }

    /** Save device registration after successful WhatsApp OTP login */
    suspend fun saveRegisteredDevice(phone: String, name: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_REGISTERED_PHONE] = phone
            prefs[KEY_REGISTERED_NAME]  = name
            prefs[KEY_IS_PROFILE_LOCKED] = true
        }
    }

    /** Clear on sign-out */
    suspend fun clearDeviceSignature() {
        context.dataStore.edit { prefs ->
            prefs[KEY_REGISTERED_PHONE] = ""
            prefs[KEY_REGISTERED_NAME]  = ""
            prefs[KEY_IS_PROFILE_LOCKED] = false
        }
    }

    suspend fun isProfileLocked(): Boolean =
        context.dataStore.data.map { it[KEY_IS_PROFILE_LOCKED] ?: false }.first()

    suspend fun getRegisteredPhone(): String? =
        context.dataStore.data.map { it[KEY_REGISTERED_PHONE]?.ifEmpty { null } }.first()

    suspend fun getRegisteredName(): String? =
        context.dataStore.data.map { it[KEY_REGISTERED_NAME]?.ifEmpty { null } }.first()

    /** Verify 4-digit FAGO PIN — same fallback logic as Flutter */
    suspend fun verifyCustomPin(pin: String): Boolean {
        val stored = context.dataStore.data.map { it[KEY_CUSTOM_FAGO_PIN] }.first()
        if (stored != null) return stored == pin
        // Default: last 4 digits of registered phone, or 1234
        val phone = getRegisteredPhone() ?: return pin == "1234"
        val lastFour = phone.takeLast(4)
        return pin == lastFour || pin == "1234"
    }

    suspend fun setCustomPin(pin: String) {
        context.dataStore.edit { it[KEY_CUSTOM_FAGO_PIN] = pin }
    }
}
