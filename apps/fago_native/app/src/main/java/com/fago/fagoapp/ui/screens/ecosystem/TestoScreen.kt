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
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

data class MockQuestion(
    val id: Int,
    val question: String,
    val optionA: String,
    val optionB: String,
    val optionC: String,
    val optionD: String,
    val correctAnswer: Int,  // 0=A, 1=B, 2=C, 3=D
    val subject: String
)

private val questions = listOf(
    MockQuestion(1, "The capital of Tamil Nadu is:", "Chennai", "Madurai", "Coimbatore", "Salem", 0, "GK"),
    MockQuestion(2, "Who was the first Chief Minister of Tamil Nadu?", "M.G. Ramachandran", "P. S. Kumaraswamy Raja", "K. Kamaraj", "C. N. Annadurai", 1, "GK"),
    MockQuestion(3, "திருக்குறளை எழுதியவர் யார்?", "இளங்கோவடிகள்", "திருவள்ளுவர்", "கம்பர்", "சுந்தரர்", 1, "Tamil"),
    MockQuestion(4, "What is 15% of 400?", "50", "55", "60", "65", 2, "Math"),
    MockQuestion(5, "The River Palar originates from:", "Andhra Pradesh", "Karnataka", "Kerala", "Tamil Nadu", 1, "Geography"),
    MockQuestion(6, "TNPSC stands for:", "Tamil Nadu Public Service Committee", "Tamil Nadu Public Service Commission", "Tamil Nadu Police Service Commission", "None of these", 1, "GK"),
    MockQuestion(7, "If a train travels 360 km in 4 hours, its speed is:", "80 km/h", "85 km/h", "90 km/h", "95 km/h", 2, "Math"),
    MockQuestion(8, "Nilgiris is in which district?", "Coimbatore", "Ooty", "Nilgiris", "Salem", 2, "Geography"),
    MockQuestion(9, "Which year was Tamil Nadu formed?", "1956", "1960", "1965", "1969", 0, "GK"),
    MockQuestion(10, "The synonym for 'valiant' in Tamil culture is:", "வீரம்", "அன்பு", "அறம்", "கல்வி", 0, "Tamil")
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TestoScreen(onBack: () -> Unit) {
    var currentQuestionIndex by remember { mutableIntStateOf(0) }
    var selectedAnswer by remember { mutableStateOf<Int?>(null) }
    var showResult by remember { mutableStateOf(false) }
    var score by remember { mutableIntStateOf(0) }
    var isFinished by remember { mutableStateOf(false) }
    var answers by remember { mutableStateOf(mutableMapOf<Int, Int>()) }
    val scope = rememberCoroutineScope()

    val currentQuestion = questions[currentQuestionIndex]
    val options = listOf(currentQuestion.optionA, currentQuestion.optionB, currentQuestion.optionC, currentQuestion.optionD)
    val optionLabels = listOf("A", "B", "C", "D")

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("TestO — Mock Exam", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text("TNPSC • GK • Tamil • Math Practice", color = OrangeDriver, fontSize = 11.sp)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Slate800),
                actions = {
                    if (!isFinished) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = OrangeDriver.copy(alpha = 0.2f),
                            modifier = Modifier.padding(end = 12.dp)
                        ) {
                            Text(
                                "${currentQuestionIndex + 1}/${questions.size}",
                                color = OrangeDriver,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                modifier = Modifier.padding(10.dp, 6.dp)
                            )
                        }
                    }
                }
            )
        },
        containerColor = Slate900
    ) { padding ->
        if (isFinished) {
            // Results screen
            Column(
                modifier = Modifier
                    .padding(padding)
                    .fillMaxSize()
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                val grade = when {
                    score >= 9 -> "🥇 Excellent!"
                    score >= 7 -> "🥈 Very Good"
                    score >= 5 -> "🥉 Pass"
                    else -> "📚 Need More Practice"
                }
                val gradeColor = when {
                    score >= 9 -> GoldAdmin
                    score >= 7 -> EmeraldGreen
                    score >= 5 -> CyanAccent
                    else -> RoseError
                }

                Icon(Icons.Default.EmojiEvents, contentDescription = null, tint = GoldAdmin, modifier = Modifier.size(72.dp))
                Spacer(Modifier.height(16.dp))
                Text("Quiz Complete!", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(8.dp))
                Text("$score / ${questions.size}", color = gradeColor, fontSize = 48.sp, fontWeight = FontWeight.Bold)
                Text(grade, color = gradeColor, fontSize = 20.sp, fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.height(20.dp))

                Surface(shape = RoundedCornerShape(16.dp), color = Slate800, modifier = Modifier.fillMaxWidth()) {
                    Row(modifier = Modifier.padding(16.dp), horizontalArrangement = Arrangement.SpaceEvenly) {
                        ResultStat("Correct", score.toString(), EmeraldGreen)
                        ResultStat("Wrong", (questions.size - score).toString(), RoseError)
                        ResultStat("Accuracy", "${(score * 100 / questions.size)}%", CyanAccent)
                    }
                }

                Spacer(Modifier.height(24.dp))

                Button(
                    onClick = {
                        currentQuestionIndex = 0
                        selectedAnswer = null
                        showResult = false
                        score = 0
                        isFinished = false
                        answers = mutableMapOf()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = OrangeDriver),
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Icon(Icons.Default.Refresh, contentDescription = null, tint = Color.White)
                    Spacer(Modifier.width(8.dp))
                    Text("Retry Quiz", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                }
            }
        } else {
            Column(
                modifier = Modifier
                    .padding(padding)
                    .fillMaxSize()
                    .padding(16.dp)
            ) {
                // Progress bar
                LinearProgressIndicator(
                    progress = { (currentQuestionIndex + 1).toFloat() / questions.size },
                    modifier = Modifier.fillMaxWidth().height(6.dp),
                    color = OrangeDriver,
                    trackColor = Slate800
                )

                Spacer(Modifier.height(16.dp))

                // Subject chip
                Surface(shape = RoundedCornerShape(8.dp), color = OrangeDriver.copy(alpha = 0.2f)) {
                    Text(currentQuestion.subject, color = OrangeDriver, fontSize = 12.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(10.dp, 4.dp))
                }

                Spacer(Modifier.height(14.dp))

                // Question card
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Slate800,
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, OrangeDriver.copy(alpha = 0.4f), RoundedCornerShape(16.dp))
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Text("Q${currentQuestionIndex + 1}.", color = OrangeDriver, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                        Spacer(Modifier.height(6.dp))
                        Text(currentQuestion.question, color = Color.White, fontSize = 17.sp, fontWeight = FontWeight.SemiBold, lineHeight = 26.sp)
                    }
                }

                Spacer(Modifier.height(16.dp))

                // Options
                options.forEachIndexed { index, option ->
                    val isSelected = selectedAnswer == index
                    val isCorrect = index == currentQuestion.correctAnswer
                    val optBgColor = when {
                        showResult && isCorrect -> EmeraldGreen.copy(alpha = 0.25f)
                        showResult && isSelected && !isCorrect -> RoseError.copy(alpha = 0.25f)
                        isSelected -> OrangeDriver.copy(alpha = 0.2f)
                        else -> Slate800
                    }
                    val optBorderColor = when {
                        showResult && isCorrect -> EmeraldGreen
                        showResult && isSelected && !isCorrect -> RoseError
                        isSelected -> OrangeDriver
                        else -> Slate700
                    }

                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = optBgColor,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                            .border(1.5.dp, optBorderColor, RoundedCornerShape(12.dp))
                            .run { if (!showResult) clickable { selectedAnswer = index } else this }
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Surface(shape = RoundedCornerShape(8.dp), color = optBorderColor.copy(alpha = 0.3f)) {
                                Text(optionLabels[index], color = optBorderColor, fontWeight = FontWeight.Bold, modifier = Modifier.padding(8.dp, 4.dp))
                            }
                            Spacer(Modifier.width(12.dp))
                            Text(option, color = Color.White, fontSize = 14.sp, modifier = Modifier.weight(1f))
                            if (showResult && isCorrect) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = EmeraldGreen, modifier = Modifier.size(20.dp))
                            } else if (showResult && isSelected && !isCorrect) {
                                Icon(Icons.Default.Cancel, contentDescription = null, tint = RoseError, modifier = Modifier.size(20.dp))
                            }
                        }
                    }
                }

                Spacer(Modifier.weight(1f))

                // Action button
                if (!showResult) {
                    Button(
                        onClick = {
                            if (selectedAnswer != null) {
                                showResult = true
                                if (selectedAnswer == currentQuestion.correctAnswer) score++
                            }
                        },
                        enabled = selectedAnswer != null,
                        modifier = Modifier.fillMaxWidth().height(52.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = OrangeDriver,
                            disabledContainerColor = Slate700
                        )
                    ) {
                        Text("Submit Answer", color = if (selectedAnswer != null) Color.White else TextMuted, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    }
                } else {
                    Button(
                        onClick = {
                            if (currentQuestionIndex < questions.size - 1) {
                                currentQuestionIndex++
                                selectedAnswer = null
                                showResult = false
                            } else {
                                isFinished = true
                            }
                        },
                        modifier = Modifier.fillMaxWidth().height(52.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = OrangeDriver)
                    ) {
                        Text(
                            if (currentQuestionIndex < questions.size - 1) "Next Question →" else "See Results",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ResultStat(label: String, value: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, color = color, fontSize = 24.sp, fontWeight = FontWeight.Bold)
        Text(label, color = TextMuted, fontSize = 12.sp)
    }
}
