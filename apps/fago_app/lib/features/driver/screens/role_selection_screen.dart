import 'package:flutter/material.dart';
import 'login_screen.dart';

class RoleSelectionScreen extends StatelessWidget {
  const RoleSelectionScreen({super.key});

  void _selectRole(BuildContext context, String role) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => LoginScreen(role: role)),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Next.js max-w-4xl roughly matches standard padding constraints, but we'll adapt for mobile.
    return Scaffold(
      backgroundColor: const Color(0xFF121212), // Match Next.js dark mode background roughly
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Banner (Super App)
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Colors.black, Color(0xFF262626)], // from-black to-neutral-800
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.3),
                      blurRadius: 15,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      height: 48,
                      width: 48,
                      decoration: BoxDecoration(
                        color: const Color(0xFF171717), // bg-neutral-900
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFF10B981)), // border-emerald-500
                      ),
                      child: const Icon(Icons.bolt, color: Color(0xFF10B981), size: 24),
                    ),
                    const SizedBox(width: 16),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Super App',
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                            letterSpacing: -0.5,
                          ),
                        ),
                        Text(
                          'Your world in one place',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.white70, // text-neutral-400
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 32),

              const Text(
                'What do you need today, there?',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),

              const SizedBox(height: 24),

              // TransO Card
              _buildRoleCard(
                context,
                title: 'Book a Ride',
                subtitle: 'Fast and reliable rides for your daily commute. Auto, Bike, and Cabs.',
                icon: Icons.directions_car,
                gradientColors: [const Color(0xFFECFDF5), const Color(0xFFD1FAE5)], // emerald-50 to emerald-100
                borderColor: const Color(0xFFD1FAE5), // border-emerald-100
                iconColor: const Color(0xFF059669), // text-emerald-600
                textColor: const Color(0xFF064E3B), // text-emerald-900
                subtitleColor: const Color(0xFF047857), // text-emerald-700
                badgeText: 'TransO',
                badgeBgColor: const Color(0xFFA7F3D0).withOpacity(0.5), // emerald-200/50
                badgeTextColor: const Color(0xFF065F46), // emerald-800
                role: 'rider',
              ),

              const SizedBox(height: 16),

              // TradO Card
              _buildRoleCard(
                context,
                title: 'Hire a Service',
                subtitle: 'Find plumbers, electricians, catering, and more near you.',
                icon: Icons.search,
                gradientColors: [const Color(0xFFF8FAFC), const Color(0xFFE2E8F0)], // slate-50 to slate-200
                borderColor: const Color(0xFFE2E8F0), // border-slate-200
                iconColor: const Color(0xFF1E293B), // text-slate-800
                textColor: const Color(0xFF0F172A), // text-slate-900
                subtitleColor: const Color(0xFF334155), // text-slate-700
                badgeText: 'TradO',
                badgeBgColor: const Color(0xFFCBD5E1), // slate-300
                badgeTextColor: const Color(0xFF1E293B), // slate-800
                role: 'trado', // Assuming tradO uses a different role or just placeholder
              ),

              const SizedBox(height: 16),

              // DrivO Card
              _buildRoleCard(
                context,
                title: 'Drive & Earn',
                subtitle: 'Register your vehicle and start earning by driving for TransO.',
                icon: Icons.work_outline,
                gradientColors: [const Color(0xFFFFF7ED), const Color(0xFFFFEDD5)], // orange-50 to orange-100
                borderColor: const Color(0xFFFED7AA), // orange-200
                iconColor: const Color(0xFFEA580C), // orange-600
                textColor: const Color(0xFF7C2D12), // orange-900
                subtitleColor: const Color(0xFFC2410C), // orange-700
                badgeText: 'DrivO',
                badgeBgColor: const Color(0xFFFED7AA), // orange-200
                badgeTextColor: const Color(0xFF9A3412), // orange-800
                role: 'driver',
              ),

              const SizedBox(height: 16),

              // Admin Card (Bonus since they need admin login)
              _buildRoleCard(
                context,
                title: 'Manage Platform',
                subtitle: 'Admin dashboard to manage drivers and payouts.',
                icon: Icons.admin_panel_settings_outlined,
                gradientColors: [const Color(0xFFF1F5F9), const Color(0xFFCBD5E1)], // slate
                borderColor: const Color(0xFF94A3B8), 
                iconColor: const Color(0xFF334155), 
                textColor: const Color(0xFF0F172A), 
                subtitleColor: const Color(0xFF475569), 
                badgeText: 'Admin',
                badgeBgColor: const Color(0xFF94A3B8), 
                badgeTextColor: const Color(0xFF0F172A), 
                role: 'admin',
              ),

              const SizedBox(height: 32),

              // Safe & Secure footer
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E1E1E), // bg-card
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF333333)), // border-border
                ),
                child: Row(
                  children: [
                    const Icon(Icons.shield_outlined, color: Color(0xFF10B981), size: 32),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Safe & Secure',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'All our drivers and service providers are verified for your safety.',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.white70,
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
      ),
    );
  }

  Widget _buildRoleCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required List<Color> gradientColors,
    required Color borderColor,
    required Color iconColor,
    required Color textColor,
    required Color subtitleColor,
    required String badgeText,
    required Color badgeBgColor,
    required Color badgeTextColor,
    required String role,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => _selectRole(context, role),
        borderRadius: BorderRadius.circular(24),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: gradientColors,
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: borderColor),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(icon, color: iconColor, size: 40),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: badgeBgColor,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Text(
                      badgeText,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: badgeTextColor,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                title,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: textColor,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                subtitle,
                style: TextStyle(
                  fontSize: 14,
                  color: subtitleColor,
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
