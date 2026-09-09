import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'app_colors.dart';

enum SuproButtonVariant { primary, secondary, outline, danger }

/// Standard SuprO Interactive Button with Haptics and Loading state
class SuproButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool isLoading;
  final SuproButtonVariant variant;
  final Color? customColor;
  final double? width;
  final double height;
  final double borderRadius;

  const SuproButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.isLoading = false,
    this.variant = SuproButtonVariant.primary,
    this.customColor,
    this.width,
    this.height = 48,
    this.borderRadius = 12,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    BorderSide border = BorderSide.none;

    switch (variant) {
      case SuproButtonVariant.primary:
        bg = customColor ?? AppColors.rideo;
        fg = Colors.white;
        break;
      case SuproButtonVariant.secondary:
        bg = AppColors.surfaceLight;
        fg = Colors.white;
        break;
      case SuproButtonVariant.outline:
        bg = Colors.transparent;
        fg = customColor ?? Colors.white;
        border = BorderSide(color: customColor ?? AppColors.border, width: 1.5);
        break;
      case SuproButtonVariant.danger:
        bg = AppColors.error;
        fg = Colors.white;
        break;
    }

    Widget content;
    if (isLoading) {
      content = const SizedBox(
        width: 20,
        height: 20,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          color: Colors.white,
        ),
      );
    } else if (icon != null) {
      content = Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 18, color: fg),
          const SizedBox(width: 8),
          Text(
            label,
            style: TextStyle(
              color: fg,
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      );
    } else {
      content = Text(
        label,
        style: TextStyle(
          color: fg,
          fontSize: 14,
          fontWeight: FontWeight.bold,
        ),
      );
    }

    return SizedBox(
      width: width,
      height: height,
      child: ElevatedButton(
        onPressed: isLoading || onPressed == null
            ? null
            : () {
                HapticFeedback.lightImpact();
                onPressed!();
              },
        style: ElevatedButton.styleFrom(
          backgroundColor: bg,
          foregroundColor: fg,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(borderRadius),
            side: border,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16),
        ),
        child: content,
      ),
    );
  }
}
