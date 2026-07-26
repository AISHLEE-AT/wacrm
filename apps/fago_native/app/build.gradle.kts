plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.google.services)
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "com.fago.fagoapp"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.fago.native"
        minSdk = 24
        targetSdk = 35
        versionCode = 5
        versionName = "1.0.5-beta"

        // Inject env vars into BuildConfig at compile time
        val envFile = when {
            rootProject.file(".env").exists() -> rootProject.file(".env")
            rootProject.file("../.env").exists() -> rootProject.file("../.env")
            else -> null
        }
        val env = if (envFile != null && envFile.exists()) {
            envFile.readLines()
                .filter { it.isNotBlank() && !it.startsWith("#") && it.contains("=") }
                .associate { it.substringBefore("=").trim() to it.substringAfter("=").trim() }
        } else emptyMap()

        manifestPlaceholders["MAPS_API_KEY"] = env["MAPS_API_KEY"] ?: "AIzaSyDdAePjhtVNhbCPhvsdEGrMUGA2kn5WDds"

        buildConfigField("String", "SUPABASE_URL",
            "\"${env["SUPABASE_URL"] ?: "https://gmahjdzqitbomtmdzlfp.supabase.co"}\"")
        buildConfigField("String", "SUPABASE_ANON_KEY",
            "\"${env["SUPABASE_ANON_KEY"] ?: ""}\"")
        buildConfigField("String", "FIREBASE_BRIDGE_URL",
            "\"${env["FIREBASE_BRIDGE_URL"] ?: "https://watscrm.vercel.app/api/auth/firebase-bridge"}\"")
        buildConfigField("String", "WHATSAPP_OTP_SEND_URL",
            "\"${env["WHATSAPP_OTP_SEND_URL"] ?: "https://watscrm.vercel.app/api/auth/whatsapp/send-otp"}\"")
        buildConfigField("String", "WHATSAPP_OTP_VERIFY_URL",
            "\"${env["WHATSAPP_OTP_VERIFY_URL"] ?: "https://watscrm.vercel.app/api/auth/whatsapp/verify-otp"}\"")
        buildConfigField("String", "ADMIN_PHONE", "\"9486335870\"")
        buildConfigField("String", "ADMIN_EMAIL", "\"aishleetechnology@gmail.com\"")

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("debug")
            isMinifyEnabled = false
            isShrinkResources = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    val supabaseVersion = "2.6.1"
    val ktorVersion = "2.3.12"
    val composeBom = platform("androidx.compose:compose-bom:2024.09.00")
    val firebaseBom = platform("com.google.firebase:firebase-bom:33.3.0")

    // ── Jetpack Compose UI ────────────────────────────────────────────────────
    implementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.activity:activity-compose:1.9.2")
    implementation("androidx.navigation:navigation-compose:2.8.1")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.6")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.6")
    debugImplementation("androidx.compose.ui:ui-tooling")

    // ── Supabase SDK (same project as Flutter fago_app) ───────────────────────
    implementation("io.github.jan-tennert.supabase:postgrest-kt:$supabaseVersion")
    implementation("io.github.jan-tennert.supabase:gotrue-kt:$supabaseVersion")
    implementation("io.github.jan-tennert.supabase:realtime-kt:$supabaseVersion")
    implementation("io.github.jan-tennert.supabase:storage-kt:$supabaseVersion")
    // Ktor HTTP engine for Supabase
    implementation("io.ktor:ktor-client-android:$ktorVersion")
    implementation("io.ktor:ktor-client-content-negotiation:$ktorVersion")
    implementation("io.ktor:ktor-serialization-kotlinx-json:$ktorVersion")

    // ── Firebase (same project: fago-letstravo) ───────────────────────────────
    implementation(firebaseBom)
    implementation("com.google.firebase:firebase-auth-ktx")
    implementation("com.google.firebase:firebase-messaging-ktx")
    implementation("com.google.firebase:firebase-analytics-ktx")

    // ── Google Maps & Location ────────────────────────────────────────────────
    implementation("com.google.android.gms:play-services-maps:19.0.0")
    implementation("com.google.android.gms:play-services-location:21.3.0")
    implementation("com.google.maps.android:maps-compose:6.1.0")

    // ── Biometric (native Android Keystore — stronger than Flutter plugin) ────
    implementation("androidx.biometric:biometric:1.2.0-alpha05")

    // ── HTTP Client for Vercel API calls ──────────────────────────────────────
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

    // ── Kotlin Serialization ──────────────────────────────────────────────────
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")

    // ── DataStore (replaces SharedPreferences for device auth) ───────────────
    implementation("androidx.datastore:datastore-preferences:1.1.1")

    // ── Dependency Injection ──────────────────────────────────────────────────
    implementation("io.insert-koin:koin-android:3.5.6")
    implementation("io.insert-koin:koin-androidx-compose:3.5.6")

    // ── Coil (image loading) ──────────────────────────────────────────────────
    implementation("io.coil-kt:coil-compose:2.7.0")

    // ── QR Code ──────────────────────────────────────────────────────────────
    implementation("com.journeyapps:zxing-android-embedded:4.3.0")

    // ── Android WebKit for CRM & Web Modules ─────────────────────────────────
    implementation("androidx.webkit:webkit:1.12.0")

    // ── Testing ───────────────────────────────────────────────────────────────
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
}
