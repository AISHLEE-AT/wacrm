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

data class DealItem(
    val id: String,
    val titleTamil: String,
    val titleEnglish: String,
    val originalPrice: String,
    val dealPrice: String,
    val discountPercent: String,
    val sellerName: String,
    val location: String,
    val category: String,
    val icon: String
)

private val dealsList = listOf(
    DealItem("1", "இயற்கை உரம் (Organic NPK Fertilizer 50kg)", "Bio-Organic NPK Fertilizer Bag", "₹1,400", "₹950", "32% OFF", "TN Agri Bio Feeds", "Tirupattur, TN", "Agri Supplies", "🌱"),
    DealItem("2", "டிராக்டர் டயர் செட் (Apollo Farm King 13.6-28)", "Apollo Tractor Rear Tires (Pair)", "₹38,000", "₹31,500", "17% OFF", "Vellore Auto Spares", "Vellore, TN", "Vehicle Spares", "🛞"),
    DealItem("3", "சூரிய சக்தி நீர் பம்ப் (Solar Water Pump 5HP)", "5HP Submersible Solar Pump Kit", "₹1,85,000", "₹1,35,000", "27% OFF", "Tamil Nadu Solar Co", "Salem, TN", "Agri Solar", "☀️"),
    DealItem("4", "தூய நல்லெண்ணெய் 15 லிட்டர் டின்", "Pure Sesame Gingelly Oil (15L Tin)", "₹4,200", "₹3,450", "18% OFF", "Erode Oil Mills", "Erode, TN", "Wholesale Food", "🪔"),
    DealItem("5", "ஆட்டோ ரிக்க்ஷா பேட்டரி (Amaron 12V 50Ah)", "Amaron High-Duty Auto Battery", "₹5,800", "₹4,600", "20% OFF", "Ambur Battery Hub", "Ambur, TN", "Vehicle Spares", "🔋"),
    DealItem("6", "டிரோன் தெளிப்பான் (Agri Spraying Drone 10L)", "10L Crop Spraying Drone System", "₹2,50,000", "₹1,95,000", "22% OFF", "Coimbatore AeroTech", "Coimbatore, TN", "Agri Solar", "🛸")
)

private val dealCategories = listOf("All Deals", "Agri Supplies", "Vehicle Spares", "Agri Solar", "Wholesale Food")

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DealoScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    var selectedCategory by remember { mutableStateOf("All Deals") }
    var selectedDeal by remember { mutableStateOf<DealItem?>(null) }

    val filteredDeals = remember(selectedCategory) {
        if (selectedCategory == "All Deals") dealsList
        else dealsList.filter { it.category == selectedCategory }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("DealO — TN Wholesale Deals & Bulk Savings", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text("Direct Factory & Wholesale Prices • Verified Sellers", color = GoldAdmin, fontSize = 11.sp)
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
                items(dealCategories) { cat ->
                    val isSelected = cat == selectedCategory
                    FilterChip(
                        selected = isSelected,
                        onClick = { selectedCategory = cat },
                        label = { Text(cat, fontSize = 12.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = GoldAdmin,
                            selectedLabelColor = Slate900,
                            containerColor = Slate800,
                            labelColor = Color.White
                        )
                    )
                }
            }

            // Deals List
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 4.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(filteredDeals) { deal ->
                    DealCard(deal = deal, ClaimDealClick = { selectedDeal = deal })
                }
            }
        }
    }

    // Deal Modal
    selectedDeal?.let { deal ->
        AlertDialog(
            onDismissRequest = { selectedDeal = null },
            title = { Text("Claim ${deal.titleEnglish}", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp) },
            text = {
                Column {
                    Text(deal.titleTamil, color = GoldAdmin, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Spacer(Modifier.height(4.dp))
                    Text("Original Price: ${deal.originalPrice}", color = TextMuted, fontSize = 13.sp)
                    Text("Special Deal: ${deal.dealPrice} (${deal.discountPercent})", color = EmeraldGreen, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Text("Seller: ${deal.sellerName} (${deal.location})", color = TextMuted, fontSize = 12.sp)
                    Spacer(Modifier.height(10.dp))
                    Surface(shape = RoundedCornerShape(10.dp), color = Slate700) {
                        Text(
                            "🏷️ Direct Seller Contact via WhatsApp. No commissions or hidden agent charges.",
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
                        val whatsappUrl = "https://wa.me/919486335870?text=Hello%20DealO,%20I%20want%20to%20order%20${Uri.encode(deal.titleEnglish)}%20at%20${Uri.encode(deal.dealPrice)}."
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(whatsappUrl))
                        context.startActivity(intent)
                        selectedDeal = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = GoldAdmin)
                ) {
                    Text("Claim Deal on WhatsApp", color = Slate900, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { selectedDeal = null }) {
                    Text("Cancel", color = TextMuted)
                }
            }
        )
    }
}

@Composable
private fun DealCard(deal: DealItem, ClaimDealClick: () -> Unit) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = Slate800,
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, GoldAdmin.copy(alpha = 0.3f), RoundedCornerShape(16.dp))
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .background(GoldAdmin.copy(alpha = 0.15f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(deal.icon, fontSize = 22.sp)
                }
                Spacer(Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(deal.titleTamil, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Text(deal.titleEnglish, color = TextMuted, fontSize = 12.sp)
                }
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = EmeraldGreen.copy(alpha = 0.2f)
                ) {
                    Text(deal.discountPercent, color = EmeraldGreen, fontWeight = FontWeight.Bold, fontSize = 11.sp, modifier = Modifier.padding(6.dp, 2.dp))
                }
            }

            Spacer(Modifier.height(10.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Storefront, contentDescription = null, tint = GoldAdmin, modifier = Modifier.size(14.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("${deal.sellerName} • ${deal.location}", color = TextMuted, fontSize = 12.sp)
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(deal.originalPrice, color = TextMuted, fontSize = 12.sp, textDecoration = androidx.compose.ui.text.style.TextDecoration.LineThrough)
                    Spacer(Modifier.width(6.dp))
                    Text(deal.dealPrice, color = GoldAdmin, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                }
            }

            Spacer(Modifier.height(12.dp))
            Button(
                onClick = ClaimDealClick,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(containerColor = GoldAdmin)
            ) {
                Icon(Icons.Default.LocalOffer, contentDescription = null, tint = Slate900, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(6.dp))
                Text("Get Bulk Deal", color = Slate900, fontWeight = FontWeight.Bold, fontSize = 13.sp)
            }
        }
    }
}
