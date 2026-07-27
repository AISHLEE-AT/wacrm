package com.fago.fagoapp.ui.screens.auth

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fago.fagoapp.auth.AuthViewModel
import com.fago.fagoapp.auth.UserRole
import com.fago.fagoapp.services.DeviceAuthService
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.koin.androidx.compose.koinViewModel

data class UserCategoryItem(
    val key: String,
    val label: String
)

/**
 * Native Android LoginScreen — 100% Matching Screenshot #2 UI Model.
 * Features:
 *   - Glowing Thamizhan FAGO Brand Logo & Tagline (தமிழன் FAGO வாழ்க • வளர்க • வெல்க • WhatsApp Verified)
 *   - Green-bordered "Mobile WhatsApp Number" with +91 prefix and length counter (0/10)
 *   - Green-bordered "Your Full Name (பெயர்)"
 *   - Dropdown menu "Choose Your Primary Goal"
 *   - Bright Green "Send WhatsApp OTP" Action Button
 *   - "Switch to SMS OTP Method" Link
 *   - Instant Device Biometric & PIN Login for returning registered devices
 *   - Visual Fallback Error Banners
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
    var selectedCategoryKey by remember { mutableStateOf("Traveller") }
    var dropdownExpanded by remember { mutableStateOf(false) }
    var isSmsMode by remember { mutableStateOf(false) }

    var otpSent by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMsg by remember { mutableStateOf("") }
    var generatedOtp by remember { mutableStateOf("") }
    var cooldownSeconds by remember { mutableIntStateOf(0) }

    var isDeviceRegistered by remember { mutableStateOf(false) }
    var registeredPhone by remember { mutableStateOf<String?>(null) }
    var isSimAutofetched by remember { mutableStateOf(false) }

    val userCategories = listOf(
        UserCategoryItem("Traveller", "🧳 Traveller (RideO)"),
        UserCategoryItem("Farmer", "🚜 Farmer (RentO Agri)"),
        UserCategoryItem("Shopper", "🛍️ Shopper (Mandi)"),
        UserCategoryItem("Driver", "🚗 Driver (DriveO)"),
        UserCategoryItem("Student", "🎓 Student (TestO Exam)"),
        UserCategoryItem("Teacher", "👨‍🏫 Teacher (TeachO)"),
        UserCategoryItem("Financier", "💰 Financier (MoneyO)"),
        UserCategoryItem("JobSeeker", "💼 Job Seeker (WorkO)"),
        UserCategoryItem("Employer", "🏢 Employer (BizHub)"),
        UserCategoryItem("Tourist", "🛕 Tourist (TourO)")
    )

    val selectedCategoryLabel = userCategories.find { it.key == selectedCategoryKey }?.label ?: "🧳 Traveller (RideO)"

    var showPinDialog by remember { mutableStateOf(false) }
    var pinInput by remember { mutableStateOf("") }
    var pinError by remember { mutableStateOf("") }

    // Live Database Auto-Detect when 10 digits are entered/autofetched
    LaunchedEffect(phone) {
        val cleanPhone = phone.filter { it.isDigit() }
        if (cleanPhone.length == 10) {
            val profileMap = authViewModel.fetchProfileByPhone(cleanPhone)
            if (profileMap != null) {
                val dbName = profileMap["full_name"]
                val dbCat  = profileMap["main_category"]
                if (!dbName.isNullOrBlank() && !dbName.startsWith("User ")) {
                    name = dbName
                }
                if (!dbCat.isNullOrBlank()) {
                    selectedCategoryKey = dbCat
                }
                isDeviceRegistered = true
            }
        }
    }

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

    Scaffold(containerColor = Color(0xFF0F172A)) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(20.dp))

            // ── 1. Glowing Thamizhan FAGO Brand Logo ──────────────────────────
            Box(
                modifier = Modifier
                    .size(130.dp)
                    .border(2.dp, Color(0xFF00FF00).copy(alpha = 0.8f), RoundedCornerShape(32.dp))
                    .background(Color(0xFF1E293B), RoundedCornerShape(32.dp))
                    .clip(RoundedCornerShape(32.dp)),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("🧠", fontSize = 48.sp)
                    Text("🌿", fontSize = 24.sp)
                }
            }

            Spacer(Modifier.height(12.dp))

            // ── 2. Branding Text Header ─────────────────────────────────────────
            Text(
                text = "தமிழன்",
                color = Color(0xFF00FF00),
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 2.sp
            )
            Text(
                text = "FAGO",
                color = Color(0xFFFFD700),
                fontSize = 46.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 3.sp
            )
            Text(
                text = "வாழ்க • வளர்க • வெல்க • WhatsApp Verified",
                color = Color(0xFF00FF00),
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp,
                textAlign = TextAlign.Center
            )

            Spacer(Modifier.height(24.dp))

            // ── 3. Device Unlock Card (If registered device) ───────────────────
            if (isDeviceRegistered && !registeredPhone.isNullOrEmpty()) {
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Color(0xFF1E293B),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.5.dp, Color(0xFF00FF00).copy(alpha = 0.6f), RoundedCornerShape(16.dp))
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Shield, contentDescription = null, tint = Color(0xFF00FF00), modifier = Modifier.size(24.dp))
                            Spacer(Modifier.width(10.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text("Welcome back, ${name.ifBlank { "User" }}! 🙏", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                                Text("Cell: +91 $registeredPhone • Device Verified 🔒", color = Color(0xFF00FF00), fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                            }
                        }
                        Spacer(Modifier.height(12.dp))
                        Button(
                            onClick = {
                                showPinDialog = true
                            },
                            modifier = Modifier.fillMaxWidth().height(46.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00FF00)),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(Icons.Default.Fingerprint, contentDescription = null, tint = Color.Black)
                            Spacer(Modifier.width(8.dp))
                            Text("🔐 UNLOCK VIA FINGERPRINT / DEVICE PIN", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }
                    }
                }
                Spacer(Modifier.height(20.dp))
            }

            if (showPinDialog) {
                AlertDialog(
                    onDismissRequest = { showPinDialog = false },
                    containerColor = Color(0xFF1E293B),
                    title = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Shield, contentDescription = null, tint = Color(0xFF00FF00))
                            Spacer(Modifier.width(8.dp))
                            Text("Enter 4-Digit Security PIN", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        }
                    },
                    text = {
                        Column {
                            Text("Enter your 4-digit FAGO PIN to unlock (+91 ${registeredPhone ?: phone})", color = Color.Gray, fontSize = 12.sp)
                            Spacer(Modifier.height(12.dp))
                            if (pinError.isNotEmpty()) {
                                Text(pinError, color = Color(0xFFEF4444), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                Spacer(Modifier.height(8.dp))
                            }
                            OutlinedTextField(
                                value = pinInput,
                                onValueChange = { pinInput = it.filter { c -> c.isDigit() }.take(4) },
                                label = { Text("4-Digit PIN", color = Color(0xFF00FF00)) },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                                singleLine = true,
                                modifier = Modifier.fillMaxWidth(),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = Color(0xFF00FF00),
                                    unfocusedBorderColor = Color(0xFF00FF00).copy(alpha = 0.6f),
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White
                                )
                            )
                        }
                    },
                    confirmButton = {
                        Button(
                            onClick = {
                                if (pinInput.length != 4) {
                                    pinError = "PIN must be 4 digits"
                                    return@Button
                                }
                                scope.launch {
                                    val isValid = deviceAuthService.verifyCustomPin(pinInput)
                                    if (!isValid) {
                                        pinError = "Incorrect PIN"
                                        return@launch
                                    }
                                    showPinDialog = false
                                    isLoading = true
                                    val targetP = registeredPhone ?: phone
                                    val resolved = authViewModel.verifyDeviceAndAutoLogin(targetP)
                                    isLoading = false
                                    onLoginSuccess(resolved)
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00FF00))
                        ) {
                            Text("Verify PIN", color = Color.Black, fontWeight = FontWeight.Bold)
                        }
                    },
                    dismissButton = {
                        TextButton(onClick = { showPinDialog = false }) {
                            Text("Cancel", color = Color.Gray)
                        }
                    }
                )
            }

            // ── 4. Fallback Error / Info Banner ──────────────────────────────
            if (errorMsg.isNotEmpty()) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = Color(0xFFEF4444).copy(alpha = 0.15f),
                    modifier = Modifier.fillMaxWidth().border(1.dp, Color(0xFFEF4444), RoundedCornerShape(8.dp))
                ) {
                    Text(
                        text = errorMsg,
                        color = Color(0xFFEF4444),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(10.dp)
                    )
                }
                Spacer(Modifier.height(14.dp))
            }

            if (!otpSent) {
                // ── 5. Mobile WhatsApp Number Input (Green Bordered) ──────────────
                OutlinedTextField(
                    value = phone,
                    onValueChange = { phone = it.filter { c -> c.isDigit() }.take(10) },
                    label = {
                        Text(
                            if (isSimAutofetched) "⚡ WhatsApp Cell Number (Autofetched SIM)" else "Mobile WhatsApp Number",
                            color = Color(0xFF00FF00),
                            fontWeight = FontWeight.Bold
                        )
                    },
                    supportingText = {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            if (isSimAutofetched) {
                                Text("✓ Auto-detected SIM number", color = Color(0xFF00FF00), fontSize = 11.sp)
                            } else {
                                Spacer(Modifier.width(1.dp))
                            }
                            Text("${phone.length}/10", color = Color(0xFF00FF00), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    },
                    leadingIcon = {
                        Icon(
                            if (isSimAutofetched) Icons.Default.SimCard else Icons.Default.Phone,
                            contentDescription = null,
                            tint = Color(0xFF00FF00)
                        )
                    },
                    prefix = { Text("+91 ", color = Color.White, fontWeight = FontWeight.Bold) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFF00FF00),
                        unfocusedBorderColor = Color(0xFF00FF00).copy(alpha = 0.6f),
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    )
                )

                Spacer(Modifier.height(12.dp))

                // ── 6. Full Name Input (Green Bordered) ───────────────────────────
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Your Full Name (பெயர்)", color = Color(0xFF00FF00), fontWeight = FontWeight.Bold) },
                    leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = Color(0xFF00F0FF)) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFF00FF00),
                        unfocusedBorderColor = Color(0xFF00FF00).copy(alpha = 0.6f),
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    )
                )

                Spacer(Modifier.height(14.dp))

                // ── 7. Primary Goal Category Dropdown ──────────────────────────────
                ExposedDropdownMenuBox(
                    expanded = dropdownExpanded,
                    onExpandedChange = { dropdownExpanded = !dropdownExpanded },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    OutlinedTextField(
                        value = selectedCategoryLabel,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Choose Your Primary Goal", color = Color(0xFF00FF00), fontWeight = FontWeight.Bold) },
                        leadingIcon = { Icon(Icons.Default.Category, contentDescription = null, tint = Color(0xFFFFD700)) },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = dropdownExpanded) },
                        modifier = Modifier.menuAnchor().fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF00FF00),
                            unfocusedBorderColor = Color(0xFF00FF00).copy(alpha = 0.6f),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        )
                    )
                    ExposedDropdownMenu(
                        expanded = dropdownExpanded,
                        onDismissRequest = { dropdownExpanded = false },
                        modifier = Modifier.background(Color(0xFF1E293B))
                    ) {
                        userCategories.forEach { item ->
                            DropdownMenuItem(
                                text = { Text(item.label, color = Color.White, fontWeight = FontWeight.Bold) },
                                onClick = {
                                    selectedCategoryKey = item.key
                                    dropdownExpanded = false
                                }
                            )
                        }
                    }
                }
            } else {
                // ── OTP Verification Mode ──────────────────────────────────────
                OutlinedTextField(
                    value = otp,
                    onValueChange = { otp = it.filter { c -> c.isDigit() }.take(6) },
                    label = { Text("6-Digit WhatsApp OTP", color = Color(0xFF00FF00), fontWeight = FontWeight.Bold) },
                    leadingIcon = { Icon(Icons.Default.Sms, contentDescription = null, tint = Color(0xFF00FF00)) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFF00FF00),
                        unfocusedBorderColor = Color(0xFF00FF00).copy(alpha = 0.6f),
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    )
                )

                Spacer(Modifier.height(12.dp))

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

            Spacer(Modifier.height(20.dp))

            // ── 8. Action Button (Bright Green "Send WhatsApp OTP") ───────────────
            Button(
                onClick = {
                    if (phone.length != 10) { errorMsg = "Please enter a valid 10-digit Indian mobile number"; return@Button }
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
                                errorMsg = "✅ OTP requested! Check your WhatsApp messages or tap Open WhatsApp."
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
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00FF00)),
                shape = RoundedCornerShape(12.dp),
                enabled = !isLoading
            ) {
                if (isLoading) {
                    CircularProgressIndicator(color = Color.Black, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                } else {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            if (otpSent) Icons.Default.CheckCircle else Icons.Default.Chat,
                            contentDescription = null,
                            tint = Color.Black,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(Modifier.width(8.dp))
                        Text(
                            if (otpSent) "Verify OTP & Access FAGO"
                            else if (cooldownSeconds > 0) "Resend OTP in ${cooldownSeconds}s"
                            else "Send WhatsApp OTP",
                            color = Color.Black,
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                    }
                }
            }

            Spacer(Modifier.height(16.dp))

            // ── 9. Method Switcher Link ───────────────────────────────────────────
            TextButton(onClick = { isSmsMode = !isSmsMode }) {
                Text(
                    text = if (isSmsMode) "Switch to WhatsApp OTP Method" else "Switch to SMS OTP Method",
                    color = Color.Gray,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }
    }
}
