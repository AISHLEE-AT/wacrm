package com.fago.fagoapp.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = CyanAccent,
    secondary = EmeraldGreen,
    tertiary = GoldAdmin,
    background = Slate900,
    surface = Slate800,
    onPrimary = Slate900,
    onSecondary = Slate900,
    onBackground = TextWhite,
    onSurface = TextWhite
)

@Composable
fun FagoAppTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}

@Composable
fun AISHOTheme(content: @Composable () -> Unit) = FagoAppTheme(content)
