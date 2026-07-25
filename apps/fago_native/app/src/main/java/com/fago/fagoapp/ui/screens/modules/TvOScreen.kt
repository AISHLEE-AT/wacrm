package com.fago.fagoapp.ui.screens.modules

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.PlayCircle
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

data class TvVideo(val title: String, val channel: String, val views: String, val duration: String)

/**
 * TvO — Farming News, Weather Alerts & Agri TV Video Streaming.
 * Parity with Flutter's tvo_screen.dart.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TvOScreen(onBack: () -> Unit) {
    val videos = listOf(
        TvVideo("Tamil Nadu Monsoon & Monsoon Crop Advisory 2026", "TNAU Agri Bulletin", "42K views", "14:20"),
        TvVideo("Modern Organic Farming Success Story: 10 Acres Income", "Pasumai Vikatan", "125K views", "18:45"),
        TvVideo("Government Subsidy Schemes for Solar Pump & Drip 2026", "Agri Dept News", "88K views", "09:30"),
        TvVideo("Latest Coconut & Copra Price Trend Analysis", "Mandi Expert TV", "65K views", "11:15")
    )

    Scaffold(
        containerColor = Color(0xFF0F172A),
        topBar = {
            TopAppBar(
                title = { Text("📺 TvO — Farming TV & Video News", color = Color(0xFFF43F5E), fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF1E293B)),
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color(0xFFF43F5E))
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding).fillMaxSize().padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(videos) { v ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.PlayCircle, contentDescription = null, tint = Color(0xFFF43F5E), modifier = Modifier.size(44.dp))
                        Spacer(Modifier.width(16.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(v.title, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                            Spacer(Modifier.height(4.dp))
                            Text("${v.channel} • ${v.views} • ${v.duration}", color = Color.Gray, fontSize = 12.sp)
                        }
                    }
                }
            }
        }
    }
}
