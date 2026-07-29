package com.fago.fagoapp.ui.screens.ecosystem

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fago.fagoapp.ui.theme.*

data class TourDestination(
    val titleTamil: String,
    val titleEnglish: String,
    val distance: String,
    val cabFareEstimate: String,
    val category: String,
    val highlights: String,
    val icon: String
)

private val tourDestinations = listOf(
    TourDestination("திருவண்ணாமலை அருணாசலேஸ்வரர் கோயில்", "Tiruvannamalai Temple", "85 km from Vellore", "₹2,400 (Round Trip)", "Spiritual", "Girivalam Path, Annamalaiyar Temple, Ashram", "🏛️"),
    TourDestination("ஊட்டி மலை வாழிடம்", "Ooty Hill Station", "380 km from Vellore", "₹7,500 (2 Days)", "Hill Stations", "Botanical Garden, Lake, Toy Train, Doddabetta", "⛰️"),
    TourDestination("கொடைக்கானல் ஏரி", "Kodaikanal Lake & Coaker's Walk", "420 km from Vellore", "₹8,200 (2 Days)", "Hill Stations", "Kodaikanal Lake, Pillar Rocks, Bryant Park", "🌲"),
    TourDestination("தஞ்சாவூர் பெரிய கோயில்", "Thanjavur Brihadeeswarar Temple", "260 km from Vellore", "₹5,200 (Day Tour)", "Heritage", "UNESCO Big Temple, Palace Museum, Art Gallery", "👑"),
    TourDestination("ராமேஸ்வரம் பாம்பன் பாலம்", "Rameswaram & Pamban Bridge", "520 km from Vellore", "₹9,800 (2 Days)", "Spiritual", "Ramanathaswamy Temple, Dhanushkodi, Sea Bridge", "🛕"),
    TourDestination("காஞ்சிபுரம் பட்டு நகரம்", "Kanchipuram Silk & Temple City", "70 km from Vellore", "₹1,800 (Day Tour)", "Heritage", "Kamakshi Amman Temple, Silk Weaving Centers", "🧵")
)

private val tourCategories = listOf("All Packages", "Spiritual", "Hill Stations", "Heritage")

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TouroScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    var selectedCategory by remember { mutableStateOf("All Packages") }
    var selectedTour by remember { mutableStateOf<TourDestination?>(null) }

    val filteredTours = remember(selectedCategory) {
        if (selectedCategory == "All Packages") tourDestinations
        else tourDestinations.filter { it.category == selectedCategory }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("TourO — TN Tourism & Tour Cabs", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text("Fixed Rate Outstation Cabs • Verified Local Captains", color = CyanAccent, fontSize = 11.sp)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Slate800)
            )
        },
        containerColor = Slate900
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
        ) {
            // Category Row
            LazyRow(
                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(tourCategories) { cat ->
                    val isSelected = cat == selectedCategory
                    FilterChip(
                        selected = isSelected,
                        onClick = { selectedCategory = cat },
                        label = { Text(cat, fontSize = 12.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = CyanAccent,
                            selectedLabelColor = Slate900,
                            containerColor = Slate800,
                            labelColor = Color.White
                        )
                    )
                }
            }

            // Destinations List
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 4.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(filteredTours) { tour ->
                    TourCard(tour = tour, onBookClick = { selectedTour = tour })
                }
            }
        }
    }

    // Booking Dialog
    selectedTour?.let { tour ->
        AlertDialog(
            onDismissRequest = { selectedTour = null },
            title = { Text("Book Cab to ${tour.titleEnglish}", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp) },
            text = {
                Column {
                    Text(tour.titleTamil, color = GoldAdmin, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Spacer(Modifier.height(4.dp))
                    Text("Distance: ${tour.distance}", color = TextMuted, fontSize = 13.sp)
                    Text("Est. Fare: ${tour.cabFareEstimate}", color = CyanAccent, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Spacer(Modifier.height(10.dp))
                    Surface(shape = RoundedCornerShape(10.dp), color = Slate700) {
                        Text(
                            "🚗 Clean AC Sedan / SUV with 0% Commission Direct UPI Payout for Driver.",
                            color = Color.White,
                            fontSize = 12.sp,
                            modifier = Modifier.padding(10.dp)
                        )
                    }
                }
            },
            containerColor = Slate800,
            confirmButton = {
                Button(
                    onClick = {
                        val whatsappUrl = "https://wa.me/919486335870?text=Hello%20AISHO%20TourO,%20I%20want%20to%20book%20a%20tour%20cab%20to%20${Uri.encode(tour.titleEnglish)}."
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(whatsappUrl))
                        context.startActivity(intent)
                        selectedTour = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = CyanAccent)
                ) {
                    Text("Book Tour Cab", color = Slate900, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { selectedTour = null }) {
                    Text("Cancel", color = TextMuted)
                }
            }
        )
    }
}

@Composable
private fun TourCard(tour: TourDestination, onBookClick: () -> Unit) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = Slate800,
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, Slate700, RoundedCornerShape(16.dp))
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .background(CyanAccent.copy(alpha = 0.15f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(tour.icon, fontSize = 22.sp)
                }
                Spacer(Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(tour.titleTamil, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Text(tour.titleEnglish, color = TextMuted, fontSize = 12.sp)
                }
            }

            Spacer(Modifier.height(8.dp))
            Text(tour.highlights, color = Color.White.copy(alpha = 0.8f), fontSize = 12.sp)

            Spacer(Modifier.height(10.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Navigation, contentDescription = null, tint = GoldAdmin, modifier = Modifier.size(14.dp))
                    Spacer(Modifier.width(4.dp))
                    Text(tour.distance, color = TextMuted, fontSize = 12.sp)
                }
                Text(tour.cabFareEstimate, color = CyanAccent, fontWeight = FontWeight.Bold, fontSize = 15.sp)
            }

            Spacer(Modifier.height(12.dp))
            Button(
                onClick = onBookClick,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(containerColor = CyanAccent)
            ) {
                Icon(Icons.Default.DirectionsCar, contentDescription = null, tint = Slate900, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(6.dp))
                Text("Reserve Tour Cab", color = Slate900, fontWeight = FontWeight.Bold, fontSize = 13.sp)
            }
        }
    }
}
