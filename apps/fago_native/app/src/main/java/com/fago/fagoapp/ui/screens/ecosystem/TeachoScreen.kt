package com.fago.fagoapp.ui.screens.ecosystem

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fago.fagoapp.ui.theme.*

data class CourseItem(
    val title: String,
    val tamilTitle: String,
    val subject: String,
    val level: String,
    val totalLessons: Int,
    val durationMins: Int,
    val isFree: Boolean
)

private val courses = listOf(
    CourseItem("TNPSC Group 4 — Full Course", "TNPSC குரூப் 4 — முழு பாடம்", "General Studies", "Beginner", 120, 40, true),
    CourseItem("Tamil Grammar Mastery", "தமிழ் இலக்கணம்", "Language", "All Levels", 80, 30, true),
    CourseItem("RRB NTPC — Math Speed Tricks", "RRB கணக்கு வேக தந்திரங்கள்", "Mathematics", "Intermediate", 60, 35, true),
    CourseItem("Bank PO Exam Prep 2025", "வங்கி தேர்வு தயாரிப்பு", "Banking", "Advanced", 90, 45, false),
    CourseItem("Class 10 Maths (State Board)", "பத்தாம் வகுப்பு கணக்கு", "School", "10th Grade", 100, 25, true),
    CourseItem("Class 12 Physics & Chemistry", "பன்னிரண்டாம் வகுப்பு அறிவியல்", "School", "12th Grade", 150, 30, true),
    CourseItem("Computer Basics & MS Office", "கணினி அடிப்படை & MS Office", "IT Skills", "Beginner", 40, 20, true),
    CourseItem("Driving License Theory Test", "வாகன ஓட்டுநர் கோட்பாடு தேர்வு", "Driving", "All Levels", 20, 15, true),
    CourseItem("English Spoken Course (Tamil Medium)", "ஆங்கிலம் பேசுவது எப்படி", "Language", "Beginner", 50, 25, true),
    CourseItem("NEET Biology — Tamil Medium", "NEET உயிரியல் (தமிழ் வழி)", "Medical", "12th+", 200, 40, false)
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TeachoScreen(onBack: () -> Unit) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedFilter by remember { mutableStateOf("All") }
    val filters = listOf("All", "Free", "TNPSC", "School", "Language", "IT Skills")

    val filteredCourses = courses.filter { c ->
        val q = searchQuery.lowercase()
        (c.title.lowercase().contains(q) || c.tamilTitle.contains(q) || c.subject.lowercase().contains(q)) &&
        when (selectedFilter) {
            "Free" -> c.isFree
            "TNPSC" -> c.title.contains("TNPSC") || c.title.contains("RRB") || c.title.contains("Bank")
            "School" -> c.level.contains("Grade") || c.level.contains("10th") || c.level.contains("12th")
            "Language" -> c.subject == "Language"
            "IT Skills" -> c.subject == "IT Skills"
            else -> true
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("TeachO — Learning Hub", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text("Tamil Medium • Free Courses for TN Students", color = PurpleVariant, fontSize = 11.sp)
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
            // Hero stats
            Surface(color = Slate800) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    TeachoStat("${courses.count { it.isFree }}", "Free Courses", PurpleVariant)
                    TeachoStat("${courses.size}", "Total Courses", CyanAccent)
                    TeachoStat("Tamil Medium", "100%", GoldAdmin)
                    TeachoStat("No Internet", "Download Ready", EmeraldGreen)
                }
            }

            Column(modifier = Modifier.padding(horizontal = 12.dp)) {
                Spacer(Modifier.height(12.dp))

                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Search subject or exam...", color = TextMuted, fontSize = 12.sp) },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = PurpleVariant) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = PurpleVariant,
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
                                selectedContainerColor = PurpleVariant,
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
                items(filteredCourses) { course ->
                    CourseTile(course)
                }
                item { Spacer(Modifier.height(12.dp)) }
            }
        }
    }
}

@Composable
private fun TeachoStat(value: String, label: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, color = color, fontSize = 14.sp, fontWeight = FontWeight.Bold)
        Text(label, color = TextMuted, fontSize = 10.sp)
    }
}

@Composable
private fun CourseTile(course: CourseItem) {
    Surface(
        shape = RoundedCornerShape(14.dp),
        color = Slate800,
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, PurpleVariant.copy(alpha = 0.3f), RoundedCornerShape(14.dp))
    ) {
        Row(modifier = Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(52.dp)
                    .background(PurpleVariant.copy(alpha = 0.15f), RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.School, contentDescription = null, tint = PurpleVariant, modifier = Modifier.size(28.dp))
            }
            Spacer(Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(course.title, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp, modifier = Modifier.weight(1f))
                    if (course.isFree) {
                        Surface(shape = RoundedCornerShape(6.dp), color = EmeraldGreen.copy(alpha = 0.2f)) {
                            Text("FREE", color = EmeraldGreen, fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(6.dp, 2.dp))
                        }
                    }
                }
                Text(course.tamilTitle, color = TextMuted, fontSize = 12.sp)
                Spacer(Modifier.height(4.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.PlayLesson, contentDescription = null, tint = CyanAccent, modifier = Modifier.size(12.dp))
                        Text(" ${course.totalLessons} lessons", color = CyanAccent, fontSize = 11.sp)
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.AccessTime, contentDescription = null, tint = GoldAdmin, modifier = Modifier.size(12.dp))
                        Text(" ${course.durationMins} min/lesson", color = GoldAdmin, fontSize = 11.sp)
                    }
                    Surface(shape = RoundedCornerShape(6.dp), color = Slate700) {
                        Text(course.level, color = TextMuted, fontSize = 10.sp, modifier = Modifier.padding(6.dp, 2.dp))
                    }
                }
            }
        }
    }
}
