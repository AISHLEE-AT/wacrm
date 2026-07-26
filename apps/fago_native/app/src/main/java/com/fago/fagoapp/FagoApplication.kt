package com.fago.fagoapp

import android.app.Application
import com.google.firebase.FirebaseApp
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.Auth
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.realtime.Realtime
import io.github.jan.supabase.storage.Storage
import org.koin.android.ext.koin.androidContext
import org.koin.core.context.startKoin

/**
 * FAGO Native Android Application entry point.
 * Initializes Supabase (same project as Flutter fago_app) and Firebase (same project: fago-letstravo).
 * Uses Koin for dependency injection.
 */
class FagoApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        // Initialize Firebase — same project as Flutter app
        FirebaseApp.initializeApp(this)

        // Initialize Supabase — same project, same DB, same auth
        val supabaseClient = createSupabaseClient(
            supabaseUrl = BuildConfig.SUPABASE_URL,
            supabaseKey = BuildConfig.SUPABASE_ANON_KEY
        ) {
            install(Auth) {
                sessionManager = com.fago.fagoapp.auth.SecureSessionManager(this@FagoApplication)
            }
            install(Postgrest)
            install(Realtime)
            install(Storage)
        }

        // Start Koin DI
        startKoin {
            androidContext(this@FagoApplication)
            modules(
                com.fago.fagoapp.di.appModule(supabaseClient)
            )
        }
    }
}
