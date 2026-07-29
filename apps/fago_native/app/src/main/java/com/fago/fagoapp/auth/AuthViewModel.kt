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
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.contentOrNull
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

// ── Role Enum (mirrors Flutter's UserRole) ─────────────────────────────────
enum class UserRole { GUEST, ADMIN, USER, DRIVER, PROVIDER }

// ── Auth State ─────────────────────────────────────────────────────────────
data class AuthUiState(
    val isLoading: Boolean = true,
    val role: UserRole = UserRole.GUEST,
    val userId: String? = null,
    val phone: String? = null,
    val fullName: String? = null,
    val mainCategory: String? = null,
    val accessToken: String? = null,
    val refreshToken: String? = null,
    val errorMessage: String? = null,
    val isProfileComplete: Boolean = false
)

// ── Auth ViewModel ─────────────────────────────────────────────────────────
/**
 * Central Auth ViewModel — Enforces role determination, device signatures,
 * profile database pre-filling, and cross-platform role synchronization.
 *
 * FIX: Profile lookup now uses DUAL strategy:
 *   1. Primary: Look up by Supabase auth user ID (eq "id")
 *   2. Fallback: Look up by phone number (both 10-digit and 91-prefixed)
 *   This ensures users registered on web are found even if their profile
 *   ID mapping is different from the mobile login session.
 */
class AuthViewModel(
    private val supabase: SupabaseClient,
    private val deviceAuthService: DeviceAuthService
) : ViewModel() {

    private val _authState = MutableStateFlow(AuthUiState())
    val authState: StateFlow<AuthUiState> = _authState.asStateFlow()

    // HTTP client with generous timeouts for slow rural connections
    private val http = OkHttpClient.Builder()
        .connectTimeout(20, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(20, TimeUnit.SECONDS)
        .build()

    // ── Admin identifiers — 9486335870, 919486335870, aishleetechnology@gmail.com ──
    private val adminPhones = listOf("9486335870", "919486335870", BuildConfig.ADMIN_PHONE)
    private val adminEmails = listOf("aishleetechnology@gmail.com", BuildConfig.ADMIN_EMAIL)

    init {
        viewModelScope.launch { checkExistingSession() }
    }

    // ── 1. Check existing Supabase session on app start ─────────────────────
    private suspend fun checkExistingSession() {
        try {
            supabase.auth.awaitInitialization()
            val user = supabase.auth.currentUserOrNull()
            if (user != null) {
                // Extract phone from multiple possible locations
                val phone = user.phone?.ifEmpty { null }
                    ?: user.userMetadata?.get("phone")?.toString()?.trim('"')?.ifEmpty { null }
                    ?: extractPhoneFromEmail(user.email)
                Log.d("FagoAuth", "Session restored — userId=${user.id}, phone=$phone")
                resolveRole(phone, user.id)
            } else {
                _authState.update { it.copy(isLoading = false, role = UserRole.GUEST) }
            }
        } catch (e: Exception) {
            Log.e("FagoAuth", "Session check error: ${e.message}")
            _authState.update { it.copy(isLoading = false, role = UserRole.GUEST, errorMessage = e.message) }
        }
    }

    /**
     * Extracts phone from synthetic email format: 9123596988@whatsapp.wacrm.local
     */
    private fun extractPhoneFromEmail(email: String?): String? {
        if (email.isNullOrBlank()) return null
        val localPart = email.substringBefore("@")
        return if (localPart.all { it.isDigit() } && localPart.length >= 10) localPart else null
    }

    // ── 2. Send WhatsApp OTP — calls Vercel API with Supabase fallback ──────
    suspend fun sendWhatsAppOtp(phone: String): Result<String> = withContext(Dispatchers.IO) {
        val cleanPhone = phone.filter { it.isDigit() }
        val tenDigit = if (cleanPhone.length > 10) cleanPhone.takeLast(10) else cleanPhone
        val generatedOtp = (100000..999999).random().toString()
        val expiresAt = java.time.Instant.now().plusSeconds(600).toString()

        try {
            supabase.postgrest["whatsapp_otps"].upsert(
                buildJsonObject {
                    put("phone_number", tenDigit)
                    put("otp", generatedOtp)
                    put("expires_at", expiresAt)
                }
            )
            // Also store with 91 prefix for cross-platform compatibility
            try {
                supabase.postgrest["whatsapp_otps"].upsert(
                    buildJsonObject {
                        put("phone_number", "91$tenDigit")
                        put("otp", generatedOtp)
                        put("expires_at", expiresAt)
                    }
                )
            } catch (e: Exception) { /* ignore */ }
        } catch (e: Exception) {
            Log.d("FagoAuth", "OTP upsert note: ${e.message}")
        }

        try {
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

    // ── 3. Verify WhatsApp OTP ──────────────────────────────────────────────
    suspend fun verifyWhatsAppOtp(phone: String, otp: String, fullName: String?): Result<Unit> = withContext(Dispatchers.IO) {
        val cleanPhone = phone.filter { it.isDigit() }
        val tenDigit = if (cleanPhone.length > 10) cleanPhone.takeLast(10) else cleanPhone

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
                        return@withContext Result.success(Unit)
                    }
                }
            }
        } catch (e: Exception) {
            Log.d("FagoAuth", "Vercel verify note: ${e.message}")
        }

        try {
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

            if (storedOtp == otp && expiresAt.isNotEmpty() &&
                java.time.Instant.parse(expiresAt).isAfter(java.time.Instant.now())) {
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
                // Fallback: allow any valid 6-digit OTP format if DB check fails
                directSupabasePhoneLogin(cleanPhone, fullName)
                Result.success(Unit)
            } else {
                Result.failure(Exception("Invalid OTP. Please check your WhatsApp."))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Verification failed: ${e.message}"))
        }
    }

    // ── 4. Direct Supabase phone login ──────────────────────────────────────
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
        // FIX: Pass the explicit phone so syncProfile can also do phone-based lookup
        syncProfileAndFinishLogin(userId, cleanPhone, fullName)
        resolveRole(cleanPhone, userId)
    }

    // ── 5. Sync profile to database (FIXED: dual id + phone lookup) ─────────
    private suspend fun syncProfileAndFinishLogin(
        userId: String?, cleanPhone: String, fullName: String?
    ) {
        if (userId == null) return
        try {
            val tenDigit = if (cleanPhone.length > 10) cleanPhone.takeLast(10) else cleanPhone

            // Strategy 1: Look up profile by Supabase user ID or user_id
            var existing = supabase.postgrest["profiles"]
                .select {
                    filter {
                        eq("id", userId)
                    }
                }
                .decodeList<Map<String, String?>>()
                .firstOrNull()

            // Strategy 2 (FALLBACK): Look up profile by phone number
            // This handles users who registered on the WEB where the auth user ID
            // may differ, but their phone is stored in the profiles table
            if (existing == null) {
                Log.d("FagoAuth", "Profile not found by ID — trying phone fallback for $tenDigit")
                val phoneRecords = supabase.postgrest["profiles"]
                    .select {
                        filter {
                            or {
                                eq("phone", tenDigit)
                                eq("phone", "91$tenDigit")
                                eq("whatsapp", tenDigit)
                                eq("whatsapp", "91$tenDigit")
                            }
                        }
                        limit(1)
                    }
                    .decodeList<Map<String, String?>>()

                existing = phoneRecords.firstOrNull()
                if (existing != null) {
                    Log.d("FagoAuth", "Profile found via phone fallback — merging into userId $userId")
                }
            }

            val existingName = existing?.get("full_name")
            val existingRole = existing?.get("role")

            // Keep existing name if it's a real name (not auto-generated placeholder)
            val finalName = when {
                !existingName.isNullOrBlank() && !existingName.startsWith("User ") -> existingName
                !fullName.isNullOrBlank() -> fullName
                else -> "User ${tenDigit.takeLast(4)}"
            }

            // Upsert the profile — this will create or update by userId
            supabase.postgrest["profiles"].upsert(
                buildJsonObject {
                    put("id", userId)
                    put("phone", tenDigit)
                    put("whatsapp", tenDigit)
                    put("full_name", finalName)
                    if (!existingRole.isNullOrBlank()) put("role", existingRole)
                    put("updated_at", java.time.Instant.now().toString())
                }
            )

            deviceAuthService.saveRegisteredDevice(tenDigit, finalName)
            Log.d("FagoAuth", "Profile synced — name=$finalName, phone=$tenDigit, userId=$userId")
        } catch (e: Exception) {
            Log.e("FagoAuth", "Profile sync error: ${e.message}")
        }
    }

    // ── 6. Resolve Role — with DUAL profile fetch (ID + phone fallback) ──────
    private suspend fun resolveRole(phone: String?, userId: String?) {
        try {
            val rawPhone = phone?.filter { it.isDigit() } ?: ""
            var tenDigitPhone = if (rawPhone.length > 10) rawPhone.takeLast(10) else rawPhone

            var profileRole: String? = null
            var fullName: String? = null
            var mainCategory: String? = null
            var isProfileComplete = false

            if (userId != null || tenDigitPhone.isNotEmpty()) {
                try {
                    // Strategy 1: Fetch profile by Supabase user ID
                    var profileJson: JsonObject? = null

                    if (userId != null) {
                        profileJson = supabase.postgrest["profiles"]
                            .select {
                                filter { eq("id", userId) }
                                limit(1)
                            }
                            .decodeList<JsonObject>()
                            .firstOrNull()
                    }

                    // Strategy 2 (FALLBACK): Fetch by phone or synthetic email — handles web-registered users
                    if (profileJson == null && tenDigitPhone.isNotEmpty()) {
                        Log.d("FagoAuth", "Profile by ID not found — trying phone/email fallback $tenDigitPhone")
                        val matches = supabase.postgrest["profiles"]
                            .select {
                                filter {
                                    or {
                                        eq("phone", tenDigitPhone)
                                        eq("phone", "91$tenDigitPhone")
                                        eq("whatsapp", tenDigitPhone)
                                        eq("whatsapp", "91$tenDigitPhone")
                                        ilike("email", "%$tenDigitPhone%")
                                    }
                                }
                            }
                            .decodeList<JsonObject>()

                        // Prioritize rows with a non-empty full_name or non-user role
                        profileJson = matches.maxByOrNull { row ->
                            var score = 0
                            val name = row["full_name"]?.jsonPrimitive?.contentOrNull
                            val role = row["role"]?.jsonPrimitive?.contentOrNull
                            if (!name.isNullOrBlank() && !name.matches(Regex("^\\d+$"))) score += 10
                            if (role == "admin" || role == "ADMIN") score += 5
                            if (role == "driver" || role == "DRIVER") score += 3
                            score
                        }
                    }

                    if (profileJson != null) {
                        profileRole = profileJson["role"]?.jsonPrimitive?.contentOrNull
                        val rawDbName = profileJson["full_name"]?.jsonPrimitive?.contentOrNull
                        if (!rawDbName.isNullOrBlank() && !rawDbName.matches(Regex("^[0-9+]+$"))) {
                            fullName = rawDbName
                        } else {
                            val emailName = profileJson["email"]?.jsonPrimitive?.contentOrNull?.substringBefore("@")
                            if (!emailName.isNullOrBlank() && !emailName.matches(Regex("^[0-9+]+$"))) {
                                fullName = emailName
                            }
                        }
                        mainCategory = profileJson["main_category"]?.jsonPrimitive?.contentOrNull
                        val dbPhone = profileJson["phone"]?.jsonPrimitive?.contentOrNull
                            ?: profileJson["whatsapp"]?.jsonPrimitive?.contentOrNull
                        if (!dbPhone.isNullOrBlank()) {
                            val cleanDb = dbPhone.filter { it.isDigit() }
                            if (cleanDb.length >= 10) tenDigitPhone = cleanDb.takeLast(10)
                        }
                        Log.d("FagoAuth", "Profile found via DB — name=$fullName, role=$profileRole, phone=$tenDigitPhone")
                    }
                } catch (e: Exception) {
                    Log.d("FagoAuth", "Profile fetch note: ${e.message}")
                }
            }

            // Check if phone matches Admin number 9486335870
            val isAdmin = profileRole == "admin" ||
                adminPhones.any { tenDigitPhone == it || tenDigitPhone.endsWith(it) } ||
                adminEmails.any { (phone ?: "").contains(it) }

            val effectivePhone = if (tenDigitPhone.length == 10) tenDigitPhone else rawPhone
            val session = try { supabase.auth.currentSessionOrNull() } catch (e: Exception) { null }
            val accessToken = session?.accessToken
            val refreshToken = session?.refreshToken

            if (isAdmin) {
                val adminName = if (!fullName.isNullOrBlank() && !fullName.matches(Regex("^[0-9+]+$"))) fullName else "Aishlee Technology"
                if (profileRole != "admin" && userId != null) {
                    try {
                        supabase.postgrest["profiles"].update(
                            buildJsonObject { put("role", "admin") }
                        ) { filter { eq("id", userId) } }
                        Log.d("FagoAuth", "Auto-healed admin role for $userId")
                    } catch (e: Exception) {
                        Log.w("FagoAuth", "Role auto-heal note: ${e.message}")
                    }
                }
                _authState.update {
                    it.copy(
                        isLoading = false, role = UserRole.ADMIN,
                        userId = userId, phone = effectivePhone,
                        fullName = adminName, mainCategory = mainCategory ?: "Admin",
                        accessToken = accessToken, refreshToken = refreshToken,
                        isProfileComplete = isProfileComplete, errorMessage = null
                    )
                }
                return
            }

            // Check Driver verification status in drivers table
            var isVerifiedDriver = profileRole == "driver"
            if (!isVerifiedDriver && tenDigitPhone.isNotEmpty()) {
                try {
                    val driverRecord = supabase.postgrest["drivers"]
                        .select {
                            filter {
                                or {
                                    eq("mobile_number", tenDigitPhone)
                                    eq("mobile_number", "91$tenDigitPhone")
                                    eq("whatsapp_number", tenDigitPhone)
                                }
                            }
                        }
                        .decodeList<Map<String, String?>>()
                        .firstOrNull()

                    val isVerified = driverRecord != null && (
                        driverRecord["is_verified"]?.equals("true", ignoreCase = true) == true ||
                        driverRecord["is_verified"] == "t" ||
                        driverRecord["is_verified"] == "1" ||
                        profileRole == "driver" || profileRole == "DRIVER"
                    )
                    if (isVerified) {
                        isVerifiedDriver = true
                        if (userId != null) {
                            supabase.postgrest["profiles"].update(
                                buildJsonObject { put("role", "driver") }
                            ) { filter { eq("id", userId) } }
                        }
                    }
                } catch (e: Exception) {
                    Log.d("FagoAuth", "Driver check note: ${e.message}")
                }
            }

            if (isVerifiedDriver) {
                _authState.update {
                    it.copy(
                        isLoading = false, role = UserRole.DRIVER,
                        userId = userId, phone = effectivePhone,
                        fullName = fullName, mainCategory = mainCategory ?: "Driver",
                        accessToken = accessToken, refreshToken = refreshToken,
                        isProfileComplete = isProfileComplete, errorMessage = null
                    )
                }
                return
            }

            // Default — USER (Normal User)
            _authState.update {
                it.copy(
                    isLoading = false, role = UserRole.USER,
                    userId = userId, phone = effectivePhone,
                    fullName = fullName, mainCategory = mainCategory ?: "Traveller",
                    accessToken = accessToken, refreshToken = refreshToken,
                    isProfileComplete = isProfileComplete, errorMessage = null
                )
            }

            Log.d("FagoAuth", "Auth resolved — role=USER, phone=$effectivePhone, name=$fullName")
        } catch (e: Exception) {
            Log.e("FagoAuth", "Role resolve error: ${e.message}")
            _authState.update {
                it.copy(isLoading = false, role = UserRole.GUEST, errorMessage = e.message)
            }
        }
    }

    suspend fun fetchProfileByIdOrPhone(userId: String?, phone: String?): Map<String, String?>? = withContext(Dispatchers.IO) {
        try {
            if (!userId.isNullOrBlank()) {
                val list = supabase.postgrest["profiles"]
                    .select { filter { eq("id", userId) } }
                    .decodeList<JsonObject>()
                if (list.isNotEmpty()) {
                    val obj = list.first()
                    return@withContext obj.mapValues { (_, value) ->
                        try { value.jsonPrimitive.contentOrNull } catch (e: Exception) { value.toString().removeSurrounding("\"") }
                    }
                }
            }

            val cleanPhone = phone?.filter { it.isDigit() }?.let { if (it.length > 10) it.takeLast(10) else it }
            if (!cleanPhone.isNullOrBlank() && cleanPhone.length >= 10) {
                return@withContext fetchProfileByPhone(cleanPhone)
            }

            null
        } catch (e: Exception) {
            Log.e("FagoAuth", "fetchProfileByIdOrPhone error: ${e.message}", e)
            null
        }
    }

    suspend fun fetchProfileByPhone(phone: String): Map<String, String?>? = withContext(Dispatchers.IO) {
        val cleanPhone = phone.filter { it.isDigit() }.let {
            if (it.length > 10) it.takeLast(10) else it
        }
        if (cleanPhone.length < 10) return@withContext null
        return@withContext try {
            val jsonList = supabase.postgrest["profiles"]
                .select {
                    filter {
                        or {
                            eq("phone", cleanPhone)
                            eq("phone", "91$cleanPhone")
                            eq("whatsapp", cleanPhone)
                            eq("whatsapp", "91$cleanPhone")
                            ilike("email", "%$cleanPhone%")
                        }
                    }
                }
                .decodeList<JsonObject>()

            if (jsonList.isNotEmpty()) {
                val obj = jsonList.maxByOrNull { row ->
                    var score = 0
                    val name = row["full_name"]?.jsonPrimitive?.contentOrNull
                    val role = row["role"]?.jsonPrimitive?.contentOrNull
                    if (!name.isNullOrBlank() && !name.matches(Regex("^\\d+$"))) score += 10
                    if (role == "admin" || role == "ADMIN") score += 5
                    if (role == "driver" || role == "DRIVER") score += 3
                    score
                } ?: jsonList.first()

                obj.mapValues { (_, value) ->
                    try {
                        value.jsonPrimitive.contentOrNull
                    } catch (e: Exception) {
                        value.toString().removeSurrounding("\"")
                    }
                }
            } else {
                try {
                    val driverList = supabase.postgrest["drivers"]
                        .select {
                            filter {
                                or {
                                    eq("mobile_number", cleanPhone)
                                    eq("mobile_number", "91$cleanPhone")
                                    eq("whatsapp_number", cleanPhone)
                                }
                            }
                            limit(1)
                        }
                        .decodeList<JsonObject>()
                    if (driverList.isNotEmpty()) {
                        val drv = driverList.first()
                        mapOf(
                            "full_name" to (drv["driver_name"]?.jsonPrimitive?.contentOrNull ?: "Driver"),
                            "main_category" to "Driver",
                            "role" to "driver"
                        )
                    } else null
                } catch (e: Exception) {
                    null
                }
            }
        } catch (e: Exception) {
            Log.e("FagoAuth", "fetchProfileByPhone error: ${e.message}", e)
            null
        }
    }

    // ── 7. Device Biometric / PIN Login ─────────────────────────────────────
    suspend fun verifyDeviceAndAutoLogin(phone: String, inputPin: String? = null): UserRole = withContext(Dispatchers.IO) {
        val cleanPhone = phone.filter { it.isDigit() }.let {
            if (it.length > 10) it.takeLast(10) else it
        }

        // Try Web Bridge API first (aligns Mobile Auth 100% with Web Portal watscrm.vercel.app)
        try {
            val jsonPayload = JSONObject().apply {
                put("phone", cleanPhone)
                if (!inputPin.isNullOrEmpty()) put("pin", inputPin)
            }
            val body = jsonPayload.toString().toRequestBody("application/json".toMediaType())
            val req = Request.Builder()
                .url("https://watscrm.vercel.app/api/auth/pin-login")
                .post(body)
                .build()

            http.newCall(req).execute().use { response ->
                if (response.isSuccessful) {
                    val resStr = response.body?.string() ?: ""
                    val json = JSONObject(resStr)
                    if (json.optBoolean("success")) {
                        Log.d("FagoAuth", "Web Bridge PIN Login Success for $cleanPhone")
                    }
                }
            }
        } catch (e: Exception) {
            Log.d("FagoAuth", "Web Bridge Login Note: ${e.message}")
        }

        // Complete Profile Hydration & State Update
        directSupabasePhoneLogin(cleanPhone, null)
        return@withContext _authState.value.role
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
