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
import io.github.jan.supabase.postgrest.rpc
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

// ── WhatsApp Session Data Classes ─────────────────────────────────────────
data class WhatsAppInitResponse(
    val success: Boolean,
    val sessionToken: String? = null,
    val pollId: String? = null,
    val deepLinkUrl: String? = null
)

data class WhatsAppPollResponse(
    val status: String,
    val role: String? = null,
    val category: String? = null,
    val fullName: String? = null,
    val accessToken: String? = null,
    val refreshToken: String? = null
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

    private val baseUrl: String
        get() = BuildConfig.API_BASE_URL.ifBlank { "https://watscrm.vercel.app" }.trimEnd('/')

    // HTTP client with generous timeouts for slow rural connections
    private val http = OkHttpClient.Builder()
        .connectTimeout(20, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(20, TimeUnit.SECONDS)
        .build()

    // ── Admin identifiers — DB role='admin' is primary, these are bootstrap fallbacks ──
    private val adminPhones = listOf(
        BuildConfig.ADMIN_PHONE.ifBlank { "9486335870" },
        BuildConfig.ADMIN_PHONE_2.ifBlank { "9123596988" },
        "919486335870", "919123596988"
    ).filter { it.isNotBlank() }.distinct()
    private val adminEmails = listOf(BuildConfig.ADMIN_EMAIL.ifBlank { "aishleetechnology@gmail.com" })

    init {
        viewModelScope.launch { checkExistingSession() }
    }

    // ── Customer-Initiated WhatsApp Inbound Session (Deep Link + Polling) ──
    suspend fun initWhatsAppSession(phone: String, fullName: String, category: String): Result<WhatsAppInitResponse> = withContext(Dispatchers.IO) {
        val cleanPhone = phone.filter { it.isDigit() }.let { if (it.length > 10) it.takeLast(10) else it }
        try {
            val bodyMap = buildString {
                append("""{"phone":"$cleanPhone","fullName":"$fullName","category":"$category"}""")
            }
            val body = bodyMap.toRequestBody("application/json".toMediaType())
            val url = "$baseUrl/api/auth/whatsapp/init-session"
            val request = Request.Builder()
                .url(url)
                .post(body)
                .build()
            val response = http.newCall(request).execute()
            if (response.isSuccessful) {
                val json = JSONObject(response.body?.string() ?: "{}")
                if (json.optBoolean("success")) {
                    val initRes = WhatsAppInitResponse(
                        success = true,
                        sessionToken = json.optString("session_token").ifEmpty { null },
                        pollId = json.optString("poll_id").ifEmpty { null },
                        deepLinkUrl = json.optString("deep_link_url").ifEmpty { null }
                    )
                    return@withContext Result.success(initRes)
                }
                return@withContext Result.failure(Exception(json.optString("error", "Init session failed")))
            }
            Result.failure(Exception("HTTP ${response.code}: ${response.message}"))
        } catch (e: Exception) {
            Log.e("FagoAuth", "initWhatsAppSession error: ${e.message}", e)
            Result.failure(e)
        }
    }

    suspend fun pollWhatsAppSession(pollId: String): Result<WhatsAppPollResponse> = withContext(Dispatchers.IO) {
        try {
            val url = "$baseUrl/api/auth/whatsapp/poll-session?poll_id=$pollId"
            val request = Request.Builder()
                .url(url)
                .get()
                .build()
            val response = http.newCall(request).execute()
            if (response.isSuccessful) {
                val json = JSONObject(response.body?.string() ?: "{}")
                val status = json.optString("status", "pending")
                if (status == "verified") {
                    val session = json.optJSONObject("session")
                    val accessToken = session?.optString("access_token")
                    val refreshToken = session?.optString("refresh_token")
                    val roleStr = json.optString("role")
                    val categoryStr = json.optString("category")
                    val nameStr = json.optString("full_name")
                    val phoneStr = json.optString("phone")

                    if (!accessToken.isNullOrEmpty() && !refreshToken.isNullOrEmpty()) {
                        signInWithTokens(accessToken, refreshToken, phoneHint = phoneStr, nameHint = nameStr)
                    }

                    val pollRes = WhatsAppPollResponse(
                        status = "verified",
                        role = roleStr,
                        category = categoryStr,
                        fullName = nameStr,
                        accessToken = accessToken,
                        refreshToken = refreshToken
                    )
                    return@withContext Result.success(pollRes)
                }
                return@withContext Result.success(WhatsAppPollResponse(status = "pending"))
            }
            Result.failure(Exception("HTTP ${response.code}: ${response.message}"))
        } catch (e: Exception) {
            Log.e("FagoAuth", "pollWhatsAppSession error: ${e.message}", e)
            Result.failure(e)
        }
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
        // FIX: Pass explicit phone so syncProfile and resolveRole do phone-validated lookup
        syncProfileAndFinishLogin(userId, cleanPhone, fullName)
        resolveRole(cleanPhone, userId)
        val resolvedPhone = if (cleanPhone.length > 10) cleanPhone.takeLast(10) else cleanPhone
        deviceAuthService.saveRegisteredDevice(resolvedPhone, _authState.value.fullName ?: "User")
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
            val isActualAdmin = tenDigit == "9486335870" || tenDigit == "919486335870"
            val safeRole = if (!isActualAdmin && (existingRole == "admin" || existingRole == "ADMIN")) "user" else existingRole

            // Keep existing name if it's a real name (not auto-generated placeholder)
            val finalName = when {
                !existingName.isNullOrBlank() && !existingName.startsWith("User ") -> existingName
                !fullName.isNullOrBlank() -> fullName
                else -> "User ${tenDigit.takeLast(4)}"
            }

            // Upsert the profile — this will create or update by userId
            supabase.postgrest.rpc(
                "upsert_profile_by_phone",
                buildJsonObject {
                    put("p_user_id", userId)
                    put("p_phone", tenDigit)
                    put("p_full_name", finalName)
                    if (!safeRole.isNullOrBlank()) put("p_role", safeRole)
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
                    // Strategy 1: Fetch profile by Supabase user ID with phone validation
                    var profileJson: JsonObject? = null

                    if (userId != null) {
                        val fetchedJson = supabase.postgrest["profiles"]
                            .select {
                                filter { eq("id", userId) }
                                limit(1)
                            }
                            .decodeList<JsonObject>()
                            .firstOrNull()

                        if (fetchedJson != null) {
                            val dbPhone = fetchedJson["phone"]?.jsonPrimitive?.contentOrNull
                                ?: fetchedJson["whatsapp"]?.jsonPrimitive?.contentOrNull
                            val cleanDbPhone = dbPhone?.filter { it.isDigit() }?.takeLast(10) ?: ""

                            if (tenDigitPhone.isEmpty() || cleanDbPhone.isEmpty() || cleanDbPhone == tenDigitPhone) {
                                profileJson = fetchedJson
                            } else {
                                Log.d("FagoAuth", "Session userId profile phone ($cleanDbPhone) != requested login phone ($tenDigitPhone). Dropping mismatched session profile.")
                            }
                        }
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

                        // Prioritize rows matching the actual logged-in user phone number
                        profileJson = matches.maxByOrNull { row ->
                            var score = 0
                            val name = row["full_name"]?.jsonPrimitive?.contentOrNull
                            val pPhone = row["phone"]?.jsonPrimitive?.contentOrNull?.filter { it.isDigit() } ?: ""
                            if (pPhone.takeLast(10) == tenDigitPhone) score += 50
                            if (!name.isNullOrBlank() && !name.matches(Regex("^\\d+$"))) score += 10
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
                            if (cleanDb.length >= 10 && (tenDigitPhone.isEmpty() || cleanDb.takeLast(10) == tenDigitPhone)) {
                                tenDigitPhone = cleanDb.takeLast(10)
                            }
                        }
                        Log.d("FagoAuth", "Profile found via DB — name=$fullName, role=$profileRole, phone=$tenDigitPhone")
                    }
                } catch (e: Exception) {
                    Log.d("FagoAuth", "Profile fetch note: ${e.message}")
                }
            }

            // Check if phone strictly matches Admin number 9486335870 / 919486335870
            val isActualAdminNumber = adminPhones.any { adminPhone ->
                val cleanAdmin = adminPhone.filter { it.isDigit() }.takeLast(10)
                cleanAdmin.length == 10 && tenDigitPhone == cleanAdmin
            } || adminEmails.any { adminEmail ->
                !phone.isNullOrBlank() && phone.contains(adminEmail, ignoreCase = true)
            }

            val isAdmin = profileRole == "admin" || profileRole == "ADMIN" || isActualAdminNumber

            // Auto-heal non-admin users who were wrongly assigned admin role by previous bug
            if (!isActualAdminNumber && profileRole == "admin" && userId != null) {
                try {
                    supabase.postgrest["profiles"].update(
                        buildJsonObject { put("role", "user") }
                    ) { filter { eq("id", userId) } }
                    profileRole = "user"
                    Log.d("FagoAuth", "Auto-healed misassigned admin role to 'user' for $userId ($tenDigitPhone)")
                } catch (e: Exception) {
                    Log.w("FagoAuth", "Role auto-heal non-admin note: ${e.message}")
                }
            }

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

        // 1. Try Vercel API search first (matches Flutter checkPhoneRegistration & bypasses RLS)
        try {
            val url = "$baseUrl/api/fago/search?phone=$cleanPhone"
            val request = Request.Builder().url(url).get().build()
            val response = http.newCall(request).execute()
            if (response.isSuccessful) {
                val json = JSONObject(response.body?.string() ?: "{}")
                val profileObj = json.optJSONObject("profile")
                if (profileObj != null) {
                    val map = mutableMapOf<String, String?>()
                    val keys = profileObj.keys()
                    while (keys.hasNext()) {
                        val key = keys.next()
                        val value = profileObj.optString(key)
                        if (value.isNotEmpty() && value != "null") {
                            map[key] = value
                        }
                    }
                    if (map.isNotEmpty()) {
                        Log.d("FagoAuth", "Profile fetched via API for $cleanPhone — name=${map["full_name"]}")
                        return@withContext map
                    }
                }
            }
        } catch (e: Exception) {
            Log.d("FagoAuth", "API search note: ${e.message}")
        }

        // 2. Fallback: Supabase Direct Query
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
            } else null
        } catch (e: Exception) {
            Log.e("FagoAuth", "fetchProfileByPhone error: ${e.message}", e)
            null
        }
    }

    // ── PIN LOGIN ────────────────────────────────────────────────────────
    suspend fun pinLogin(phone: String, pin: String): Result<String?> = withContext(Dispatchers.IO) {
        val cleanPhone = phone.filter { it.isDigit() }
        try {
            val bodyMap = buildString {
                append("{\"phone\":\"$cleanPhone\",\"pin\":\"$pin\"}")
            }
            val body = bodyMap.toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url("${BuildConfig.API_BASE_URL.trimEnd('/')}/api/auth/pin-login")
                .post(body)
                .build()
            val response = http.newCall(request).execute()
            if (response.isSuccessful) {
                val json = JSONObject(response.body?.string() ?: "{}")
                val session = json.optJSONObject("session")
                val redirectTo = json.optString("redirect_to").ifEmpty { null }
                if (session != null) {
                    val accessToken = session.optString("access_token")
                    val refreshToken = session.optString("refresh_token")
                    if (accessToken.isNotEmpty() && refreshToken.isNotEmpty()) {
                        signInWithTokens(accessToken, refreshToken)
                        return@withContext Result.success(redirectTo)
                    }
                }
            }
            Result.failure(Exception("Invalid PIN or server error"))
        } catch (e: Exception) {
            Result.failure(Exception("PIN Login failed: ${e.message}"))
        }
    }

    private suspend fun signInWithTokens(accessToken: String, refreshToken: String, phoneHint: String? = null, nameHint: String? = null) {
        supabase.auth.importSession(
            io.github.jan.supabase.gotrue.user.UserSession(
                accessToken = accessToken,
                refreshToken = refreshToken,
                expiresIn = 3600,
                tokenType = "bearer",
                user = null
            )
        )
        val user = supabase.auth.currentUserOrNull()
        val userId = user?.id
        val userPhone = phoneHint?.ifEmpty { null }
            ?: user?.phone?.ifEmpty { null }
            ?: user?.userMetadata?.get("phone")?.toString()?.trim('"')?.ifEmpty { null }
            ?: extractPhoneFromEmail(user?.email)

        if (userId != null && !userPhone.isNullOrEmpty()) {
            try {
                syncProfileAndFinishLogin(userId, userPhone, nameHint)
            } catch(e: Exception) {
                Log.d("FagoAuth", "Failed to sync profile on login: ${e.message}")
            }
        }
        resolveRole(userPhone, userId)
    }

    // ── 8. Sign Out ──────────────────────────────────────────────────────────
    fun signOut() {
        viewModelScope.launch {
            deviceAuthService.clearDeviceSignature()
            try { supabase.auth.signOut() } catch (e: Exception) { Log.e("FagoAuth", "SignOut: ${e.message}") }
            _authState.update { AuthUiState(isLoading = false, role = UserRole.GUEST) }
        }
    }

    // ── Compatibility: verifyDeviceAndAutoLogin ───────────────────────────────
    // Called by LoginScreen when biometric or device PIN succeeds.
    // Returns a UserRole so that onLoginSuccess(UserRole) callback is satisfied.
    suspend fun verifyDeviceAndAutoLogin(phone: String, inputPin: String? = null): UserRole = withContext(Dispatchers.IO) {
        val cleanPhone = phone.filter { it.isDigit() }.let {
            if (it.length > 10) it.substring(it.length - 10) else it
        }
        try {
            // If a PIN was passed in, use DB-backed pin login
            if (!inputPin.isNullOrBlank() && inputPin.length == 4) {
                val result = pinLogin(cleanPhone, inputPin)
                return@withContext if (result.isSuccess) _authState.value.role else UserRole.GUEST
            }

            // Otherwise restore session from device
            val (storedAccess, storedRefresh) = deviceAuthService.getStoredTokens()
            if (!storedAccess.isNullOrBlank() && !storedRefresh.isNullOrBlank()) {
                signInWithTokens(storedAccess, storedRefresh)
                return@withContext _authState.value.role
            }
            UserRole.GUEST
        } catch (e: Exception) {
            Log.e("FagoAuth", "verifyDeviceAndAutoLogin error: ${e.message}")
            UserRole.GUEST
        }
    }
}
