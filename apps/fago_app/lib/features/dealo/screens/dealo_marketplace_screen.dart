import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:fago_app/core/utils/validation.dart';
import 'package:fago_app/services/location_service.dart';
import 'package:fago_app/services/whatsapp_service.dart';
import 'package:fago_app/features/profile/services/profile_service.dart';
import 'package:fago_app/screens/web_module_screen.dart';

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
  int _radiusKm = 5; // 5 km default radius!

  final List<int> _radiusOptions = [5, 10, 20, 50, 999];

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

  void _shareToWhatsAppStatus(Map<String, dynamic> deal) async {
    final messenger = ScaffoldMessenger.of(context);
    final String rawPhone = (deal['phone'] ?? '').toString().replaceAll(RegExp(r'\D'), '');
    final String cleanPhone = rawPhone.length >= 10 ? rawPhone.substring(rawPhone.length - 10) : rawPhone;
    final String text =
      "🔥 *விற்பனைக்கு / FOR SALE on FAGO DealO*:\n\n"
      "📌 *${deal['title']}*\n"
      "💰 விலை: ₹${deal['price']}\n"
      "📍 இடம்: ${deal['location_name']} (5 km radius)\n"
      "🛡️ சரிபார்க்கப்பட்ட விற்பனையாளர் (Verified Seller)\n\n"
      "💬 தொடர்புக்கு: https://wa.me/91$cleanPhone\n"
      "📲 FAGO Super App மூலம் நேரடியாக வாங்குங்கள்!";
    final Uri url = Uri.parse("https://api.whatsapp.com/send?text=${Uri.encodeComponent(text)}");
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } else {
      messenger.showSnackBar(
        const SnackBar(content: Text("Could not launch WhatsApp")),
      );
    }
  }

  void _openWhatsAppDealChat(Map<String, dynamic> deal, {String actionType = 'chat'}) async {
    final messenger = ScaffoldMessenger.of(context);
    final String rawPhone = (deal['phone'] ?? '').toString().replaceAll(RegExp(r'\D'), '');
    final String cleanPhone = rawPhone.length >= 10 ? rawPhone.substring(rawPhone.length - 10) : rawPhone;
    
    final loc = await LocationService().getCurrentLocation();
    final pinData = await LocationService().getPincodeAndAddressFromCoordinates(loc.latitude, loc.longitude);
    final userDetails = await ProfileService.getCurrentUserProfileDetails();
    final buyerName = userDetails['name'] ?? '';

    StringBuffer sb = StringBuffer();
    if (actionType == 'photos') {
      sb.writeln("📸 *Request for Item Live Photos & Videos*\n");
      sb.writeln("Hi ${deal['seller_name']}, I saw *${deal['title']}* on FAGO DealO. Could you please send me 2-3 live photos or a short video recording of the item?");
    } else if (actionType == 'videocall') {
      sb.writeln("📹 *WhatsApp Video Call Live Inspection*\n");
      sb.writeln("Hi ${deal['seller_name']}, can we have a quick WhatsApp Video Call to inspect *${deal['title']}* live?");
    } else if (actionType == 'bargain') {
      final int bargainPrice = ((deal['price'] ?? 0) * 0.85).round();
      sb.writeln("🏷️ *FAGO DealO - விலை பேரம் பேசல் (Price Offer)*\n");
      sb.writeln("வணக்கம் ${deal['seller_name']}, உங்கள் *${deal['title']}* பொருளுக்கு நான் ₹$bargainPrice வழங்கத் தயார். சம்மதமா?");
    } else {
      sb.writeln("🛍️ *FAGO DealO P2P Inquiry*\n");
      sb.writeln("வணக்கம் *${deal['seller_name']}*,");
      sb.writeln("I am interested in your item on *FAGO DealO*:");
      sb.writeln("📌 *${deal['title']}*");
      sb.writeln("💰 Price: ₹${deal['price']}");
      sb.writeln("📍 Item Location: ${deal['location_name']} (${deal['pincode']})");
      sb.writeln("\nIs this available? Let's talk!");
    }

    if (buyerName.isNotEmpty) {
      sb.writeln("\n👤 *Buyer Name*: $buyerName");
    }
    sb.writeln("📍 *Buyer Live Location Pin*: ${pinData['address']}");
    if (pinData['pincode']!.isNotEmpty) {
      sb.writeln("📮 *Pincode*: ${pinData['pincode']}");
    }
    sb.writeln("🗺️ *Live GPS Maps Pin*: https://maps.google.com/?q=${loc.latitude},${loc.longitude}");

    final success = await WhatsAppService.openWhatsApp(phone: cleanPhone, message: sb.toString());
    if (!success) {
      messenger.showSnackBar(
        const SnackBar(content: Text("Could not launch WhatsApp")),
      );
    }
  }

  void _makePhoneCall(Map<String, dynamic> deal) async {
    final String rawPhone = (deal['phone'] ?? '').toString().replaceAll(RegExp(r'\D'), '');
    final String cleanPhone = rawPhone.length >= 10 ? rawPhone.substring(rawPhone.length - 10) : rawPhone;
    final Uri url = Uri.parse("tel:+91$cleanPhone");
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    }
  }

  void _showContactOptionsBottomSheet(Map<String, dynamic> deal) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF141414),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Contact Seller: ${deal['seller_name']} 🛡️ Verified",
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 4),
              Text(deal['title'] ?? '', style: const TextStyle(color: Colors.grey, fontSize: 12)),
              const SizedBox(height: 16),
              ListTile(
                leading: const Icon(Icons.share_outlined, color: Color(0xFF00FF00)),
                title: const Text("Share to WhatsApp Status (ஸ்டேட்டஸ்)", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                onTap: () {
                  Navigator.pop(ctx);
                  _shareToWhatsAppStatus(deal);
                },
              ),
              ListTile(
                leading: const Icon(Icons.chat, color: Color(0xFF25D366)),
                title: const Text("Chat on WhatsApp", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                onTap: () {
                  Navigator.pop(ctx);
                  _openWhatsAppDealChat(deal, actionType: 'chat');
                },
              ),
              ListTile(
                leading: const Icon(Icons.monetization_on, color: Colors.amber),
                title: const Text("🏷️ பேரம் பேசல் (1-Click Bargain Offer)", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                onTap: () {
                  Navigator.pop(ctx);
                  _openWhatsAppDealChat(deal, actionType: 'bargain');
                },
              ),
              ListTile(
                leading: const Icon(Icons.phone, color: Colors.blueAccent),
                title: const Text("Direct Phone Call", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                onTap: () {
                  Navigator.pop(ctx);
                  _makePhoneCall(deal);
                },
              ),
              ListTile(
                leading: const Icon(Icons.videocam, color: Colors.purpleAccent),
                title: const Text("Request WhatsApp Video Call Inspection", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                onTap: () {
                  Navigator.pop(ctx);
                  _openWhatsAppDealChat(deal, actionType: 'videocall');
                },
              ),
            ],
          ),
        );
      },
    );
  }

  void _showPostDealBottomSheet() {
    final titleController = TextEditingController();
    final priceController = TextEditingController();
    final pincodeController = TextEditingController(text: 'Detecting GPS...');
    final locationController = TextEditingController(text: 'Detecting GPS...');
    final nameController = TextEditingController();
    final phoneController = TextEditingController();
    final upiController = TextEditingController();
    String dealType = 'sell';
    bool isPinningGps = false;
    bool hasAutoLoaded = false;

    Future<void> autoLoadData(StateSetter setModalState) async {
      setModalState(() => isPinningGps = true);
      try {
        // 1. Auto load profile name, phone, address
        final profile = await ProfileService.getCurrentUserProfileDetails();
        setModalState(() {
          if (nameController.text.isEmpty || nameController.text == 'User') {
            nameController.text = profile['name'] ?? '';
          }
          if (phoneController.text.isEmpty) {
            phoneController.text = profile['phone'] ?? '';
          }
          if (upiController.text.isEmpty) {
            upiController.text = profile['upi_id'] ?? '';
          }
        });

        // 2. Auto pin live GPS location and pincode
        final loc = await LocationService().getCurrentLocation();
        final details = await LocationService().getPincodeAndAddressFromCoordinates(loc.latitude, loc.longitude);
        setModalState(() {
          pincodeController.text = details['pincode'] ?? '641001';
          locationController.text = details['address'] ?? 'Tamil Nadu, India';
        });
      } catch (e) {
        debugPrint("Error auto pinning location/profile in DealO: $e");
      } finally {
        setModalState(() {
          isPinningGps = false;
          hasAutoLoaded = true;
        });
      }
    }

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
            if (!hasAutoLoaded && !isPinningGps) {
              autoLoadData(setModalState);
            }

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
                          "🚀 Post Deal (தமிழ் தட்டச்சு)",
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
                        labelText: "Item Name (பொருள் பெயர் - Tamil / English) *",
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
                    // Auto-Pin Live GPS Location Button
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: isPinningGps ? null : () => autoLoadData(setModalState),
                        icon: isPinningGps
                            ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF00FF00)))
                            : const Icon(Icons.my_location, color: Color(0xFF00FF00), size: 16),
                        label: Text(
                          isPinningGps ? "Detecting Live GPS Pincode..." : "📍 Auto-Pin My Live GPS Location & Pincode",
                          style: const TextStyle(color: Color(0xFF00FF00), fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Color(0xFF00FF00)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          flex: 1,
                          child: TextField(
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
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          flex: 2,
                          child: TextField(
                            controller: locationController,
                            style: const TextStyle(color: Colors.white),
                            decoration: const InputDecoration(
                              labelText: "Address / Location *",
                              labelStyle: TextStyle(color: Colors.grey),
                              filled: true,
                              fillColor: Color(0xFF222222),
                            ),
                          ),
                        ),
                      ],
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
                Row(
                  children: [
                    const Icon(Icons.verified, size: 14, color: Color(0xFF00FF00)),
                    const SizedBox(width: 4),
                    Text(
                      "📍 ${deal['location_name'] ?? 'Local'} (${deal['pincode'] ?? ''}) • Seller: ${deal['seller_name'] ?? 'User'}",
                      style: const TextStyle(color: Colors.grey, fontSize: 12),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF00FF00),
                          foregroundColor: Colors.black,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: () => _shareToWhatsAppStatus(deal),
                        icon: const Icon(Icons.share, size: 18),
                        label: const Text("Share to Status", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF25D366),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: () => _showContactOptionsBottomSheet(deal),
                        icon: const Icon(Icons.contact_phone, size: 18),
                        label: const Text("Contact Seller", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
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
        title: const Text("FAGO DealO (5km Nearby)", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.language, color: Color(0xFF00FF00)),
            tooltip: 'Open Aishlee-Web DealO',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const WebModuleScreen(title: 'DealO - Aishlee Web Marketplace', modulePath: 'dealo'),
                ),
              );
            },
          ),
        ],
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
      body: Column(
        children: [
          // Radius Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: const Color(0xFF181818),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  const Text("📍 Radius: ", style: TextStyle(color: Color(0xFF00FF00), fontWeight: FontWeight.bold, fontSize: 12)),
                  ..._radiusOptions.map((r) => Padding(
                    padding: const EdgeInsets.only(right: 6),
                    child: ChoiceChip(
                      label: Text(r == 999 ? 'All' : '$r km'),
                      selected: _radiusKm == r,
                      selectedColor: const Color(0xFF00FF00),
                      onSelected: (val) => setState(() => _radiusKm = r),
                    ),
                  )),
                ],
              ),
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF00FF00)))
                : TabBarView(
                    controller: _tabController,
                    children: [
                      _buildDealList(_sellDeals),
                      _buildDealList(_buyDeals),
                    ],
                  ),
          ),
        ],
      ),
    );
  }
}
