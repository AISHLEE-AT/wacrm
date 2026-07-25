package com.fago.fagoapp.ui.screens.admin

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fago.fagoapp.data.SupabaseRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.serialization.json.*
import org.koin.compose.koinInject

/**
 * AdminCrmScreen.kt — Native Android Jetpack Compose Admin CRM Module.
 * Full parity with Flutter's AdminCrmScreen.
 * Features:
 *   - Driver Management & 1-Click Verification / Approval
 *   - WhatsApp CRM Contact Search & 1-Tap Quick Decision Templates
 *   - Direct 1-Click WhatsApp launcher
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminCrmScreen(
    onBack: () -> Unit,
    onSignOut: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val supabaseClient: SupabaseClient = koinInject()
    val supabaseRepo: SupabaseRepository = koinInject()

    var selectedTab by remember { mutableIntStateOf(0) } // 0: Drivers, 1: Contacts

    // Drivers state
    var driversList by remember { mutableStateOf<List<JsonObject>>(emptyList()) }
    var isLoadingDrivers by remember { mutableStateOf(true) }
    var driverFilter by remember { mutableStateOf("All") }

    // Contacts state
    var contactsList by remember { mutableStateOf<List<JsonObject>>(emptyList()) }
    var isLoadingContacts by remember { mutableStateOf(true) }
    var searchQuery by remember { mutableStateOf("") }
    var selectedContactForAction by remember { mutableStateOf<JsonObject?>(null) }
    var customMsgText by remember { mutableStateOf("") }

    // Fetch Drivers from Supabase
    fun fetchDrivers() {
        isLoadingDrivers = true
        scope.launch(Dispatchers.IO) {
            try {
                val res = supabaseClient.postgrest["drivers"]
                    .select { order("created_at", io.github.jan.supabase.postgrest.query.Order.DESCENDING) }
                    .decodeList<JsonObject>()
                withContext(Dispatchers.Main) {
                    driversList = res
                    isLoadingDrivers = false
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    isLoadingDrivers = false
                }
            }
        }
    }

    // Fetch Contacts from Supabase
    fun fetchContacts() {
        isLoadingContacts = true
        scope.launch(Dispatchers.IO) {
            try {
                val res = supabaseClient.postgrest["contacts"]
                    .select { order("created_at", io.github.jan.supabase.postgrest.query.Order.DESCENDING) }
                    .decodeList<JsonObject>()
                withContext(Dispatchers.Main) {
                    contactsList = res
                    isLoadingContacts = false
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    isLoadingContacts = false
                }
            }
        }
    }

    LaunchedEffect(Unit) {
        fetchDrivers()
        fetchContacts()
    }

    fun openWhatsAppMsg(phoneStr: String, text: String) {
        val clean = phoneStr.filter { it.isDigit() }
        val encoded = Uri.encode(text)
        val uri = Uri.parse("https://api.whatsapp.com/send?phone=$clean&text=$encoded")
        context.startActivity(Intent(Intent.ACTION_VIEW, uri))
    }

    Scaffold(
        containerColor = Color(0xFF0F172A),
        topBar = {
            TopAppBar(
                title = { Text("👑 Admin CRM & Driver Radar", color = Color(0xFFFFD700), fontWeight = FontWeight.Bold, fontSize = 16.sp) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF1E293B)),
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color(0xFFFFD700))
                    }
                },
                actions = {
                    IconButton(onClick = { fetchDrivers(); fetchContacts() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = Color(0xFF00FF00))
                    }
                    IconButton(onClick = onSignOut) {
                        Icon(Icons.AutoMirrored.Filled.Logout, contentDescription = "Sign Out", tint = Color(0xFFF43F5E))
                    }
                }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {

            // Tab Selector Row
            Row(modifier = Modifier.fillMaxWidth().background(Color(0xFF1E293B))) {
                Surface(
                    color = if (selectedTab == 0) Color(0xFFFFD700) else Color(0xFF1E293B),
                    modifier = Modifier.weight(1f).clickable { selectedTab = 0 }
                ) {
                    Box(contentAlignment = Alignment.Center, modifier = Modifier.padding(vertical = 12.dp)) {
                        Text("🚚 Driver Management", color = if (selectedTab == 0) Color.Black else Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                }
                Surface(
                    color = if (selectedTab == 1) Color(0xFFFFD700) else Color(0xFF1E293B),
                    modifier = Modifier.weight(1f).clickable { selectedTab = 1 }
                ) {
                    Box(contentAlignment = Alignment.Center, modifier = Modifier.padding(vertical = 12.dp)) {
                        Text("💬 WhatsApp CRM", color = if (selectedTab == 1) Color.Black else Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                }
            }

            if (selectedTab == 0) {
                // ── DRIVERS TAB ──────────────────────────────────────────────
                val filteredDrivers = driversList.filter { d ->
                    val isVer = d["is_verified"]?.jsonPrimitive?.booleanOrNull ?: false
                    when (driverFilter) {
                        "Pending"  -> !isVer
                        "Approved" -> isVer
                        else       -> true
                    }
                }

                Row(modifier = Modifier.padding(12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("All", "Pending", "Approved").forEach { filter ->
                        val isSel = driverFilter == filter
                        Surface(
                            shape = RoundedCornerShape(20.dp),
                            color = if (isSel) Color(0xFFFFD700) else Color(0xFF1E293B),
                            modifier = Modifier.clickable { driverFilter = filter }
                        ) {
                            Text(
                                "$filter Drivers",
                                color = if (isSel) Color.Black else Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp,
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
                            )
                        }
                    }
                }

                if (isLoadingDrivers) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = Color(0xFF00FF00))
                    }
                } else if (filteredDrivers.isEmpty()) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("No drivers found matching filter.", color = Color.Gray)
                    }
                } else {
                    LazyColumn(modifier = Modifier.fillMaxSize().padding(horizontal = 12.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        items(filteredDrivers) { d ->
                            val driverId   = d["id"]?.jsonPrimitive?.content ?: ""
                            val driverName = d["driver_name"]?.jsonPrimitive?.content ?: "Driver Partner"
                            val phone      = d["mobile_number"]?.jsonPrimitive?.content ?: ""
                            val vehicle    = d["vehicle_number"]?.jsonPrimitive?.content ?: "Vehicle"
                            val isVerified = d["is_verified"]?.jsonPrimitive?.booleanOrNull ?: false

                            Surface(
                                shape = RoundedCornerShape(16.dp),
                                color = Color(0xFF1E293B),
                                modifier = Modifier.fillMaxWidth().border(1.dp, Color(0xFF334155), RoundedCornerShape(16.dp))
                            ) {
                                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Row(horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                                        Text(driverName, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                                        Surface(
                                            shape = RoundedCornerShape(10.dp),
                                            color = if (isVerified) Color(0xFF00FF00).copy(alpha = 0.2f) else Color(0xFFFFD700).copy(alpha = 0.2f)
                                        ) {
                                            Text(
                                                if (isVerified) "VERIFIED" else "PENDING",
                                                color = if (isVerified) Color(0xFF00FF00) else Color(0xFFFFD700),
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 10.sp,
                                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 3.dp)
                                            )
                                        }
                                    }
                                    Text("📱 Mobile: +91 $phone • 🚗 Vehicle: $vehicle", color = Color.Gray, fontSize = 12.sp)

                                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                        if (!isVerified) {
                                            Button(
                                                onClick = {
                                                    scope.launch {
                                                        supabaseRepo.fastApproveDriver(driverId, driverName)
                                                        fetchDrivers()
                                                        openWhatsAppMsg(
                                                            phone,
                                                            "🎉 *CONGRATULATIONS! DRIVER PROFILE APPROVED* 🎉\n\n" +
                                                            "Your DriveO Driver Partner profile on FAGO Super App has been verified by Area Admin.\n" +
                                                            "You can now go online, accept rides with 0% commission!\n\n" +
                                                            "🔗 Open App: https://watscrm.vercel.app"
                                                        )
                                                    }
                                                },
                                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00FF00)),
                                                modifier = Modifier.weight(1f)
                                            ) {
                                                Text("APPROVE DRIVER", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                            }
                                        }
                                        OutlinedButton(
                                            onClick = { openWhatsAppMsg(phone, "Hello $driverName! This is FAGO Admin regarding your vehicle ($vehicle):") },
                                            modifier = Modifier.weight(1f)
                                        ) {
                                            Icon(Icons.Default.Chat, contentDescription = null, tint = Color(0xFF25D366), modifier = Modifier.size(14.dp))
                                            Spacer(Modifier.width(4.dp))
                                            Text("WHATSAPP CHAT", color = Color(0xFF25D366), fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                // ── WHATSAPP CRM CONTACTS TAB ────────────────────────────────
                val filteredContacts = contactsList.filter { c ->
                    val name  = c["name"]?.jsonPrimitive?.content?.lowercase() ?: ""
                    val phone = c["phone"]?.jsonPrimitive?.content?.lowercase() ?: ""
                    val role  = c["role"]?.jsonPrimitive?.content?.lowercase() ?: ""
                    val query = searchQuery.lowercase().trim()
                    query.isEmpty() || name.contains(query) || phone.contains(query) || role.contains(query)
                }

                Column(modifier = Modifier.fillMaxSize().padding(12.dp)) {
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        label = { Text("Search CRM contacts by name, phone (+91), or role...", color = Color.Gray, fontSize = 11.sp) },
                        leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Color(0xFFFFD700)) },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Color(0xFFFFD700), unfocusedBorderColor = Color(0xFF334155), focusedTextColor = Color.White, unfocusedTextColor = Color.White)
                    )

                    Spacer(Modifier.height(10.dp))

                    if (isLoadingContacts) {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator(color = Color(0xFF00FF00))
                        }
                    } else if (filteredContacts.isEmpty()) {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            Text("No CRM contacts found.", color = Color.Gray)
                        }
                    } else {
                        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            items(filteredContacts) { c ->
                                val name     = c["name"]?.jsonPrimitive?.content ?: "App User"
                                val phone    = c["phone"]?.jsonPrimitive?.content ?: ""
                                val role     = c["role"]?.jsonPrimitive?.content ?: "User"
                                val category = c["last_vehicle_category"]?.jsonPrimitive?.content ?: "General"

                                Surface(
                                    shape = RoundedCornerShape(14.dp),
                                    color = Color(0xFF1E293B),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                                        Surface(
                                            shape = androidx.compose.foundation.shape.CircleShape,
                                            color = if (role == "Driver") Color(0xFFFF8C00).copy(alpha = 0.2f) else Color(0xFF00F0FF).copy(alpha = 0.2f)
                                        ) {
                                            Box(modifier = Modifier.padding(10.dp)) {
                                                Icon(
                                                    if (role == "Driver") Icons.Default.LocalShipping else Icons.Default.Person,
                                                    contentDescription = null,
                                                    tint = if (role == "Driver") Color(0xFFFF8C00) else Color(0xFF00F0FF),
                                                    modifier = Modifier.size(20.dp)
                                                )
                                            }
                                        }
                                        Spacer(Modifier.width(12.dp))
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(name, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                            Text("+91 $phone • Role: $role • Category: $category", color = Color.Gray, fontSize = 11.sp)
                                        }
                                        Button(
                                            onClick = { selectedContactForAction = c },
                                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF25D366)),
                                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                                        ) {
                                            Text("ACTIONS", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 10.sp)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Quick Admin Decision Sheet Modal
    if (selectedContactForAction != null) {
        val contact = selectedContactForAction!!
        val name  = contact["name"]?.jsonPrimitive?.content ?: "User"
        val phone = contact["phone"]?.jsonPrimitive?.content ?: ""

        ModalBottomSheet(
            onDismissRequest = { selectedContactForAction = null },
            containerColor = Color(0xFF1E293B)
        ) {
            Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Quick Admin Decision: $name", color = Color(0xFFFFD700), fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Text("Phone: +91 $phone • Role: ${contact["role"]?.jsonPrimitive?.content ?: "User"}", color = Color.White.copy(alpha = 0.7f), fontSize = 12.sp)

                Spacer(Modifier.height(8.dp))

                Button(
                    onClick = {
                        selectedContactForAction = null
                        openWhatsAppMsg(phone, "👋 Hello $name! Welcome to FAGO Super App. Your account is active. Book 0% commission rides & farm rentals anytime!\n🔗 https://watscrm.vercel.app")
                    },
                    modifier = Modifier.fillMaxWidth().height(44.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00FF00))
                ) {
                    Text("✅ Send Welcome & Welcome Guide", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }

                Button(
                    onClick = {
                        selectedContactForAction = null
                        openWhatsAppMsg(phone, "📍 Hello $name! FAGO Admin needs your live GPS location for local pincode service verification. Please reply with your location pin!")
                    },
                    modifier = Modifier.fillMaxWidth().height(44.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0369A1))
                ) {
                    Text("📍 Request Live Location Pin", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }

                Button(
                    onClick = {
                        selectedContactForAction = null
                        openWhatsAppMsg(phone, "💳 Hello $name! Your FAGO UPI settlement receipt has been processed. Pay/Receive via UPI: 9486335870@hdfcbank.")
                    },
                    modifier = Modifier.fillMaxWidth().height(44.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFD700))
                ) {
                    Text("💳 Send Payment / Settlement Link", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }

                Spacer(Modifier.height(8.dp))

                OutlinedTextField(
                    value = customMsgText,
                    onValueChange = { customMsgText = it },
                    label = { Text("Type custom WhatsApp admin message...", color = Color.Gray, fontSize = 11.sp) },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Color(0xFF00FF00), unfocusedBorderColor = Color(0xFF334155), focusedTextColor = Color.White, unfocusedTextColor = Color.White)
                )

                Button(
                    onClick = {
                        if (customMsgText.trim().isNotEmpty()) {
                            selectedContactForAction = null
                            openWhatsAppMsg(phone, customMsgText.trim())
                            customMsgText = ""
                        }
                    },
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF25D366))
                ) {
                    Text("SEND CUSTOM WHATSAPP MESSAGE", color = Color.Black, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
