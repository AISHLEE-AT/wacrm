package com.fago.fagoapp.ui.screens.modules

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.School
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

data class CourseItem(val title: String, val author: String, val duration: String, val free: Boolean)

/**
 * TeachO — Farming Courses & Agri Education.
 * Parity with Flutter's teacho_screen.dart.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TeachOScreen(onBack: () -> Unit) {
    val courses = listOf(
        CourseItem("Organic Farming Masterclass", "Dr. Nammalvar Academy", "12 Lessons", true),
        CourseItem("Drip Irrigation System Design", "TNAU Faculty", "8 Lessons", true),
        CourseItem("Natural Pest Control & Panchagavya", "Organic Certified Expert", "6 Lessons", true),
        CourseItem("High-Yield Coconut Plantation", "Coconut Research Station", "10 Lessons", false),
        CourseItem("Agri Business & Export Marketing", "APEDA Trainer", "15 Lessons", false)
    )

    Scaffold(
        containerColor = Color(0xFF0F172A),
        topBar = {
            TopAppBar(
                title = { Text("🎓 TeachO — Agri Courses", color = Color(0xFF00F0FF), fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF1E293B)),
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color(0xFF00F0FF))
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding).fillMaxSize().padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(courses) { c ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.School, contentDescription = null, tint = Color(0xFF00F0FF), modifier = Modifier.size(36.dp))
                        Spacer(Modifier.width(16.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(c.title, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                            Text("Instructor: ${c.author} • ${c.duration}", color = Color.Gray, fontSize = 12.sp)
                        }
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = if (c.free) Color(0xFF00FF00).copy(alpha = 0.15f) else Color(0xFFFFD700).copy(alpha = 0.15f)
                        ) {
                            Text(
                                if (c.free) "FREE" else "PRO",
                                color = if (c.free) Color(0xFF00FF00) else Color(0xFFFFD700),
                                fontWeight = FontWeight.Bold,
                                fontSize = 11.sp,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}
