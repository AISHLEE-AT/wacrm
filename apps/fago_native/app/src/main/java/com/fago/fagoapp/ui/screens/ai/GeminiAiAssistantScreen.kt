package com.fago.fagoapp.ui.screens.ai

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
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
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

/**
 * GeminiAiAssistantScreen — 100% parity with Flutter's gemini_ai_assistant_screen.dart.
 * Features:
 *   - Google Gemini API Key saved in SharedPreferences
 *   - Auto-Get Key button opening Google AI Studio (https://aistudio.google.com/app/apikey)
 *   - Mode Selector Chips: Agri Doctor (🌾), Exam Tutor (📚), Business Assistant (🏢)
 *   - Multi-model fallback calling gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash-latest, gemini-1.5-pro-latest
 *   - Full Tamil & English responses formatted in selectable card
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GeminiAiAssistantScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val prefs = remember { context.getSharedPreferences("fago_prefs", Context.MODE_PRIVATE) }

    var apiKey by remember { mutableStateOf(prefs.getString("user_gemini_api_key", "") ?: "") }
    var inputKey by remember { mutableStateOf(apiKey) }
    var isConnected by remember { mutableStateOf(apiKey.isNotEmpty()) }

    var selectedMode by remember { mutableStateOf("Agri") } // Agri, Tutor, Business
    var prompt by remember { mutableStateOf("") }
    var isGenerating by remember { mutableStateOf(false) }
    var aiResponse by remember { mutableStateOf("") }
    var statusNote by remember { mutableStateOf("") }

    fun askGemini() {
        val query = prompt.trim()
        if (query.isEmpty()) { statusNote = "தயவுசெய்து உங்கள் கேள்வியை எழுதவும்"; return }
        if (apiKey.isEmpty()) { statusNote = "தயவுசெய்து Gemini API Key-ஐ இணைக்கவும்"; return }

        isGenerating = true
        statusNote = ""
        aiResponse = ""

        val systemInstruction = when (selectedMode) {
            "Agri" -> "You are FAGO Agri AI Doctor in Tamil Nadu. Answer in clear, helpful Tamil with organic farming advice, pest control remedies, and mandi tips for farmers."
            "Tutor" -> "You are TeachO AI Exam Tutor in Tamil Nadu. Answer TNPSC, TN Board 11th/12th, and competitive exam questions step-by-step in Tamil & English with detailed explanations."
            else -> "You are FAGO Business AI Assistant. Help write polite WhatsApp messages, driver route advice, and business communications in Tamil & English."
        }

        val fullPrompt = "$systemInstruction\n\nUser Question: $query"
        val models = listOf("gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro-latest")

        scope.launch(Dispatchers.IO) {
            var successText = ""
            var lastErr = ""

            for (model in models) {
                try {
                    val url = URL("https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=$apiKey")
                    val conn = url.openConnection() as HttpURLConnection
                    conn.requestMethod = "POST"
                    conn.setRequestProperty("Content-Type", "application/json")
                    conn.doOutput = true
                    conn.connectTimeout = 6000
                    conn.readTimeout = 6000

                    val body = JSONObject().apply {
                        put("contents", JSONArray().apply {
                            put(JSONObject().apply {
                                put("parts", JSONArray().apply {
                                    put(JSONObject().apply { put("text", fullPrompt) })
                                })
                            })
                        })
                    }

                    conn.outputStream.use { os -> os.write(body.toString().toByteArray()) }

                    if (conn.responseCode == 200) {
                        val respText = conn.inputStream.bufferedReader().readText()
                        val resJson = JSONObject(respText)
                        val candidates = resJson.optJSONArray("candidates")
                        if (candidates != null && candidates.length() > 0) {
                            val text = candidates.getJSONObject(0)
                                .optJSONObject("content")
                                ?.optJSONArray("parts")
                                ?.optJSONObject(0)
                                ?.optString("text") ?: ""
                            if (text.isNotEmpty()) {
                                successText = text
                                break
                            }
                        }
                    } else {
                        val errText = conn.errorStream?.bufferedReader()?.readText() ?: "HTTP ${conn.responseCode}"
                        lastErr = errText
                    }
                } catch (e: Exception) {
                    lastErr = e.message ?: e.toString()
                }
            }

            withContext(Dispatchers.Main) {
                isGenerating = false
                if (successText.isNotEmpty()) {
                    aiResponse = successText
                } else {
                    aiResponse = "❌ API Error: $lastErr\n\nCheck your Gemini API Key or try again."
                }
            }
        }
    }

    Scaffold(
        containerColor = Color(0xFF0F172A),
        topBar = {
            TopAppBar(
                title = { Text("🤖 FAGO Gemini AI உதவி மையம்", color = Color(0xFFFFD700), fontWeight = FontWeight.Bold, fontSize = 16.sp) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF1E293B)),
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color(0xFFFFD700))
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
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Status Banner
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = if (isConnected) Color(0xFF059669) else Color(0xFFD97706),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(if (isConnected) "🤖" else "🔑", fontSize = 32.sp)
                        Spacer(Modifier.width(12.dp))
                        Column {
                            Text(
                                if (isConnected) "Google Gemini AI Connected" else "Connect Free Google Gemini AI",
                                color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp
                            )
                            Text(
                                if (isConnected) "Gemini 1.5 Flash Active • 100% Free Unlimited Usage"
                                else "Get free API key in 1-tap from Google AI Studio",
                                color = Color.White.copy(alpha = 0.7f), fontSize = 12.sp
                            )
                        }
                    }
                    Spacer(Modifier.height(12.dp))
                    Button(
                        onClick = {
                            val uri = Uri.parse("https://aistudio.google.com/app/apikey")
                            context.startActivity(Intent(Intent.ACTION_VIEW, uri))
                        },
                        modifier = Modifier.fillMaxWidth().height(42.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color.Black),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.OpenInNew, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("Auto-Get Key (Google AI Studio)", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
            }

            // API Key Input
            if (!isConnected) {
                OutlinedTextField(
                    value = inputKey,
                    onValueChange = { inputKey = it },
                    label = { Text("Paste Google Gemini API Key (AIzaSy...)", color = Color(0xFF00FF00)) },
                    leadingIcon = { Icon(Icons.Default.Key, contentDescription = null, tint = Color(0xFF00FF00)) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Color(0xFF00FF00), unfocusedBorderColor = Color(0xFF334155), focusedTextColor = Color.White, unfocusedTextColor = Color.White)
                )
                Button(
                    onClick = {
                        if (inputKey.trim().isNotEmpty()) {
                            prefs.edit().putString("user_gemini_api_key", inputKey.trim()).apply()
                            apiKey = inputKey.trim()
                            isConnected = true
                        }
                    },
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00FF00)),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Save & Connect Gemini AI", color = Color.Black, fontWeight = FontWeight.Bold)
                }
            }

            // Mode Selector Chips
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf(
                    Triple("Agri", "🌾 பயிர் மருத்துவர்", Color(0xFF00FF00)),
                    Triple("Tutor", "📚 AI ஆசான்", Color(0xFFA855F7)),
                    Triple("Business", "🏢 Business AI", Color(0xFFFFD700))
                ).forEach { (modeKey, label, color) ->
                    val isSel = selectedMode == modeKey
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = if (isSel) color else Color(0xFF1E293B),
                        modifier = Modifier.weight(1f).clickable { selectedMode = modeKey }
                    ) {
                        Box(contentAlignment = Alignment.Center, modifier = Modifier.padding(vertical = 10.dp)) {
                            Text(label, color = if (isSel) Color.Black else Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                        }
                    }
                }
            }

            // Prompt Input
            OutlinedTextField(
                value = prompt,
                onValueChange = { prompt = it },
                label = {
                    Text(
                        if (selectedMode == "Agri") "கேள்வி கேளுங்கள் (எ.கா: தக்காளி இலையில் மஞ்சள் புள்ளி வந்தால் என்ன செய்வது?)"
                        else "கேள்வி கேளுங்கள் (எ.கா: TNPSC குரூப் 4 தேர்வுக்கான தமிழ் இலக்கணக் குறிப்புகள்)",
                        color = Color.Gray, fontSize = 11.sp
                    )
                },
                minLines = 3,
                maxLines = 5,
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Color(0xFFFFD700), unfocusedBorderColor = Color(0xFF334155), focusedTextColor = Color.White, unfocusedTextColor = Color.White)
            )

            if (statusNote.isNotEmpty()) {
                Text(statusNote, color = Color(0xFFF43F5E), fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }

            // Ask Button
            Button(
                onClick = { askGemini() },
                modifier = Modifier.fillMaxWidth().height(52.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFD700)),
                shape = RoundedCornerShape(14.dp),
                enabled = !isGenerating
            ) {
                if (isGenerating) {
                    CircularProgressIndicator(color = Color.Black, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                    Spacer(Modifier.width(8.dp))
                    Text("AI சிந்தித்துக் கொண்டிருக்கிறது...", color = Color.Black, fontWeight = FontWeight.Bold)
                } else {
                    Icon(Icons.Default.Send, contentDescription = null, tint = Color.Black)
                    Spacer(Modifier.width(8.dp))
                    Text("Gemini AI-யிடம் கேளுங்கள்", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                }
            }

            // Response Box
            if (aiResponse.isNotEmpty()) {
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Color(0xFF1E293B),
                    modifier = Modifier.fillMaxWidth().border(1.dp, Color(0xFF00FF00).copy(alpha = 0.4f), RoundedCornerShape(16.dp))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Color(0xFFFFD700), modifier = Modifier.size(20.dp))
                            Spacer(Modifier.width(8.dp))
                            Text("Gemini AI பதில் (Response):", color = Color(0xFFFFD700), fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        }
                        HorizontalDivider(color = Color(0xFF334155), modifier = Modifier.padding(vertical = 12.dp))
                        SelectionContainer {
                            Text(aiResponse, color = Color.White, fontSize = 13.sp, lineHeight = 20.sp)
                        }
                    }
                }
            }
        }
    }
}
