package com.fago.fagoapp.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fago.fagoapp.auth.AuthUiState
import com.fago.fagoapp.auth.UserRole

data class DrawerMenuItem(
    val title: String,
    val subtitle: String,
    val route: String,
    val icon: ImageVector,
    val color: Color
)

/**
 * FAGO Drawer Menu — launcher for all 12+ FAGO modules.
 * Mirrors all routes defined in Flutter's app_router.dart.
 */
@Composable
fun FagoDrawerContent(
    authState: AuthUiState,
    onNavigate: (String) -> Unit,
    onNavigateWeb: (String, String) -> Unit,
    onClose: () -> Unit
) {
    val items = listOf(
        DrawerMenuItem("CRM", "WhatsApp CRM Hub", "crm", Icons.Default.Chat, Color(0xFFFFD700)),
        DrawerMenuItem("RideO", "Ride & Cab Booking", "rideo", Icons.Default.DirectionsCar, Color(0xFF00F0FF)),
        DrawerMenuItem("DriveO", "Driver Dashboard", "drivo", Icons.Default.LocalShipping, Color(0xFFFF8C00)),
        DrawerMenuItem("RentO", "Farm Equipment Rental", "rento", Icons.Default.Agriculture, Color(0xFF00FF00)),
        DrawerMenuItem("Mandi", "APMC Live Market Rates", "mandi", Icons.Default.BarChart, Color(0xFFFFD700)),
        DrawerMenuItem("TourO", "Outstation & Tourism Cabs", "touro", Icons.Default.Luggage, Color(0xFFFF8C00)),
        DrawerMenuItem("TeachO", "Agri Courses & Training", "teacho", Icons.Default.School, Color(0xFF00F0FF)),
        DrawerMenuItem("TestO", "Soil & Water Lab Test", "testo", Icons.Default.Biotech, Color(0xFF7C3AED)),
        DrawerMenuItem("TvO", "Farming TV & Video News", "tvo", Icons.Default.PlayCircle, Color(0xFFF43F5E)),
        DrawerMenuItem("Gemini AI", "AI Krishi Assistant", "ai", Icons.Default.AutoAwesome, Color(0xFFFFD700)),
        DrawerMenuItem("MoneyO", "Agri Ledger & Finance", "web:moneyo:MoneyO - Agri Ledger", Icons.Default.AccountBalanceWallet, Color(0xFF00FF00)),
        DrawerMenuItem("TaskO", "Daily Tasks & Gig Work", "web:tasko:TaskO - Daily Tasks", Icons.Default.Task, Color(0xFF00F0FF)),
        DrawerMenuItem("ToolsO", "Calculators & Agri Tools", "web:toolso:ToolsO - Agri Calculators", Icons.Default.Build, Color(0xFFFF8C00)),
        DrawerMenuItem("Promo", "WhatsApp Status Generator", "promo", Icons.Default.Share, Color(0xFF25D366)),
        DrawerMenuItem("Admin CRM", "Driver Approval & WhatsApp CRM", "admin", Icons.Default.AdminPanelSettings, Color(0xFFFFD700)),
        DrawerMenuItem("Profile", "My Digital ID & Pass", "profile", Icons.Default.Person, Color.White)
    )

    ModalDrawerSheet(
        drawerContainerColor = Color(0xFF0F172A),
        drawerContentColor = Color.White
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("🚗 FAGO", color = Color(0xFFFFD700), fontSize = 28.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.width(8.dp))
                if (authState.role == UserRole.ADMIN) {
                    Surface(shape = RoundedCornerShape(6.dp), color = Color(0xFFFFD700).copy(alpha = 0.2f)) {
                        Text(" ADMIN ", color = Color(0xFFFFD700), fontWeight = FontWeight.Bold, fontSize = 10.sp, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                    }
                }
            }
            Text("Super App for Mobility & Agri", color = Color(0xFF00F0FF), fontSize = 12.sp)

            Spacer(Modifier.height(16.dp))
            HorizontalDivider(color = Color(0xFF334155))
            Spacer(Modifier.height(8.dp))

            LazyColumn(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                items(items) { item ->
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = Color(0xFF1E293B),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                onClose()
                                if (item.route.startsWith("web:")) {
                                    val parts = item.route.split(":")
                                    onNavigateWeb(parts[2], parts[1])
                                } else {
                                    onNavigate(item.route)
                                }
                            }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(item.icon, contentDescription = null, tint = item.color, modifier = Modifier.size(24.dp))
                            Spacer(Modifier.width(14.dp))
                            Column {
                                Text(item.title, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Text(item.subtitle, color = Color.Gray, fontSize = 11.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}
