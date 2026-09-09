import 'package:flutter/material.dart';

/// Central Design System Color Palette for SuprO Flutter
class AppColors {
  // Background & Surface
  static const Color background = Color(0xFF0A0F1E);     // Deep cosmic navy
  static const Color surface = Color(0xFF1E293B);        // Frosted card surface
  static const Color surfaceLight = Color(0xFF334155);   // Lighter slate for borders / chips
  static const Color surfaceDark = Color(0xFF0F172A);    // Dark inset container
  static const Color border = Color(0xFF334155);         // Subtle border
  static const Color borderLight = Color(0xFF475569);    // Highlighted border

  // Text Colors
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFF94A3B8);  // Slate 400
  static const Color textMuted = Color(0xFF64748B);      // Slate 500
  static const Color textLink = Color(0xFF38BDF8);       // Sky blue

  // Functional Colors
  static const Color success = Color(0xFF10B981);        // Emerald
  static const Color warning = Color(0xFFF59E0B);        // Amber
  static const Color error = Color(0xFFEF4444);          // Rose Red
  static const Color info = Color(0xFF3B82F6);           // Blue

  // Module Signature Colors
  static const Color rideo = Color(0xFF10B981);          // Emerald
  static const Color driveo = Color(0xFF38BDF8);         // Sky Blue
  static const Color dealo = Color(0xFFF97316);          // Orange
  static const Color rento = Color(0xFF84CC16);          // Lime
  static const Color groupo = Color(0xFFEC4899);         // Hot Pink / Purple
  static const Color teacho = Color(0xFFF59E0B);         // Golden Amber
  static const Color agro = Color(0xFF059669);           // Forest Green
  static const Color touro = Color(0xFF06B6D4);          // Cyan
  static const Color testo = Color(0xFF8B5CF6);          // Violet
  static const Color tvo = Color(0xFFE11D48);            // Crimson Pink
  static const Color moneyo = Color(0xFF14B8A6);         // Teal
  static const Color gameo = Color(0xFFA855F7);          // Neon Purple
  static const Color jobo = Color(0xFF3B82F6);           // Royal Blue
  static const Color admin = Color(0xFFEF4444);          // Red

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF10B981), Color(0xFF059669)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient purpleGradient = LinearGradient(
    colors: [Color(0xFF8B5CF6), Color(0xFF6D28D9)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient cardGradient = LinearGradient(
    colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
