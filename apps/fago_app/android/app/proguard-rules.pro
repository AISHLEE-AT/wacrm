# Flutter ProGuard Rules
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.embedding.** { *; }
-keep class io.flutter.provider.** { *; }
-dontwarn io.flutter.embedding.**

# Supabase / HTTP / Webview rules
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**
