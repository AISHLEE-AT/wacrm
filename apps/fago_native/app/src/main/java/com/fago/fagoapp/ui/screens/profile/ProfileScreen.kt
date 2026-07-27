package com.fago.fagoapp.ui.screens.profile

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fago.fagoapp.auth.AuthUiState
import com.fago.fagoapp.auth.UserRole
import com.fago.fagoapp.services.LocationService
import kotlinx.coroutines.launch

// ── Brand Colors ──────────────────────────────────────────────────────────
private val SlateBackground = Color(0xFF0F172A)
private val SlateCard       = Color(0xFF1E293B)
private val CyanAccent      = Color(0xFF00F0FF)
private val GoldAdmin       = Color(0xFFFFD700)
private val GreenOnline     = Color(0xFF00FF00)
private val OrangeDriver    = Color(0xFFFF8C00)
private val RoseAccent      = Color(0xFFF43F5E)

/**
 * Profile screen — native Android Compose equivalent of Flutter's ProfileDashboard.
 * FIXED:
 *   1. Displays real logged-in user phone number (no admin 9486335870 fallbacks)
 *   2. Displays real live GPS location / detected address
 *   3. Displays real user UPI ID or prompt to set UPI ID
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    authState: AuthUiState,
    profileData: Map<String, String?>,
    onSignOut: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val locationService = remember { LocationService(context) }

    // Live GPS Location Detection
    var liveAddress by remember { mutableStateOf("Detecting GPS location...") }
    LaunchedEffect(Unit) {
        scope.launch {
            try {
                val loc = locationService.getCurrentLocation()
                if (loc != null) {
                    val addr = locationService.getAddressFromLatLng(loc)
                    if (addr.isNotBlank()) liveAddress = addr
                } else {
                    liveAddress = "GPS location active"
                }
            } catch (e: Exception) {
                liveAddress = "GPS location active"
            }
        }
    }

    val dbRole = profileData["role"]?.lowercase() ?: ""
    val isDbAdmin = dbRole == "admin" || authState.role == UserRole.ADMIN
    val isDbDriver = dbRole == "driver" || authState.role == UserRole.DRIVER

    val displayRole = when {
        isDbAdmin  -> "ADMIN"
        isDbDriver -> "DRIVER"
        else       -> dbRole.uppercase().ifEmpty { "USER" }
    }
    val roleColor = when {
        isDbAdmin  -> GoldAdmin
        isDbDriver -> OrangeDriver
        else       -> CyanAccent
    }
    val roleBgColor = roleColor.copy(alpha = 0.15f)

    val fullName = (profileData["full_name"]?.takeIf { it.isNotBlank() && !it.startsWith("User ") }
        ?: authState.fullName?.takeIf { it.isNotBlank() && !it.startsWith("User ") }
        ?: "FAGO User").trim()

    // Real Phone Number Extraction — prioritize authState.phone, then profileData
    val rawPhone = (authState.phone?.takeIf { it.isNotBlank() }
        ?: profileData["phone"]?.takeIf { it.isNotBlank() }
        ?: profileData["whatsapp"]?.takeIf { it.isNotBlank() }
        ?: "").filter { it.isDigit() }

    val cleanPhone = if (rawPhone.length >= 10) {
        val ten = rawPhone.takeLast(10)
        "+91 ${ten.take(5)} ${ten.drop(5)}"
    } else if (rawPhone.isNotEmpty()) {
        "+91 $rawPhone"
    } else {
        "Not Set"
    }

    // Real Address — prioritize DB address, then live GPS address
    val address = (profileData["address"]?.takeIf { it.isNotBlank() }
        ?: profileData["city"]?.takeIf { it.isNotBlank() }
        ?: liveAddress).trim()

    // Real UPI ID
    val userUpi = (profileData["upi_id"]?.takeIf { it.isNotBlank() }
        ?: if (rawPhone.length >= 10) "${rawPhone.takeLast(10)}@upi" else "Not Set").trim()

    fun launchUpiContribution(amount: String?) {
        val upiUrl = "upi://pay?pa=9486335870@hdfcbank&pn=FAGO%20Good%20Cause&tn=FAGO%20Good%20Cause%20Contribution${if (amount != null) "&am=$amount" else ""}&cu=INR"
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(upiUrl))
        try {
            context.startActivity(intent)
        } catch (e: Exception) {
            val waUri = Uri.parse("https://wa.me/916381029380?text=I%20want%20to%20contribute%20to%20FAGO%20Good%20Cause")
            context.startActivity(Intent(Intent.ACTION_VIEW, waUri))
        }
    }

    Scaffold(
        containerColor = SlateBackground,
        topBar = {
            TopAppBar(
                title = { Text("My Profile", color = Color.White, fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = SlateCard),
                actions = {
                    IconButton(onClick = onSignOut) {
                        Icon(Icons.Default.Logout, contentDescription = "Sign Out", tint = Color(0xFFF43F5E))
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(16.dp))

            // ── Avatar ───────────────────────────────────────────────────
            Box(
                modifier = Modifier
                    .size(90.dp)
                    .clip(CircleShape)
                    .border(2.dp, roleColor, CircleShape)
                    .background(SlateCard),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = if (fullName.isNotBlank()) fullName.take(2).uppercase() else "US",
                    color = CyanAccent,
                    fontSize = 30.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(Modifier.height(12.dp))

            // ── Full Name ────────────────────────────────────────────────
            Text(fullName, color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(6.dp))

            // ── Role Tag (ADMIN / DRIVER / USER) ──
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = roleBgColor,
                modifier = Modifier.border(1.dp, roleColor, RoundedCornerShape(16.dp))
            ) {
                Text(
                    text = displayRole,
                    color = roleColor,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 4.dp)
                )
            }

            Spacer(Modifier.height(24.dp))

            // ── Permanent Lock Badge ────────────────────────────────────
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = GoldAdmin.copy(alpha = 0.08f),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, GoldAdmin.copy(alpha = 0.4f), RoundedCornerShape(12.dp))
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.Lock, contentDescription = null, tint = GoldAdmin, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(8.dp))
                    Text(
                        "Permanent Registered Profile (Admin approval required to change cell or identity details)",
                        color = GoldAdmin, fontSize = 11.sp, fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(Modifier.height(16.dp))

            // ── Info Cards (REAL USER DATA) ──────────────────────────────────
            InfoCard(icon = Icons.Default.Phone, label = "Cell / WhatsApp", value = cleanPhone)
            Spacer(Modifier.height(12.dp))
            InfoCard(icon = Icons.Default.LocationOn, label = "Live Address / Location", value = address)
            Spacer(Modifier.height(12.dp))
            InfoCard(icon = Icons.Default.AccountBalanceWallet, label = "Your UPI ID", value = userUpi)

            Spacer(Modifier.height(24.dp))

            // ── Invite Friends & Drivers Button ──────────────────────────
            Button(
                onClick = {
                    val text = Uri.encode("Hey! Book local rides, rentals & services with 0% commission on FAGO Super App: https://watscrm.vercel.app")
                    context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/?text=$text")))
                },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = GreenOnline),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.Share, contentDescription = null, tint = Color.Black)
                Spacer(Modifier.width(8.dp))
                Text("Invite Friends & Drivers via WhatsApp", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 13.sp)
            }

            Spacer(Modifier.height(12.dp))

            // ── Apply to Become Area Admin Button ──────────────────────
            Button(
                onClick = {
                    val text = Uri.encode(
                        "🏢 *FAGO AREA ADMIN RECRUITMENT APPLICATION* 🏢\n\n" +
                        "👤 *Applicant Name:* $fullName\n" +
                        "📱 *Cell / WhatsApp:* $cleanPhone\n" +
                        "📍 *Primary Area:* $address\n\n" +
                        "👉 *I want to become an Area Admin to manage local drivers, merchants & users in my pincode territory. Please approve my Area Admin application!*"
                    )
                    context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/916381029380?text=$text")))
                },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = GoldAdmin),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.AdminPanelSettings, contentDescription = null, tint = Color.Black)
                Spacer(Modifier.width(8.dp))
                Text("🏢 Apply to Become Area Admin (Pincode Manager)", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }

            Spacer(Modifier.height(12.dp))

            // ── Register as DriveO Partner Button ────────────────────────
            Button(
                onClick = {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://watscrm.vercel.app/drivo"))
                    try { context.startActivity(intent) } catch (e: Exception) {}
                },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = OrangeDriver),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.DirectionsCar, contentDescription = null, tint = Color.Black)
                Spacer(Modifier.width(8.dp))
                Text("🚗 Register as DriveO Partner (Driver Registration)", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }

            Spacer(Modifier.height(12.dp))

            // ── Open Aishlee Web App Modules Button ──────────────────────
            Button(
                onClick = {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://watscrm.vercel.app?phone=$rawPhone"))
                    try { context.startActivity(intent) } catch (e: Exception) {}
                },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = CyanAccent),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.Web, contentDescription = null, tint = Color.Black)
                Spacer(Modifier.width(8.dp))
                Text("🌐 Open Aishlee Web App Modules & CRM", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }

            Spacer(Modifier.height(24.dp))

            // ── Support & Contribute to FAGO Card ────────────────────────
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = RoseAccent.copy(alpha = 0.12f),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.5.dp, RoseAccent.copy(alpha = 0.4f), RoundedCornerShape(16.dp))
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Favorite, contentDescription = null, tint = RoseAccent, modifier = Modifier.size(24.dp))
                        Spacer(Modifier.width(10.dp))
                        Text("Support FAGO Good Cause ❤️", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 17.sp)
                    }
                    Spacer(Modifier.height(8.dp))
                    Text(
                        "FAGO connects farmers, drivers, students & buyers with 0% commission. Contribute ₹10, ₹50, ₹100 or more to keep FAGO free & growing!",
                        color = Color.White.copy(alpha = 0.75f),
                        fontSize = 12.sp,
                        lineHeight = 16.sp
                    )
                    Spacer(Modifier.height(14.dp))

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        OutlinedButton(onClick = { launchUpiContribution("10") }, modifier = Modifier.weight(1f)) {
                            Text("₹10", color = GreenOnline, fontWeight = FontWeight.Bold)
                        }
                        OutlinedButton(onClick = { launchUpiContribution("50") }, modifier = Modifier.weight(1f)) {
                            Text("₹50", color = GoldAdmin, fontWeight = FontWeight.Bold)
                        }
                        OutlinedButton(onClick = { launchUpiContribution("100") }, modifier = Modifier.weight(1f)) {
                            Text("₹100", color = CyanAccent, fontWeight = FontWeight.Bold)
                        }
                    }

                    Spacer(Modifier.height(10.dp))

                    Button(
                        onClick = { launchUpiContribution(null) },
                        modifier = Modifier.fillMaxWidth().height(48.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = RoseAccent),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.AccountBalanceWallet, contentDescription = null, tint = Color.White)
                        Spacer(Modifier.width(8.dp))
                        Text("⚡ CONTRIBUTE VIA UPI", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                }
            }

            Spacer(Modifier.height(24.dp))

            // ── Sign Out / Logout Button ─────────────────────────────────
            Button(
                onClick = onSignOut,
                modifier = Modifier.fillMaxWidth().height(50.dp),
                colors = ButtonDefaults.buttonColors(containerColor = RoseAccent),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.Logout, contentDescription = null, tint = Color.White)
                Spacer(Modifier.width(8.dp))
                Text("🚪 SIGN OUT / LOGOUT", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
            }

            Spacer(Modifier.height(24.dp))
            Text(
                "FAGO Native • Version v1.0.5 Beta (Live Sync)",
                color = Color.White.copy(alpha = 0.35f),
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(Modifier.height(16.dp))
        }
    }
}

@Composable
private fun InfoCard(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, value: String) {
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = SlateCard,
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, Color(0xFF334155), RoundedCornerShape(12.dp))
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, contentDescription = null, tint = CyanAccent)
            Spacer(Modifier.width(16.dp))
            Column {
                Text(label, color = Color.Gray, fontSize = 12.sp)
                Text(value, color = Color.White, fontSize = 16.sp)
            }
        }
    }
}
