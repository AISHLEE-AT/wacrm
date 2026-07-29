package com.fago.fagoapp.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.fago.fagoapp.auth.AuthUiState
import com.fago.fagoapp.auth.UserRole
import com.fago.fagoapp.ui.screens.SplashScreen
import com.fago.fagoapp.ui.screens.auth.LoginScreen
import com.fago.fagoapp.ui.screens.auth.PinSetupScreen
import com.fago.fagoapp.ui.screens.crm.CrmDashboardScreen
import com.fago.fagoapp.ui.screens.rider.RiderMapScreen
import com.fago.fagoapp.ui.screens.driver.DriverHomeScreen
import com.fago.fagoapp.ui.screens.driver.DriverRegistrationScreen
import com.fago.fagoapp.ui.screens.profile.ProfileScreen
import com.fago.fagoapp.ui.screens.modules.RentOScreen
import com.fago.fagoapp.ui.screens.modules.MandiPricesScreen
import com.fago.fagoapp.ui.screens.modules.TourOScreen
import com.fago.fagoapp.ui.screens.modules.TeachOScreen
import com.fago.fagoapp.ui.screens.modules.TestOScreen
import com.fago.fagoapp.ui.screens.modules.TvOScreen
import com.fago.fagoapp.ui.screens.ecosystem.DealoScreen
import com.fago.fagoapp.ui.screens.ai.GeminiAiAssistantScreen
import com.fago.fagoapp.ui.screens.promo.WhatsAppStatusPromoScreen
import com.fago.fagoapp.ui.screens.admin.AdminCrmScreen
import com.fago.fagoapp.ui.screens.web.WebModuleScreen

/**
 * FAGO Central Navigation Host — Enforces role-based initial landing guards.
 * FIX: Does NOT hijack active screen navigation when user moves around inside the app!
 */
@Composable
fun FagoNavHost(
    authState: AuthUiState,
    onSignOut: () -> Unit
) {
    val navController = rememberNavController()

    // Reactive Role Navigation Guard — auto-routes user ONLY when starting on SPLASH or LOGIN
    LaunchedEffect(authState.role, authState.isLoading) {
        if (!authState.isLoading) {
            val currentRoute = navController.currentDestination?.route
            if (currentRoute == null || currentRoute == Routes.SPLASH || currentRoute == Routes.LOGIN) {
                val targetRoute = when (authState.role) {
                    UserRole.GUEST -> Routes.LOGIN
                    UserRole.ADMIN -> Routes.ADMIN
                    UserRole.DRIVER -> Routes.DRIVO
                    UserRole.USER, UserRole.PROVIDER -> {
                        when (authState.mainCategory) {
                            "Farmer" -> Routes.RENTO
                            "Shopper", "Financier" -> Routes.MANDI
                            "Tourist" -> Routes.TOURO
                            "Teacher", "Student" -> Routes.TEACHO
                            else -> Routes.RIDEO
                        }
                    }
                }
                if (currentRoute != targetRoute) {
                    navController.navigate(targetRoute) {
                        popUpTo(0)
                    }
                }
            }
        }
    }

    val startDest = when {
        authState.isLoading              -> Routes.SPLASH
        authState.role == UserRole.GUEST -> Routes.LOGIN
        authState.role == UserRole.ADMIN -> Routes.ADMIN
        authState.role == UserRole.DRIVER -> Routes.DRIVO
        else                             -> {
            when (authState.mainCategory) {
                "Farmer"              -> Routes.RENTO
                "Shopper", "Financier"-> Routes.MANDI
                "Tourist"             -> Routes.TOURO
                "Teacher", "Student"  -> Routes.TEACHO
                else                  -> Routes.RIDEO
            }
        }
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
                        UserRole.ADMIN  -> navController.navigate(Routes.ADMIN) { popUpTo(0) }
                        UserRole.DRIVER -> navController.navigate(Routes.DRIVO) { popUpTo(0) }
                        else            -> {
                            val targetRoute = when (authState.mainCategory) {
                                "Farmer"               -> Routes.RENTO
                                "Shopper", "Financier" -> Routes.MANDI
                                "Tourist"              -> Routes.TOURO
                                "Teacher", "Student"   -> Routes.TEACHO
                                else                   -> Routes.RIDEO
                            }
                            navController.navigate(targetRoute) { popUpTo(0) }
                        }
                    }
                }
            )
        }

        composable(
            route = Routes.PIN_SETUP,
            arguments = listOf(
                navArgument("phone") { type = NavType.StringType },
                navArgument("name")  { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val phone = java.net.URLDecoder.decode(backStackEntry.arguments?.getString("phone") ?: "", "UTF-8")
            val name  = java.net.URLDecoder.decode(backStackEntry.arguments?.getString("name")  ?: "User", "UTF-8")
            PinSetupScreen(
                phone = phone,
                name = name,
                onPinSetSuccess = {
                    navController.navigate(Routes.RIDEO) { popUpTo(0) }
                }
            )
        }

        composable(Routes.CRM) {
            val isAdmin = authState.role == UserRole.ADMIN ||
                (authState.phone != null && (authState.phone.contains("9486335870") || authState.phone.contains("9123596988")))
            if (!isAdmin && authState.role != UserRole.GUEST) {
                LaunchedEffect(Unit) {
                    navController.navigate(Routes.RIDEO) { popUpTo(0) }
                }
            } else {
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
        }

        composable(Routes.RIDEO) {
            RiderMapScreen(
                authState = authState,
                onOpenDrawer = { navController.navigate(Routes.PROFILE) },
                onNavigateCrm = {
                    val isAdmin = authState.role == UserRole.ADMIN || (authState.phone != null && authState.phone.contains("9486335870"))
                    if (isAdmin) {
                        navController.navigate(Routes.ADMIN)
                    } else {
                        navController.navigate(Routes.PROFILE)
                    }
                },
                onNavigateDrivo = {
                    if (authState.role == UserRole.DRIVER || authState.role == UserRole.ADMIN) {
                        navController.navigate(Routes.DRIVO)
                    }
                },
                onNavigateRento = { navController.navigate(Routes.RENTO) },
                onNavigateMandi = { navController.navigate(Routes.MANDI) },
                onNavigateTouro = { navController.navigate(Routes.TOURO) },
                onNavigateTeacho = { navController.navigate(Routes.TEACHO) },
                onNavigateTesto = { navController.navigate(Routes.TESTO) },
                onNavigateTvo = { navController.navigate(Routes.TVO) },
                onNavigateAi = { navController.navigate(Routes.AI) },
                onNavigateProfile = { navController.navigate(Routes.PROFILE) }
            )
        }

        composable(Routes.DRIVO) {
            DriverHomeScreen(
                authState = authState,
                onOpenDrawer = { navController.navigate(Routes.PROFILE) },
                onNavigateCrm = { navController.navigate(Routes.ADMIN) },
                onNavigateRideo = { navController.navigate(Routes.RIDEO) },
                onNavigateRento = { navController.navigate(Routes.RENTO) },
                onNavigateMandi = { navController.navigate(Routes.MANDI) },
                onNavigateTouro = { navController.navigate(Routes.TOURO) },
                onNavigateTeacho = { navController.navigate(Routes.TEACHO) },
                onNavigateTesto = { navController.navigate(Routes.TESTO) },
                onNavigateTvo = { navController.navigate(Routes.TVO) },
                onNavigateAi = { navController.navigate(Routes.AI) },
                onNavigateProfile = { navController.navigate(Routes.PROFILE) }
            )
        }

        composable(Routes.RENTO) {
            RentOScreen(
                authState = authState,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Routes.MANDI) {
            MandiPricesScreen(onBack = { navController.popBackStack() })
        }

        composable(Routes.TOURO) {
            TourOScreen(
                authState = authState,
                onBack = { navController.popBackStack() }
            )
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

        composable(Routes.DEALO) {
            DealoScreen(onBack = { navController.popBackStack() })
        }

        composable(Routes.DRIVER_REGISTRATION) {
            DriverRegistrationScreen(
                userPhone = authState.phone,
                userName = authState.fullName,
                onBack = { navController.popBackStack() },
                onSuccess = { navController.navigate(Routes.DRIVO) { popUpTo(0) } }
            )
        }

        composable(Routes.ADMIN) {
            val isAdmin = authState.role == UserRole.ADMIN ||
                (authState.phone != null && (authState.phone.contains("9486335870") || authState.phone.contains("9123596988")))
            if (!isAdmin) {
                LaunchedEffect(Unit) {
                    navController.navigate(Routes.RIDEO) { popUpTo(0) }
                }
            } else {
                AdminCrmScreen(
                    onBack = { navController.popBackStack() },
                    onSignOut = {
                        onSignOut()
                        navController.navigate(Routes.LOGIN) { popUpTo(0) }
                    }
                )
            }
        }

        composable(Routes.PROFILE) {
            ProfileScreen(
                authState = authState,
                profileData = mapOf(
                    "full_name" to (authState.fullName ?: "User"),
                    "phone" to (authState.phone ?: ""),
                    "whatsapp" to (authState.phone ?: ""),
                    "main_category" to (authState.mainCategory ?: "Traveller"),
                    "role" to if (authState.role == UserRole.ADMIN) "admin" else if (authState.role == UserRole.DRIVER) "driver" else "user"
                ),
                onNavigateAdmin = { navController.navigate(Routes.ADMIN) },
                onNavigateDriverRegistration = { navController.navigate(Routes.DRIVER_REGISTRATION) },
                onNavigateWebModule = { title, path -> navController.navigate(Routes.buildWebRoute(title, path)) },
                onNavigateRoute = { route -> navController.navigate(route) },
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
