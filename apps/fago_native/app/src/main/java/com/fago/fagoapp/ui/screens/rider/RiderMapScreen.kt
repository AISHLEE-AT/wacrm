package com.fago.fagoapp.ui.screens.rider

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.speech.RecognizerIntent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fago.fagoapp.data.RideRequestItem
import com.fago.fagoapp.data.SupabaseRepository
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.*
import kotlinx.coroutines.launch
import org.koin.compose.koinInject
import java.util.Locale
import kotlin.math.*
import kotlin.random.Random

data class VehicleCategoryItem(
    val key: String,
    val label: String,
    val baseFare: Double,
    val perKm: Double,
    val icon: ImageVector,
    val color: Color
)

data class HotspotItem(
    val taName: String,
    val enName: String,
    val address: String,
    val latLng: LatLng,
    val icon: String
)

/**
 * Uber & Rapido Parity RiderMapScreen — 100% Full-Screen Interactive Map Experience.
 * Features:
 *   - 100% Full-Screen Google Map Canvas (Edge-to-Edge)
 *   - Interactive Map Touch & Drag Location Picker (Animated Center Pin + Floating Confirmation Button)
 *   - Low-Literacy Friendly 1-Tap Landmark Quick Chips (Dual Tamil & English + Large Icons)
 *   - Dedicated Uber-Style Full-Screen Location Search Modal (Voice Search 🎤 + Auto Suggestions)
 *   - 0% Commission Fare Breakdown & Rapido SOS Safety Shield Modal
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RiderMapScreen(
    onOpenDrawer: () -> Unit,
    onNavigateCrm: () -> Unit = {},
    onNavigateDrivo: () -> Unit = {},
    onNavigateRento: () -> Unit = {},
    onNavigateMandi: () -> Unit = {},
    onNavigateTouro: () -> Unit = {},
    onNavigateTeacho: () -> Unit = {},
    onNavigateTesto: () -> Unit = {},
    onNavigateTvo: () -> Unit = {},
    onNavigateAi: () -> Unit = {},
    onNavigateProfile: () -> Unit = {}
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val supabaseRepo: SupabaseRepository = koinInject()
    val locationService: com.fago.fagoapp.services.LocationService = koinInject()

    var pickupLatLng by remember { mutableStateOf(LatLng(11.0168, 76.9558)) }
    var dropoffLatLng by remember { mutableStateOf(LatLng(11.0300, 77.0434)) }
    var pickupAddress by remember { mutableStateOf("Detecting GPS location...") }
    var dropoffAddress by remember { mutableStateOf("Coimbatore Airport (CJB), Peelamedu") }
    var riderName by remember { mutableStateOf("") }
    var riderPhone by remember { mutableStateOf("") }
    var selectedCategoryKey by remember { mutableStateOf("Bike") }
    var showConfirmSheet by remember { mutableStateOf(false) }
    var isPostingRide by remember { mutableStateOf(false) }

    // Map Pin Picker Mode: null = normal viewing, "pickup" = dragging to set pickup, "dropoff" = dragging to set dropoff
    var mapPinMode by remember { mutableStateOf<String?>(null) }
    var draggedAddress by remember { mutableStateOf("") }

    // Uber-style Dedicated Full-Screen Search Modal State
    var showSearchModal by remember { mutableStateOf(false) }
    var searchTargetField by remember { mutableStateOf("pickup") } // "pickup" or "dropoff"
    var searchQuery by remember { mutableStateOf("") }

    // Modals
    var showSosSheet by remember { mutableStateOf(false) }
    var showFareBreakdownSheet by remember { mutableStateOf(false) }
    var showAllModulesSheet by remember { mutableStateOf(false) }
    var activeSecurityOtp by remember { mutableStateOf<String?>(null) }

    val cameraPositionState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(pickupLatLng, 15f)
    }

    // Voice Search Speech Recognizer Launcher
    val voiceSpeechLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val spokenMatches = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
            if (!spokenMatches.isNullOrEmpty()) {
                val spokenText = spokenMatches[0]
                searchQuery = spokenText
                scope.launch {
                    val latLng = locationService.getLatLngFromAddress(spokenText)
                    if (latLng != null) {
                        if (searchTargetField == "pickup") {
                            pickupLatLng = latLng
                            pickupAddress = spokenText
                        } else {
                            dropoffLatLng = latLng
                            dropoffAddress = spokenText
                        }
                        cameraPositionState.animate(CameraUpdateFactory.newLatLngZoom(latLng, 15f))
                        showSearchModal = false
                    }
                }
            }
        }
    }

    fun launchVoiceSearch() {
        try {
            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, "ta_IN")
                putExtra(RecognizerIntent.EXTRA_PROMPT, "Speak location in Tamil or English (இடம் பேசுங்கள்)")
            }
            voiceSpeechLauncher.launch(intent)
        } catch (e: Exception) {
            // Speech recognition not supported or unavailable
        }
    }

    // Auto-fetch real device GPS location on launch
    LaunchedEffect(Unit) {
        val currentLoc = locationService.getCurrentLocation()
        if (currentLoc != null) {
            pickupLatLng = currentLoc
            cameraPositionState.animate(CameraUpdateFactory.newLatLngZoom(currentLoc, 15f))
            val resolvedAddress = locationService.getAddressFromLatLng(currentLoc)
            if (resolvedAddress.isNotEmpty()) {
                pickupAddress = resolvedAddress
            }
        } else {
            pickupAddress = "Coimbatore Junction Railway Station, Tamil Nadu"
        }
    }

    // Low-Literacy Bilingual Landmarks (Tamil + English + Big Visual Icons)
    val hotspots = listOf(
        HotspotItem("என் இருப்பிடம்", "My Location", pickupAddress, pickupLatLng, "📍"),
        HotspotItem("ரயில் நிலையம்", "Railway Station", "Coimbatore Junction Railway Station, Gopalapuram", LatLng(11.0017, 76.9629), "🚆"),
        HotspotItem("விமான நிலையம்", "Airport (CJB)", "Coimbatore International Airport, Peelamedu", LatLng(11.0300, 77.0434), "✈️"),
        HotspotItem("பேருந்து நிலையம்", "Bus Stand", "Gandhipuram Central Bus Stand, Coimbatore", LatLng(11.0183, 76.9673), "🚌"),
        HotspotItem("மருத்துவமனை", "KMCH Hospital", "Kovai Medical Center & Hospital, Avinashi Road", LatLng(11.0425, 77.0375), "🏥"),
        HotspotItem("அக்ரி சந்தை", "Agri Mandi Market", "Oddanchatram Vegetable Market, Dindigul", LatLng(10.4851, 77.7478), "🌾"),
        HotspotItem("தஞ்சை கோவில்", "Thanjavur Temple", "Brihadeeswarar Temple, Thanjavur", LatLng(10.7828, 79.1318), "🛕"),
        HotspotItem("ஊட்டி கார்டன்", "Ooty Botanical Garden", "Vannarapettai, Ooty, Nilgiris", LatLng(11.4150, 76.7110), "🏔️")
    )

    val vehicleCategories = listOf(
        VehicleCategoryItem("Bike",  "Bike (0% Comm)",   30.0,  10.0, Icons.Default.TwoWheeler,       Color(0xFFFF8C00)),
        VehicleCategoryItem("Auto",  "Auto Rickshaw",     50.0,  15.0, Icons.Default.ElectricRickshaw, Color(0xFFFFD700)),
        VehicleCategoryItem("Car",   "AC Sedan Car",     100.0, 22.0, Icons.Default.DirectionsCar,    Color(0xFF00F0FF)),
        VehicleCategoryItem("Van",   "Mini Van / Pickup",250.0, 35.0, Icons.Default.AirportShuttle,   Color(0xFFA855F7)),
        VehicleCategoryItem("Truck", "Agri Freight Truck",400.0, 50.0, Icons.Default.LocalShipping,   Color(0xFFF97316)),
        VehicleCategoryItem("Bus",   "Group Tour Bus",   600.0, 75.0, Icons.Default.DirectionsBus,    Color(0xFF10B981))
    )

    val selectedCat = vehicleCategories.find { it.key == selectedCategoryKey } ?: vehicleCategories[0]

    fun calculateDistanceKm(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        val p = 0.017453292519943295
        val a = 0.5 - cos((lat2 - lat1) * p) / 2 + cos(lat1 * p) * cos(lat2 * p) * (1 - cos((lon2 - lon1) * p)) / 2
        return 12742 * asin(sqrt(a))
    }

    val estimatedDistKm = calculateDistanceKm(
        pickupLatLng.latitude, pickupLatLng.longitude,
        dropoffLatLng.latitude, dropoffLatLng.longitude
    )
    val calculatedFare = max(selectedCat.baseFare, selectedCat.baseFare + (estimatedDistKm * selectedCat.perKm))

    // Real-Time Reverse Geocoding when map is being dragged in Pin Selection Mode
    LaunchedEffect(cameraPositionState.isMoving) {
        if (!cameraPositionState.isMoving && mapPinMode != null) {
            val target = cameraPositionState.position.target
            val address = locationService.getAddressFromLatLng(target)
            draggedAddress = address.ifEmpty { "Selected Location (${String.format("%.4f", target.latitude)}, ${String.format("%.4f", target.longitude)})" }
        }
    }

    Scaffold(
        containerColor = Color(0xFF0F172A),
        bottomBar = {
            NavigationBar(containerColor = Color(0xFF1E293B)) {
                NavigationBarItem(
                    selected = false,
                    onClick = onNavigateCrm,
                    icon = { Icon(Icons.Default.Chat, contentDescription = null) },
                    label = { Text("CRM", fontSize = 10.sp) },
                    colors = NavigationBarItemDefaults.colors(selectedIconColor = Color(0xFFFFD700))
                )
                NavigationBarItem(
                    selected = true,
                    onClick = { mapPinMode = null },
                    icon = { Icon(Icons.Default.DirectionsCar, contentDescription = null) },
                    label = { Text("RideO", fontSize = 10.sp) },
                    colors = NavigationBarItemDefaults.colors(selectedIconColor = Color(0xFF00F0FF), indicatorColor = Color(0xFF00F0FF).copy(alpha = 0.2f))
                )
                NavigationBarItem(
                    selected = false,
                    onClick = onNavigateDrivo,
                    icon = { Icon(Icons.Default.LocalShipping, contentDescription = null) },
                    label = { Text("DriveO", fontSize = 10.sp) },
                    colors = NavigationBarItemDefaults.colors(selectedIconColor = Color(0xFFFF8C00))
                )
                NavigationBarItem(
                    selected = false,
                    onClick = { showAllModulesSheet = true },
                    icon = { Icon(Icons.Default.GridView, contentDescription = null) },
                    label = { Text("Modules", fontSize = 10.sp) },
                    colors = NavigationBarItemDefaults.colors(selectedIconColor = Color(0xFF00FF00), indicatorColor = Color(0xFF00FF00).copy(alpha = 0.2f))
                )
                NavigationBarItem(
                    selected = false,
                    onClick = onNavigateProfile,
                    icon = { Icon(Icons.Default.Person, contentDescription = null) },
                    label = { Text("Profile", fontSize = 10.sp) },
                    colors = NavigationBarItemDefaults.colors(selectedIconColor = Color.White)
                )
            }
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            // ── 1. 100% EDGE-TO-EDGE FULL SCREEN MAP CANVAS ─────────────────────────
            GoogleMap(
                modifier = Modifier.fillMaxSize(),
                cameraPositionState = cameraPositionState,
                uiSettings = MapUiSettings(
                    zoomControlsEnabled = false,
                    myLocationButtonEnabled = false,
                    compassEnabled = true
                ),
                properties = MapProperties(isMyLocationEnabled = true)
            ) {
                // Pickup Marker (Green)
                if (mapPinMode != "pickup") {
                    Marker(
                        state = MarkerState(position = pickupLatLng),
                        title = "🟢 Pickup (ஏறும் இடம்)",
                        snippet = pickupAddress
                    )
                }
                // Dropoff Marker (Red)
                if (mapPinMode != "dropoff") {
                    Marker(
                        state = MarkerState(position = dropoffLatLng),
                        title = "🔴 Dropoff (இறங்கும் இடம்)",
                        snippet = dropoffAddress
                    )
                }
                // Route Polyline Connection
                Polyline(
                    points = listOf(pickupLatLng, dropoffLatLng),
                    color = Color(0xFF00FF00),
                    width = 8f
                )
            }

            // ── 2. INTERACTIVE CENTER MAP PIN PICKER (UBER / RAPIDO STYLE) ──────────
            if (mapPinMode != null) {
                // Animated Center Pin Marker
                Column(
                    modifier = Modifier.align(Alignment.Center),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Floating live address tooltip badge above center pin
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = Color(0xFF0F172A).copy(alpha = 0.92f),
                        border = androidx.compose.foundation.BorderStroke(
                            1.5.dp,
                            if (mapPinMode == "pickup") Color(0xFF00FF00) else Color(0xFFF43F5E)
                        ),
                        shadowElevation = 8.dp,
                        modifier = Modifier.padding(horizontal = 24.dp)
                    ) {
                        Text(
                            text = if (draggedAddress.isNotEmpty()) draggedAddress else "Drag map to select location...",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
                        )
                    }

                    Spacer(Modifier.height(6.dp))

                    // Big Animated Target Marker Pin
                    Icon(
                        imageVector = Icons.Default.LocationOn,
                        contentDescription = "Center Map Pin",
                        tint = if (mapPinMode == "pickup") Color(0xFF00FF00) else Color(0xFFF43F5E),
                        modifier = Modifier.size(48.dp)
                    )
                }

                // Bottom Floating Action Button: CONFIRM LOCATION HERE
                Column(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 20.dp, start = 20.dp, end = 20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Button(
                        onClick = {
                            val target = cameraPositionState.position.target
                            scope.launch {
                                val resolvedAddr = draggedAddress.ifEmpty { locationService.getAddressFromLatLng(target) }
                                if (mapPinMode == "pickup") {
                                    pickupLatLng = target
                                    pickupAddress = resolvedAddr
                                } else {
                                    dropoffLatLng = target
                                    dropoffAddress = resolvedAddr
                                }
                                mapPinMode = null
                            }
                        },
                        modifier = Modifier.fillMaxWidth().height(54.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (mapPinMode == "pickup") Color(0xFF00FF00) else Color(0xFFF43F5E)
                        ),
                        shape = RoundedCornerShape(16.dp),
                        elevation = ButtonDefaults.buttonElevation(defaultElevation = 8.dp)
                    ) {
                        Icon(Icons.Default.Check, contentDescription = null, tint = Color.Black)
                        Spacer(Modifier.width(8.dp))
                        Text(
                            if (mapPinMode == "pickup") "🟢 CONFIRM PICKUP HERE (இங்கே உறுதி செய்)"
                            else "🔴 CONFIRM DROPOFF HERE (இங்கே உறுதி செய்)",
                            color = Color.Black,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    }

                    Spacer(Modifier.height(8.dp))

                    TextButton(onClick = { mapPinMode = null }) {
                        Text("Cancel Map Picker (ரத்து)", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }
            }

            // ── 3. FLOATING TOP HEADER & QUICK ACTION BAR ───────────────────────────
            if (mapPinMode == null) {
                Column(
                    modifier = Modifier
                        .align(Alignment.TopCenter)
                        .fillMaxWidth()
                        .padding(top = 10.dp, start = 12.dp, end = 12.dp)
                ) {
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = Color(0xFF0F172A).copy(alpha = 0.92f),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFFD700).copy(alpha = 0.4f)),
                        shadowElevation = 6.dp,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                IconButton(onClick = onOpenDrawer) {
                                    Icon(Icons.Default.Menu, contentDescription = "Menu", tint = Color(0xFFFFD700))
                                }
                                Column {
                                    Text("🚖 RideO Super App", color = Color(0xFFFFD700), fontWeight = FontWeight.Bold, fontSize = 15.sp)
                                    Text("0% Commission Mobility", color = Color(0xFF00FF00), fontSize = 10.sp)
                                }
                            }

                            Row {
                                IconButton(onClick = { showAllModulesSheet = true }) {
                                    Icon(Icons.Default.GridView, contentDescription = "Modules", tint = Color(0xFF00FF00))
                                }
                                IconButton(onClick = { showSosSheet = true }) {
                                    Icon(Icons.Default.Shield, contentDescription = "SOS Shield", tint = Color(0xFFF43F5E))
                                }
                            }
                        }
                    }

                    Spacer(Modifier.height(8.dp))

                    // ── 4. LOW-LITERACY 1-TAP BILINGUAL LANDMARK QUICK CHIPS ─────────
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        contentPadding = PaddingValues(horizontal = 4.dp)
                    ) {
                        items(hotspots) { hs ->
                            Surface(
                                shape = RoundedCornerShape(24.dp),
                                color = Color(0xFF1E293B).copy(alpha = 0.95f),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFFD700).copy(alpha = 0.6f)),
                                shadowElevation = 4.dp,
                                modifier = Modifier.clickable {
                                    dropoffAddress = hs.address
                                    dropoffLatLng = hs.latLng
                                    scope.launch {
                                        cameraPositionState.animate(CameraUpdateFactory.newLatLngZoom(hs.latLng, 15f))
                                    }
                                }
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 7.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(hs.icon, fontSize = 16.sp)
                                    Spacer(Modifier.width(6.dp))
                                    Column {
                                        Text(hs.taName, color = Color(0xFFFFD700), fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                        Text(hs.enName, color = Color.White, fontSize = 9.sp)
                                    }
                                }
                            }
                        }
                    }
                }

                // Floating My GPS Location Button
                FloatingActionButton(
                    onClick = {
                        scope.launch {
                            val currentLoc = locationService.getCurrentLocation()
                            if (currentLoc != null) {
                                pickupLatLng = currentLoc
                                pickupAddress = locationService.getAddressFromLatLng(currentLoc)
                                cameraPositionState.animate(CameraUpdateFactory.newLatLngZoom(currentLoc, 16f))
                            }
                        }
                    },
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(bottom = 260.dp, end = 16.dp),
                    containerColor = Color(0xFF1E293B),
                    contentColor = Color(0xFF00FF00)
                ) {
                    Icon(Icons.Default.MyLocation, contentDescription = "My GPS Location")
                }

                // ── 5. UBER-STYLE FLOATING BOTTOM CONTROL CARD ───────────────────────
                Surface(
                    shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
                    color = Color(0xFF0F172A).copy(alpha = 0.96f),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.1f)),
                    shadowElevation = 16.dp,
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        // Pickup & Dropoff Quick Touch Search Bars
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            // 🟢 Pickup Touch Box
                            Surface(
                                shape = RoundedCornerShape(14.dp),
                                color = Color(0xFF1E293B),
                                border = androidx.compose.foundation.BorderStroke(1.5.dp, Color(0xFF00FF00)),
                                modifier = Modifier
                                    .weight(1f)
                                    .clickable {
                                        searchTargetField = "pickup"
                                        showSearchModal = true
                                    }
                            ) {
                                Row(
                                    modifier = Modifier.padding(10.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(Icons.Default.Circle, contentDescription = null, tint = Color(0xFF00FF00), modifier = Modifier.size(12.dp))
                                    Spacer(Modifier.width(8.dp))
                                    Column {
                                        Text("🟢 PICKUP (ஏறும் இடம்)", color = Color(0xFF00FF00), fontWeight = FontWeight.Bold, fontSize = 9.sp)
                                        Text(pickupAddress, color = Color.White, fontSize = 11.sp, maxLines = 1)
                                    }
                                }
                            }

                            // 🔴 Dropoff Touch Box
                            Surface(
                                shape = RoundedCornerShape(14.dp),
                                color = Color(0xFF1E293B),
                                border = androidx.compose.foundation.BorderStroke(1.5.dp, Color(0xFFF43F5E)),
                                modifier = Modifier
                                    .weight(1f)
                                    .clickable {
                                        searchTargetField = "dropoff"
                                        showSearchModal = true
                                    }
                            ) {
                                Row(
                                    modifier = Modifier.padding(10.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(Icons.Default.LocationOn, contentDescription = null, tint = Color(0xFFF43F5E), modifier = Modifier.size(14.dp))
                                    Spacer(Modifier.width(8.dp))
                                    Column {
                                        Text("🔴 DROPOFF (இறங்கும் இடம்)", color = Color(0xFFF43F5E), fontWeight = FontWeight.Bold, fontSize = 9.sp)
                                        Text(dropoffAddress, color = Color.White, fontSize = 11.sp, maxLines = 1)
                                    }
                                }
                            }
                        }

                        // Touch Map Picker Buttons (Direct Map Touch Selection)
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedButton(
                                onClick = {
                                    mapPinMode = "pickup"
                                    cameraPositionState.position = CameraPosition.fromLatLngZoom(pickupLatLng, 16f)
                                },
                                modifier = Modifier.weight(1f).height(38.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF00FF00)),
                                contentPadding = PaddingValues(horizontal = 6.dp)
                            ) {
                                Icon(Icons.Default.TouchApp, contentDescription = null, tint = Color(0xFF00FF00), modifier = Modifier.size(16.dp))
                                Spacer(Modifier.width(4.dp))
                                Text("Touch Map Pickup", color = Color(0xFF00FF00), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                            }

                            OutlinedButton(
                                onClick = {
                                    mapPinMode = "dropoff"
                                    cameraPositionState.position = CameraPosition.fromLatLngZoom(dropoffLatLng, 16f)
                                },
                                modifier = Modifier.weight(1f).height(38.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF43F5E)),
                                contentPadding = PaddingValues(horizontal = 6.dp)
                            ) {
                                Icon(Icons.Default.TouchApp, contentDescription = null, tint = Color(0xFFF43F5E), modifier = Modifier.size(16.dp))
                                Spacer(Modifier.width(4.dp))
                                Text("Touch Map Dropoff", color = Color(0xFFF43F5E), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                            }
                        }

                        // Vehicle Category Selector Chips
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            items(vehicleCategories) { cat ->
                                val isSel = cat.key == selectedCategoryKey
                                Surface(
                                    shape = RoundedCornerShape(12.dp),
                                    color = if (isSel) cat.color.copy(alpha = 0.2f) else Color(0xFF1E293B),
                                    modifier = Modifier
                                        .border(width = if (isSel) 2.dp else 1.dp, color = if (isSel) cat.color else Color(0xFF334155), shape = RoundedCornerShape(12.dp))
                                        .clickable { selectedCategoryKey = cat.key }
                                ) {
                                    Row(modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                                        Icon(cat.icon, contentDescription = null, tint = cat.color, modifier = Modifier.size(16.dp))
                                        Spacer(Modifier.width(6.dp))
                                        Text(cat.label, color = if (isSel) cat.color else Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                    }
                                }
                            }
                        }

                        // Fare Box
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = Color(0xFF1E293B),
                            modifier = Modifier.fillMaxWidth().clickable { showFareBreakdownSheet = true }
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text("Estimated Fare (0% Commission):", color = Color.Gray, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                    Text("${selectedCat.label} • ${String.format("%.1f", estimatedDistKm)} km", color = Color.White, fontSize = 12.sp)
                                }
                                Text("₹${calculatedFare.toInt()}", color = Color(0xFF00FF00), fontSize = 20.sp, fontWeight = FontWeight.Bold)
                            }
                        }

                        // Confirm & Book Button
                        Button(
                            onClick = { showConfirmSheet = true },
                            modifier = Modifier.fillMaxWidth().height(48.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFD700)),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color.Black)
                            Spacer(Modifier.width(8.dp))
                            Text("BOOK ${selectedCat.key.uppercase()} RIDE VIA WHATSAPP", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                    }
                }
            }
        }
    }

    // ── 6. DEDICATED UBER-STYLE FULL-SCREEN LOCATION SEARCH MODAL ────────────────
    if (showSearchModal) {
        ModalBottomSheet(
            onDismissRequest = { showSearchModal = false },
            containerColor = Color(0xFF0F172A),
            modifier = Modifier.fillMaxHeight(0.9f)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Title Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        if (searchTargetField == "pickup") "🟢 Choose Pickup Place (ஏறும் இடம்)"
                        else "🔴 Choose Dropoff Place (இறங்கும் இடம்)",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                    IconButton(onClick = { showSearchModal = false }) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = Color.White)
                    }
                }

                // Search Input with 🎤 Voice Search Button
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Search location, bus stand, station...", color = Color.Gray) },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Color(0xFFFFD700)) },
                    trailingIcon = {
                        Row {
                            if (searchQuery.isNotEmpty()) {
                                IconButton(onClick = { searchQuery = "" }) {
                                    Icon(Icons.Default.Clear, contentDescription = "Clear", tint = Color.Gray)
                                }
                            }
                            // 🎤 Voice Search Button
                            IconButton(onClick = { launchVoiceSearch() }) {
                                Icon(Icons.Default.Mic, contentDescription = "Voice Search", tint = Color(0xFF00FF00))
                            }
                        }
                    },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFFFFD700),
                        unfocusedBorderColor = Color(0xFF334155),
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    )
                )

                // Quick Action: "Touch & Select on Map" Option
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFF1E293B),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF00F0FF)),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            showSearchModal = false
                            mapPinMode = searchTargetField
                        }
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.TouchApp, contentDescription = null, tint = Color(0xFF00F0FF))
                        Spacer(Modifier.width(12.dp))
                        Column {
                            Text("📍 Touch & Move Location Pin on Map", color = Color(0xFF00F0FF), fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Text("வரைபடத்தில் தொட்டு இடம் தேர்ந்தெடு", color = Color.Gray, fontSize = 11.sp)
                        }
                    }
                }

                Text("Popular Places & Landmarks (பிரபல இடங்கள்):", color = Color.Gray, fontSize = 12.sp, fontWeight = FontWeight.Bold)

                // Landmark List Filtered by Search Query
                val filteredHotspots = hotspots.filter {
                    searchQuery.isEmpty() ||
                    it.taName.contains(searchQuery, ignoreCase = true) ||
                    it.enName.contains(searchQuery, ignoreCase = true) ||
                    it.address.contains(searchQuery, ignoreCase = true)
                }

                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    items(filteredHotspots) { hs ->
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = Color(0xFF1E293B),
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    if (searchTargetField == "pickup") {
                                        pickupLatLng = hs.latLng
                                        pickupAddress = hs.address
                                    } else {
                                        dropoffLatLng = hs.latLng
                                        dropoffAddress = hs.address
                                    }
                                    scope.launch {
                                        cameraPositionState.animate(CameraUpdateFactory.newLatLngZoom(hs.latLng, 15f))
                                    }
                                    showSearchModal = false
                                }
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(hs.icon, fontSize = 22.sp)
                                Spacer(Modifier.width(12.dp))
                                Column {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(hs.taName, color = Color(0xFFFFD700), fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                        Spacer(Modifier.width(6.dp))
                                        Text("• ${hs.enName}", color = Color.White, fontSize = 11.sp)
                                    }
                                    Text(hs.address, color = Color.Gray, fontSize = 11.sp, maxLines = 1)
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // ── 7. RAPIDO SOS SAFETY SHEET ──────────────────────────────────────────
    if (showSosSheet) {
        ModalBottomSheet(
            onDismissRequest = { showSosSheet = false },
            containerColor = Color(0xFF1E293B)
        ) {
            Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Shield, contentDescription = null, tint = Color(0xFFF43F5E), modifier = Modifier.size(28.dp))
                    Spacer(Modifier.width(10.dp))
                    Text("🚨 FAGO Safety Shield & SOS", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                }
                Text("Your safety is our top priority. Choose an emergency action below:", color = Color.Gray, fontSize = 12.sp)

                Spacer(Modifier.height(8.dp))

                Button(
                    onClick = {
                        showSosSheet = false
                        context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("tel:112")))
                    },
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF43F5E))
                ) {
                    Icon(Icons.Default.Call, contentDescription = null, tint = Color.White)
                    Spacer(Modifier.width(8.dp))
                    Text("CALL POLICE EMERGENCY (112)", color = Color.White, fontWeight = FontWeight.Bold)
                }

                Button(
                    onClick = {
                        showSosSheet = false
                        val mapLink = "https://maps.google.com/?q=${pickupLatLng.latitude},${pickupLatLng.longitude}"
                        val text = Uri.encode("🚨 EMERGENCY SOS ALERT from FAGO Rider!\nI need urgent help at my live location: $pickupAddress\n📍 Live GPS Map: $mapLink")
                        context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/?text=$text")))
                    },
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF25D366))
                ) {
                    Icon(Icons.Default.Share, contentDescription = null, tint = Color.White)
                    Spacer(Modifier.width(8.dp))
                    Text("SHARE LIVE GPS LOCATION ON WHATSAPP", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
            }
        }
    }

    // ── 8. FARE BREAKDOWN SHEET ─────────────────────────────────────────────
    if (showFareBreakdownSheet) {
        ModalBottomSheet(
            onDismissRequest = { showFareBreakdownSheet = false },
            containerColor = Color(0xFF1E293B)
        ) {
            Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("📊 Fare Breakdown (${selectedCat.key})", color = Color(0xFFFFD700), fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Spacer(Modifier.height(6.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Base Fare", color = Color.Gray)
                    Text("₹${selectedCat.baseFare.toInt()}", color = Color.White)
                }
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Distance Charge (${String.format("%.1f", estimatedDistKm)} km @ ₹${selectedCat.perKm.toInt()}/km)", color = Color.Gray)
                    Text("₹${(estimatedDistKm * selectedCat.perKm).toInt()}", color = Color.White)
                }
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Platform Fee (0% Commission)", color = Color(0xFF00FF00), fontWeight = FontWeight.Bold)
                    Text("₹0 FREE", color = Color(0xFF00FF00), fontWeight = FontWeight.Bold)
                }
                HorizontalDivider(color = Color.White.copy(alpha = 0.12f), modifier = Modifier.padding(vertical = 8.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Total Estimated Fare", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Text("₹${calculatedFare.toInt()}", color = Color(0xFF00FF00), fontWeight = FontWeight.Bold, fontSize = 18.sp)
                }
            }
        }
    }

    // Confirmation Modal Sheet
    if (showConfirmSheet) {
        ModalBottomSheet(
            onDismissRequest = { showConfirmSheet = false },
            containerColor = Color(0xFF1E293B)
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text("Confirm ${selectedCat.label} Booking", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                Text("Pickup: $pickupAddress", color = Color.Gray, fontSize = 12.sp)
                Text("Dropoff: $dropoffAddress", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                Text("Fare: ₹${calculatedFare.toInt()}", color = Color(0xFF00FF00), fontSize = 20.sp, fontWeight = FontWeight.Bold)

                OutlinedTextField(
                    value = riderName,
                    onValueChange = { riderName = it },
                    label = { Text("Your Name", color = Color.Gray) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Color(0xFFFFD700), unfocusedBorderColor = Color(0xFF334155), focusedTextColor = Color.White, unfocusedTextColor = Color.White)
                )

                OutlinedTextField(
                    value = riderPhone,
                    onValueChange = { riderPhone = it },
                    label = { Text("WhatsApp Phone Number", color = Color.Gray) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Color(0xFF00FF00), unfocusedBorderColor = Color(0xFF334155), focusedTextColor = Color.White, unfocusedTextColor = Color.White)
                )

                Button(
                    onClick = {
                        isPostingRide = true
                        scope.launch {
                            val rName = riderName.ifBlank { "Rider" }
                            val rPhone = riderPhone.ifBlank { "+919486335870" }
                            val generatedPin = (1000 + Random.nextInt(9000)).toString()
                            activeSecurityOtp = generatedPin

                            supabaseRepo.saveCrmContact(null, rName, rPhone, "Rider", pickupAddress, selectedCat.key)

                            val rideItem = RideRequestItem(
                                id = "RIDE_${System.currentTimeMillis()}",
                                riderId = "RIDER_001",
                                riderPhone = "$rName ($rPhone)",
                                pickupAddress = pickupAddress,
                                dropoffAddress = dropoffAddress,
                                pickupLat = pickupLatLng.latitude,
                                pickupLng = pickupLatLng.longitude,
                                dropoffLat = dropoffLatLng.latitude,
                                dropoffLng = dropoffLatLng.longitude,
                                vehicleCategory = selectedCat.key,
                                estimatedFare = calculatedFare,
                                status = "requested"
                            )
                            supabaseRepo.createRideRequest(rideItem)

                            val msgText = Uri.encode(
                                "🚖 *RIDEO 0% COMMISSION RIDE REQUEST* 🚖\n\n" +
                                "🔑 *START TRIP SECURITY PIN*: $generatedPin\n" +
                                "👤 *Rider Name*: $rName\n" +
                                "📞 *Contact*: $rPhone\n" +
                                "🚘 *Vehicle Category*: ${selectedCat.label}\n" +
                                "📍 *Pickup*: $pickupAddress\n" +
                                "📍 *Dropoff*: $dropoffAddress\n" +
                                "💵 *Estimated Fare*: ₹${calculatedFare.toInt()}\n\n" +
                                "👉 Driver / Support: Please confirm ride assignment!"
                            )
                            val waUri = Uri.parse("https://api.whatsapp.com/send?phone=916381029380&text=$msgText")
                            context.startActivity(Intent(Intent.ACTION_VIEW, waUri))

                            isPostingRide = false
                            showConfirmSheet = false
                        }
                    },
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF25D366)),
                    shape = RoundedCornerShape(12.dp),
                    enabled = !isPostingRide
                ) {
                    Text("CONFIRM & NOTIFY DRIVERS VIA WHATSAPP", color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        }
    }

    // All Modules GridView Sheet
    if (showAllModulesSheet) {
        ModalBottomSheet(
            onDismissRequest = { showAllModulesSheet = false },
            containerColor = Color(0xFF0F172A)
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("🚀 All FAGO Modules", color = Color(0xFFFFD700), fontWeight = FontWeight.Bold, fontSize = 20.sp)
                        Text("Explore 12+ Super App Services", color = Color.Gray, fontSize = 12.sp)
                    }
                    IconButton(onClick = { showAllModulesSheet = false }) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = Color.White)
                    }
                }

                data class ModuleGridItem(val title: String, val subtitle: String, val icon: String, val color: Color, val onClick: () -> Unit)

                val modulesList = listOf(
                    ModuleGridItem("RideO", "0% Comm Rides", "🚲", Color(0xFF00F0FF)) { showAllModulesSheet = false },
                    ModuleGridItem("DriveO", "Captain Partner", "🚖", Color(0xFFFF8C00)) { showAllModulesSheet = false; onNavigateDrivo() },
                    ModuleGridItem("RentO", "Farm Equipment", "🚜", Color(0xFF10B981)) { showAllModulesSheet = false; onNavigateRento() },
                    ModuleGridItem("Mandi Prices", "Agri Rates", "🌾", Color(0xFFFFD700)) { showAllModulesSheet = false; onNavigateMandi() },
                    ModuleGridItem("TourO", "Tamil Tours", "🛕", Color(0xFFA855F7)) { showAllModulesSheet = false; onNavigateTouro() },
                    ModuleGridItem("TeachO", "Tamil Lessons", "🎓", Color(0xFF3B82F6)) { showAllModulesSheet = false; onNavigateTeacho() },
                    ModuleGridItem("TestO", "TNPSC Prep", "📝", Color(0xFFEC4899)) { showAllModulesSheet = false; onNavigateTesto() },
                    ModuleGridItem("TvO", "Live TV & News", "📺", Color(0xFFEF4444)) { showAllModulesSheet = false; onNavigateTvo() },
                    ModuleGridItem("Gemini AI", "Smart Assistant", "🤖", Color(0xFF8B5CF6)) { showAllModulesSheet = false; onNavigateAi() },
                    ModuleGridItem("WhatsApp CRM", "Customer Portal", "👑", Color(0xFFFFD700)) { showAllModulesSheet = false; onNavigateCrm() },
                    ModuleGridItem("My Profile", "Digital ID & UPI", "👤", Color.White) { showAllModulesSheet = false; onNavigateProfile() },
                )

                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    val rows = modulesList.chunked(2)
                    rows.forEach { rowItems ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            rowItems.forEach { mod ->
                                Surface(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clickable { mod.onClick() },
                                    shape = RoundedCornerShape(16.dp),
                                    color = Color(0xFF1E293B),
                                    border = androidx.compose.foundation.BorderStroke(1.dp, mod.color.copy(alpha = 0.4f))
                                ) {
                                    Row(
                                        modifier = Modifier.padding(14.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                                    ) {
                                        Text(mod.icon, fontSize = 24.sp)
                                        Column {
                                            Text(mod.title, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                            Text(mod.subtitle, color = Color.Gray, fontSize = 10.sp, maxLines = 1)
                                        }
                                    }
                                }
                            }
                            if (rowItems.size == 1) {
                                Spacer(Modifier.weight(1f))
                            }
                        }
                    }
                }
            }
        }
    }
}
