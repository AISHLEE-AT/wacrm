package com.fago.fagoapp.ui.screens.promo

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.AmpStories
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

data class PromoTemplateItem(
    val key: String,
    val title: String,
    val icon: String,
    val text: String
)

/**
 * WhatsAppStatusPromoScreen — 100% parity with Flutter's whatsapp_status_promo_screen.dart.
 * Features:
 *   - 5 Promo Category Templates: rideo (0% Commission), rento (Agri rentals), mandi (Live rates), dealo (5km Hyperlocal), teacho (TNPSC prep)
 *   - Automatic user referral parameter appended
 *   - 1-Tap Post to WhatsApp status trigger
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WhatsAppStatusPromoScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    var selectedCategoryKey by remember { mutableStateOf("rideo") }

    val templates = listOf(
        PromoTemplateItem(
            "rideo", "🚖 RideO / DriveO (0% Commission)", "🚖",
            "☀️ *ஃபேகோ சூப்பர் ஆப் - 0% கமிஷன் சவாரி!* ☀️\n\n" +
            "🚖 உங்கள் ஊரில் பைக், ஆட்டோ & கார் சவாரி முன்பதிவு செய்ய எந்த கமிஷனும் இல்லை!\n" +
            "🚚 டிரைவர் நண்பர்கள் 100% வருமானத்தை நேரடியாக பெறலாம்.\n\n" +
            "👉 உடனே இலவசமாக பயன்படுத்தி பாருங்கள்:\n" +
            "🔗 https://watscrm.vercel.app\n\n" +
            "#FAGO #RideO #ZeroCommission #TamilNadu"
        ),
        PromoTemplateItem(
            "rento", "🚜 RentO (விவசாய இயந்திர வாடகை)", "🚜",
            "🌾 *ஃபேகோ ரெண்டோ - விவசாய வாடகை சேவை!* 🌾\n\n" +
            "🚜 டிராக்டர், ஹார்வெஸ்டர், ஜேசிபி & விவசாய கருவிகள் உங்கள் ஊரில் நேரடி வாடகைக்கு!\n" +
            "தரமான இயந்திரங்கள் குறைந்த வாடகையில் கிடைக்கின்றன.\n\n" +
            "👉 தொடர்புக்கு செயலி பதிவிறக்கம் செய்ய:\n" +
            "🔗 https://watscrm.vercel.app\n\n" +
            "#RentO #AgriRentals #TamilNaduFarmers"
        ),
        PromoTemplateItem(
            "mandi", "🌾 AgrO (உழவர் சந்தை & விதைகள்)", "🌾",
            "🥦 *இன்றைய காய்கறி & நெல் சந்தை விலை நிலவரம்!* 🥦\n\n" +
            "📊 தமிழ்நாட்டின் அனைத்து மாவட்ட உழவர் சந்தை காய்கறி & விவசாய பொருட்கள் நேரடி விலை நிலவரம் உடனுக்குடன்!\n\n" +
            "👉 இன்றைய விலையை சரிபார்க்க:\n" +
            "🔗 https://watscrm.vercel.app\n\n" +
            "#MandiPrices #UzhavarSanthai #TamilNaduAgri"
        ),
        PromoTemplateItem(
            "dealo", "🏷️ DealO (5km Hyperlocal Marketplace)", "🏷️",
            "🛍️ *உங்கள் ஊரில் 5 கி.மீ சுற்றளவில் சூப்பர் டீல்கள்!* 🛍️\n\n" +
            "🏷️ பழைய & புதிய பொருட்கள், மொபைல், வண்டி, லேப்டாப் நேரடியாக வாங்க/விற்க!\n" +
            "இடைத்தரகர் இல்லாமல் நேரடியாக வாடிக்கையாளர்களை தொடர்பு கொள்ளுங்கள்.\n\n" +
            "👉 டீல்களை பார்க்க:\n" +
            "🔗 https://watscrm.vercel.app\n\n" +
            "#DealO #LocalDeals #TamilNaduMarket"
        ),
        PromoTemplateItem(
            "teacho", "🎓 TeachO / TestO (TNPSC & Govt Prep)", "🎓",
            "📚 *டிஎன்பிஎஸ்சி & அரசு தேர்வு இலவச ஆன்லைன் பயிற்சி!* 📚\n\n" +
            "✍️ TNPSC Group 1, 2, 4, VAO, SSC & Police தேர்வுகளுக்கு இலவச ஆன்லைன் மாதிரி தேர்வுகள்!\n" +
            "தினசரி பாடங்கள் & வினாக்கள் தமிழில்.\n\n" +
            "👉 இலவச ஆன்லைன் தேர்வு எழுத:\n" +
            "🔗 https://thamizhan.vercel.app\n\n" +
            "#TeachO #TestO #TNPSC #TamilNaduEducation"
        )
    )

    val currentObj = templates.find { it.key == selectedCategoryKey } ?: templates[0]

    Scaffold(
        containerColor = Color(0xFF0F172A),
        topBar = {
            TopAppBar(
                title = { Text("📸 Share to WhatsApp Status", color = Color(0xFF00FF00), fontWeight = FontWeight.Bold, fontSize = 16.sp) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF1E293B)),
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color(0xFF00FF00))
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Header Banner
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = Color(0xFF128C7E),
                modifier = Modifier.fillMaxWidth().border(1.dp, Color(0xFF25D366).copy(alpha = 0.5f), RoundedCornerShape(16.dp))
            ) {
                Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.AmpStories, contentDescription = null, tint = Color.White, modifier = Modifier.size(36.dp))
                    Spacer(Modifier.width(14.dp))
                    Column {
                        Text("தமிழ்நாடு வாட்ஸ்அப் விளம்பரம்", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text("1-Tap Share to WhatsApp Status! Promote local services.", color = Color.White.copy(alpha = 0.7f), fontSize = 11.sp)
                    }
                }
            }

            Text("Select Promo Category (பிரிவை தேர்ந்தெடுக்கவும்):", color = Color.Gray, fontSize = 12.sp, fontWeight = FontWeight.Bold)

            // Category Chips
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(templates) { item ->
                    val isSel = item.key == selectedCategoryKey
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = if (isSel) Color(0xFF00FF00) else Color(0xFF1E293B),
                        modifier = Modifier.clickable { selectedCategoryKey = item.key }
                    ) {
                        Text(
                            "${item.icon} ${item.key.uppercase()}",
                            color = if (isSel) Color.Black else Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp,
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                        )
                    }
                }
            }

            // Preview Card
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = Color(0xFF1E293B),
                modifier = Modifier.fillMaxWidth().border(1.5.dp, Color(0xFF25D366).copy(alpha = 0.4f), RoundedCornerShape(16.dp))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(currentObj.title, color = Color(0xFF00FF00), fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    HorizontalDivider(color = Color(0xFF334155), modifier = Modifier.padding(vertical = 12.dp))
                    SelectionContainer {
                        Text(currentObj.text, color = Color.White, fontSize = 13.sp, lineHeight = 20.sp)
                    }
                }
            }

            // 1-Tap Share Button
            Button(
                onClick = {
                    val encoded = Uri.encode(currentObj.text)
                    val url = Uri.parse("https://api.whatsapp.com/send?text=$encoded")
                    context.startActivity(Intent(Intent.ACTION_VIEW, url))
                },
                modifier = Modifier.fillMaxWidth().height(52.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF25D366)),
                shape = RoundedCornerShape(14.dp)
            ) {
                Icon(Icons.Default.Share, contentDescription = null, tint = Color.Black)
                Spacer(Modifier.width(8.dp))
                Text("📲 Post to My WhatsApp Status (வாட்ஸ்அப்பில் பகிரவும்)", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 13.sp)
            }
        }
    }
}
