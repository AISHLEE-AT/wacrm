import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'dart:ui';
import '../auth/auth_provider.dart';



final _modules = [
  {
    'title': 'TeachO',
    'subtitle': 'Online Academy & Courses',
    'icon': Icons.school_rounded,
    'gradient': [Color(0xFF3B82F6), Color(0xFF2563EB)],
    'id': 'teacho',
  },
  {
    'title': 'TestO',
    'subtitle': 'Assessments & Exams',
    'icon': Icons.fact_check_rounded,
    'gradient': [Color(0xFFEF4444), Color(0xFFDC2626)],
    'id': 'testo',
  },
  {
    'title': 'TourO',
    'subtitle': 'Travel & Tours',
    'icon': Icons.flight_rounded,
    'gradient': [Color(0xFF10B981), Color(0xFF059669)],
    'id': 'touro',
  },
  {
    'title': 'MoneyO',
    'subtitle': 'Finance & Wallet',
    'icon': Icons.account_balance_wallet_rounded,
    'gradient': [Color(0xFFF59E0B), Color(0xFFD97706)],
    'id': 'moneyo',
  },
  {
    'title': 'TaskO',
    'subtitle': 'Task Management',
    'icon': Icons.task_alt_rounded,
    'gradient': [Color(0xFF8B5CF6), Color(0xFF6D28D9)],
    'id': 'tasko',
  },
  {
    'title': 'TradeO',
    'subtitle': 'Business & Trade',
    'icon': Icons.storefront_rounded,
    'gradient': [Color(0xFFEC4899), Color(0xFFBE185D)],
    'id': 'tradeo',
  },
  {
    'title': 'TvO',
    'subtitle': 'Entertainment & Media',
    'icon': Icons.tv_rounded,
    'gradient': [Color(0xFF14B8A6), Color(0xFF0F766E)],
    'id': 'tvo',
  },
  {
    'id': 'toolso',
    'title': 'ToolsO',
    'subtitle': 'AI Generators & Tools',
    'icon': Icons.build_circle_rounded,
    'gradient': [Color(0xFFF43F5E), Color(0xFFE11D48)],
  },
  {
    'id': 'rido',
    'title': 'RidO',
    'subtitle': 'Book a Ride',
    'icon': Icons.directions_car_rounded,
    'gradient': [Color(0xFF8B5CF6), Color(0xFF7C3AED)],
  },
  {
    'id': 'rideo',
    'title': 'RideO',
    'subtitle': 'Driver Dashboard',
    'icon': Icons.navigation_rounded,
    'gradient': [Color(0xFF6366F1), Color(0xFF4F46E5)],
  },
  {
    'title': 'DrivO',
    'subtitle': 'Logistics & Delivery',
    'icon': Icons.local_shipping_rounded,
    'gradient': [Color(0xFFEAB308), Color(0xFFCA8A04)],
    'id': 'drivo',
  },
];

final _categories = [
  {'title': 'Student', 'icon': Icons.school, 'color': Color(0xFF3B82F6)},
  {'title': 'Professional', 'icon': Icons.work, 'color': Color(0xFF10B981)},
  {'title': 'Driver', 'icon': Icons.local_taxi, 'color': Color(0xFF6366F1)},
  {'title': 'Business Owner', 'icon': Icons.store, 'color': Color(0xFFF59E0B)},
  {'title': 'Farmer', 'icon': Icons.agriculture, 'color': Color(0xFF14B8A6)},
  {'title': 'Other', 'icon': Icons.more_horiz, 'color': Color(0xFF8B5CF6)},
];

class SetupScreen extends ConsumerStatefulWidget {
  const SetupScreen({super.key});

  @override
  ConsumerState<SetupScreen> createState() => _SetupScreenState();
}

class _SetupScreenState extends ConsumerState<SetupScreen> {
  int _currentStep = 0;
  final _nameController = TextEditingController();
  final _whatsappController = TextEditingController();
  String? _selectedCategory;
  String? _selectedModule;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    // Pre-fill if user has name
    final user = Supabase.instance.client.auth.currentUser;
    if (user != null) {
      final name = user.userMetadata?['full_name'];
      if (name != null) {
        _nameController.text = name;
      }
    }
  }

  Future<void> _submit(bool skipped) async {
    setState(() => _isLoading = true);
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user != null) {
        await Supabase.instance.client.from('profiles').update({
          if (_nameController.text.isNotEmpty) 'full_name': _nameController.text,
          if (_whatsappController.text.isNotEmpty) 'whatsapp': '+91${_whatsappController.text}',
          if (_selectedCategory != null) 'main_category': _selectedCategory,
          if (_selectedModule != null && !skipped) 'default_module': _selectedModule,
          'profile_complete': true,
        }).eq('id', user.id);
        
        // Force provider refresh
        ref.invalidate(authProvider);

        if (mounted) {
           if (!skipped && _selectedModule != null) {
             context.go('/$_selectedModule');
           } else {
             context.go('/');
           }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Widget _buildStep1() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Let\'s get to know you', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
        const SizedBox(height: 8),
        const Text('Enter your details below.', style: TextStyle(color: Colors.white70)),
        const SizedBox(height: 32),
        TextFormField(
          controller: _nameController,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            labelText: 'Full Name',
            labelStyle: const TextStyle(color: Colors.white54),
            enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)), borderRadius: BorderRadius.circular(12)),
            focusedBorder: OutlineInputBorder(borderSide: const BorderSide(color: Color(0xFF6366F1)), borderRadius: BorderRadius.circular(12)),
            filled: true,
            fillColor: Colors.white.withValues(alpha: 0.05),
          ),
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _whatsappController,
          style: const TextStyle(color: Colors.white),
          keyboardType: TextInputType.phone,
          maxLength: 10,
          decoration: InputDecoration(
            labelText: 'WhatsApp Number',
            prefixText: '+91 ',
            prefixStyle: const TextStyle(color: Colors.white),
            labelStyle: const TextStyle(color: Colors.white54),
            enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)), borderRadius: BorderRadius.circular(12)),
            focusedBorder: OutlineInputBorder(borderSide: const BorderSide(color: Color(0xFF6366F1)), borderRadius: BorderRadius.circular(12)),
            filled: true,
            fillColor: Colors.white.withValues(alpha: 0.05),
            counterText: '',
          ),
        ),
        const Spacer(),
        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
            onPressed: () {
              final isValidPhone = _whatsappController.text.length == 10 && RegExp(r'^[6-9]\d{9}$').hasMatch(_whatsappController.text);
              if (_nameController.text.isNotEmpty && isValidPhone) {
                setState(() => _currentStep = 1);
              } else {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter valid name and a 10-digit Indian WhatsApp number')));
              }
            },
            child: const Text('Next', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          ),
        ),
      ],
    );
  }

  Widget _buildStep2() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('What do you do?', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
        const SizedBox(height: 8),
        const Text('Select your main category.', style: TextStyle(color: Colors.white70)),
        const SizedBox(height: 24),
        Expanded(
          child: GridView.builder(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.2,
            ),
            itemCount: _categories.length,
            itemBuilder: (context, index) {
              final cat = _categories[index];
              final isSelected = _selectedCategory == cat['title'];
              final color = cat['color'] as Color;
              return GestureDetector(
                onTap: () => setState(() => _selectedCategory = cat['title'] as String),
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    color: isSelected ? color.withValues(alpha: 0.2) : Colors.white.withValues(alpha: 0.05),
                    border: Border.all(
                      color: isSelected ? color : Colors.white.withValues(alpha: 0.1),
                      width: 2,
                    ),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(cat['icon'] as IconData, color: isSelected ? color : Colors.white54, size: 32),
                      const SizedBox(height: 8),
                      Text(cat['title'] as String, style: TextStyle(color: isSelected ? Colors.white : Colors.white70, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
            onPressed: () {
              if (_selectedCategory != null) {
                setState(() => _currentStep = 2);
              } else {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select a category')));
              }
            },
            child: const Text('Next', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          ),
        ),
      ],
    );
  }

  Widget _buildStep3() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Choose Default Home', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
        const SizedBox(height: 8),
        const Text('You can change this later in settings.', style: TextStyle(color: Colors.white70)),
        const SizedBox(height: 24),
        Expanded(
          child: GridView.builder(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.05,
            ),
            itemCount: _modules.length,
            itemBuilder: (context, index) {
              final mod = _modules[index];
              final isSelected = _selectedModule == mod['id'];
              final colors = mod['gradient'] as List<Color>;
              return GestureDetector(
                onTap: () => setState(() => _selectedModule = mod['id'] as String),
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    gradient: LinearGradient(
                      colors: [colors[0].withValues(alpha: isSelected ? 0.3 : 0.1), colors[1].withValues(alpha: isSelected ? 0.1 : 0.05)],
                      begin: Alignment.topLeft, end: Alignment.bottomRight,
                    ),
                    border: Border.all(
                      color: isSelected ? colors[0] : colors[0].withValues(alpha: 0.3),
                      width: isSelected ? 2 : 1,
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Icon(mod['icon'] as IconData, color: colors[0], size: 28),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(mod['title'] as String, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                            const SizedBox(height: 4),
                            Text(mod['subtitle'] as String, style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 11)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
        Row(
          children: [
            Expanded(
              child: TextButton(
                onPressed: _isLoading ? null : () => _submit(true),
                child: const Text('Skip', style: TextStyle(color: Colors.white54)),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              flex: 2,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF6366F1),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                onPressed: _isLoading ? null : () {
                  if (_selectedModule != null) {
                    _submit(false);
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select a module or Skip')));
                  }
                },
                child: _isLoading 
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('Finish', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0F),
      body: Stack(
        children: [
          // Background Glows
          Positioned(top: -100, left: -50, child: Container(width: 250, height: 250, decoration: BoxDecoration(shape: BoxShape.circle, color: const Color(0xFF6366F1).withValues(alpha: 0.2)))),
          Positioned(bottom: -50, right: -50, child: Container(width: 200, height: 200, decoration: BoxDecoration(shape: BoxShape.circle, color: const Color(0xFF10B981).withValues(alpha: 0.15)))),
          BackdropFilter(filter: ImageFilter.blur(sigmaX: 50, sigmaY: 50), child: Container(color: Colors.transparent)),
          
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                children: [
                  Row(
                    children: [
                      if (_currentStep > 0)
                        IconButton(
                          icon: const Icon(Icons.arrow_back, color: Colors.white),
                          onPressed: () => setState(() => _currentStep--),
                        ),
                      if (_currentStep == 0) const SizedBox(width: 48), // balance layout
                      Expanded(
                        child: LinearProgressIndicator(
                          value: (_currentStep + 1) / 3,
                          backgroundColor: Colors.white.withValues(alpha: 0.1),
                          valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF6366F1)),
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      const SizedBox(width: 48), // balance back button
                    ],
                  ),
                  const SizedBox(height: 32),
                  Expanded(
                    child: AnimatedSwitcher(
                      duration: const Duration(milliseconds: 300),
                      child: _currentStep == 0 ? _buildStep1() : _currentStep == 1 ? _buildStep2() : _buildStep3(),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
