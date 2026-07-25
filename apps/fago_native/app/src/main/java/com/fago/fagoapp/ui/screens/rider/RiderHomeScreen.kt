package com.fago.fagoapp.ui.screens.rider

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
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
import com.fago.fagoapp.auth.AuthUiState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RiderHomeScreen(
    authState: AuthUiState,
    onNavigateProfile: () -> Unit,
    onSignOut: () -> Unit
) {
    Scaffold(
        containerColor = Color(0xFF0F172A),
        topBar = {
            TopAppBar(
                title = { Text("🚲 RideO — FAGO Rider", color = Color(0xFF00F0FF), fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF1E293B)),
                actions = {
                    IconButton(onClick = onNavigateProfile) {
                        Icon(Icons.Default.Person, contentDescription = "Profile", tint = Color(0xFF00F0FF))
                    }
                    IconButton(onClick = onSignOut) {
                        Icon(Icons.Default.Logout, contentDescription = "Sign Out", tint = Color.White)
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(20.dp))

            // Booking card
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text("Where to?", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(12.dp))
                    OutlinedTextField(
                        value = "",
                        onValueChange = {},
                        placeholder = { Text("Enter Pickup Location", color = Color.Gray) },
                        leadingIcon = { Icon(Icons.Default.MyLocation, contentDescription = null, tint = Color(0xFF00F0FF)) },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF00F0FF),
                            unfocusedBorderColor = Color(0xFF334155),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        )
                    )
                    Spacer(Modifier.height(8.dp))
                    OutlinedTextField(
                        value = "",
                        onValueChange = {},
                        placeholder = { Text("Enter Destination", color = Color.Gray) },
                        leadingIcon = { Icon(Icons.Default.LocationOn, contentDescription = null, tint = Color(0xFFFFD700)) },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFFFFD700),
                            unfocusedBorderColor = Color(0xFF334155),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        )
                    )
                    Spacer(Modifier.height(16.dp))
                    Button(
                        onClick = {},
                        modifier = Modifier.fillMaxWidth().height(48.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00F0FF)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Search Rides", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    }
                }
            }
        }
    }
}
