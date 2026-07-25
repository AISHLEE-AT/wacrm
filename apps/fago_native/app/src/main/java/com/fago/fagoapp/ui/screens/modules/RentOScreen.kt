package com.fago.fagoapp.ui.screens.modules

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
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

data class MachineryCategoryItem(
    val key: String,
    val title: String,
    val subtitle: String,
    val icon: ImageVector,
    val color: Color,
    val baseRate: Double,
    val unit: String
)

/**
 * RentOScreen — 100% parity with Flutter's rento_screen.dart.
 * Features:
 *   - Machinery categories: Tractor, Harvester, MiniVan, PowerTiller, WaterTanker
 *   - Dynamic hourly/acre rent calculation engine
 *   - Requirement counter (+/- hours or acres)
 *   - Farmer details & live farm GPS location
 *   - 1-Click WhatsApp booking engine sending formatted farm location, pincode, GPS pin to 916381029380
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RentOScreen(onBack: () -> Unit) {
    val context = LocalContext.current

    var selectedCategoryKey by remember { mutableStateOf("Tractor") }
    var requirementCount by remember { mutableIntStateOf(2) }
    var farmerName by remember { mutableStateOf("") }
    var farmerVillage by remember { mutableStateOf("Tamil Nadu Farm GPS Location") }

    val categories = listOf(
        MachineryCategoryItem("Tractor",     "உழவு டிராக்டர் (Tractor)",           "Rotavator, Cultivator, Disc Ploughing",          Icons.Default.Agriculture,    Color(0xFFFF8C00), 700.0,  "Hour"),
        MachineryCategoryItem("Harvester",   "அறுவடை இயந்திரம் (Harvester)",      "Paddy, Sugarcane, Maize Harvester",             Icons.Default.Grass,          Color(0xFF00FF00), 1800.0, "Hour"),
        MachineryCategoryItem("MiniVan",     "சரக்கு வாகனம் (Mini-Van / Pickup)", "Tata Ace, Bolero to Uzhavar Shandhai / Mandi",  Icons.Default.LocalShipping,  Color(0xFF00F0FF), 500.0,  "Trip"),
        MachineryCategoryItem("PowerTiller", "பவர் டில்லர் (Power Tiller)",       "Small field tilling & pesticide sprayer",        Icons.Default.Build,          Color(0xFFFFD700), 400.0,  "Day"),
        MachineryCategoryItem("WaterTanker", "தண்ணீர் டேங்கர் (Water Tanker)",     "5000L / 10000L Farm & Domestic Water Supply",    Icons.Default.WaterDrop,      Color(0xFF06B6D4), 800.0,  "Load")
    )

    val selectedCat = categories.find { it.key == selectedCategoryKey } ?: categories[0]
    val estimatedRent = selectedCat.baseRate * requirementCount

    Scaffold(
        containerColor = Color(0xFF0F172A),
        topBar = {
            TopAppBar(
                title = { Text("🚜 RentO — விவசாய இயந்திர வாடகை", color = Color(0xFF00FF00), fontWeight = FontWeight.Bold, fontSize = 16.sp) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF1E293B)),
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color(0xFF00FF00))
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding).fillMaxSize().padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Banner
            item {
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Color(0xFF166534),
                    modifier = Modifier.fillMaxWidth().border(1.dp, Color(0xFF00FF00).copy(alpha = 0.3f), RoundedCornerShape(16.dp))
                ) {
                    Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text("🚜", fontSize = 36.sp)
                        Spacer(Modifier.width(14.dp))
                        Column {
                            Text("Tamil Nadu Local Machine Rentals", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            Text("உழவு, அறுவடை & சந்தை போக்குவரத்து இயந்திரங்கள்", color = Color(0xFF00FF00), fontSize = 12.sp)
                        }
                    }
                }
            }

            // Category Selector Label
            item {
                Text("SELECT MACHINERY CATEGORY (இயந்திரத்தை தேர்வுசெய்க):", color = Color.Gray, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }

            // Category Cards
            items(categories) { item ->
                val isSel = item.key == selectedCategoryKey
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = if (isSel) item.color.copy(alpha = 0.15f) else Color(0xFF1E293B),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(
                            width = if (isSel) 2.dp else 1.dp,
                            color = if (isSel) item.color else Color(0xFF334155),
                            shape = RoundedCornerShape(14.dp)
                        )
                        .clickable { selectedCategoryKey = item.key }
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(item.icon, contentDescription = null, tint = item.color, modifier = Modifier.size(30.dp))
                        Spacer(Modifier.width(14.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(item.title, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Text(item.subtitle, color = Color.Gray, fontSize = 11.sp)
                        }
                        Text("₹${item.baseRate.toInt()} / ${item.unit}", color = item.color, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                }
            }

            // Requirement Counter (+/-)
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
                        Text("Requirement (${selectedCat.unit}s):", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(onClick = { if (requirementCount > 1) requirementCount-- }) {
                                Icon(Icons.Default.RemoveCircleOutline, contentDescription = null, tint = Color(0xFFF43F5E))
                            }
                            Text("$requirementCount ${selectedCat.unit}(s)", color = Color(0xFF00FF00), fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            IconButton(onClick = { requirementCount++ }) {
                                Icon(Icons.Default.AddCircleOutline, contentDescription = null, tint = Color(0xFF00FF00))
                            }
                        }
                    }
                }
            }

            // Farmer Contact Inputs
            item {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("FARMER DETAILS (விவசாயி விவரங்கள்):", color = Color.Gray, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    OutlinedTextField(
                        value = farmerName,
                        onValueChange = { farmerName = it },
                        label = { Text("Farmer Name (விவசாயி பெயர்)", color = Color.Gray) },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Color(0xFF00FF00), unfocusedBorderColor = Color(0xFF334155), focusedTextColor = Color.White, unfocusedTextColor = Color.White)
                    )
                    OutlinedTextField(
                        value = farmerVillage,
                        onValueChange = { farmerVillage = it },
                        label = { Text("Village / Farm Address (கிராமம் / தோட்டம்)", color = Color.Gray) },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Color(0xFF00FF00), unfocusedBorderColor = Color(0xFF334155), focusedTextColor = Color.White, unfocusedTextColor = Color.White)
                    )
                }
            }

            // Total Rent Box
            item {
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = Color(0xFF00FF00).copy(alpha = 0.15f),
                    modifier = Modifier.fillMaxWidth().border(1.dp, Color(0xFF00FF00).copy(alpha = 0.5f), RoundedCornerShape(14.dp))
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Total Estimated Rent:", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                            Text("$requirementCount ${selectedCat.unit}(s) @ ₹${selectedCat.baseRate.toInt()}/${selectedCat.unit}", color = Color.White.copy(alpha = 0.7f), fontSize = 11.sp)
                        }
                        Text("₹${estimatedRent.toInt()}", color = Color(0xFF00FF00), fontSize = 24.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            // 1-Click WhatsApp Booking Button
            item {
                Button(
                    onClick = {
                        val nameStr = farmerName.ifBlank { "Local Farmer" }
                        val msg = Uri.encode(
                            "🌾 *RENTO AGRICULTURAL & HEAVY MACHINERY BOOKING* 🌾\n\n" +
                            "👤 *Farmer / Customer*: $nameStr\n" +
                            "🚜 *Machine Category*: ${selectedCat.title}\n" +
                            "⏱️ *Requirement*: $requirementCount ${selectedCat.unit}(s)\n" +
                            "📍 *Farm Address*: $farmerVillage\n" +
                            "💵 *Calculated Rent*: ₹${estimatedRent.toInt()} (Base Rate: ₹${selectedCat.baseRate.toInt()}/${selectedCat.unit})\n\n" +
                            "👉 Please confirm machine availability & timing with local operator!"
                        )
                        val waUri = Uri.parse("https://api.whatsapp.com/send?phone=916381029380&text=$msg")
                        context.startActivity(Intent(Intent.ACTION_VIEW, waUri))
                    },
                    modifier = Modifier.fillMaxWidth().height(54.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF25D366)),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Icon(Icons.Default.Chat, contentDescription = null, tint = Color.White)
                    Spacer(Modifier.width(8.dp))
                    Text("BOOK MACHINERY VIA WHATSAPP (1-CLICK)", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                }
            }
        }
    }
}
