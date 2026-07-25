package com.fago.fagoapp.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun SplashScreen() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A)),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("FAGO", color = Color(0xFFFFD700), fontSize = 48.sp, fontWeight = FontWeight.Bold)
            Text("Super App", color = Color(0xFF00F0FF), fontSize = 18.sp)
            Spacer(Modifier.height(32.dp))
            CircularProgressIndicator(color = Color(0xFF00F0FF))
        }
    }
}
