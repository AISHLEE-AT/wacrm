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

data class MachineryItem(
    val id: String,
    val titleTamil: String,
    val titleEnglish: String,
    val rate: String,
    val category: String,
    val ownerName: String,
    val phone: String,
    val location: String,
    val hpRating: String,
    val icon: String
)

private val machineryList = listOf(
    MachineryItem("1", "மகிந்திரா 575 DI டிராக்டர்", "Mahindra 575 DI Tractor (50 HP)", "₹1,200 / day", "Tractors", "Ramanathan Farmers", "9486335870", "Tirupattur, TN", "50 HP", "🚜"),
    MachineryItem("2", "ஜான் டீரெ 5050D டிராக்டர்", "John Deere 5050D Heavy Tractor", "₹1,500 / day", "Tractors", "Vellore Agri Tools", "9486335870", "Vellore, TN", "50 HP", "🚜"),
    MachineryItem("3", "நெல் அறுவடை இயந்திரம்", "Combine Paddy Harvester", "₹2,200 / hour", "Harvesters", "TN Kisan Co-op", "9486335870", "Ambur / Vaniyambadi", "75 HP", "🌾"),
    MachineryItem("4", "JCB 3DX எர்த்மூவர்", "JCB 3DX Earthmover & Digger", "₹1,800 / hour", "Earthmovers", "Vellore Earthworks", "9486335870", "Katpadi, TN", "76 HP", "🚜"),
    MachineryItem("5", "பவர் டிரில்லர் & ரோட்டவேட்டர்", "Power Tiller with Rotavator", "₹800 / day", "Tillers", "Selvam Machinery", "9486335870", "Tirupattur, TN", "15 HP", "⚙️"),
    MachineryItem("6", "டிராக்டர் டிரெய்லர் (5 Ton)", "Heavy Tipper Trailer (5 Ton)", "₹900 / day", "Trailers", "Kumar Transport", "9486335870", "Natrampalli, TN", "5 Ton", "🚛")
)

private val rentoCategories = listOf("All Machinery", "Tractors", "Harvesters", "Earthmovers", "Tillers", "Trailers")

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RentOScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    var selectedCategory by remember { mutableStateOf("All Machinery") }
    var bookingMachinery by remember { mutableStateOf<MachineryItem?>(null) }

    val filteredList = remember(selectedCategory) {
        if (selectedCategory == "All Machinery") machineryList
        else machineryList.filter { it.category == selectedCategory }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("RentO — Agri & Heavy Equipment", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text("Direct Owner Rates • No Middleman Commission", color = EmeraldGreen, fontSize = 11.sp)
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
            // Category Filter Row
            LazyRow(
                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(rentoCategories) { cat ->
                    val isSelected = cat == selectedCategory
                    FilterChip(
                        selected = isSelected,
                        onClick = { selectedCategory = cat },
                        label = { Text(cat, fontSize = 12.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = EmeraldGreen,
                            selectedLabelColor = Slate900,
                            containerColor = Slate800,
                            labelColor = Color.White
                        )
                    )
                }
            }

            // Machinery List
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 4.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(filteredList) { item ->
                    MachineryCard(
                        item = item,
                        onBookClick = { bookingMachinery = item },
                        onCallClick = {
                            val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:+91${item.phone}"))
                            context.startActivity(intent)
                        }
                    )
                }
            }
        }
    }

    // Booking Dialog Modal
    bookingMachinery?.let { item ->
        AlertDialog(
            onDismissRequest = { bookingMachinery = null },
            title = { Text("Book ${item.titleEnglish}", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp) },
            text = {
                Column {
                    Text("Owner: ${item.ownerName}", color = TextMuted, fontSize = 13.sp)
                    Text("Rate: ${item.rate}", color = EmeraldGreen, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Text("Location: ${item.location}", color = TextMuted, fontSize = 12.sp)
                    Spacer(Modifier.height(12.dp))
                    Surface(shape = RoundedCornerShape(10.dp), color = Slate700) {
                        Text(
                            "✅ 0% Commission rental request will be sent to the owner via WhatsApp.",
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
                        val whatsappUrl = "https://wa.me/91${item.phone}?text=Hello%20${Uri.encode(item.ownerName)},%20I%20want%20to%20rent%20your%20${Uri.encode(item.titleEnglish)}%20via%20AISHO%20RentO."
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(whatsappUrl))
                        context.startActivity(intent)
                        bookingMachinery = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldGreen)
                ) {
                    Text("Book via WhatsApp", color = Slate900, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { bookingMachinery = null }) {
                    Text("Cancel", color = TextMuted)
                }
            }
        )
    }
}

@Composable
private fun MachineryCard(
    item: MachineryItem,
    onBookClick: () -> Unit,
    onCallClick: () -> Unit
) {
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
                        .background(EmeraldGreen.copy(alpha = 0.15f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(item.icon, fontSize = 22.sp)
                }
                Spacer(Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(item.titleTamil, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Text(item.titleEnglish, color = TextMuted, fontSize = 12.sp)
                }
                Text(item.rate, color = EmeraldGreen, fontWeight = FontWeight.Bold, fontSize = 15.sp)
            }

            Spacer(Modifier.height(10.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Person, contentDescription = null, tint = GoldAdmin, modifier = Modifier.size(14.dp))
                    Spacer(Modifier.width(4.dp))
                    Text(item.ownerName, color = TextMuted, fontSize = 12.sp)
                    Spacer(Modifier.width(10.dp))
                    Icon(Icons.Default.LocationOn, contentDescription = null, tint = CyanAccent, modifier = Modifier.size(14.dp))
                    Spacer(Modifier.width(2.dp))
                    Text(item.location, color = TextMuted, fontSize = 12.sp)
                }
            }

            Spacer(Modifier.height(12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(
                    onClick = onCallClick,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = CyanAccent),
                    border = ButtonDefaults.outlinedButtonBorder.copy(brush = androidx.compose.ui.graphics.SolidColor(CyanAccent))
                ) {
                    Icon(Icons.Default.Call, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Call Owner", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }

                Button(
                    onClick = onBookClick,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldGreen)
                ) {
                    Icon(Icons.Default.Agriculture, contentDescription = null, tint = Slate900, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Reserve Now", color = Slate900, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
