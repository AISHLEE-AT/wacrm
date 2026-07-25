package com.fago.fagoapp.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.fago.fagoapp.auth.AuthUiState
import com.fago.fagoapp.auth.UserRole
import com.fago.fagoapp.ui.screens.SplashScreen
import com.fago.fagoapp.ui.screens.auth.LoginScreen
import com.fago.fagoapp.ui.screens.crm.CrmDashboardScreen
import com.fago.fagoapp.ui.screens.rider.RiderMapScreen
import com.fago.fagoapp.ui.screens.driver.DriverHomeScreen
import com.fago.fagoapp.ui.screens.profile.ProfileScreen
import com.fago.fagoapp.ui.screens.modules.RentOScreen
import com.fago.fagoapp.ui.screens.modules.MandiPricesScreen
import com.fago.fagoapp.ui.screens.modules.TourOScreen
import com.fago.fagoapp.ui.screens.modules.TeachOScreen
import com.fago.fagoapp.ui.screens.modules.TestOScreen
import com.fago.fagoapp.ui.screens.modules.TvOScreen
import com.fago.fagoapp.ui.screens.ai.GeminiAiAssistantScreen
import com.fago.fagoapp.ui.screens.promo.WhatsAppStatusPromoScreen
import com.fago.fagoapp.ui.screens.admin.AdminCrmScreen
import com.fago.fagoapp.ui.screens.web.WebModuleScreen

object Routes {
    const val SPLASH  = "splash"
    const val LOGIN   = "login"
    const val CRM     = "crm"
    const val RIDEO   = "rideo"
    const val DRIVO   = "drivo"
    const val RENTO   = "rento"
    const val MANDI   = "mandi"
    const val TOURO   = "touro"
    const val TEACHO = "teacho"
    const val TESTO   = "testo"
    const val TVO     = "tvo"
    const val AI      = "ai"
    const val PROMO   = "promo"
    const val ADMIN   = "admin"
    const val PROFILE = "profile"
    const val WEB     = "web/{title}/{path}"

    fun buildWebRoute(title: String, path: String) = "web/${java.net.URLEncoder.encode(title, "UTF-8")}/${java.net.URLEncoder.encode(path, "UTF-8")}"
}

/**
 * FAGO Central Navigation Host — full feature parity with Flutter's app_router.dart.
 * Routes all 12+ modules natively in Kotlin + Jetpack Compose.
 */
@Composable
fun FagoNavHost(
    authState: AuthUiState,
    onSignOut: () -> Unit
) {
    val navController = rememberNavController()

    val startDest = when {
        authState.isLoading              -> Routes.SPLASH
        authState.role == UserRole.GUEST -> Routes.LOGIN
        else                             -> Routes.CRM
    }

    NavHost(
        navController = navController,
        startDestination = startDest
    ) {
        composable(Routes.SPLASH) { SplashScreen() }

        composable(Routes.LOGIN) {
            LoginScreen(
                onLoginSuccess = { role ->
                    when (role) {
                        UserRole.ADMIN  -> navController.navigate(Routes.CRM)   { popUpTo(0) }
                        UserRole.DRIVER -> navController.navigate(Routes.DRIVO) { popUpTo(0) }
                        else            -> navController.navigate(Routes.CRM)   { popUpTo(0) }
                    }
                }
            )
        }

        composable(Routes.CRM) {
            CrmDashboardScreen(
                authState = authState,
                onNavigateProfile = { navController.navigate(Routes.PROFILE) },
                onNavigateRideo = { navController.navigate(Routes.RIDEO) },
                onNavigateDrivo = { navController.navigate(Routes.DRIVO) },
                onNavigateModule = { title, path -> navController.navigate(Routes.buildWebRoute(title, path)) },
                onSignOut = {
                    onSignOut()
                    navController.navigate(Routes.LOGIN) { popUpTo(0) }
                }
            )
        }

        composable(Routes.RIDEO) {
            RiderMapScreen(
                onOpenDrawer = { navController.navigate(Routes.PROFILE) }
            )
        }

        composable(Routes.DRIVO) {
            DriverHomeScreen(
                onOpenDrawer = { navController.navigate(Routes.PROFILE) }
            )
        }

        composable(Routes.RENTO) {
            RentOScreen(onBack = { navController.popBackStack() })
        }

        composable(Routes.MANDI) {
            MandiPricesScreen(onBack = { navController.popBackStack() })
        }

        composable(Routes.TOURO) {
            TourOScreen(onBack = { navController.popBackStack() })
        }

        composable(Routes.TEACHO) {
            TeachOScreen(onBack = { navController.popBackStack() })
        }

        composable(Routes.TESTO) {
            TestOScreen(onBack = { navController.popBackStack() })
        }

        composable(Routes.TVO) {
            TvOScreen(onBack = { navController.popBackStack() })
        }

        composable(Routes.AI) {
            GeminiAiAssistantScreen(onBack = { navController.popBackStack() })
        }

        composable(Routes.PROMO) {
            WhatsAppStatusPromoScreen(onBack = { navController.popBackStack() })
        }

        composable(Routes.ADMIN) {
            AdminCrmScreen(
                onBack = { navController.popBackStack() },
                onSignOut = {
                    onSignOut()
                    navController.navigate(Routes.LOGIN) { popUpTo(0) }
                }
            )
        }

        composable(Routes.PROFILE) {
            ProfileScreen(
                authState = authState,
                profileData = mapOf("role" to if (authState.role == UserRole.ADMIN) "admin" else "user"),
                onSignOut = {
                    onSignOut()
                    navController.navigate(Routes.LOGIN) { popUpTo(0) }
                }
            )
        }

        composable(
            route = Routes.WEB,
            arguments = listOf(
                navArgument("title") { type = NavType.StringType },
                navArgument("path")  { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val title = java.net.URLDecoder.decode(backStackEntry.arguments?.getString("title") ?: "Module", "UTF-8")
            val path  = java.net.URLDecoder.decode(backStackEntry.arguments?.getString("path")  ?: "", "UTF-8")
            WebModuleScreen(title = title, modulePath = path, onBack = { navController.popBackStack() })
        }
    }
}
