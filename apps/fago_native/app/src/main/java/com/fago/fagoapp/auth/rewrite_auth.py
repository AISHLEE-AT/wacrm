import re

file_path = r"C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\fago_native\app\src\main\java\com\fago\fagoapp\auth\AuthViewModel.kt"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update admin phones list
content = re.sub(
    r'private val adminPhones = listOfNotNull\(.*?BuildConfig\.ADMIN_PHONE\.ifBlank \{ null \}\)\.filter \{ it\.isNotBlank\(\) \}',
    'private val adminPhones = listOfNotNull("9123596988", "919123596988", BuildConfig.ADMIN_PHONE.ifBlank { null }).filter { it.isNotBlank() }',
    content,
    flags=re.DOTALL
)

# 2. Fix resolveRole (remove 9486335870 logic, rely on DB first)
content = re.sub(
    r'val isAdmin = isActualAdminNumber \|\| \(profileRole == "admin" && tenDigitPhone == "9486335870"\)',
    'val isAdmin = profileRole == "admin" || profileRole == "ADMIN" || isActualAdminNumber',
    content
)

# 3. Add pinLogin method and signInWithTokens
pin_login_code = """
    // ── PIN LOGIN ────────────────────────────────────────────────────────
    suspend fun pinLogin(phone: String, pin: String): Result<String?> = withContext(Dispatchers.IO) {
        val cleanPhone = phone.filter { it.isDigit() }
        try {
            val bodyMap = buildString {
                append("{\\"phone\\":\\"$cleanPhone\\",\\"pin\\":\\"$pin\\"}")
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

    private suspend fun signInWithTokens(accessToken: String, refreshToken: String) {
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
        val phone = user?.phone ?: user?.userMetadata?.get("phone")?.toString()?.trim('"')
        if (userId != null) {
            try {
                supabase.postgrest["profiles"].update(
                    buildJsonObject {
                        put("last_login", java.time.Instant.now().toString())
                        put("platform", "android")
                    }
                ) { filter { eq("id", userId) } }
            } catch(e: Exception) {
                Log.d("FagoAuth", "Failed to update last_login: ${e.message}")
            }
        }
        resolveRole(phone, userId)
    }
"""

content = re.sub(r'\}\s*$', pin_login_code + '\n}', content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
