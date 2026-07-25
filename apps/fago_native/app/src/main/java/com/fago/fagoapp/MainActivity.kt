package com.fago.fagoapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.lifecycle.viewmodel.compose.viewModel
import com.fago.fagoapp.auth.AuthViewModel
import com.fago.fagoapp.auth.UserRole
import com.fago.fagoapp.ui.navigation.FagoNavHost
import com.fago.fagoapp.ui.theme.FagoTheme
import org.koin.androidx.compose.koinViewModel

/**
 * Single activity — Jetpack Compose navigation handles all screens.
 */
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            FagoTheme {
                val authViewModel: AuthViewModel = koinViewModel()
                val authState by authViewModel.authState.collectAsState()

                FagoNavHost(
                    authState = authState,
                    onSignOut = { authViewModel.signOut() }
                )
            }
        }
    }
}
