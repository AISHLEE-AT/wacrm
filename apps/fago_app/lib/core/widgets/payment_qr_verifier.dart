import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';

class PaymentQRVerifier extends StatelessWidget {
  final double amount;
  final String upiId;
  final String payeeName;

  const PaymentQRVerifier({
    super.key,
    required this.amount,
    this.upiId = "9486335870@hdfcbank",
    this.payeeName = "RAJAKUMARAN S P",
  });

  @override
  Widget build(BuildContext context) {
    // Format the UPI URL
    // upi://pay?pa=UPI_ID&pn=PAYEE_NAME&am=AMOUNT&cu=INR
    final upiUrl = 'upi://pay?pa=${Uri.encodeComponent(upiId)}&pn=${Uri.encodeComponent(payeeName)}&am=$amount&cu=INR';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.redAccent.withValues(alpha: 0.1),
            border: Border.all(color: Colors.redAccent.withValues(alpha: 0.3)),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Column(
            children: [
              const Text(
                '⚠️ STRICT RULE ⚠️',
                style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              RichText(
                textAlign: TextAlign.center,
                text: TextSpan(
                  style: const TextStyle(color: Colors.redAccent, fontSize: 13, height: 1.4),
                  children: [
                    const TextSpan(text: 'Please pay the '),
                    const TextSpan(text: 'exact full amount ', style: TextStyle(fontWeight: FontWeight.bold)),
                    TextSpan(text: 'of ₹$amount. Partial payments are strictly prohibited, will cause significant delays requiring manual verification, and partial amounts below the required price will not be refunded.'),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: const [
              BoxShadow(
                color: Colors.black12,
                blurRadius: 6,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: QrImageView(
            data: upiUrl,
            version: QrVersions.auto,
            size: 200.0,
            backgroundColor: Colors.white,
          ),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.05),
            border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
            borderRadius: BorderRadius.circular(8),
          ),
          child: RichText(
            textAlign: TextAlign.center,
            text: const TextSpan(
              style: TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
              children: [
                TextSpan(text: 'After successful payment, please enter your exact '),
                TextSpan(text: '12-digit UPI Reference Number ', style: TextStyle(fontWeight: FontWeight.bold)),
                TextSpan(text: 'below to unlock access immediately.'),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
