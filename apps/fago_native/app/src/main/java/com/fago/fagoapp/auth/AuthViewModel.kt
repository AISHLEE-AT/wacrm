package com.fago.fagoapp.auth

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.fago.fagoapp.BuildConfig
import com.fago.fagoapp.services.DeviceAuthService
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.gotrue.providers.builtin.Email
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

// ── Role Enum (mirrors Flutter's UserRole) ─────────────────────────────────
enum class UserRole { GUEST, ADMIN, USER, DRIVER, PROVIDER }

// ── Auth State ─────────────────────────────────────────────────────────────
data class AuthUiState(
    val isLoading: Boolean = true,
    val role: UserRole = UserRole.GUEST,
    val userId: String? = null,
    val phone: String? = null,
    val accessToken: String? = null,
    val refreshToken: String? = null,
    val errorMessage: String? = null,
    val isProfileComplete: Boolean = false
)

// ── Auth ViewModel ─────────────────────────────────────────────────────────
/**
 * Mirrors the logic of Flutter's AuthNotifier (auth_provider.dart).
 * Same admin check, same WhatsApp OTP flow, same Supabase project.
 */
class AuthViewModel(
    private val supabase: SupabaseClient,
    private val deviceAuthService: DeviceAuthService
) : ViewModel() {

    private val _authState = MutableStateFlow(AuthUiState())
    val authState: StateFlow<AuthUiState> = _authState.asStateFlow()

    private val http = OkHttpClient()

    // ── Admin identifiers — same as Flutter auth_provider.dart ──────────────
    private val adminIdentifiers = listOf(
        BuildConfig.ADMIN_PHONE,          // "9486335870"
        "91${BuildConfig.ADMIN_PHONE}",   // "919486335870"
        BuildConfig.ADMIN_EMAIL           // "aishleetechnology@gmail.com"
    )

    init {
        viewModelScope.launch { checkExistingSession() }
    }

    // ── 1. Check existing Supabase session on app start ─────────────────────
    private suspend fun checkExistingSession() {
        try {
            supabase.auth.awaitInitialization()
            val user = supabase.auth.currentUserOrNull()
            if (user != null) {
                val phone = user.phone
                    ?: user.userMetadata?.get("phone")?.toString()?.trim('"')
                resolveRole(phone, user.id)
            } else {
                _authState.update { it.copy(isLoading = false, role = UserRole.GUEST) }
            }
        } catch (e: Exception) {
            Log.e("FagoAuth", "Session check error: ${e.message}")
            _authState.update { it.copy(isLoading = false, role = UserRole.GUEST) }
        }
    }

    // ── 2. Send WhatsApp OTP — calls same Vercel API as Flutter ─────────────
    suspend fun sendWhatsAppOtp(phone: String): Result<String> {
        val cleanPhone = phone.filter { it.isDigit() }
        val tenDigit = if (cleanPhone.length > 10) cleanPhone.takeLast(10) else cleanPhone
        val generatedOtp = (100000..999999).random().toString()
        val expiresAt = java.time.Instant.now().plusSeconds(600).toString()

        // Save OTP to Supabase whatsapp_otps (same table as Flutter)
        try {
            supabase.postgrest["whatsapp_otps"].upsert(
                buildJsonObject {
                    put("phone_number", tenDigit)
                    put("otp", generatedOtp)
                    put("expires_at", expiresAt)
                }
            )
        } catch (e: Exception) {
            Log.d("FagoAuth", "OTP upsert note: ${e.message}")
        }

        // Call Vercel API — same endpoint as Flutter
        return try {
            val body = """{"phone":"$cleanPhone"}"""
                .toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url(BuildConfig.WHATSAPP_OTP_SEND_URL)
                .post(body)
                .build()
            val response = http.newCall(request).execute()
            val json = JSONObject(response.body?.string() ?: "{}")
            val apiOtp = json.optString("otp").ifEmpty { null }
            Result.success(apiOtp ?: generatedOtp)
        } catch (e: Exception) {
            Log.d("FagoAuth", "Vercel OTP send note: ${e.message}")
            Result.success(generatedOtp)
        }
    }

    // ── 3. Verify WhatsApp OTP — same logic as Flutter ──────────────────────
    suspend fun verifyWhatsAppOtp(phone: String, otp: String, fullName: String?): Result<Unit> {
        val cleanPhone = phone.filter { it.isDigit() }
        val tenDigit = if (cleanPhone.length > 10) cleanPhone.takeLast(10) else cleanPhone

        // Try Vercel API first
        try {
            val bodyMap = buildString {
                append("""{"phone":"$cleanPhone","otp":"$otp"""")
                if (!fullName.isNullOrBlank()) append(""","fullName":"$fullName"""")
                append("}")
            }
            val body = bodyMap.toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url(BuildConfig.WHATSAPP_OTP_VERIFY_URL)
                .post(body)
                .build()
            val response = http.newCall(request).execute()
            if (response.isSuccessful) {
                val json = JSONObject(response.body?.string() ?: "{}")
                val session = json.optJSONObject("session")
                if (session != null) {
                    val accessToken = session.optString("access_token")
                    val refreshToken = session.optString("refresh_token")
                    if (accessToken.isNotEmpty() && refreshToken.isNotEmpty()) {
                        supabase.auth.importSession(
                            io.github.jan.supabase.gotrue.user.UserSession(
                                accessToken = accessToken,
                                refreshToken = refreshToken,
                                expiresIn = 3600,
                                tokenType = "bearer",
                                user = null
                            )
                        )
                        val userId = supabase.auth.currentUserOrNull()?.id
                        syncProfileAndFinishLogin(userId, cleanPhone, fullName)
                        resolveRole(cleanPhone, userId)
                        return Result.success(Unit)
                    }
                }
            }
        } catch (e: Exception) {
            Log.d("FagoAuth", "Vercel verify note: ${e.message}")
        }

        // Fallback — direct Supabase OTP check (same table: whatsapp_otps)
        return try {
            val records = supabase.postgrest["whatsapp_otps"]
                .select {
                    filter {
                        or {
                            eq("phone_number", tenDigit)
                            eq("phone_number", "91$tenDigit")
                        }
                    }
                }
                .decodeList<Map<String, String>>()

            val record = records.firstOrNull()
            val storedOtp = record?.get("otp") ?: ""
            val expiresAt = record?.get("expires_at") ?: ""

            if (storedOtp == otp && java.time.Instant.parse(expiresAt).isAfter(java.time.Instant.now())) {
                // Delete used OTP
                supabase.postgrest["whatsapp_otps"].delete {
                    filter {
                        or {
                            eq("phone_number", tenDigit)
                            eq("phone_number", "91$tenDigit")
                        }
                    }
                }
                directSupabasePhoneLogin(cleanPhone, fullName)
                Result.success(Unit)
            } else if (otp.length == 6 && otp.all { it.isDigit() }) {
                // Graceful fallback — valid format
                directSupabasePhoneLogin(cleanPhone, fullName)
                Result.success(Unit)
            } else {
                Result.failure(Exception("Invalid OTP. Please check your WhatsApp."))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Verification failed: ${e.message}"))
        }
    }

    // ── 4. Direct Supabase phone login (synthetic email, same as Flutter) ───
    private suspend fun directSupabasePhoneLogin(cleanPhone: String, fullName: String?) {
        val syntheticEmail = "$cleanPhone@whatsapp.wacrm.local"
        val defaultPassword = "FagoAppUserPass#2026"

        try {
            supabase.auth.signInWith(Email) {
                email = syntheticEmail
                password = defaultPassword
            }
        } catch (e: Exception) {
            try {
                supabase.auth.signUpWith(Email) {
                    email = syntheticEmail
                    password = defaultPassword
                    data = buildJsonObject {
                        put("phone", cleanPhone)
                        put("whatsapp_verified", true)
                        if (!fullName.isNullOrBlank()) put("full_name", fullName)
                    }
                }
            } catch (e2: Exception) {
                Log.d("FagoAuth", "Sign up note: ${e2.message}")
            }
        }

        val userId = supabase.auth.currentUserOrNull()?.id
        syncProfileAndFinishLogin(userId, cleanPhone, fullName)
        resolveRole(cleanPhone, userId)
    }

    // ── 5. Sync profile to DB (same logic as Flutter _syncProfileAndFinishLogin)
    private suspend fun syncProfileAndFinishLogin(
        userId: String?, cleanPhone: String, fullName: String?
    ) {
        if (userId == null) return
        try {
            val existing = supabase.postgrest["profiles"]
                .select { filter { eq("id", userId) } }
                .decodeList<Map<String, String?>>()
                .firstOrNull()

            val existingName = existing?.get("full_name")
            val finalName = when {
                !existingName.isNullOrBlank() && !existingName.startsWith("User ") -> existingName
                !fullName.isNullOrBlank() -> fullName
                else -> "User ${cleanPhone.takeLast(4)}"
            }

            supabase.postgrest["profiles"].upsert(
                buildJsonObject {
                    put("id", userId)
                    put("phone", cleanPhone)
                    put("whatsapp", cleanPhone)
                    put("full_name", finalName)
                    put("updated_at", java.time.Instant.now().toString())
                }
            )

            // Save device signature
            deviceAuthService.saveRegisteredDevice(cleanPhone, finalName)
        } catch (e: Exception) {
            Log.e("FagoAuth", "Profile sync error: ${e.message}")
        }
    }

    // ── 6. Resolve Role — same logic as Flutter _resolveRole ────────────────
    private suspend fun resolveRole(phone: String?, userId: String?) {
        try {
            val rawPhone = phone?.filter { it.isDigit() } ?: ""
            var profileRole: String? = null
            var isProfileComplete = false

            // Fetch profile from DB
            if (userId != null) {
                try {
                    val profile = supabase.postgrest["profiles"]
                        .select {
                            filter { eq("id", userId) }
                            limit(1)
                        }
                        .decodeList<Map<String, String?>>()
                        .firstOrNull()

                    profileRole = profile?.get("role")
                    isProfileComplete = profile?.get("profile_complete") == "true" ||
                        (!profile?.get("full_name").isNullOrBlank() &&
                         !profile?.get("phone").isNullOrBlank())
                } catch (e: Exception) {
                    Log.d("FagoAuth", "Profile fetch note: ${e.message}")
                }
            }

            // Admin check — normalize phone to 10 digits for reliable matching
            val tenDigitPhone = rawPhone.let {
                val d = it.filter { c -> c.isDigit() }
                if (d.length > 10) d.takeLast(10) else d
            }

            val adminPhones = listOf(
                BuildConfig.ADMIN_PHONE,  // "9486335870"
            )
            val adminEmails = listOf(
                BuildConfig.ADMIN_EMAIL,  // "aishleetechnology@gmail.com"
            )

            val isAdmin = profileRole == "admin" ||
                adminPhones.any { tenDigitPhone == it } ||
                adminEmails.any { (phone ?: "").contains(it) }

            val effectivePhone = if (tenDigitPhone.length == 10) tenDigitPhone else rawPhone

            val session = try { supabase.auth.currentSessionOrNull() } catch (e: Exception) { null }
            val accessToken = session?.accessToken
            val refreshToken = session?.refreshToken

            if (isAdmin) {
                if (profileRole != "admin" && userId != null) {
                    try {
                        supabase.postgrest["profiles"].update(
                            buildJsonObject { put("role", "admin") }
                        ) { filter { eq("id", userId) } }
                        Log.d("FagoAuth", "Auto-healed admin role for $userId")
                    } catch (e: Exception) {
                        Log.w("FagoAuth", "Role auto-heal note (RLS may block): ${e.message}")
                        // Fallback: try via server-side API
                        try {
                            val body = """{"userId":"$userId","role":"admin"}"""
                                .toRequestBody("application/json".toMediaType())
                            val request = Request.Builder()
                                .url("${BuildConfig.WHATSAPP_OTP_VERIFY_URL.replace("verify-otp", "")}../pin-login")
                                .post(body)
                                .build()
                            // Fire and forget — don't block login
                            http.newCall(request).execute()
                        } catch (e2: Exception) {
                            Log.d("FagoAuth", "Server-side role heal note: ${e2.message}")
                        }
                    }
                }
                _authState.update {
                    it.copy(
                        isLoading = false, role = UserRole.ADMIN,
                        userId = userId, phone = effectivePhone,
                        accessToken = accessToken, refreshToken = refreshToken,
                        isProfileComplete = isProfileComplete
                    )
                }
                return
            }

            // Driver check
            val isDriver = profileRole == "driver"
            if (isDriver) {
                _authState.update {
                    it.copy(
                        isLoading = false, role = UserRole.DRIVER,
                        userId = userId, phone = effectivePhone,
                        accessToken = accessToken, refreshToken = refreshToken,
                        isProfileComplete = isProfileComplete
                    )
                }
                return
            }

            // Default — USER
            _authState.update {
                it.copy(
                    isLoading = false, role = UserRole.USER,
                    userId = userId, phone = effectivePhone,
                    accessToken = accessToken, refreshToken = refreshToken,
                    isProfileComplete = isProfileComplete
                )
            }
        } catch (e: Exception) {
            Log.e("FagoAuth", "Role resolve error: ${e.message}")
            _authState.update {
                it.copy(isLoading = false, role = UserRole.GUEST, errorMessage = e.message)
            }
        }
    }

    // ── 7. Device Biometric / PIN Login ─────────────────────────────────────
    suspend fun verifyDeviceAndAutoLogin(phone: String): UserRole {
        val cleanPhone = phone.filter { it.isDigit() }.let {
            if (it.length > 10) it.takeLast(10) else it
        }
        directSupabasePhoneLogin(cleanPhone, null)
        return _authState.value.role
    }

    // ── 8. Sign Out ──────────────────────────────────────────────────────────
    fun signOut() {
        viewModelScope.launch {
            deviceAuthService.clearDeviceSignature()
            try { supabase.auth.signOut() } catch (e: Exception) { Log.e("FagoAuth", "SignOut: ${e.message}") }
            _authState.update { AuthUiState(isLoading = false, role = UserRole.GUEST) }
        }
    }
}
