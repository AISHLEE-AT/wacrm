package com.fago.fagoapp.auth

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import io.github.jan.supabase.gotrue.SessionManager
import io.github.jan.supabase.gotrue.user.UserSession
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

/**
 * Securely stores the Supabase UserSession (access & refresh tokens) using
 * Android's EncryptedSharedPreferences (AES256_GCM).
 */
class SecureSessionManager(context: Context) : SessionManager {

    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs = EncryptedSharedPreferences.create(
        context,
        "supabase_auth_session",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    private val SESSION_KEY = "user_session"

    override suspend fun saveSession(session: UserSession) {
        try {
            val json = Json.encodeToString(session)
            prefs.edit().putString(SESSION_KEY, json).apply()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override suspend fun loadSession(): UserSession? {
        val json = prefs.getString(SESSION_KEY, null)
        if (json.isNullOrBlank()) return null
        return try {
            Json.decodeFromString<UserSession>(json)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    override suspend fun deleteSession() {
        prefs.edit().remove(SESSION_KEY).apply()
    }
}
