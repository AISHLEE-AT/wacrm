package com.fago.fagoapp.ui.navigation

object Routes {
    const val SPLASH = "splash"
    const val LOGIN = "login"
    const val PIN_SETUP = "pin_setup/{phone}/{name}"
    const val RIDEO = "ride_o"
    const val DRIVO = "drive_o"
    const val ADMIN = "admin_crm"
    const val PROFILE = "profile"
    const val RENTO = "rento"
    const val MANDI = "mandi"
    const val TOURO = "touro"
    const val TEACHO = "teacho"
    const val TESTO = "testo"
    const val TVO = "tvo"
    const val GEMINI_AI = "gemini_ai"
    const val DEALO = "dealo"
    const val DRIVER_REGISTRATION = "driver_registration"
    const val CRM = "crm"
    const val AI = "ai"
    const val PROMO = "promo"
    const val WEB = "web/{title}/{path}"

    fun buildPinRoute(phone: String, name: String) =
        "pin_setup/${java.net.URLEncoder.encode(phone, "UTF-8")}/${java.net.URLEncoder.encode(name.ifBlank { "User" }, "UTF-8")}"

    fun buildWebModuleRoute(title: String, path: String) =
        "web_module/${java.net.URLEncoder.encode(title, "UTF-8")}/${java.net.URLEncoder.encode(path, "UTF-8")}"

    fun buildWebRoute(title: String, path: String) =
        "web/${java.net.URLEncoder.encode(title, "UTF-8")}/${java.net.URLEncoder.encode(path, "UTF-8")}"
}
