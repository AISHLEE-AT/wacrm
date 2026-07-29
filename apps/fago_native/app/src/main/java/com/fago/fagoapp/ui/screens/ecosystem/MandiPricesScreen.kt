package com.fago.fagoapp.ui.screens.ecosystem

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fago.fagoapp.ui.theme.*

data class MandiCropItem(
    val nameTamil: String,
    val nameEnglish: String,
    val price: String,
    val unit: String,
    val trend: String, // UP, DOWN, STABLE
    val priceChange: String,
    val market: String,
    val category: String,
    val icon: String
)

private val districts = listOf("Tirupattur", "Vellore", "Salem", "Coimbatore", "Madurai", "Trichy")
private val categories = listOf("All", "Grains & Paddy", "Vegetables", "Spices", "Fruits")

private val initialCrops = listOf(
    MandiCropItem("பச்சரிசி (Paddy Raw)", "Raw Paddy Rice", "₹2,850", "Quintal", "UP", "+₹50", "Tirupattur Central Mandi", "Grains & Paddy", "🌾"),
    MandiCropItem("புழுங்கல் அரிசி (Paddy Boiled)", "Boiled Paddy Rice", "₹3,100", "Quintal", "STABLE", "₹0", "Tirupattur Central Mandi", "Grains & Paddy", "🌾"),
    MandiCropItem("தக்காளி (Tomato)", "Fresh Tomato", "₹32", "Kg", "DOWN", "-₹6", "Vellore Uzhavar Sandhai", "Vegetables", "🍅"),
    MandiCropItem("வெங்காயம் (Onion)", "Small Onion (Shallots)", "₹48", "Kg", "UP", "+₹4", "Vellore Uzhavar Sandhai", "Vegetables", "🧅"),
    MandiCropItem("மஞ்சள் (Turmeric)", "Raw Turmeric Finger", "₹12,400", "Quintal", "UP", "+₹350", "Salem Erode Spices Yard", "Spices", "🟡"),
    MandiCropItem("தென்னை (Coconut)", "Pollachi Coconut", "₹18", "Piece", "STABLE", "₹0", "Coimbatore Whole Market", "Fruits", "🥥"),
    MandiCropItem("வாழை (Banana Grand Naine)", "Grand Naine Banana", "₹220", "Comb (தார்)", "UP", "+₹15", "Trichy Central Fruit Yard", "Fruits", "🍌"),
    MandiCropItem("பச்சை மிளகாய் (Green Chilli)", "Green Chilli", "₹42", "Kg", "DOWN", "-₹3", "Tirupattur Mandi", "Vegetables", "🌶️"),
    MandiCropItem("இஞ்சி (Ginger)", "Fresh Ginger", "₹140", "Kg", "UP", "+₹10", "Vellore Market", "Spices", "🫚")
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MandiPricesScreen(onBack: () -> Unit) {
    var selectedDistrict by remember { mutableStateOf("Tirupattur") }
    var selectedCategory by remember { mutableStateOf("All") }
    var searchQuery by remember { mutableStateOf("") }

    val filteredCrops = remember(selectedCategory, searchQuery) {
        initialCrops.filter { crop ->
            (selectedCategory == "All" || crop.category == selectedCategory) &&
                    (searchQuery.isBlank() || crop.nameTamil.contains(searchQuery, ignoreCase = true) || crop.nameEnglish.contains(searchQuery, ignoreCase = true))
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Mandi — Daily TN Crop Prices", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text("Updated Live Today • Tamil Nadu Mandis", color = GoldAdmin, fontSize = 11.sp)
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
            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search crop in Tamil or English...", color = TextMuted, fontSize = 13.sp) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = TextMuted) },
                singleLine = true,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 8.dp),
                shape = RoundedCornerShape(14.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = GoldAdmin,
                    unfocusedBorderColor = Slate700,
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    focusedContainerColor = Slate800,
                    unfocusedContainerColor = Slate800
                )
            )

            // District Chips Selector
            LazyRow(
                contentPadding = PaddingValues(horizontal = 14.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(bottom = 6.dp)
            ) {
                items(districts) { district ->
                    val isSelected = district == selectedDistrict
                    FilterChip(
                        selected = isSelected,
                        onClick = { selectedDistrict = district },
                        label = { Text("📍 $district", fontSize = 12.sp, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = GoldAdmin,
                            selectedLabelColor = Slate900,
                            containerColor = Slate800,
                            labelColor = Color.White
                        )
                    )
                }
            }

            // Category Selector
            LazyRow(
                contentPadding = PaddingValues(horizontal = 14.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(bottom = 10.dp)
            ) {
                items(categories) { cat ->
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

            // Price Cards List
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(filteredCrops) { crop ->
                    CropPriceCard(crop = crop)
                }
            }
        }
    }
}

@Composable
private fun CropPriceCard(crop: MandiCropItem) {
    val trendColor = when (crop.trend) {
        "UP" -> EmeraldGreen
        "DOWN" -> Color(0xFFEF4444)
        else -> TextMuted
    }
    val trendIcon = when (crop.trend) {
        "UP" -> "▲"
        "DOWN" -> "▼"
        else -> "➔"
    }

    Surface(
        shape = RoundedCornerShape(16.dp),
        color = Slate800,
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, Slate700, RoundedCornerShape(16.dp))
    ) {
        Row(
            modifier = Modifier
                .padding(14.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .background(Slate700, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text(crop.icon, fontSize = 22.sp)
            }
            Spacer(Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(crop.nameTamil, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                Text(crop.nameEnglish, color = TextMuted, fontSize = 12.sp)
                Spacer(Modifier.height(4.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.LocationOn, contentDescription = null, tint = GoldAdmin, modifier = Modifier.size(12.dp))
                    Spacer(Modifier.width(2.dp))
                    Text(crop.market, color = TextMuted, fontSize = 10.sp)
                }
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(crop.price, color = GoldAdmin, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                Text("/ ${crop.unit}", color = TextMuted, fontSize = 11.sp)
                Spacer(Modifier.height(4.dp))
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = trendColor.copy(alpha = 0.15f)
                ) {
                    Text(
                        "$trendIcon ${crop.priceChange}",
                        color = trendColor,
                        fontWeight = FontWeight.Bold,
                        fontSize = 10.sp,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }
        }
    }
}
