package com.fago.fagoapp.ui.screens.ecosystem

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fago.fagoapp.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

data class ChatMessage(
    val id: String,
    val text: String,
    val isUser: Boolean,
    val timestamp: String = ""
)

private val suggestionPrompts = listOf(
    "🚗 Book an Auto Rikshaw to Vellore",
    "🌾 Today's rice price in Tirupattur Mandi",
    "🏛️ Temples near me in Tamil Nadu",
    "📚 TNPSC Group 4 preparation tips",
    "🚜 Tractor rental for harvest season",
    "💰 How to become an AISHO Driver Partner?"
)

private val aiResponses = mapOf(
    "book" to "I'll help you book an Auto Rikshaw! 🚗\n\nPlease go to the main screen and enter your destination. Available drivers in your area will be notified instantly. Our 0% commission model ensures drivers get the full fare directly to their UPI.",
    "rice" to "🌾 **Today's Mandi Prices (Tirupattur)**\n\n• Raw Rice (Pacha Arisi): ₹2,850/quintal\n• Boiled Rice (Puzhungal Arisi): ₹3,100/quintal\n• Parboiled Premium: ₹3,400/quintal\n\nPrices updated as of this morning. Visit the Mandi screen for full commodity list.",
    "temple" to "🏛️ **Top Temples Near Vellore / Tirupattur**\n\n1. Vellore Golden Temple (Sripuram) — 8km\n2. Jalagandeeswarar Temple — 2km\n3. Murugan Temple, Tirupattur — 5km\n4. Arunachaleswarar Temple, Tiruvannamalai — 45km\n\nWant me to book a cab to any of these?",
    "tnpsc" to "📚 **TNPSC Group 4 Study Plan**\n\nKey subjects:\n• General Tamil — 150 marks (most important!)\n• General Knowledge — 75 marks\n• Aptitude & Mental Ability — 75 marks\n\nDaily target: 2 hours study, 50 MCQ practice.\nVisit the TeachO screen for mock tests and study materials!",
    "tractor" to "🚜 **Tractor & Machinery Rental**\n\nAvailable in your area:\n• Mahindra 575 DI — ₹1,200/day\n• John Deere 5050 — ₹1,800/day\n• Mini Harvester — ₹2,500/day\n\nVisit the RentO screen to book directly with verified operators. Advance booking available!",
    "driver" to "💰 **Become an AISHO Driver Partner**\n\n✅ 0% Commission — Keep 100% of fare\n✅ Direct UPI settlement to your account\n✅ Work your own hours\n✅ Area Admin support in every pincode\n\nRequirements:\n• Valid driving license\n• Vehicle registration\n• Aadhaar + PAN card\n\nContact Admin at +91 94863 35870 to get started!",
    "default" to "நமஸ்காரம்! 🙏 I'm your AISHO AI Assistant.\n\nI can help you with:\n• 🚗 Ride booking & driver info\n• 🌾 Mandi crop prices\n• 🏛️ Tourism places in Tamil Nadu\n• 📚 Education & exam prep\n• 🚜 Equipment rental\n• 💬 Any AISHO service query\n\nType your question in Tamil or English!"
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GeminiAiAssistantScreen(onBack: () -> Unit) {
    val scope = rememberCoroutineScope()
    val listState = rememberLazyListState()

    var messages by remember {
        mutableStateOf(
            listOf(
                ChatMessage(
                    id = "0",
                    text = "நமஸ்காரம்! 🙏 I'm AISHO AI — your Tamil Nadu Rural Services Assistant.\n\nAsk me anything about rides, crop prices, tourism, education, or equipment rental. I speak Tamil & English!",
                    isUser = false
                )
            )
        )
    }
    var inputText by remember { mutableStateOf("") }
    var isThinking by remember { mutableStateOf(false) }
    var showSuggestions by remember { mutableStateOf(true) }

    fun sendMessage(text: String) {
        if (text.isBlank()) return
        val userMsg = ChatMessage(id = System.currentTimeMillis().toString(), text = text, isUser = true)
        messages = messages + userMsg
        inputText = ""
        isThinking = true
        showSuggestions = false

        scope.launch {
            delay(800L + (300L * (text.length / 10)))
            val lower = text.lowercase()
            val responseText = when {
                lower.contains("book") || lower.contains("ride") || lower.contains("auto") || lower.contains("cab") -> aiResponses["book"]!!
                lower.contains("rice") || lower.contains("price") || lower.contains("mandi") || lower.contains("crop") -> aiResponses["rice"]!!
                lower.contains("temple") || lower.contains("tour") || lower.contains("travel") || lower.contains("visit") -> aiResponses["temple"]!!
                lower.contains("tnpsc") || lower.contains("exam") || lower.contains("study") || lower.contains("teach") -> aiResponses["tnpsc"]!!
                lower.contains("tractor") || lower.contains("rent") || lower.contains("machine") || lower.contains("harvest") -> aiResponses["tractor"]!!
                lower.contains("driver") || lower.contains("partner") || lower.contains("commission") || lower.contains("join") -> aiResponses["driver"]!!
                else -> aiResponses["default"]!!
            }
            val aiMsg = ChatMessage(id = (System.currentTimeMillis() + 1).toString(), text = responseText, isUser = false)
            messages = messages + aiMsg
            isThinking = false
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(34.dp)
                                .background(
                                    Brush.radialGradient(listOf(CyanAccent, PurpleVariant)),
                                    CircleShape
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Color.White, modifier = Modifier.size(20.dp))
                        }
                        Spacer(Modifier.width(10.dp))
                        Column {
                            Text("AISHO AI Assistant", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            Text("Tamil & English • Always Online", color = CyanAccent, fontSize = 11.sp)
                        }
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
            // Chat messages list
            LazyColumn(
                state = listState,
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
                contentPadding = PaddingValues(vertical = 12.dp)
            ) {
                items(messages, key = { it.id }) { msg ->
                    ChatBubble(msg)
                }

                if (isThinking) {
                    item {
                        ThinkingBubble()
                    }
                }

                if (showSuggestions && messages.size == 1) {
                    item {
                        SuggestionChips(onSuggestionClick = { sendMessage(it) })
                    }
                }
            }

            // Input area
            Surface(
                color = Slate800,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .padding(horizontal = 12.dp, vertical = 10.dp)
                        .fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = inputText,
                        onValueChange = { inputText = it },
                        placeholder = { Text("Ask in Tamil or English...", color = TextMuted, fontSize = 13.sp) },
                        singleLine = false,
                        maxLines = 3,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(20.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = CyanAccent,
                            unfocusedBorderColor = Slate700,
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedContainerColor = Slate900,
                            unfocusedContainerColor = Slate900
                        ),
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                        keyboardActions = KeyboardActions(onSend = { sendMessage(inputText) })
                    )
                    Spacer(Modifier.width(8.dp))
                    FloatingActionButton(
                        onClick = { sendMessage(inputText) },
                        containerColor = if (inputText.isNotBlank()) CyanAccent else Slate700,
                        contentColor = if (inputText.isNotBlank()) Slate900 else TextMuted,
                        modifier = Modifier.size(48.dp),
                        elevation = FloatingActionButtonDefaults.elevation(0.dp)
                    ) {
                        Icon(Icons.Default.Send, contentDescription = "Send", modifier = Modifier.size(22.dp))
                    }
                }
            }
        }
    }
}

@Composable
private fun ChatBubble(msg: ChatMessage) {
    val isUser = msg.isUser
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start
    ) {
        if (!isUser) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .background(
                        Brush.radialGradient(listOf(CyanAccent.copy(0.8f), PurpleVariant.copy(0.8f))),
                        CircleShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
            }
            Spacer(Modifier.width(8.dp))
        }

        Surface(
            shape = RoundedCornerShape(
                topStart = if (isUser) 18.dp else 4.dp,
                topEnd = if (isUser) 4.dp else 18.dp,
                bottomStart = 18.dp,
                bottomEnd = 18.dp
            ),
            color = if (isUser) CyanAccent.copy(alpha = 0.85f) else Slate800,
            modifier = Modifier.widthIn(max = 300.dp)
        ) {
            Text(
                text = msg.text,
                color = if (isUser) Slate900 else Color.White,
                fontSize = 14.sp,
                lineHeight = 21.sp,
                modifier = Modifier.padding(12.dp, 10.dp)
            )
        }

        if (isUser) {
            Spacer(Modifier.width(8.dp))
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .background(CyanAccent.copy(alpha = 0.2f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.Person, contentDescription = null, tint = CyanAccent, modifier = Modifier.size(18.dp))
            }
        }
    }
}

@Composable
private fun ThinkingBubble() {
    var dots by remember { mutableStateOf("•") }
    LaunchedEffect(Unit) {
        while (true) {
            delay(400)
            dots = when (dots) {
                "•" -> "••"
                "••" -> "•••"
                else -> "•"
            }
        }
    }
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Start) {
        Box(
            modifier = Modifier
                .size(32.dp)
                .background(Brush.radialGradient(listOf(CyanAccent.copy(0.6f), PurpleVariant.copy(0.6f))), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
        }
        Spacer(Modifier.width(8.dp))
        Surface(
            shape = RoundedCornerShape(topStart = 4.dp, topEnd = 18.dp, bottomStart = 18.dp, bottomEnd = 18.dp),
            color = Slate800
        ) {
            Text(dots, color = CyanAccent, fontSize = 20.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(16.dp, 10.dp))
        }
    }
}

@Composable
private fun SuggestionChips(onSuggestionClick: (String) -> Unit) {
    Column {
        Text("Quick questions:", color = TextMuted, fontSize = 12.sp, modifier = Modifier.padding(bottom = 8.dp))
        suggestionPrompts.forEach { prompt ->
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = Slate800,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 3.dp)
                    .border(1.dp, CyanAccent.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
            ) {
                TextButton(
                    onClick = { onSuggestionClick(prompt) },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(prompt, color = Color.White, fontSize = 13.sp, modifier = Modifier.fillMaxWidth())
                }
            }
        }
    }
}
