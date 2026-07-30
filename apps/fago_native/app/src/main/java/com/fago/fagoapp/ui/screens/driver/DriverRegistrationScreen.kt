package com.fago.fagoapp.ui.screens.driver

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material.icons.filled.TwoWheeler
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fago.fagoapp.ui.theme.*
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.rpc
import io.github.jan.supabase.gotrue.auth
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import org.koin.compose.koinInject

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DriverRegistrationScreen(
    userPhone: String?,
    userName: String?,
    onBack: () -> Unit,
    onSuccess: () -> Unit
) {
    val scope = rememberCoroutineScope()
    val supabase: SupabaseClient = koinInject()

    var name by remember { mutableStateOf(userName ?: "") }
    var phone by remember { mutableStateOf((userPhone ?: "").filter { it.isDigit() }) }
    var rcNumber by remember { mutableStateOf("") }
    var licenseNumber by remember { mutableStateOf("") }
    var insurancePolicy by remember { mutableStateOf("") }
    var upiId by remember { mutableStateOf(if (phone.length >= 10) "${phone.takeLast(10)}@upi" else "") }
    var selectedVehicleType by remember { mutableStateOf("cab") } // cab, auto, bike, van, truck, agri

    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Become a DriveO Partner", color = Color.White, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Slate900)
            )
        },
        containerColor = DarkBackground
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(20.dp)
        ) {
            Text("Become a DrivO", color = OrangeDriver, fontSize = 32.sp, fontWeight = FontWeight.Black)
            Text("Partner with us & earn on your own schedule with zero commission.", color = TextMuted, fontSize = 14.sp)

            Spacer(Modifier.height(16.dp))

            // 0% Commission Hero Card
            Card(
                colors = CardDefaults.cardColors(containerColor = EmeraldGreen.copy(alpha = 0.15f)),
                border = androidx.compose.foundation.BorderStroke(1.5.dp, EmeraldGreen),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Verified, contentDescription = null, tint = EmeraldGreen, modifier = Modifier.size(36.dp))
                    Spacer(Modifier.width(12.dp))
                    Column {
                        Text("0% Commission Platform", color = EmeraldGreen, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                        Text("Keep 100% of your ride fares. Direct WhatsApp passenger connectivity!", color = Color.White.copy(alpha = 0.8f), fontSize = 11.sp)
                    }
                }
            }

            Spacer(Modifier.height(20.dp))

            // Vehicle Category Selector
            Text("VEHICLE TYPE", color = TextMuted, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(8.dp))

            Row(modifier = Modifier.fillMaxWidth()) {
                listOf("bike" to "Bike", "auto" to "Auto", "cab" to "Cab").forEach { (type, label) ->
                    val isSelected = selectedVehicleType == type
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .padding(end = 6.dp)
                            .background(if (isSelected) OrangeDriver.copy(alpha = 0.2f) else SlateCard, shape = RoundedCornerShape(12.dp))
                            .border(2.dp, if (isSelected) OrangeDriver else Slate700, shape = RoundedCornerShape(12.dp))
                            .clickable { selectedVehicleType = type }
                            .padding(vertical = 12.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(label, color = if (isSelected) OrangeDriver else Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                }
            }

            Spacer(Modifier.height(16.dp))

            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Full Name *", color = CyanAccent) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White)
            )

            Spacer(Modifier.height(12.dp))

            OutlinedTextField(
                value = phone,
                onValueChange = { phone = it.filter { c -> c.isDigit() }.take(10) },
                label = { Text("Mobile WhatsApp Number *", color = PrimaryGreen) },
                prefix = { Text("+91 ", color = PrimaryGreen, fontWeight = FontWeight.Bold) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White)
            )

            Spacer(Modifier.height(12.dp))

            OutlinedTextField(
                value = rcNumber,
                onValueChange = { rcNumber = it.uppercase() },
                label = { Text("RC Vehicle Number (e.g. TN 37 AB 1234) *", color = GoldAdmin) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.Characters),
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White)
            )

            Spacer(Modifier.height(12.dp))

            OutlinedTextField(
                value = licenseNumber,
                onValueChange = { licenseNumber = it.uppercase() },
                label = { Text("Driving License Number *", color = CyanAccent) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.Characters),
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White)
            )

            Spacer(Modifier.height(12.dp))

            OutlinedTextField(
                value = upiId,
                onValueChange = { upiId = it },
                label = { Text("UPI ID for Payouts (e.g. 9876543210@upi)", color = GoldAdmin) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White)
            )

            Spacer(Modifier.height(20.dp))

            if (errorMessage.isNotEmpty()) {
                Text(errorMessage, color = RoseError, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(10.dp))
            }

            Button(
                onClick = {
                    if (name.isBlank() || phone.length < 10 || rcNumber.isBlank() || licenseNumber.isBlank()) {
                        errorMessage = "Fill all required fields (*)"
                        return@Button
                    }
                    scope.launch {
                        isLoading = true
                        errorMessage = ""
                        try {
                            withContext(Dispatchers.IO) {
                                val tenDigit = phone.takeLast(10)
                                supabase.postgrest["drivers"].upsert(
                                    buildJsonObject {
                                        put("driver_name", name)
                                        put("name", name)
                                        put("mobile_number", tenDigit)
                                        put("whatsapp_number", tenDigit)
                                        put("vehicle_number", rcNumber)
                                        put("vehicle_type", selectedVehicleType)
                                        put("license_number", licenseNumber)
                                        put("upi_id", upiId)
                                        put("is_verified", true)
                                        put("verification_status", "approved")
                                        put("status", "online")
                                    }
                                )

                                val userId = supabase.auth.currentUserOrNull()?.id
                                if (userId != null) {
                                    supabase.postgrest.rpc(
                                        "upsert_profile_by_phone",
                                        buildJsonObject {
                                            put("p_user_id", userId)
                                            put("p_phone", tenDigit)
                                            put("p_full_name", name)
                                            put("p_role", "driver")
                                        }
                                    )
                                    // Note: upi_id is already saved in drivers. profiles only needs standard fields via RPC
                                }
                            }
                            onSuccess()
                        } catch (e: Exception) {
                            errorMessage = e.message ?: "Failed to submit driver registration"
                        }
                        isLoading = false
                    }
                },
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = OrangeDriver, contentColor = Color.White)
            ) {
                if (isLoading) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                } else {
                    Text("Start Driving Today", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                }
            }
        }
    }
}
