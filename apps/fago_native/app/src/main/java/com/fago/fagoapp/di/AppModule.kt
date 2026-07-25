package com.fago.fagoapp.di

import com.fago.fagoapp.auth.AuthViewModel
import com.fago.fagoapp.data.SupabaseRepository
import com.fago.fagoapp.services.DeviceAuthService
import io.github.jan.supabase.SupabaseClient
import org.koin.android.ext.koin.androidContext
import org.koin.androidx.viewmodel.dsl.viewModel
import org.koin.dsl.module

/**
 * Koin dependency injection module.
 * Provides Supabase client, repositories, services, and ViewModels to the whole app.
 */
fun appModule(supabaseClient: SupabaseClient) = module {

    // ── Supabase Client (singleton) ────────────────────────────────────────
    single<SupabaseClient> { supabaseClient }

    // ── Repositories & Services ────────────────────────────────────────────
    single { SupabaseRepository(get()) }
    single { DeviceAuthService(androidContext()) }

    // ── ViewModels ─────────────────────────────────────────────────────────
    viewModel { AuthViewModel(get(), get()) }
}
