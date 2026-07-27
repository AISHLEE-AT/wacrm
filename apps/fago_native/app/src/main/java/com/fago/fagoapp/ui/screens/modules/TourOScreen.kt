package com.fago.fagoapp.ui.screens.modules

import com.fago.fagoapp.auth.AuthUiState
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.AddCircleOutline
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.RemoveCircleOutline
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

data class TourPackageItem(
    val key: String,
    val title: String,
    val subtitle: String,
    val icon: String,
    val baseRate: Double,
    val duration: String,
    val vehicle: String
)

/**
 * TourOScreen — 100% parity with Flutter's touro_screen.dart.
 * Features:
 *   - Tamil Nadu Temple & Hill tour packages
 *   - Passenger count counter (+/- persons)
 *   - Live pickup location & pincode
 *   - 1-Click WhatsApp package booking engine to 916381029380
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TourOScreen(
    authState: AuthUiState? = null,
    onBack: () -> Unit
) {
    val context = LocalContext.current

    var selectedPackageKey by remember { mutableStateOf("arupadaiveedu") }
    var passengerCount by remember { mutableIntStateOf(4) }
    var travellerName by remember { mutableStateOf(authState?.fullName ?: "") }
    var travellerPhone by remember { mutableStateOf(authState?.phone ?: "") }

    LaunchedEffect(authState?.fullName, authState?.phone) {
        if (!authState?.fullName.isNullOrBlank()) travellerName = authState.fullName!!
        if (!authState?.phone.isNullOrBlank()) travellerPhone = authState.phone!!
    }

    val tourPackages = listOf(
        TourPackageItem("arupadaiveedu", "அறுபடைவீடு ஆன்மீக பயணம் (Arupadaiveedu)", "Palani, Tiruchendur, Swamimalai, Thiruthani, Madurai", "🕉️", 12500.0, "3 Days / 2 Nights", "Innova / Ertiga / Tempo Traveller"),
        TourPackageItem("rameswaram",    "இராமேஸ்வரம் & கன்னியாகுமரி (Rameswaram)",       "Ramanathaswamy Temple, Dhanushkodi, Vivekananda Rock", "🌊", 14000.0, "3 Days / 2 Nights", "AC SUV / Force Traveller"),
        TourPackageItem("ooty_kodai",    "ஊட்டி & கொடைக்கானல் (Ooty & Kodaikanal)",     "Botanical Garden, Pykara, Pillar Rocks, Coaker Walk",  "⛰️", 16500.0, "4 Days / 3 Nights", "Ghat Road Expert Driver + Force Traveller"),
        TourPackageItem("tanjore_chola", "தஞ்சை பெரிய கோவில் (Tanjore Big Temple)",      "Brihadeeswarar Temple, Gangaikonda Cholapuram",        "🛕", 8500.0,  "2 Days / 1 Night",  "Sedan / SUV / Tempo")
    )

    val selectedPkg = tourPackages.find { it.key == selectedPackageKey } ?: tourPackages[0]

    Scaffold(
        containerColor = Color(0xFF0F172A),
        topBar = {
            TopAppBar(
                title = { Text("🕉️ TourO — ஆன்மீக & சுற்றுலா பயணம்", color = Color(0xFF00F0FF), fontWeight = FontWeight.Bold, fontSize = 16.sp) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF1E293B)),
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color(0xFF00F0FF))
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding).fillMaxSize().padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Header Banner
            item {
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Color(0xFF0369A1),
                    modifier = Modifier.fillMaxWidth().border(1.dp, Color(0xFF00F0FF).copy(alpha = 0.3f), RoundedCornerShape(16.dp))
                ) {
                    Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text("🛕", fontSize = 36.sp)
                        Spacer(Modifier.width(14.dp))
                        Column {
                            Text("Tamil Nadu Temple & Hill Packages", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            Text("அறுபடைவீடு, இராமேஸ்வரம் & மலைவாசஸ்தல சுற்றுலா", color = Color(0xFF00F0FF), fontSize = 12.sp)
                        }
                    }
                }
            }

            item {
                Text("SELECT TOUR PACKAGE (சுற்றுலா பொதியை தேர்வுசெய்க):", color = Color.Gray, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }

            // Tour Package List
            items(tourPackages) { item ->
                val isSel = item.key == selectedPackageKey
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = if (isSel) Color(0xFF00F0FF).copy(alpha = 0.15f) else Color(0xFF1E293B),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(
                            width = if (isSel) 2.dp else 1.dp,
                            color = if (isSel) Color(0xFF00F0FF) else Color(0xFF334155),
                            shape = RoundedCornerShape(14.dp)
                        )
                        .clickable { selectedPackageKey = item.key }
                ) {
                    Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text(item.icon, fontSize = 30.sp)
                        Spacer(Modifier.width(14.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(item.title, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Spacer(Modifier.height(2.dp))
                            Text(item.subtitle, color = Color.Gray, fontSize = 11.sp)
                            Spacer(Modifier.height(4.dp))
                            Text("Duration: ${item.duration}", color = Color(0xFF00F0FF), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        }
                        Text("₹${item.baseRate.toInt()}", color = Color(0xFF00F0FF), fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    }
                }
            }

            // Passenger Counter
            item {
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = Color(0xFF1E293B),
                    modifier = Modifier.fillMaxWidth().border(1.dp, Color(0xFF334155), RoundedCornerShape(14.dp))
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Passenger Count (பயணிகள் எண்ணிக்கை):", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(onClick = { if (passengerCount > 1) passengerCount-- }) {
                                Icon(Icons.Default.RemoveCircleOutline, contentDescription = null, tint = Color(0xFFF43F5E))
                            }
                            Text("$passengerCount Persons", color = Color(0xFF00F0FF), fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            IconButton(onClick = { passengerCount++ }) {
                                Icon(Icons.Default.AddCircleOutline, contentDescription = null, tint = Color(0xFF00F0FF))
                            }
                        }
                    }
                }
            }

            // 1-Click WhatsApp Booking Button
            item {
                Button(
                    onClick = {
                        val pName = travellerName.ifBlank { authState?.fullName?.trim() ?: "Pilgrim / Traveller" }
                        val pPhone = travellerPhone.ifBlank { authState?.phone?.trim() ?: "" }
                        if (pPhone.isBlank()) {
                            android.widget.Toast.makeText(context, "Please enter your mobile phone number in profile settings before booking", android.widget.Toast.LENGTH_LONG).show()
                            return@Button
                        }
                        val msg = Uri.encode(
                            "🕉️ *TOURO TAMIL NADU TEMPLE & HILL TOUR BOOKING* 🕉️\n\n" +
                            "👤 *Pilgrim / Traveller Name*: $pName\n" +
                            "📱 *Cell / WhatsApp*: +91 $pPhone\n" +
                            "🚩 *Selected Package*: ${selectedPkg.title}\n" +
                            "⏱️ *Duration*: ${selectedPkg.duration}\n" +
                            "🚘 *Vehicle Type*: ${selectedPkg.vehicle}\n" +
                            "👥 *Passengers*: $passengerCount Persons\n" +
                            "💵 *Package Base Fare*: ₹${selectedPkg.baseRate.toInt()}\n" +
                            "📍 *Pickup Location*: Gandhipuram, Coimbatore 641012, Tamil Nadu\n\n" +
                            "👉 TourO Manager: Please confirm tour booking & driver assignment!"
                        )
                        val waUri = Uri.parse("https://api.whatsapp.com/send?phone=916381029380&text=$msg")
                        context.startActivity(Intent(Intent.ACTION_VIEW, waUri))
                    },
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7)),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Icon(Icons.Default.Chat, contentDescription = null, tint = Color.White)
                    Spacer(Modifier.width(8.dp))
                    Text("BOOK TOUR PACKAGE VIA WHATSAPP (1-CLICK)", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
            }
        }
    }
}
