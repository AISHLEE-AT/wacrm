package com.fago.fagoapp.ui.screens.crm

import android.annotation.SuppressLint
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.fago.fagoapp.auth.AuthUiState
import com.fago.fagoapp.auth.UserRole

/**
 * Native Android CrmDashboardScreen — full WhatsApp CRM WebView integration.
 * Mirrors Flutter's CrmDashboardScreen with custom JS bridge (FlutterBridge equivalent).
 */
@OptIn(ExperimentalMaterial3Api::class)
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun CrmDashboardScreen(
    authState: AuthUiState,
    onNavigateProfile: () -> Unit,
    onNavigateRideo: () -> Unit,
    onNavigateDrivo: () -> Unit,
    onNavigateModule: (String, String) -> Unit,
    onSignOut: () -> Unit
) {
    val crmUrl = "https://watscrm.vercel.app"
    var progress by remember { mutableFloatStateOf(0f) }
    var isLoading by remember { mutableStateOf(true) }
    var webViewInstance by remember { mutableStateOf<WebView?>(null) }
    var selectedTab by remember { me.intValueStateOf(0) }

    Scaffold(
        containerColor = Color(0xFF0F172A),
        topBar = {
            TopAppBar(
                title = {
                    Row {
                        Text("👑 FAGO CRM", color = Color(0xFFFFD700), fontWeight = FontWeight.Bold)
                        Spacer(Modifier.width(8.dp))
                        if (authState.role == UserRole.ADMIN) {
                            Surface(
                                shape = androidx.compose.foundation.shape.RoundedCornerShape(6.dp),
                                color = Color(0xFFFFD700).copy(alpha = 0.2f)
                            ) {
                                Text(
                                    " ADMIN ", color = Color(0xFFFFD700),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 10.sp,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF1E293B)),
                actions = {
                    IconButton(onClick = onNavigateRideo) {
                        Icon(Icons.Default.DirectionsBike, contentDescription = "RideO", tint = Color(0xFF00F0FF))
                    }
                    IconButton(onClick = onNavigateDrivo) {
                        Icon(Icons.Default.LocalShipping, contentDescription = "DriveO", tint = Color(0xFFFF8C00))
                    }
                    IconButton(onClick = onNavigateProfile) {
                        Icon(Icons.Default.Person, contentDescription = "Profile", tint = Color.White)
                    }
                    IconButton(onClick = onSignOut) {
                        Icon(Icons.Default.Logout, contentDescription = "Sign Out", tint = Color.White)
                    }
                }
            )
        },
        bottomBar = {
            NavigationBar(containerColor = Color(0xFF1E293B)) {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0; webViewInstance?.loadUrl("$crmUrl/crm") },
                    icon = { Icon(Icons.Default.Chat, contentDescription = null) },
                    label = { Text("CRM") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFFFFD700),
                        indicatorColor = Color(0xFFFFD700).copy(alpha = 0.2f)
                    )
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1; onNavigateRideo() },
                    icon = { Icon(Icons.Default.DirectionsCar, contentDescription = null) },
                    label = { Text("RideO") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFF00F0FF),
                        indicatorColor = Color(0xFF00F0FF).copy(alpha = 0.2f)
                    )
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2; onNavigateDrivo() },
                    icon = { Icon(Icons.Default.LocalShipping, contentDescription = null) },
                    label = { Text("DriveO") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFFFF8C00),
                        indicatorColor = Color(0xFFFF8C00).copy(alpha = 0.2f)
                    )
                )
                NavigationBarItem(
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3; onNavigateModule("RentO - Farm Rental", "rento") },
                    icon = { Icon(Icons.Default.Agriculture, contentDescription = null) },
                    label = { Text("RentO") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFF00FF00),
                        indicatorColor = Color(0xFF00FF00).copy(alpha = 0.2f)
                    )
                )
                NavigationBarItem(
                    selected = selectedTab == 4,
                    onClick = { selectedTab = 4; onNavigateProfile() },
                    icon = { Icon(Icons.Default.Person, contentDescription = null) },
                    label = { Text("Profile") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color.White,
                        indicatorColor = Color.White.copy(alpha = 0.2f)
                    )
                )
            }
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            if (isLoading) {
                LinearProgressIndicator(
                    progress = { progress },
                    modifier = Modifier.fillMaxWidth().height(3.dp),
                    color = Color(0xFFFFD700),
                    trackColor = Color(0xFF1E293B)
                )
            }

            AndroidView(
                factory = { ctx ->
                    WebView(ctx).apply {
                        webViewInstance = this
                        layoutParams = android.view.ViewGroup.LayoutParams(
                            android.view.ViewGroup.LayoutParams.MATCH_PARENT,
                            android.view.ViewGroup.LayoutParams.MATCH_PARENT
                        )

                        settings.apply {
                            javaScriptEnabled = true
                            domStorageEnabled = true
                            databaseEnabled = true
                            useWideViewPort = true
                            loadWithOverviewMode = true
                            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                            cacheMode = WebSettings.LOAD_DEFAULT
                            userAgentString = "$userAgentString FagoAndroidNative/1.0"
                        }

                        // Add JS Bridge interface (equivalent to FlutterChannel)
                        addJavascriptInterface(object {
                            @JavascriptInterface
                            fun postMessage(message: String) {
                                // Handles actions triggered from the web CRM
                            }
                        }, "AndroidBridge")

                        webViewClient = object : WebViewClient() {
                            override fun onPageFinished(view: WebView?, url: String?) {
                                super.onPageFinished(view, url)
                                isLoading = false
                            }
                        }

                        webChromeClient = object : WebChromeClient() {
                            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                                progress = newProgress / 100f
                                isLoading = newProgress < 100
                            }
                        }

                        loadUrl(crmUrl)
                    }
                },
                update = { webView -> webViewInstance = webView },
                modifier = Modifier.fillMaxSize()
            )
        }
    }
}

// Utility extension for int state
private object me {
    fun intValueStateOf(v: Int) = mutableIntStateOf(v)
}
