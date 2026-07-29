package com.fago.fagoapp.ui.screens.ecosystem

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

data class VideoChannel(
    val name: String,
    val tamilName: String,
    val category: String,
    val subscribers: String,
    val latestVideo: String,
    val youtubeHandle: String,
    val isLive: Boolean = false
)

private val channels = listOf(
    VideoChannel("Sun News Tamil", "சன் நியூஸ்", "News", "12M+", "Live: TN Politics Today", "sunnewstamil", isLive = true),
    VideoChannel("Puthiya Thalaimurai", "புதிய தலைமுறை", "News", "8M+", "Breaking: Vellore District Flood Update", "puthiyathalaimurai"),
    VideoChannel("TNPSC Expert", "TNPSC நிபுணர்", "Education", "2.5M+", "Group 4 History — Complete 2025 Edition", "tnpscexpert"),
    VideoChannel("Tamil Comedy Factory", "தமிழ் நகைச்சுவை", "Entertainment", "5M+", "New Skit: Village Auto Driver Life", "tamilcomedyfactory"),
    VideoChannel("Farming Tamil Nadu", "தமிழ்நாடு விவசாயம்", "Agriculture", "1.2M+", "Paddy Cultivation Tips — Oct-Nov Season", "farmingtamilnadu"),
    VideoChannel("Cooking Tamil Style", "தமிழ் சமையல்", "Cooking", "3M+", "Briyani Recipe for 50 People — Wedding Style", "cookingtamilstyle"),
    VideoChannel("Tamil Nadu Tourism Vlogs", "சுற்றுலா வீடியோக்கள்", "Tourism", "800K+", "Vellore Fort & Golden Temple Tour 2025", "tntourismvlogs"),
    VideoChannel("Carnatic Music Academy", "கர்நாடக இசை", "Music", "600K+", "Beginner Veena Lesson — Sarali Varisai", "carnaticmusicacademy"),
    VideoChannel("Auto Driver Stories", "ஆட்டோ டிரைவர் கதைகள்", "Lifestyle", "1.5M+", "Zero Commission Apps — AISHO Review", "autodriverstories"),
    VideoChannel("Village Life Tamil", "கிராமத்து வாழ்க்கை", "Lifestyle", "4M+", "One Day in Tirupattur Village — Morning Routine", "villagelifetamil")
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TvoScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    var searchQuery by remember { mutableStateOf("") }
    var selectedFilter by remember { mutableStateOf("All") }
    val filters = listOf("All", "Live", "News", "Education", "Agriculture", "Entertainment")

    val filteredChannels = channels.filter { ch ->
        val q = searchQuery.lowercase()
        (ch.name.lowercase().contains(q) || ch.tamilName.contains(q) || ch.category.lowercase().contains(q)) &&
        when (selectedFilter) {
            "Live" -> ch.isLive
            "News" -> ch.category == "News"
            "Education" -> ch.category == "Education"
            "Agriculture" -> ch.category == "Agriculture"
            "Entertainment" -> ch.category == "Entertainment" || ch.category == "Cooking" || ch.category == "Lifestyle"
            else -> true
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("TvO — Tamil Media Hub", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text("Live News, Education & Entertainment", color = RoseError, fontSize = 11.sp)
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
            // Live badge banner
            Surface(color = Slate800) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(10.dp)
                                .background(RoseError, androidx.compose.foundation.shape.CircleShape)
                        )
                        Spacer(Modifier.width(6.dp))
                        Text("${channels.count { it.isLive }} Channel Live Now", color = RoseError, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    }
                    Text("${channels.size} Tamil Channels", color = TextMuted, fontSize = 12.sp)
                }
            }

            Column(modifier = Modifier.padding(horizontal = 12.dp)) {
                Spacer(Modifier.height(12.dp))

                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Search channel or show...", color = TextMuted, fontSize = 12.sp) },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = RoseError) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = RoseError,
                        unfocusedBorderColor = Slate700,
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    )
                )

                Spacer(Modifier.height(10.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    filters.forEach { f ->
                        FilterChip(
                            selected = selectedFilter == f,
                            onClick = { selectedFilter = f },
                            label = { Text(f, fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = RoseError,
                                selectedLabelColor = Color.White,
                                containerColor = Slate800,
                                labelColor = TextMuted
                            )
                        )
                    }
                }

                Spacer(Modifier.height(12.dp))
            }

            LazyColumn(
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(filteredChannels) { channel ->
                    ChannelTile(
                        channel = channel,
                        onWatch = {
                            val url = "https://www.youtube.com/@${channel.youtubeHandle}"
                            context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                        }
                    )
                }
                item { Spacer(Modifier.height(12.dp)) }
            }
        }
    }
}

@Composable
private fun ChannelTile(channel: VideoChannel, onWatch: () -> Unit) {
    val catColor = when (channel.category) {
        "News" -> RoseError
        "Education" -> PurpleVariant
        "Agriculture" -> EmeraldGreen
        "Music" -> GoldAdmin
        "Cooking" -> OrangeDriver
        "Tourism" -> CyanAccent
        else -> TextMuted
    }

    Surface(
        shape = RoundedCornerShape(14.dp),
        color = Slate800,
        modifier = Modifier
            .fillMaxWidth()
            .border(
                1.dp,
                if (channel.isLive) RoseError.copy(alpha = 0.6f) else Slate700,
                RoundedCornerShape(14.dp)
            )
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(52.dp)
                        .background(catColor.copy(alpha = 0.15f), RoundedCornerShape(12.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.Tv, contentDescription = null, tint = catColor, modifier = Modifier.size(28.dp))
                }
                Spacer(Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(channel.name, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                        if (channel.isLive) {
                            Spacer(Modifier.width(6.dp))
                            Surface(shape = RoundedCornerShape(4.dp), color = RoseError) {
                                Text("● LIVE", color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(6.dp, 2.dp))
                            }
                        }
                    }
                    Text(channel.tamilName, color = TextMuted, fontSize = 12.sp)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(shape = RoundedCornerShape(6.dp), color = catColor.copy(alpha = 0.2f)) {
                            Text(channel.category, color = catColor, fontSize = 10.sp, modifier = Modifier.padding(6.dp, 2.dp))
                        }
                        Text("  •  ${channel.subscribers} subscribers", color = TextMuted, fontSize = 11.sp)
                    }
                }
            }

            Spacer(Modifier.height(10.dp))

            Surface(
                shape = RoundedCornerShape(10.dp),
                color = Slate900,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.PlayArrow, contentDescription = null, tint = RoseError, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(6.dp))
                    Text(channel.latestVideo, color = Color(0xFFCBD5E1), fontSize = 12.sp, modifier = Modifier.weight(1f), maxLines = 2)
                }
            }

            Spacer(Modifier.height(10.dp))

            Button(
                onClick = onWatch,
                colors = ButtonDefaults.buttonColors(containerColor = RoseError),
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp)
            ) {
                Icon(Icons.Default.PlayCircle, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(6.dp))
                Text("Watch on YouTube", color = Color.White, fontWeight = FontWeight.Bold)
            }
        }
    }
}
