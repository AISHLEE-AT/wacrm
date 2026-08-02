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


/**
 * FAGO Central Navigation Host — Enforces strict role-based routing guards.
 * USER -> RideO (Rider Map); DRIVER -> DriveO; ADMIN -> CRM.
 */
@Composable
fun FagoNavHost(
    authState: AuthUiState,
    onSignOut: () -> Unit
) {
    val navController = rememberNavController()

    // Reactive Role Navigation Guard — seamlessly routes user as soon as role resolves
    LaunchedEffect(authState.role, authState.isLoading) {
        if (!authState.isLoading) {
            val targetRoute = when (authState.role) {
                UserRole.GUEST -> Routes.LOGIN
                UserRole.ADMIN -> Routes.CRM
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
            if (navController.currentDestination?.route != targetRoute) {
                navController.navigate(targetRoute) {
                    popUpTo(0)
                }
            }
        }
    }

    val startDest = when {
        authState.isLoading              -> Routes.SPLASH
        authState.role == UserRole.GUEST -> Routes.LOGIN
        authState.role == UserRole.ADMIN -> Routes.CRM
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
            // Strict guard: non-admins redirected to RIDEO
            if (authState.role != UserRole.ADMIN && authState.role != UserRole.GUEST) {
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
            // Strict guard: DRIVER logins redirected to DRIVO
            if (authState.role == UserRole.DRIVER) {
                LaunchedEffect(Unit) {
                    navController.navigate(Routes.DRIVO) { popUpTo(0) }
                }
            } else {
                RiderMapScreen(
                    authState = authState,
                    onOpenDrawer = { navController.navigate(Routes.PROFILE) },
                    onNavigateCrm = {
                        if (authState.role == UserRole.ADMIN) {
                            navController.navigate(Routes.CRM)
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
        }

        composable(Routes.DRIVO) {
            // Strict guard: USER logins redirected to RIDEO
            if (authState.role == UserRole.USER) {
                LaunchedEffect(Unit) {
                    navController.navigate(Routes.RIDEO) { popUpTo(0) }
                }
            } else {
                DriverHomeScreen(
                    authState = authState,
                    onOpenDrawer = { navController.navigate(Routes.PROFILE) },
                    onNavigateCrm = { navController.navigate(Routes.CRM) },
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

        composable(Routes.ADMIN) {
            // Guard: non-admins cannot access admin route
            if (authState.role != UserRole.ADMIN) {
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
                onNavigateCrm = { navController.navigate(Routes.CRM) },
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
