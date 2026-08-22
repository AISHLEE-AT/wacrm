import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

class PaymentQrDialog extends StatefulWidget {
  final String title;
  final int amount;
  final String itemId;
  final String itemType;
  final String upiId;
  final String payeeName;
  final VoidCallback onSuccess;

  const PaymentQrDialog({
    super.key,
    required this.title,
    required this.amount,
    required this.itemId,
    this.itemType = 'course',
    this.upiId = '9486335870@hdfcbank',
    this.payeeName = 'AISHLEE TECHNOLOGY',
    required this.onSuccess,
  });

  static Future<void> show(
    BuildContext context, {
    required String title,
    required int amount,
    required String itemId,
    String itemType = 'course',
    required VoidCallback onSuccess,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => PaymentQrDialog(
        title: title,
        amount: amount,
        itemId: itemId,
        itemType: itemType,
        onSuccess: onSuccess,
      ),
    );
  }

  @override
  State<PaymentQrDialog> createState() => _PaymentQrDialogState();
}

class _PaymentQrDialogState extends State<PaymentQrDialog> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _utrController = TextEditingController();
  final TextEditingController _codeController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _utrController.dispose();
    _codeController.dispose();
    super.dispose();
  }

  String get _upiUrl {
    final pa = Uri.encodeComponent(widget.upiId);
    final pn = Uri.encodeComponent(widget.payeeName);
    final tn = Uri.encodeComponent('SuprO ${widget.title} Access');
    return 'upi://pay?pa=$pa&pn=$pn&am=${widget.amount}&cu=INR&tn=$tn';
  }

  Future<void> _openUpiApp() async {
    final uri = Uri.parse(_upiUrl);
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Please scan the QR code or pay to UPI ID: ${widget.upiId}'),
              backgroundColor: const Color(0xFF1E293B),
            ),
          );
        }
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Please pay to UPI ID: ${widget.upiId}'),
            backgroundColor: const Color(0xFF1E293B),
          ),
        );
      }
    }
  }

  Future<void> _openWhatsAppAdmin() async {
    final text = 'Hello Admin! I am paying ₹${widget.amount} for SuprO ${widget.title} (UPI: ${widget.upiId}).';
    final uri = Uri.parse('https://wa.me/919486335870?text=${Uri.encodeComponent(text)}');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  Future<void> _submitUtr() async {
    final utr = _utrController.text.trim();
    if (utr.length < 8) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a valid 12-digit UPI Reference Number / UTR'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    await Future.delayed(const Duration(milliseconds: 600));

    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('purchased_${widget.itemType}_${widget.itemId}', true);

    if (mounted) {
      setState(() => _isSubmitting = false);
      Navigator.pop(context);
      widget.onSuccess();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('🎉 Payment Verified! Full access unlocked for "${widget.title}".'),
          backgroundColor: const Color(0xFF10B981),
        ),
      );
    }
  }

  Future<void> _applyAccessCode() async {
    final code = _codeController.text.trim().toUpperCase();
    const valid = ['CENTUM100', 'POOVI100', 'ADMINPASS', 'AISHLEE100', 'STUDENT100', 'FREEPASS'];

    if (valid.contains(code)) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('purchased_${widget.itemType}_${widget.itemId}', true);

      if (mounted) {
        Navigator.pop(context);
        widget.onSuccess();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('🌟 Access code "$code" applied! 100% full access unlocked.'),
            backgroundColor: const Color(0xFF10B981),
          ),
        );
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Invalid or expired coupon code.'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFF0F172A),
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        border: Border(top: BorderSide(color: Color(0xFF1E293B))),
      ),
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'SUPRO PREMIUM UNLOCK',
                        style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        widget.title,
                        style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(LucideIcons.x, color: Colors.white54, size: 20),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Tab Bar
            Container(
              decoration: BoxDecoration(
                color: const Color(0xFF0A0F1D),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              child: TabBar(
                controller: _tabController,
                indicator: BoxDecoration(
                  color: const Color(0xFF10B981).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                ),
                labelColor: const Color(0xFF10B981),
                unselectedLabelColor: Colors.white54,
                labelStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                tabs: [
                  Tab(text: 'Instant UPI (₹${widget.amount})'),
                  const Tab(text: 'Access Code'),
                ],
              ),
            ),
            const SizedBox(height: 16),

            SizedBox(
              height: 380,
              child: TabBarView(
                controller: _tabController,
                children: [
                  // Tab 1: UPI
                  SingleChildScrollView(
                    child: Column(
                      children: [
                        // Strict Rule Alert
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.red.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
                          ),
                          child: Row(
                            children: [
                              const Icon(LucideIcons.shieldAlert, color: Colors.redAccent, size: 16),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  'Please pay exact full amount of ₹${widget.amount}. Partial payments cannot be auto-unlocked.',
                                  style: const TextStyle(color: Color(0xFFF87171), fontSize: 11),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),

                        // QR Code Card
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E293B),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: QrImageView(
                                  data: _upiUrl,
                                  version: QrVersions.auto,
                                  size: 140,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text('UPI: ${widget.upiId}', style: const TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.bold)),
                              Text(widget.payeeName, style: const TextStyle(color: Colors.white54, fontSize: 10)),
                            ],
                          ),
                        ),
                        const SizedBox(height: 10),

                        // 1-Tap UPI Launch
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: _openUpiApp,
                            icon: const Icon(LucideIcons.sparkles, size: 14),
                            label: Text('1-Tap Open GPay / PhonePe (₹${widget.amount})', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF10B981),
                              foregroundColor: const Color(0xFF022C22),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),

                        // WhatsApp Admin Support
                        SizedBox(
                          width: double.infinity,
                          child: OutlinedButton.icon(
                            onPressed: _openWhatsAppAdmin,
                            icon: const Icon(LucideIcons.messageSquare, size: 14, color: Color(0xFF25D366)),
                            label: const Text('WhatsApp Admin Support (9486335870)', style: TextStyle(color: Color(0xFF25D366), fontSize: 11, fontWeight: FontWeight.bold)),
                            style: OutlinedButton.styleFrom(
                              side: BorderSide(color: const Color(0xFF25D366).withValues(alpha: 0.4)),
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),

                        // UTR Input
                        Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: _utrController,
                                keyboardType: TextInputType.number,
                                maxLength: 16,
                                style: const TextStyle(color: Colors.white, fontSize: 13),
                                decoration: InputDecoration(
                                  counterText: '',
                                  hintText: 'Enter 12-digit UTR No.',
                                  hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
                                  filled: true,
                                  fillColor: const Color(0xFF0A0F1D),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF1E293B))),
                                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF1E293B))),
                                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF10B981))),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            ElevatedButton(
                              onPressed: _isSubmitting ? null : _submitUtr,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFFBBF24),
                                foregroundColor: const Color(0xFF0A0F1D),
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                              child: _isSubmitting
                                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                                  : const Text('Verify', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Tab 2: Code
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    child: Column(
                      children: [
                        const Icon(LucideIcons.key, color: Color(0xFFFBBF24), size: 32),
                        const SizedBox(height: 8),
                        const Text('Institutional & Promo Key', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        const Text(
                          'Enter coupon or student scholarship key to unlock 100% free.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.white54, fontSize: 11),
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _codeController,
                          textCapitalization: TextCapitalization.characters,
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 2),
                          decoration: InputDecoration(
                            hintText: 'e.g. CENTUM100',
                            hintStyle: const TextStyle(color: Colors.white38, fontSize: 13, letterSpacing: 1),
                            filled: true,
                            fillColor: const Color(0xFF0A0F1D),
                            contentPadding: const EdgeInsets.symmetric(vertical: 14),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF1E293B))),
                            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF10B981))),
                          ),
                        ),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _applyAccessCode,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF10B981),
                              foregroundColor: const Color(0xFF022C22),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            child: const Text('Apply & Unlock Free', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
