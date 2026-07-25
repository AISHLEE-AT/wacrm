package com.fago.fagoapp.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// ── FAGO Brand Colors (matches Flutter fago_app) ──────────────────────────
val FagoGold        = Color(0xFFFFD700)
val FagoCyan        = Color(0xFF00F0FF)
val FagoGreen       = Color(0xFF00FF00)
val FagoSlate900    = Color(0xFF0F172A)
val FagoSlate800    = Color(0xFF1E293B)
val FagoSlate700    = Color(0xFF334155)
val FagoOrange      = Color(0xFFFF8C00)
val FagoPink        = Color(0xFFF43F5E)
val FagoPurple      = Color(0xFF7C3AED)

private val FagoDarkColorScheme = darkColorScheme(
    primary         = FagoGold,
    secondary       = FagoCyan,
    tertiary        = FagoGreen,
    background      = FagoSlate900,
    surface         = FagoSlate800,
    onPrimary       = Color.Black,
    onSecondary     = Color.Black,
    onBackground    = Color.White,
    onSurface       = Color.White,
    error           = FagoPink,
    outline         = FagoSlate700,
)

@Composable
fun FagoTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = FagoDarkColorScheme,
        content = content
    )
}
