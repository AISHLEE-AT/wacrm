package com.fago.fagoapp.ui.screens.auth

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fago.fagoapp.auth.AuthViewModel
import com.fago.fagoapp.auth.UserRole
import com.fago.fagoapp.services.DeviceAuthService
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.koin.androidx.compose.koinViewModel

data class UserCategoryOption(
    val key: String,
    val label: String,
    val color: Color
)

/**
 * Native Android LoginScreen — 100% feature parity with Flutter's login_screen.dart.
 * Features:
 *   - WhatsApp CRM OTP Auth (Vercel Bridge + Supabase whatsapp_otps table)
 *   - 1-Tap "Open WhatsApp to Get OTP" direct launcher
 *   - Resend OTP 60s cooldown timer
 *   - User Category Selector (Traveller, Farmer, Shopper, Driver, Student, Teacher, Financier, JobSeeker, Employer, Tourist)
 *   - Instant Device Biometric & PIN Login for returning registered devices
 *   - Admin auto-heal routing to CRM
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(onLoginSuccess: (UserRole) -> Unit) {
    val context = LocalContext.current
    val authViewModel: AuthViewModel = koinViewModel()
    val authState by authViewModel.authState.collectAsState()
    val scope = rememberCoroutineScope()
    val deviceAuthService = remember { DeviceAuthService(context) }

    var phone by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }
    var otp by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("Traveller") }

    var otpSent by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMsg by remember { mutableStateOf("") }
    var generatedOtp by remember { mutableStateOf("") }
    var cooldownSeconds by remember { mutableIntStateOf(0) }

    var isDeviceRegistered by remember { mutableStateOf(false) }
    var registeredPhone by remember { mutableStateOf<String?>(null) }
    var isSimAutofetched by remember { mutableStateOf(false) }

    // Check device signature on start
    LaunchedEffect(Unit) {
        val regPhone = deviceAuthService.getRegisteredPhone()
        val regName  = deviceAuthService.getRegisteredName()
        val isLocked = deviceAuthService.isProfileLocked()
        if (!regPhone.isNullOrEmpty() && isLocked) {
            registeredPhone = regPhone
            phone = regPhone
            if (!regName.isNullOrEmpty()) name = regName
            isDeviceRegistered = true
        } else {
            val simPhone = deviceAuthService.getExtractedSimPhoneNumber()
            if (!simPhone.isNullOrEmpty() && phone.isEmpty()) {
                phone = simPhone
                isSimAutofetched = true
            }
        }
    }

    // Handle navigation on role resolution
    LaunchedEffect(authState.role) {
        if (authState.role != UserRole.GUEST && !authState.isLoading) {
            onLoginSuccess(authState.role)
        }
    }

    // Cooldown timer loop
    LaunchedEffect(cooldownSeconds) {
        if (cooldownSeconds > 0) {
            delay(1000)
            cooldownSeconds -= 1
        }
    }

    val userCategories = listOf(
        UserCategoryOption("Traveller",  "🧳 Traveller (RideO)",  Color(0xFFFFD700)),
        UserCategoryOption("Farmer",     "🚜 Farmer (RentO Agri)", Color(0xFF00FF00)),
        UserCategoryOption("Shopper",    "🛍️ Shopper (Mandi)",     Color(0xFFF43F5E)),
        UserCategoryOption("Driver",     "🚗 Driver (DriveO)",    Color(0xFFFF8C00)),
        UserCategoryOption("Student",    "🎓 Student (TestO Exam)",Color(0xFF7C3AED)),
        UserCategoryOption("Teacher",    "👨‍🏫 Teacher (TeachO)",    Color(0xFF00F0FF)),
        UserCategoryOption("Financier",  "💰 Financier (MoneyO)", Color(0xFF10B981)),
        UserCategoryOption("JobSeeker",  "💼 Job Seeker (WorkO)", Color(0xFF84CC16)),
        UserCategoryOption("Employer",   "🏢 Employer (BizHub)",  Color(0xFF6366F1)),
        UserCategoryOption("Tourist",    "🧳 Tourist (TourO)",     Color(0xFFF97316))
    )

    Scaffold(containerColor = Color(0xFF0F172A)) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(30.dp))

            // ── Logo Header ──────────────────────────────────────────────────
            Text("🚗 FAGO", color = Color(0xFFFFD700), fontSize = 44.sp, fontWeight = FontWeight.Bold)
            Text("Super App for Mobility, Agri & Services", color = Color(0xFF00F0FF), fontSize = 13.sp)
            Spacer(Modifier.height(30.dp))

            // ── Device Unlock Card (if registered returning device) ───────────
            if (isDeviceRegistered && !registeredPhone.isNullOrEmpty()) {
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Color(0xFFFFD700).copy(alpha = 0.1f),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, Color(0xFFFFD700).copy(alpha = 0.5f), RoundedCornerShape(16.dp))
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Fingerprint, contentDescription = null, tint = Color(0xFFFFD700), modifier = Modifier.size(28.dp))
                            Spacer(Modifier.width(10.dp))
                            Column {
                                Text("Registered Device Detected", color = Color(0xFFFFD700), fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Text("Phone: +91 $registeredPhone", color = Color.White, fontSize = 12.sp)
                            }
                        }
                        Spacer(Modifier.height(12.dp))
                        Button(
                            onClick = {
                                isLoading = true
                                scope.launch {
                                    val resolved = authViewModel.verifyDeviceAndAutoLogin(registeredPhone!!)
                                    isLoading = false
                                    onLoginSuccess(resolved)
                                }
                            },
                            modifier = Modifier.fillMaxWidth().height(46.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFD700)),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(Icons.Default.LockOpen, contentDescription = null, tint = Color.Black)
                            Spacer(Modifier.width(8.dp))
                            Text("Instant Biometric / PIN Unlock", color = Color.Black, fontWeight = FontWeight.Bold)
                        }
                    }
                }
                Spacer(Modifier.height(24.dp))
                HorizontalDivider(color = Color(0xFF334155))
                Spacer(Modifier.height(20.dp))
            }

            // ── User Category Selector Chips ────────────────────────────────
            Text("Select Your Primary Category:", color = Color.Gray, fontSize = 12.sp, fontWeight = FontWeight.Bold, modifier = Modifier.align(Alignment.Start))
            Spacer(Modifier.height(8.dp))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(userCategories) { cat ->
                    val isSel = cat.key == selectedCategory
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = if (isSel) cat.color.copy(alpha = 0.2f) else Color(0xFF1E293B),
                        modifier = Modifier
                            .border(
                                width = if (isSel) 2.dp else 1.dp,
                                color = if (isSel) cat.color else Color(0xFF334155),
                                shape = RoundedCornerShape(12.dp)
                            )
                            .clickable { selectedCategory = cat.key }
                    ) {
                        Text(
                            cat.label,
                            color = if (isSel) cat.color else Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
                        )
                    }
                }
            }
            Spacer(Modifier.height(20.dp))

            // ── Mobile Number Input (First Input Box - Autofetched Cell / WhatsApp Number) ──
            OutlinedTextField(
                value = phone,
                onValueChange = { phone = it.filter { c -> c.isDigit() }.take(10) },
                label = {
                    Text(
                        if (isSimAutofetched) "⚡ WhatsApp Cell Number (Autofetched SIM)" else "WhatsApp Cell Number",
                        color = if (isSimAutofetched) Color(0xFF00FF00) else Color.Gray,
                        fontWeight = FontWeight.Bold
                    )
                },
                supportingText = {
                    if (isSimAutofetched) {
                        Text("✓ Auto-detected SIM card number from your device", color = Color(0xFF00FF00), fontSize = 11.sp)
                    }
                },
                leadingIcon = {
                    Icon(
                        if (isSimAutofetched) Icons.Default.SimCard else Icons.Default.Phone,
                        contentDescription = null,
                        tint = if (isSimAutofetched) Color(0xFF00FF00) else Color(0xFF00F0FF)
                    )
                },
                prefix = { Text("+91 ", color = Color.White, fontWeight = FontWeight.Bold) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = if (isSimAutofetched) Color(0xFF00FF00) else Color(0xFF00F0FF),
                    unfocusedBorderColor = if (isSimAutofetched) Color(0xFF00FF00).copy(alpha = 0.6f) else Color(0xFF334155),
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                )
            )
            Spacer(Modifier.height(12.dp))

            // ── Full Name Input ─────────────────────────────────────────────
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Full Name", color = Color.Gray) },
                leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = Color(0xFFFFD700)) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color(0xFFFFD700),
                    unfocusedBorderColor = Color(0xFF334155),
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                )
            )

            // ── 6-digit OTP Input (shown after OTP sent) ────────────────────
            if (otpSent) {
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(
                    value = otp,
                    onValueChange = { otp = it.filter { c -> c.isDigit() }.take(6) },
                    label = { Text("6-Digit WhatsApp OTP", color = Color.Gray) },
                    leadingIcon = { Icon(Icons.Default.Sms, contentDescription = null, tint = Color(0xFF00FF00)) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFF00FF00),
                        unfocusedBorderColor = Color(0xFF334155),
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    )
                )

                Spacer(Modifier.height(12.dp))

                // ── Direct "Open WhatsApp to Get OTP" Button ─────────────────
                Button(
                    onClick = {
                        val waMsg = Uri.encode("Hi FAGO! Send my login OTP for +91 $phone")
                        val waUri = Uri.parse("https://api.whatsapp.com/send?phone=916381029380&text=$waMsg")
                        context.startActivity(Intent(Intent.ACTION_VIEW, waUri))
                    },
                    modifier = Modifier.fillMaxWidth().height(44.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF25D366)),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(Icons.Default.Chat, contentDescription = null, tint = Color.Black)
                    Spacer(Modifier.width(8.dp))
                    Text("Open WhatsApp Chat to Get OTP", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                }
            }

            if (errorMsg.isNotEmpty()) {
                Spacer(Modifier.height(10.dp))
                Text(errorMsg, color = Color(0xFFF43F5E), fontSize = 13.sp, fontWeight = FontWeight.Bold)
            }

            Spacer(Modifier.height(24.dp))

            // ── Send OTP / Verify Login Button ──────────────────────────────
            Button(
                onClick = {
                    if (phone.length != 10) { errorMsg = "Enter valid 10-digit Indian mobile number"; return@Button }
                    errorMsg = ""
                    isLoading = true

                    scope.launch {
                        if (!otpSent) {
                            if (cooldownSeconds > 0) {
                                errorMsg = "Please wait ${cooldownSeconds}s before requesting a new OTP."
                                isLoading = false
                                return@launch
                            }
                            cooldownSeconds = 60
                            val result = authViewModel.sendWhatsAppOtp(phone)
                            isLoading = false
                            result.onSuccess { sentOtp ->
                                generatedOtp = sentOtp
                                otpSent = true
                                errorMsg = "✅ OTP sent via WhatsApp! Check your WhatsApp messages."
                            }.onFailure {
                                errorMsg = it.message ?: "Failed to send WhatsApp OTP"
                            }
                        } else {
                            if (otp.length != 6) { errorMsg = "Enter 6-digit OTP code"; isLoading = false; return@launch }
                            val result = authViewModel.verifyWhatsAppOtp(phone, otp, name.ifBlank { null })
                            isLoading = false
                            result.onSuccess {
                                val resolvedRole = authViewModel.authState.value.role
                                onLoginSuccess(resolvedRole)
                            }.onFailure {
                                errorMsg = it.message ?: "Invalid OTP. Please check your WhatsApp."
                            }
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth().height(52.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (otpSent) Color(0xFF00FF00) else Color(0xFFFFD700)
                ),
                shape = RoundedCornerShape(12.dp),
                enabled = !isLoading
            ) {
                if (isLoading) {
                    CircularProgressIndicator(color = Color.Black, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                } else {
                    Text(
                        if (otpSent) "✅ Verify OTP & Access FAGO"
                        else if (cooldownSeconds > 0) "Resend OTP in ${cooldownSeconds}s"
                        else "📲 Send WhatsApp OTP",
                        color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 16.sp
                    )
                }
            }
        }
    }
}
