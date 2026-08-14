package com.poovisri.mobile.flow.ui

import android.content.Intent
import android.net.Uri
import androidx.activity.compose.BackHandler
import androidx.browser.customtabs.CustomTabsIntent
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.poovisri.mobile.flow.model.FlowNode
import com.poovisri.mobile.flow.model.FlowType
import com.poovisri.mobile.flow.viewmodel.FlowViewModel

// SuprO Theme Colors
private val BackgroundDark = Color(0xFF0A0F1E)
private val CardBackground = Color(0xFF111827)
private val CardBorderColor = Color(0xFF1E293B)
private val PrimaryEmerald = Color(0xFF10B981)
private val AmberAccent = Color(0xFFF59E0B)
private val TextWhite = Color(0xFFF8FAFC)
private val TextSecondary = Color(0xFF94A3B8)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FlowQuestionScreen(
    viewModel: FlowViewModel,
    onFinish: () -> Unit = {}
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    // Handle system back button to pop node history
    BackHandler(enabled = true) {
        if (!viewModel.goBack()) {
            onFinish()
        }
    }

    Scaffold(
        containerColor = BackgroundDark,
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF0D1526))
                    .padding(bottom = 8.dp)
            ) {
                // Top Action Bar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(
                            onClick = {
                                if (!viewModel.goBack()) {
                                    onFinish()
                                }
                            }
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Back",
                                tint = TextWhite
                            )
                        }
                        Spacer(modifier = Modifier.width(4.dp))
                        Column {
                            Text(
                                text = "GUIDED LEARNING PATH",
                                color = PrimaryEmerald,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp
                            )
                            Text(
                                text = "Topic Assessment",
                                color = TextWhite,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    // Reset / Start Over
                    FilledTonalButton(
                        onClick = { viewModel.resetToRoot() },
                        colors = ButtonDefaults.filledTonalButtonColors(
                            containerColor = PrimaryEmerald.copy(alpha = 0.15f),
                            contentColor = PrimaryEmerald
                        ),
                        shape = RoundedCornerShape(16.dp),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Start Over",
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(text = "Start Over", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }

                // Breadcrumbs Trail
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState())
                        .padding(horizontal = 16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    uiState.breadcrumbs.forEachIndexed { index, crumb ->
                        val isLast = index == uiState.breadcrumbs.size - 1
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isLast) PrimaryEmerald.copy(alpha = 0.2f) else Color.White.copy(alpha = 0.05f))
                                .border(
                                    1.dp,
                                    if (isLast) PrimaryEmerald else Color.White.copy(alpha = 0.1f),
                                    RoundedCornerShape(8.dp)
                                )
                                .clickable(enabled = !isLast) { viewModel.jumpToBreadcrumb(index) }
                                .padding(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = crumb.label,
                                color = if (isLast) PrimaryEmerald else TextSecondary,
                                fontSize = 11.sp,
                                fontWeight = if (isLast) FontWeight.Bold else FontWeight.Normal
                            )
                        }
                        if (!isLast) {
                            Icon(
                                imageVector = Icons.Default.ChevronRight,
                                contentDescription = null,
                                tint = Color.Gray,
                                modifier = Modifier.size(16.dp).padding(horizontal = 2.dp)
                            )
                        }
                    }
                }
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(BackgroundDark)
        ) {
            if (uiState.isLoading) {
                CircularProgressIndicator(
                    color = PrimaryEmerald,
                    modifier = Modifier.align(Alignment.Center)
                )
            } else if (uiState.error != null) {
                Column(
                    modifier = Modifier
                        .align(Alignment.Center)
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(text = uiState.error!!, color = Color.Red, textAlign = TextAlign.Center)
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(onClick = { viewModel.resetToRoot() }) {
                        Text(text = "Retry Flow")
                    }
                }
            } else {
                uiState.currentNode?.let { node ->
                    AnimatedContent(
                        targetState = node,
                        transitionSpec = {
                            (slideInHorizontally { width -> width / 2 } + fadeIn())
                                .togetherWith(slideOutHorizontally { width -> -width / 2 } + fadeOut())
                        },
                        label = "FlowNodeTransition"
                    ) { targetNode ->
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .verticalScroll(rememberScrollState())
                                .padding(16.dp)
                        ) {
                            when (targetNode.type) {
                                FlowType.BRANCH -> BranchNodeView(targetNode, viewModel)
                                FlowType.LEAF_PURCHASE -> LeafPurchaseView(targetNode) { url ->
                                    url?.let {
                                        val customTabsIntent = CustomTabsIntent.Builder().build()
                                        customTabsIntent.launchUrl(context, Uri.parse(it))
                                    }
                                }
                                FlowType.LEAF_COMING_SOON -> LeafComingSoonView(
                                    node = targetNode,
                                    isNotified = uiState.isNotified,
                                    isNotifying = uiState.isNotifying,
                                    onNotifyClick = { viewModel.submitNotifyMe() },
                                    onExploreOthers = { viewModel.resetToRoot() }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun BranchNodeView(node: FlowNode, viewModel: FlowViewModel) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 16.dp),
        colors = CardDefaults.cardColors(containerColor = CardBackground),
        shape = RoundedCornerShape(20.dp),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(PrimaryEmerald.copy(alpha = 0.3f)))
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Text(
                text = node.question ?: "Please select an option:",
                color = TextWhite,
                fontSize = 19.sp,
                fontWeight = FontWeight.Bold,
                lineHeight = 26.sp
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "Select an option below to narrow down syllabus.",
                color = TextSecondary,
                fontSize = 13.sp
            )
        }
    }

    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        node.options?.forEachIndexed { index, option ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { viewModel.selectOption(option.nextId, option.label) },
                colors = CardDefaults.cardColors(containerColor = Color(0xFF131D33)),
                shape = RoundedCornerShape(16.dp),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(Color.White.copy(alpha = 0.08f)))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        modifier = Modifier.weight(1f),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(28.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(PrimaryEmerald.copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "${index + 1}",
                                color = PrimaryEmerald,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = option.label,
                            color = TextWhite,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                    Icon(
                        imageVector = Icons.Default.ChevronRight,
                        contentDescription = null,
                        tint = PrimaryEmerald
                    )
                }
            }
        }
    }
}

@Composable
private fun LeafPurchaseView(node: FlowNode, onPurchaseClick: (String?) -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF111C30)),
        shape = RoundedCornerShape(24.dp),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(PrimaryEmerald))
    ) {
        Column(modifier = Modifier.padding(24.dp)) {
            Surface(
                color = AmberAccent.copy(alpha = 0.15f),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(
                    text = "✦ TEST READY • HIGH YIELD ✦",
                    color = AmberAccent,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.ExtraBold,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = node.title ?: "Premium Test Series",
                color = TextWhite,
                fontSize = 22.sp,
                fontWeight = FontWeight.ExtraBold,
                lineHeight = 28.sp
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = node.description ?: "Comprehensive exam simulation with answer keys and percentile metrics.",
                color = TextSecondary,
                fontSize = 14.sp,
                lineHeight = 20.sp
            )
            Spacer(modifier = Modifier.height(20.dp))

            // Perks
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.Black.copy(alpha = 0.25f), RoundedCornerShape(16.dp))
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.CheckCircle, null, tint = PrimaryEmerald, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Real Exam Timer & Automated Grading", color = TextWhite, fontSize = 13.sp)
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.CheckCircle, null, tint = PrimaryEmerald, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Instant Tamil & English Explanations", color = TextWhite, fontSize = 13.sp)
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.CheckCircle, null, tint = PrimaryEmerald, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Rank & Percentile Analytics", color = TextWhite, fontSize = 13.sp)
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = { onPurchaseClick(node.purchaseUrl) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp),
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryEmerald),
                shape = RoundedCornerShape(16.dp)
            ) {
                Icon(Icons.Default.ShoppingCart, contentDescription = null, tint = Color.Black)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Take Test / Purchase Now",
                    color = Color.Black,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp
                )
            }
        }
    }
}

@Composable
private fun LeafComingSoonView(
    node: FlowNode,
    isNotified: Boolean,
    isNotifying: Boolean,
    onNotifyClick: () -> Unit,
    onExploreOthers: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = CardBackground),
        shape = RoundedCornerShape(24.dp),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(AmberAccent.copy(alpha = 0.3f)))
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(64.dp)
                    .clip(CircleShape)
                    .background(AmberAccent.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Notifications,
                    contentDescription = null,
                    tint = AmberAccent,
                    modifier = Modifier.size(32.dp)
                )
            }
            Spacer(modifier = Modifier.height(16.dp))
            Surface(
                color = AmberAccent.copy(alpha = 0.2f),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = "IN DEVELOPMENT",
                    color = AmberAccent,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = node.title ?: "Coming Soon",
                color = TextWhite,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = node.message ?: "This module is being authored by top subject matter experts.",
                color = TextSecondary,
                fontSize = 14.sp,
                textAlign = TextAlign.Center,
                lineHeight = 20.sp
            )
            Spacer(modifier = Modifier.height(24.dp))

            if (isNotified) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(PrimaryEmerald.copy(alpha = 0.15f), RoundedCornerShape(12.dp))
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = PrimaryEmerald)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "We'll notify you as soon as this test launches!",
                        color = PrimaryEmerald,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            } else {
                Button(
                    onClick = onNotifyClick,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB)),
                    shape = RoundedCornerShape(14.dp),
                    enabled = !isNotifying
                ) {
                    if (isNotifying) {
                        CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp))
                    } else {
                        Icon(Icons.Default.Notifications, contentDescription = null, tint = Color.White)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Notify Me When Ready", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            TextButton(onClick = onExploreOthers) {
                Text("Explore Available Tests", color = TextSecondary, fontSize = 13.sp)
            }
        }
    }
}
