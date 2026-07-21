import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'dart:ui';
import '../auth/auth_provider.dart';
import '../features/profile/models/profile_model.dart';
import '../features/profile/providers/profile_provider.dart';
import '../core/widgets/whatsapp_helper.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

// ─── Module definitions: title, subtitle, icon, direct web URL ───────────────
final _kBaseUrl = 'https://watscrm.vercel.app';

final _modules = [
  {
    'title': 'TeachO',
    'subtitle': 'Online Academy & Courses',
    'icon': Icons.school_rounded,
    'gradient': [Color(0xFF3B82F6), Color(0xFF2563EB)],
    'url': '$_kBaseUrl/teacho',
  },
  {
    'title': 'TestO',
    'subtitle': 'Assessments & Exams',
    'icon': Icons.fact_check_rounded,
    'gradient': [Color(0xFFEF4444), Color(0xFFDC2626)],
    'url': '$_kBaseUrl/testo',
  },
  {
    'title': 'TourO',
    'subtitle': 'Travel & Tours',
    'icon': Icons.flight_rounded,
    'gradient': [Color(0xFF10B981), Color(0xFF059669)],
    'url': '$_kBaseUrl/touro',
  },
  {
    'title': 'MoneyO',
    'subtitle': 'Finance & Wallet',
    'icon': Icons.account_balance_wallet_rounded,
    'gradient': [Color(0xFFF59E0B), Color(0xFFD97706)],
    'url': '$_kBaseUrl/moneyo',
  },
  {
    'title': 'TaskO',
    'subtitle': 'Task Management',
    'icon': Icons.task_alt_rounded,
    'gradient': [Color(0xFF8B5CF6), Color(0xFF6D28D9)],
    'url': '$_kBaseUrl/tasko',
  },
  {
    'title': 'TradeO',
    'subtitle': 'Business & Trade',
    'icon': Icons.storefront_rounded,
    'gradient': [Color(0xFFEC4899), Color(0xFFBE185D)],
    'url': '$_kBaseUrl/tradeo',
  },
  {
    'title': 'TvO',
    'subtitle': 'Entertainment & Media',
    'icon': Icons.tv_rounded,
    'gradient': [Color(0xFF14B8A6), Color(0xFF0F766E)],
    'url': '$_kBaseUrl/tvo',
  },
  {
    'title': 'ToolsO',
    'subtitle': 'AI Generators & Tools',
    'icon': Icons.build_circle_rounded,
    'gradient': [Color(0xFFF43F5E), Color(0xFFBE123C)],
    'url': '$_kBaseUrl/toolso',
  },
  {
    'title': 'RidO',
    'subtitle': 'Book a Ride',
    'icon': Icons.directions_car_rounded,
    'gradient': [Color(0xFF8B5CF6), Color(0xFF6D28D9)],
    'url': '/rider', // Native screen
  },
  {
    'title': 'RideO',
    'subtitle': 'Driver Dashboard',
    'icon': Icons.navigation_rounded,
    'gradient': [Color(0xFF6366F1), Color(0xFF4338CA)],
    'url': '/driver', // Native screen
  },
  {
    'title': 'DrivO',
    'subtitle': 'Logistics & Delivery',
    'icon': Icons.local_shipping_rounded,
    'gradient': [Color(0xFFEAB308), Color(0xFFCA8A04)],
    'url': '$_kBaseUrl/drivo',
  },
];

class ModuleSelectionScreen extends ConsumerStatefulWidget {
  const ModuleSelectionScreen({super.key});

  @override
  ConsumerState<ModuleSelectionScreen> createState() => _ModuleSelectionScreenState();
}

class _ModuleSelectionScreenState extends ConsumerState<ModuleSelectionScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 900),
      vsync: this,
    );
    _fadeAnimation = CurvedAnimation(parent: _controller, curve: Curves.easeOutQuart);
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _openModule(Map module) {
    final url = module['url'] as String;
    if (url.startsWith('/')) {
      context.go(url);
    } else {
      // The URLs in `_modules` are defined as `$_kBaseUrl/teacho`
      // We need to extract the path segment (e.g. '/teacho')
      final uri = Uri.parse(url);
      context.go(uri.path);
    }
  }

  void _setDefaultModule(String moduleTitle) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1E1E28),
        title: const Text('Set Default Home', style: TextStyle(color: Colors.white)),
        content: Text('Set $moduleTitle as your default home?', style: const TextStyle(color: Colors.white70)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              final userId = Supabase.instance.client.auth.currentUser?.id;
              if (userId != null) {
                await Supabase.instance.client.from('profiles').update({
                  'default_module': moduleTitle.toLowerCase(),
                }).eq('id', userId);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('$moduleTitle set as default!')),
                  );
                }
              }
            },
            child: const Text('Yes', style: TextStyle(color: Color(0xFF6366F1))),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).supabaseUser;
    final userName = user?.userMetadata?['full_name']?.toString().split(' ')[0] ?? 'User';

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0F),
      body: Stack(
        children: [
          // Ambient background glows
          Positioned(
            top: -120,
            left: -80,
            child: Container(
              width: 320,
              height: 320,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF4F46E5).withValues(alpha: 0.25),
              ),
            ),
          ),
          Positioned(
            bottom: -60,
            right: -60,
            child: Container(
              width: 260,
              height: 260,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF10B981).withValues(alpha: 0.15),
              ),
            ),
          ),
          BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 60, sigmaY: 60),
            child: Container(color: Colors.transparent),
          ),

          // Main content
          SafeArea(
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Header ────────────────────────────────────────────────
                  Padding(
                    padding: const EdgeInsets.fromLTRB(24, 28, 24, 0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Welcome back,',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.white.withValues(alpha: 0.55),
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              userName,
                              style: const TextStyle(
                                fontSize: 28,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                                letterSpacing: -0.5,
                              ),
                            ),
                          ],
                        ),
                        // Avatar circle and settings
                        Row(
                          children: [
                            IconButton(
                              icon: const Icon(Icons.settings, color: Colors.white70),
                              onPressed: () => context.push('/profile'),
                            ),
                            const SizedBox(width: 8),
                            GestureDetector(
                              onTap: () => context.push('/profile'),
                              child: Container(
                                width: 46,
                                height: 46,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  gradient: const LinearGradient(
                                    colors: [Color(0xFF6366F1), Color(0xFF3B82F6)],
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: const Color(0xFF6366F1).withValues(alpha: 0.4),
                                      blurRadius: 12,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: Center(
                                  child: Text(
                                    userName[0].toUpperCase(),
                                    style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
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

                  const SizedBox(height: 20),

                  // ── AI Prompt Banner ──────────────────────────────────────
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.03),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.07)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: const Color(0xFF8B5CF6).withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.auto_awesome,
                                color: Color(0xFFC4B5FD), size: 20),
                          ),
                          const SizedBox(width: 14),
                          const Expanded(
                            child: Text(
                              'Select a module — only that page will load. Saves data & loads faster.',
                              style: TextStyle(
                                fontSize: 13,
                                color: Color(0xFFE5E7EB),
                                height: 1.4,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),

                  // ── Section Label ─────────────────────────────────────────
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 24),
                    child: Text(
                      'CHOOSE MODULE',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: Colors.white38,
                        letterSpacing: 2.5,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // ── Module Grid ───────────────────────────────────────────
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: GridView.builder(
                        physics: const BouncingScrollPhysics(),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                          childAspectRatio: 1.05,
                        ),
                        itemCount: _modules.length,
                        itemBuilder: (context, index) {
                          final mod = _modules[index];
                          final colors = mod['gradient'] as List<Color>;
                          final icon = mod['icon'] as IconData;
                          return _ModuleCard(
                            title: mod['title'] as String,
                            subtitle: mod['subtitle'] as String,
                            icon: icon,
                            colors: colors,
                            onTap: () => _openModule(mod),
                            onLongPress: () => _setDefaultModule(mod['title'] as String),
                          );
                        },
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: const WhatsAppHelper(),
    );
  }
}

// ─── Reusable card widget ─────────────────────────────────────────────────────
class _ModuleCard extends StatefulWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final List<Color> colors;
  final VoidCallback onTap;
  final VoidCallback onLongPress;

  const _ModuleCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.colors,
    required this.onTap,
    required this.onLongPress,
  });

  @override
  State<_ModuleCard> createState() => _ModuleCardState();
}

class _ModuleCardState extends State<_ModuleCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _scaleCtrl;
  late Animation<double> _scaleAnim;

  @override
  void initState() {
    super.initState();
    _scaleCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 120),
      lowerBound: 0.95,
      upperBound: 1.0,
      value: 1.0,
    );
    _scaleAnim = _scaleCtrl;
  }

  @override
  void dispose() {
    _scaleCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => _scaleCtrl.reverse(),
      onTapUp: (_) {
        _scaleCtrl.forward();
        widget.onTap();
      },
      onLongPress: widget.onLongPress,
      onTapCancel: () => _scaleCtrl.forward(),
      child: AnimatedBuilder(
        animation: _scaleAnim,
        builder: (context, child) => Transform.scale(
          scale: _scaleAnim.value,
          child: child,
        ),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                widget.colors[0].withValues(alpha: 0.18),
                widget.colors[1].withValues(alpha: 0.06),
              ],
            ),
            border: Border.all(
              color: widget.colors[0].withValues(alpha: 0.35),
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: widget.colors[0].withValues(alpha: 0.12),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: widget.colors[0].withValues(alpha: 0.22),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Icon(widget.icon, color: widget.colors[0], size: 26),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.title,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                            letterSpacing: -0.3,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          widget.subtitle,
                          style: TextStyle(
                            fontSize: 11,
                            color: Colors.white.withValues(alpha: 0.55),
                            height: 1.3,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
