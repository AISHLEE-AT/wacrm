package com.fago.fagoapp.ui.screens.modules

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Biotech
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

data class LabTestItem(val name: String, val description: String, val price: Int, val turnaround: String)

/**
 * TestO — Soil, Water & Crop Lab Testing Requests.
 * Parity with Flutter's testo_screen.dart.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TestOScreen(onBack: () -> Unit) {
    val tests = listOf(
        LabTestItem("Full NPK & Micronutrient Soil Test", "Tests pH, Nitrogen, Phosphorus, Potassium, Zinc, Iron", 450, "48 hours"),
        LabTestItem("Irrigation Water Quality Test", "Tests Salinity, EC, TDS, Hardness & Sodium Adsorption Ratio", 350, "24 hours"),
        LabTestItem("Plant Tissue & Leaf Analysis", "Identifies nutrient deficiencies directly from leaf samples", 600, "72 hours"),
        LabTestItem("Organic Fertilizer Quality Test", "Verifies NPK & Carbon ratio in compost & vermicompost", 500, "48 hours")
    )

    var selectedTest by remember { mutableStateOf<String?>(null) }

    Scaffold(
        containerColor = Color(0xFF0F172A),
        topBar = {
            TopAppBar(
                title = { Text("🧪 TestO — Soil & Water Lab Testing", color = Color(0xFF7C3AED), fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF1E293B)),
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color(0xFF7C3AED))
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding).fillMaxSize().padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(tests) { t ->
                val isSelected = selectedTest == t.name
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Biotech, contentDescription = null, tint = Color(0xFF7C3AED), modifier = Modifier.size(32.dp))
                            Spacer(Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(t.name, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                                Text("Result in: ${t.turnaround}", color = Color.Gray, fontSize = 11.sp)
                            }
                        }
                        Spacer(Modifier.height(8.dp))
                        Text(t.description, color = Color.White.copy(alpha = 0.7f), fontSize = 12.sp)
                        Spacer(Modifier.height(12.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("₹${t.price}", color = Color(0xFFFFD700), fontWeight = FontWeight.Bold, fontSize = 20.sp)
                            Button(
                                onClick = { selectedTest = if (isSelected) null else t.name },
                                colors = ButtonDefaults.buttonColors(containerColor = if (isSelected) Color(0xFF00FF00) else Color(0xFF7C3AED)),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Text(if (isSelected) "✅ Sample Scheduled" else "Book Lab Test", color = Color.White, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}
