import 'dart:async';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

class MarketListing {
  final String id;
  final String? userId;
  final String sellerName;
  final String sellerPhone;
  final String sellerWhatsapp;
  final String? sellerUpi;
  final String title;
  final String category;
  final int price;
  final String unit;
  final int? quantity;
  final String? description;
  final String pincode;
  final String? district;
  final String? locationName;
  final double? latitude;
  final double? longitude;
  final String status;
  final String createdAt;

  MarketListing({
    required this.id,
    this.userId,
    required this.sellerName,
    required this.sellerPhone,
    required this.sellerWhatsapp,
    this.sellerUpi,
    required this.title,
    required this.category,
    required this.price,
    required this.unit,
    this.quantity,
    this.description,
    required this.pincode,
    this.district,
    this.locationName,
    this.latitude,
    this.longitude,
    required this.status,
    required this.createdAt,
  });

  factory MarketListing.fromJson(Map<String, dynamic> json) {
    return MarketListing(
      id: json['id']?.toString() ?? '',
      userId: json['user_id']?.toString(),
      sellerName: json['seller_name']?.toString() ?? 'Local Trader / உழவர்',
      sellerPhone: json['seller_phone']?.toString() ?? '',
      sellerWhatsapp: json['seller_whatsapp']?.toString() ?? json['seller_phone']?.toString() ?? '',
      sellerUpi: json['seller_upi']?.toString(),
      title: json['title']?.toString() ?? '',
      category: json['category']?.toString() ?? 'livestock',
      price: (json['price'] as num?)?.toInt() ?? 0,
      unit: json['unit']?.toString() ?? 'per_head',
      quantity: (json['quantity'] as num?)?.toInt(),
      description: json['description']?.toString(),
      pincode: json['pincode']?.toString() ?? '',
      district: json['district']?.toString(),
      locationName: json['location_name']?.toString(),
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      status: json['status']?.toString() ?? 'pending',
      createdAt: json['created_at']?.toString() ?? '',
    );
  }
}

class DealoScreen extends StatefulWidget {
  const DealoScreen({super.key});

  @override
  State<DealoScreen> createState() => _DealoScreenState();
}

class _DealoScreenState extends State<DealoScreen> {
  final supabase = Supabase.instance.client;
  List<MarketListing> _listings = [];
  bool _isLoading = true;
  String _searchQuery = '';
  String _selectedPincode = '';
  String _selectedCategory = 'all';
  String _activeTab = 'market'; // 'market' or 'my_listings'

  String? _currentUserPhone;
  String? _currentUserId;

  RealtimeChannel? _listingsChannel;

  final List<Map<String, String>> _categories = [
    {'id': 'all', 'label': 'All Items', 'labelTa': 'அனைத்தும்', 'icon': '🌟'},
    {'id': 'livestock', 'label': 'Livestock', 'labelTa': 'கால்நடைகள் (மாடு/ஆடு)', 'icon': '🐄'},
    {'id': 'cereals', 'label': 'Grains & Crops', 'labelTa': 'தானியங்கள் (நெல்/கம்பு)', 'icon': '🌾'},
    {'id': 'farm_produce', 'label': 'Farm Produce', 'labelTa': 'உழவர் சந்தை (காய்கறி/தேங்காய்)', 'icon': '🥦'},
    {'id': 'machinery_tools', 'label': 'Tools & Agri', 'labelTa': 'விவசாய கருவிகள் (கொழு/மோட்டார்)', 'icon': '🚜'},
    {'id': 'general_shop', 'label': 'Local Shops', 'labelTa': 'உள்ளூர் கடைகள் (உரம்/தீவனம்)', 'icon': '🏪'},
  ];

  final List<Map<String, String>> _popularPincodes = [
    {'pincode': '', 'label': 'All TN'},
    {'pincode': '614904', 'label': '614904 Pattukkottai'},
    {'pincode': '620001', 'label': '620001 Trichy'},
    {'pincode': '614601', 'label': '614601 Pudukkottai'},
    {'pincode': '613001', 'label': '613001 Thanjavur'},
    {'pincode': '625001', 'label': '625001 Madurai'},
  ];

  @override
  void initState() {
    super.initState();
    _loadUserContext();
    _fetchListings();
    _subscribeToListings();
  }

  Future<void> _loadUserContext() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _currentUserPhone = prefs.getString('user_phone') ?? supabase.auth.currentUser?.phone;
      _currentUserId = supabase.auth.currentUser?.id;
    });
  }

  Future<void> _fetchListings() async {
    setState(() => _isLoading = true);
    try {
      final data = await supabase
          .from('market_listings')
          .select('*')
          .order('created_at', ascending: false);

      if (mounted) {
        setState(() {
          _listings = (data as List).map((i) => MarketListing.fromJson(i)).toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _subscribeToListings() {
    _listingsChannel = supabase
        .channel('public:market_listings')
        .onPostgresChanges(
          event: PostgresChangeEvent.all,
          schema: 'public',
          table: 'market_listings',
          callback: (payload) {
            _fetchListings();
          },
        )
        .subscribe();
  }

  @override
  void dispose() {
    if (_listingsChannel != null) {
      supabase.removeChannel(_listingsChannel!);
    }
    super.dispose();
  }

  void _openWhatsApp(MarketListing item) async {
    final cleanPhone = item.sellerWhatsapp.replaceAll(RegExp(r'\D'), '');
    final msg = Uri.encodeComponent(
      'வணக்கம் ${item.sellerName}! 👋\n\nநான் SuprO DealO App-ல் உங்களுடைய "${item.title}" (விலை: ₹${item.price} / ${item.unit.replaceAll('per_', '')}) பார்த்தேன்.\n\nநேரில் பார்த்து வாங்க விரும்புகிறேன். விவரங்களை கூறவும்.',
    );
    final url = Uri.parse('https://wa.me/91$cleanPhone?text=$msg');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  void _payUpi(MarketListing item) async {
    final cleanPhone = item.sellerPhone.replaceAll(RegExp(r'\D'), '');
    final upiId = item.sellerUpi ?? '$cleanPhone@upi';
    final name = Uri.encodeComponent(item.sellerName);
    final note = Uri.encodeComponent('SuprO DealO: ${item.title}');
    final url = Uri.parse('upi://pay?pa=$upiId&pn=$name&am=${item.price}&cu=INR&tn=$note');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFF0D1526),
            content: Text('UPI ID: $upiId (Copy to GPay / PhonePe)'),
          ),
        );
      }
    }
  }

  void _callSeller(MarketListing item) async {
    final cleanPhone = item.sellerPhone.replaceAll(RegExp(r'\D'), '');
    final url = Uri.parse('tel:+91$cleanPhone');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  void _openMaps(MarketListing item) async {
    if (item.latitude != null && item.longitude != null) {
      final url = Uri.parse('https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}');
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
      }
    }
  }

  void _markSold(String id) async {
    try {
      await supabase.from('market_listings').update({'status': 'sold'}).eq('id', id);
      _fetchListings();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: Color(0xFF10B981),
            content: Text('Listing marked as SOLD / விற்றுவிட்டது'),
          ),
        );
      }
    } catch (_) {}
  }

  void _openListGoodsSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0D1526),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => _ListGoodsBottomSheet(
        onCreated: () {
          _fetchListings();
        },
      ),
    );
  }

  List<MarketListing> get _filteredListings {
    final cleanUserPhone = _currentUserPhone?.replaceAll(RegExp(r'\D'), '');

    return _listings.where((item) {
      if (_activeTab == 'my_listings') {
        final cleanSeller = item.sellerPhone.replaceAll(RegExp(r'\D'), '');
        final isMine = item.userId == _currentUserId || (cleanUserPhone != null && cleanSeller.endsWith(cleanUserPhone.length >= 10 ? cleanUserPhone.substring(cleanUserPhone.length - 10) : cleanUserPhone));
        if (!isMine) return false;
      } else {
        if (item.status != 'approved' && item.userId != _currentUserId) {
          return false;
        }
      }

      if (_selectedCategory != 'all' && item.category != _selectedCategory) {
        return false;
      }

      if (_selectedPincode.isNotEmpty && !item.pincode.startsWith(_selectedPincode)) {
        return false;
      }

      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final matchesTitle = item.title.toLowerCase().contains(q);
        final matchesSeller = item.sellerName.toLowerCase().contains(q);
        final matchesPin = item.pincode.contains(q);
        final matchesLoc = (item.locationName ?? '').toLowerCase().contains(q);
        if (!matchesTitle && !matchesSeller && !matchesPin && !matchesLoc) {
          return false;
        }
      }

      return true;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _filteredListings;

    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D1526),
        elevation: 0,
        title: const Row(
          children: [
            Icon(LucideIcons.shoppingBag, color: Color(0xFF10B981), size: 22),
            SizedBox(width: 8),
            Text(
              'DealO • உள்ளூர் சந்தை',
              style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw, color: Color(0xFF10B981), size: 18),
            onPressed: _fetchListings,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openListGoodsSheet,
        backgroundColor: const Color(0xFF10B981),
        foregroundColor: Colors.black,
        icon: const Icon(LucideIcons.plus, size: 18),
        label: const Text(
          'விற்பனை செய் (List Goods)',
          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
        ),
      ),
      body: Column(
        children: [
          // Pincode & Search Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: const Color(0xFF0D1526),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        onChanged: (v) => setState(() => _searchQuery = v),
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                        decoration: InputDecoration(
                          hintText: 'Search goods, cattle, paddy, or pincode...',
                          hintStyle: const TextStyle(color: Color(0xFF475569), fontSize: 12),
                          prefixIcon: const Icon(LucideIcons.search, color: Color(0xFF10B981), size: 16),
                          filled: true,
                          fillColor: const Color(0xFF111C35),
                          contentPadding: const EdgeInsets.symmetric(vertical: 8),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: BorderSide.none,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF111C35),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0x3310B981)),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: _selectedPincode,
                          dropdownColor: const Color(0xFF111C35),
                          icon: const Icon(LucideIcons.mapPin, color: Color(0xFF10B981), size: 16),
                          style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                          items: _popularPincodes.map((p) {
                            return DropdownMenuItem<String>(
                              value: p['pincode'],
                              child: Text(p['label']!),
                            );
                          }).toList(),
                          onChanged: (v) {
                            if (v != null) setState(() => _selectedPincode = v);
                          },
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Market vs My Listings Tab Bar
                Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _activeTab = 'market'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          decoration: BoxDecoration(
                            color: _activeTab == 'market' ? const Color(0xFF10B981) : const Color(0xFF111C35),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Center(
                            child: Text(
                              '🏪 Live Market (${_listings.where((l) => l.status == 'approved').length})',
                              style: TextStyle(
                                color: _activeTab == 'market' ? Colors.black : Colors.white,
                                fontWeight: FontWeight.w900,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _activeTab = 'my_listings'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          decoration: BoxDecoration(
                            color: _activeTab == 'my_listings' ? const Color(0xFF10B981) : const Color(0xFF111C35),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Center(
                            child: Text(
                              '📦 My Listings',
                              style: TextStyle(
                                color: _activeTab == 'my_listings' ? Colors.black : Colors.white,
                                fontWeight: FontWeight.w900,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Categories Horizontal Carousel
          Container(
            height: 48,
            color: const Color(0xFF0A0F1E),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              itemCount: _categories.length,
              itemBuilder: (ctx, idx) {
                final cat = _categories[idx];
                final isSelected = _selectedCategory == cat['id'];
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text('${cat['icon']} ${cat['label']}'),
                    selected: isSelected,
                    onSelected: (_) => setState(() => _selectedCategory = cat['id']!),
                    backgroundColor: const Color(0xFF0D1526),
                    selectedColor: const Color(0xFF10B981),
                    checkmarkColor: Colors.black,
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.black : Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: BorderSide(
                        color: isSelected ? const Color(0xFF10B981) : const Color(0x3310B981),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          // Listings Grid / Feed
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: Color(0xFF10B981)),
                  )
                : filtered.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(LucideIcons.shoppingBag, color: Color(0x3310B981), size: 48),
                            const SizedBox(height: 12),
                            const Text(
                              'No listings found',
                              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _searchQuery.isNotEmpty || _selectedPincode.isNotEmpty
                                  ? 'Try changing your search or pincode'
                                  : 'Be the first local trader to list goods in your town!',
                              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: _openListGoodsSheet,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF10B981),
                                foregroundColor: Colors.black,
                              ),
                              child: const Text('+ 1-Click List My Goods', style: TextStyle(fontWeight: FontWeight.w900)),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.fromLTRB(14, 8, 14, 80),
                        itemCount: filtered.length,
                        itemBuilder: (ctx, idx) {
                          final item = filtered[idx];
                          return _buildListingCard(item);
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildListingCard(MarketListing item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0D1526),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0x3310B981)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0D000000),
            blurRadius: 12,
            offset: Offset(0, 4),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Pincode Badge & Status
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(LucideIcons.mapPin, color: Color(0xFF10B981), size: 12),
                    const SizedBox(width: 4),
                    Text(
                      '${item.pincode} • ${item.district ?? item.locationName ?? 'Tamil Nadu'}',
                      style: const TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.w900),
                    ),
                  ],
                ),
              ),
              if (item.status == 'pending')
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF59E0B).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.3)),
                  ),
                  child: const Text('🟡 PENDING', style: TextStyle(color: Color(0xFFF59E0B), fontSize: 10, fontWeight: FontWeight.bold)),
                )
              else if (item.status == 'sold')
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFF64748B).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text('⚪ SOLD OUT', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 10, fontWeight: FontWeight.bold)),
                )
              else
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                  ),
                  child: const Text('🟢 VERIFIED LIVE', style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold)),
                ),
            ],
          ),
          const SizedBox(height: 10),

          // Title & Price
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  item.title,
                  style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900),
                ),
              ),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '₹${item.price}',
                    style: const TextStyle(color: Color(0xFF34D399), fontSize: 18, fontWeight: FontWeight.w900),
                  ),
                  Text(
                    '/${item.unit.replaceAll('per_', '')}',
                    style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 6),

          // Trader Info
          Text(
            '👤 ${item.sellerName} • 📦 ${item.quantity != null ? "Stock: ${item.quantity}" : "In Stock"}',
            style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
          ),

          if (item.description != null && item.description!.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              item.description!,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 12),
            ),
          ],

          if (item.sellerUpi != null && item.sellerUpi!.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              'UPI ID: ${item.sellerUpi}',
              style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 11, fontWeight: FontWeight.bold),
            ),
          ],

          const SizedBox(height: 14),

          // 1-Tap Action Row
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _openWhatsApp(item),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF25D366),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: const Icon(LucideIcons.messageCircle, size: 16),
                  label: const Text('வாட்ஸ்அப்', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12)),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _payUpi(item),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0052CC),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: const Icon(LucideIcons.creditCard, size: 16),
                  label: const Text('UPI Pay', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12)),
                ),
              ),
              const SizedBox(width: 8),
              InkWell(
                onTap: () => _callSeller(item),
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF111C35),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0x3310B981)),
                  ),
                  child: const Icon(LucideIcons.phone, color: Color(0xFF10B981), size: 16),
                ),
              ),
              if (item.latitude != null && item.longitude != null) ...[
                const SizedBox(width: 6),
                InkWell(
                  onTap: () => _openMaps(item),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF111C35),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0x3310B981)),
                    ),
                    child: const Icon(LucideIcons.navigation, color: Color(0xFF10B981), size: 16),
                  ),
                ),
              ],
            ],
          ),

          if (_activeTab == 'my_listings' && item.status != 'sold') ...[
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () => _markSold(item.id),
                style: OutlinedButton.styleFrom(
                  foregroundColor: const Color(0xFF10B981),
                  side: const BorderSide(color: Color(0xFF10B981)),
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                icon: const Icon(LucideIcons.check, size: 14),
                label: const Text('Mark as Sold / விற்றுவிட்டது', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _ListGoodsBottomSheet extends StatefulWidget {
  final VoidCallback onCreated;

  const _ListGoodsBottomSheet({required this.onCreated});

  @override
  State<_ListGoodsBottomSheet> createState() => _ListGoodsBottomSheetState();
}

class _ListGoodsBottomSheetState extends State<_ListGoodsBottomSheet> {
  final _titleController = TextEditingController();
  final _priceController = TextEditingController();
  final _quantityController = TextEditingController(text: '1');
  final _pincodeController = TextEditingController(text: '614904');
  final _locationController = TextEditingController(text: 'Pattukkottai, Thanjavur');
  final _upiController = TextEditingController();
  final _descController = TextEditingController();

  String _selectedCategory = 'livestock';
  String _selectedUnit = 'per_head';
  bool _isSubmitting = false;

  final List<Map<String, String>> _categories = [
    {'id': 'livestock', 'label': '🐄 Livestock'},
    {'id': 'cereals', 'label': '🌾 Grains & Crops'},
    {'id': 'farm_produce', 'label': '🥦 Farm Produce'},
    {'id': 'machinery_tools', 'label': '🚜 Tools & Agri'},
    {'id': 'general_shop', 'label': '🏪 Local Shop'},
  ];

  final List<Map<String, String>> _units = [
    {'id': 'per_head', 'label': 'Per Head (எண்ணிக்கை)'},
    {'id': 'per_bag', 'label': 'Per Bag (மூட்டை)'},
    {'id': 'per_kg', 'label': 'Per Kg (கிலோ)'},
    {'id': 'per_item', 'label': 'Per Item (பொருள்)'},
    {'id': 'per_ton', 'label': 'Per Ton (டன்)'},
  ];

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  void _loadProfile() async {
    final prefs = await SharedPreferences.getInstance();
    final phone = prefs.getString('user_phone') ?? '6381029380';
    final cleanPhone = phone.replaceAll(RegExp(r'\D'), '');
    final last10 = cleanPhone.length >= 10 ? cleanPhone.substring(cleanPhone.length - 10) : cleanPhone;
    setState(() {
      _upiController.text = '$last10@upi';
    });
  }

  void _submit() async {
    if (_titleController.text.trim().isEmpty || _priceController.text.trim().isEmpty || _pincodeController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill Title, Price, and Pincode')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final supabase = Supabase.instance.client;
      final prefs = await SharedPreferences.getInstance();
      final phone = prefs.getString('user_phone') ?? supabase.auth.currentUser?.phone ?? '6381029380';
      final cleanPhone = phone.replaceAll(RegExp(r'\D'), '');
      final last10 = cleanPhone.length >= 10 ? cleanPhone.substring(cleanPhone.length - 10) : cleanPhone;
      final name = prefs.getString('user_name') ?? 'Local Trader / உழவர்';

      await supabase.from('market_listings').insert({
        'user_id': supabase.auth.currentUser?.id,
        'seller_name': name,
        'seller_phone': last10,
        'seller_whatsapp': last10,
        'seller_upi': _upiController.text.trim().isNotEmpty ? _upiController.text.trim() : '$last10@upi',
        'title': _titleController.text.trim(),
        'category': _selectedCategory,
        'price': int.tryParse(_priceController.text.trim()) ?? 0,
        'unit': _selectedUnit,
        'quantity': int.tryParse(_quantityController.text.trim()) ?? 1,
        'description': _descController.text.trim(),
        'pincode': _pincodeController.text.trim().replaceAll(RegExp(r'\D'), '').substring(0, 6),
        'district': _locationController.text.split(',').length > 1 ? _locationController.text.split(',')[1].trim() : 'Thanjavur',
        'location_name': _locationController.text.trim(),
        'status': 'pending',
      });

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: Color(0xFF10B981),
            content: Text('🎉 Your listing has been submitted for Pincode Admin verification!'),
          ),
        );
        widget.onCreated();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(backgroundColor: Colors.redAccent, content: Text('Failed: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('விற்பனைக்கு பதிவு செய்', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
                    Text('List Cow, Goat, Cereals & Goods with 1-Click', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                  ],
                ),
                IconButton(
                  icon: const Icon(LucideIcons.x, color: Colors.white),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Category Dropdown
            const Text('CATEGORY / வகை', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF111C35),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0x3310B981)),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedCategory,
                  dropdownColor: const Color(0xFF111C35),
                  isExpanded: true,
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                  items: _categories.map((c) => DropdownMenuItem(value: c['id'], child: Text(c['label']!))).toList(),
                  onChanged: (v) {
                    if (v != null) setState(() => _selectedCategory = v);
                  },
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Title
            const Text('ITEM TITLE (பொருள் பெயர்) *', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            TextField(
              controller: _titleController,
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: InputDecoration(
                hintText: 'e.g. நாட்டு காங்கேயம் கறவை பசு / பொன்னி நெல்',
                hintStyle: const TextStyle(color: Color(0xFF475569)),
                filled: true,
                fillColor: const Color(0xFF111C35),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 12),

            // Price & Quantity
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('PRICE (விலை ₹) *', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      TextField(
                        controller: _priceController,
                        keyboardType: TextInputType.number,
                        style: const TextStyle(color: Colors.white, fontSize: 14),
                        decoration: InputDecoration(
                          hintText: '45000',
                          hintStyle: const TextStyle(color: Color(0xFF475569)),
                          filled: true,
                          fillColor: const Color(0xFF111C35),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('QUANTITY (அளவு)', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      TextField(
                        controller: _quantityController,
                        keyboardType: TextInputType.number,
                        style: const TextStyle(color: Colors.white, fontSize: 14),
                        decoration: InputDecoration(
                          hintText: '1',
                          hintStyle: const TextStyle(color: Color(0xFF475569)),
                          filled: true,
                          fillColor: const Color(0xFF111C35),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Unit Selector
            const Text('PRICE UNIT (விலை முறை)', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF111C35),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0x3310B981)),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedUnit,
                  dropdownColor: const Color(0xFF111C35),
                  isExpanded: true,
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                  items: _units.map((u) => DropdownMenuItem(value: u['id'], child: Text(u['label']!))).toList(),
                  onChanged: (v) {
                    if (v != null) setState(() => _selectedUnit = v);
                  },
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Pincode & Town
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('6-DIGIT PINCODE *', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      TextField(
                        controller: _pincodeController,
                        keyboardType: TextInputType.number,
                        maxLength: 6,
                        style: const TextStyle(color: Colors.white, fontSize: 14),
                        decoration: InputDecoration(
                          counterText: '',
                          hintText: '614904',
                          hintStyle: const TextStyle(color: Color(0xFF475569)),
                          filled: true,
                          fillColor: const Color(0xFF111C35),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('VILLAGE / TOWN', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      TextField(
                        controller: _locationController,
                        style: const TextStyle(color: Colors.white, fontSize: 14),
                        decoration: InputDecoration(
                          hintText: 'Pattukkottai',
                          hintStyle: const TextStyle(color: Color(0xFF475569)),
                          filled: true,
                          fillColor: const Color(0xFF111C35),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // UPI ID
            const Text('TRADER UPI ID (நேரடி கட்டணம்)', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            TextField(
              controller: _upiController,
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: InputDecoration(
                hintText: 'e.g. 6381029380@upi',
                hintStyle: const TextStyle(color: Color(0xFF475569)),
                filled: true,
                fillColor: const Color(0xFF111C35),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 12),

            // Description
            const Text('DESCRIPTION (விவரங்கள்)', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            TextField(
              controller: _descController,
              maxLines: 2,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                hintText: 'நாட்டு இனம், பால் அளவு, தரம் போன்ற விவரங்களை குறிப்பிடவும்...',
                hintStyle: const TextStyle(color: Color(0xFF475569)),
                filled: true,
                fillColor: const Color(0xFF111C35),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 18),

            ElevatedButton(
              onPressed: _isSubmitting ? null : _submit,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF10B981),
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: _isSubmitting
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                  : const Text('Submit Listing / பதிவிடு', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
            ),
          ],
        ),
      ),
    );
  }
}
