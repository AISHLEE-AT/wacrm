package com.fago.fagoapp.ui.screens.web

import android.annotation.SuppressLint
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.fago.fagoapp.BuildConfig
import com.fago.fagoapp.auth.AuthViewModel
import org.koin.androidx.compose.koinViewModel

/**
 * Native Android WebView Module for web-backed FAGO modules:
 * MoneyO, TaskO, ToolsO, Careers, AdminO, Profile Pass.
 */
@OptIn(ExperimentalMaterial3Api::class)
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun WebModuleScreen(
    title: String,
    modulePath: String,
    onBack: () -> Unit
) {
    val authViewModel: AuthViewModel = koinViewModel()
    val authState by authViewModel.authState.collectAsState()

    val baseUrl = BuildConfig.WHATSAPP_OTP_SEND_URL
        .replace("/api/auth/whatsapp/send-otp", "")
        .ifEmpty { "https://watscrm.vercel.app" }
    
    val tokenQuery = if (!authState.accessToken.isNullOrEmpty() && !authState.refreshToken.isNullOrEmpty()) {
        val separator = if (modulePath.contains("?")) "&" else "?"
        "${separator}access_token=${authState.accessToken}&refresh_token=${authState.refreshToken}"
    } else ""

    val fullUrl = if (modulePath.startsWith("http")) "$modulePath$tokenQuery" else "$baseUrl/$modulePath$tokenQuery"

    var progress by remember { mutableFloatStateOf(0f) }
    var isLoading by remember { mutableStateOf(true) }
    var webViewInstance by remember { mutableStateOf<WebView?>(null) }

    Scaffold(
        containerColor = Color(0xFF0F172A),
        topBar = {
            TopAppBar(
                title = { Text(title, color = Color.White, fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF1E293B)),
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color(0xFF00F0FF))
                    }
                },
                actions = {
                    IconButton(onClick = { webViewInstance?.reload() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = Color.White)
                    }
                }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            if (isLoading) {
                LinearProgressIndicator(
                    progress = { progress },
                    modifier = Modifier.fillMaxWidth().height(3.dp),
                    color = Color(0xFF00F0FF),
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
                        }

                        webViewClient = object : WebViewClient() {
                            override fun onPageFinished(view: WebView?, url: String?) {
                                super.onPageFinished(view, url)
                                isLoading = false

                                val accessToken = authState.accessToken
                                val refreshToken = authState.refreshToken
                                if (!accessToken.isNullOrEmpty() && !refreshToken.isNullOrEmpty()) {
                                    val js = """
                                        (function() {
                                            try {
                                                var sessionData = {
                                                    access_token: '$accessToken',
                                                    refresh_token: '$refreshToken',
                                                    expires_in: 3600,
                                                    token_type: 'bearer'
                                                };
                                                localStorage.setItem('sb-gmahjdzqitbomtmdzlfp-auth-token', JSON.stringify(sessionData));
                                                localStorage.setItem('supabase.auth.token', JSON.stringify(sessionData));
                                            } catch(e) {}
                                        })();
                                    """.trimIndent()
                                    view?.evaluateJavascript(js, null)
                                }
                            }
                        }

                        webChromeClient = object : WebChromeClient() {
                            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                                progress = newProgress / 100f
                                isLoading = newProgress < 100
                            }
                        }

                        loadUrl(fullUrl)
                    }
                },
                update = { webView ->
                    webViewInstance = webView
                },
                modifier = Modifier.fillMaxSize()
            )
        }
    }
}
