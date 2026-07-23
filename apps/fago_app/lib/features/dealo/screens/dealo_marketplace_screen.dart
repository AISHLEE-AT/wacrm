import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:fago_app/core/utils/validation.dart';

class DealoMarketplaceScreen extends StatefulWidget {
  const DealoMarketplaceScreen({super.key});

  @override
  State<DealoMarketplaceScreen> createState() => _DealoMarketplaceScreenState();
}

class _DealoMarketplaceScreenState extends State<DealoMarketplaceScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  List<Map<String, dynamic>> _sellDeals = [];
  List<Map<String, dynamic>> _buyDeals = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _fetchDeals();
  }

  Future<void> _fetchDeals() async {
    setState(() => _isLoading = true);
    try {
      final res = await Supabase.instance.client
          .from('local_deals')
          .select('*')
          .order('created_at', ascending: false);

      final List<Map<String, dynamic>> data = List<Map<String, dynamic>>.from(res);
      if (mounted) {
        setState(() {
          _sellDeals = data.where((d) => d['deal_type'] == 'sell').toList();
          _buyDeals = data.where((d) => d['deal_type'] == 'buy').toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint("Fetch deal error: $e");
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _openWhatsAppDealChat(Map<String, dynamic> deal) async {
    final messenger = ScaffoldMessenger.of(context);
    final String rawPhone = (deal['phone'] ?? '').toString().replaceAll(RegExp(r'\D'), '');
    final String cleanPhone = rawPhone.length >= 10 ? rawPhone.substring(rawPhone.length - 10) : rawPhone;
    
    final String message = Uri.encodeComponent(
      "🛍️ *FAGO DealO P2P Inquiry*\n\n"
      "Hello *${deal['seller_name']}*,\n"
      "I saw your ${deal['deal_type'] == 'sell' ? 'item for sale' : 'buyer requirement'} on *FAGO DealO*:\n"
      "📌 *${deal['title']}*\n"
      "💰 Price: ₹${deal['price']}\n"
      "📍 Location: ${deal['location_name']} (${deal['pincode']})\n\n"
      "Is this available? Let's talk!"
    );

    final Uri url = Uri.parse("https://wa.me/91$cleanPhone?text=$message");
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } else {
      messenger.showSnackBar(
        const SnackBar(content: Text("Could not launch WhatsApp")),
      );
    }
  }

  void _showPostDealBottomSheet() {
    final titleController = TextEditingController();
    final priceController = TextEditingController();
    final pincodeController = TextEditingController(text: '641001');
    final locationController = TextEditingController(text: 'Coimbatore, Tamil Nadu');
    final nameController = TextEditingController();
    final phoneController = TextEditingController();
    final upiController = TextEditingController();
    String dealType = 'sell';
    String category = 'electronics';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF141414),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (modalContext) {
        return StatefulBuilder(
          builder: (modalContext, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                top: 20,
                left: 20,
                right: 20,
                bottom: MediaQuery.of(modalContext).viewInsets.bottom + 20,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          "🚀 Post Deal or Requirement",
                          style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        IconButton(
                          onPressed: () => Navigator.pop(modalContext),
                          icon: const Icon(Icons.close, color: Colors.grey),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: ChoiceChip(
                            label: const Text("🏷️ For Sale"),
                            selected: dealType == 'sell',
                            selectedColor: const Color(0xFF00FF00),
                            onSelected: (val) => setModalState(() => dealType = 'sell'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: ChoiceChip(
                            label: const Text("🔍 Buyer Want"),
                            selected: dealType == 'buy',
                            selectedColor: Colors.cyanAccent,
                            onSelected: (val) => setModalState(() => dealType = 'buy'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: titleController,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        labelText: "Title / Item Name *",
                        labelStyle: TextStyle(color: Colors.grey),
                        filled: true,
                        fillColor: Color(0xFF222222),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: priceController,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        labelText: "Price / Target Budget (₹) *",
                        labelStyle: TextStyle(color: Colors.grey),
                        filled: true,
                        fillColor: Color(0xFF222222),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: pincodeController,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        labelText: "Pincode *",
                        labelStyle: TextStyle(color: Colors.grey),
                        filled: true,
                        fillColor: Color(0xFF222222),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: nameController,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        labelText: "Your Full Name *",
                        labelStyle: TextStyle(color: Colors.grey),
                        filled: true,
                        fillColor: Color(0xFF222222),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: phoneController,
                      keyboardType: TextInputType.phone,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        labelText: "WhatsApp Phone Number *",
                        labelStyle: TextStyle(color: Colors.grey),
                        filled: true,
                        fillColor: Color(0xFF222222),
                      ),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF00FF00),
                          foregroundColor: Colors.black,
                        ),
                        onPressed: () async {
                          final messenger = ScaffoldMessenger.of(modalContext);
                          final navigator = Navigator.of(modalContext);

                          if (titleController.text.isEmpty || priceController.text.isEmpty) {
                            messenger.showSnackBar(
                              const SnackBar(content: Text("Title & Price are required")),
                            );
                            return;
                          }

                          final nameErr = ValidationUtils.validateFullName(nameController.text);
                          if (nameErr != null) {
                            messenger.showSnackBar(
                              SnackBar(content: Text("⚠️ $nameErr")),
                            );
                            return;
                          }

                          final phoneErr = ValidationUtils.validateIndianPhone(phoneController.text);
                          if (phoneErr != null) {
                            messenger.showSnackBar(
                              SnackBar(content: Text("⚠️ $phoneErr")),
                            );
                            return;
                          }

                          final user = Supabase.instance.client.auth.currentUser;
                          await Supabase.instance.client.from('local_deals').insert({
                            'user_id': user?.id,
                            'deal_type': dealType,
                            'title': titleController.text.trim(),
                            'category': category,
                            'price': double.tryParse(priceController.text) ?? 0,
                            'pincode': pincodeController.text.trim(),
                            'location_name': locationController.text.trim(),
                            'seller_name': nameController.text.trim(),
                            'phone': phoneController.text.trim(),
                            'upi_id': upiController.text.trim().isNotEmpty
                                ? upiController.text.trim()
                                : "${phoneController.text.trim()}@upi",
                            'created_at': DateTime.now().toIso8601String(),
                          });

                          navigator.pop();
                          _fetchDeals();
                        },
                        child: const Text("🚀 Publish Deal Now", style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildDealList(List<Map<String, dynamic>> deals) {
    if (deals.isEmpty) {
      return const Center(
        child: Text("No local deals available. Tap + to post first deal!", style: TextStyle(color: Colors.grey)),
      );
    }
    return ListView.builder(
      itemCount: deals.length,
      padding: const EdgeInsets.all(12),
      itemBuilder: (context, index) {
        final deal = deals[index];
        return Card(
          color: const Color(0xFF1E1E1E),
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        deal['title'] ?? 'Listing',
                        style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF00FF00),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        "₹${deal['price']}",
                        style: const TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 14),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  "📍 ${deal['location_name'] ?? 'Local'} (${deal['pincode'] ?? ''}) • Seller: ${deal['seller_name'] ?? 'User'}",
                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF25D366),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: () => _openWhatsAppDealChat(deal),
                        icon: const Icon(Icons.chat, size: 18),
                        label: const Text("Chat WhatsApp", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF141414),
        title: const Text("FAGO DealO Marketplace", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFF00FF00),
          labelColor: const Color(0xFF00FF00),
          unselectedLabelColor: Colors.grey,
          tabs: const [
            Tab(text: "🏷️ Items for Sale"),
            Tab(text: "🔍 Buyer Wants"),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFF00FF00),
        foregroundColor: Colors.black,
        onPressed: _showPostDealBottomSheet,
        icon: const Icon(Icons.add),
        label: const Text("Post Deal", style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF00FF00)))
          : TabBarView(
              controller: _tabController,
              children: [
                _buildDealList(_sellDeals),
                _buildDealList(_buyDeals),
              ],
            ),
    );
  }
}
