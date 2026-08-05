import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../auth/providers/auth_provider.dart';

class CategoryItem {
  final String id;
  final String title;
  final String desc;
  final IconData icon;
  final Color color;
  final Color bgColor;
  final String path;
  final bool adminOnly;

  CategoryItem({
    required this.id,
    required this.title,
    required this.desc,
    required this.icon,
    required this.color,
    required this.bgColor,
    required this.path,
    this.adminOnly = false,
  });
}

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final List<CategoryItem> categories = [
    CategoryItem(
      id: 'admin',
      title: 'Admin CRM',
      desc: 'Manage Everything',
      icon: LucideIcons.shield,
      color: const Color(0xFFef4444),
      bgColor: const Color(0x33ef4444),
      path: '/admin',
      adminOnly: true,
    ),
    CategoryItem(
      id: 'rideo',
      title: 'RideO',
      desc: 'Book Cabs & Autos',
      icon: LucideIcons.car,
      color: const Color(0xFF10b981),
      bgColor: const Color(0x3310b981),
      path: '/ride',
    ),
    CategoryItem(
      id: 'driveo',
      title: 'DriveO',
      desc: 'Driver Partner Hub',
      icon: LucideIcons.mapPin,
      color: const Color(0xFF3b82f6),
      bgColor: const Color(0x333b82f6),
      path: '/driveo',
    ),
    CategoryItem(
      id: 'dealo',
      title: 'DealO',
      desc: 'Local Deals & Offers',
      icon: LucideIcons.shoppingBag,
      color: const Color(0xFFf97316),
      bgColor: const Color(0x33f97316),
      path: '/dealo',
    ),
    CategoryItem(
      id: 'teacho',
      title: 'TeachO',
      desc: 'Courses & Tuitions',
      icon: LucideIcons.graduationCap,
      color: const Color(0xFFf59e0b),
      bgColor: const Color(0x33f59e0b),
      path: '/teacho',
    ),
    CategoryItem(
      id: 'rento',
      title: 'RentO',
      desc: 'Agri Equipment Rental',
      icon: LucideIcons.wrench,
      color: const Color(0xFF84cc16),
      bgColor: const Color(0x3384cc16),
      path: '/rento',
    ),
    CategoryItem(
      id: 'agro',
      title: 'AgrO & Mandi',
      desc: 'Crop Rates & Seeds',
      icon: LucideIcons.leaf,
      color: const Color(0xFF10b981),
      bgColor: const Color(0x3310b981),
      path: '/agro',
    ),
    CategoryItem(
      id: 'touro',
      title: 'TourO',
      desc: 'Temple & Local Tours',
      icon: LucideIcons.compass,
      color: const Color(0xFF06b6d4),
      bgColor: const Color(0x3306b6d4),
      path: '/touro',
    ),
    CategoryItem(
      id: 'testo',
      title: 'TestO',
      desc: 'Mock Exams & Quiz',
      icon: LucideIcons.award,
      color: const Color(0xFF8b5cf6),
      bgColor: const Color(0x338b5cf6),
      path: '/testo',
    ),
    CategoryItem(
      id: 'tvo',
      title: 'TvO',
      desc: 'Tamil Live TV & Streams',
      icon: LucideIcons.monitorPlay,
      color: const Color(0xFFec4899),
      bgColor: const Color(0x33ec4899),
      path: '/tvo',
    ),
    CategoryItem(
      id: 'moneyo',
      title: 'MoneyO',
      desc: 'Micro Loans & Savings',
      icon: LucideIcons.wallet,
      color: const Color(0xFF14b8a6),
      bgColor: const Color(0x3314b8a6),
      path: '/moneyo',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final userRole = ref.watch(currentUserProvider)?.role;

    final filteredCategories = categories.where((cat) {
      if (cat.adminOnly && userRole != 'admin') return false;
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0a0f1e),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'SuprO Ecosystem',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF10b981),
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Select a module to get started',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF94a3b8),
                        ),
                      ),
                    ],
                  ),
                  InkWell(
                    onTap: () => context.push('/dashboard'),
                    borderRadius: BorderRadius.circular(24),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: const Color(0xFF334155)),
                      ),
                      child: const Icon(LucideIcons.user, color: Colors.white, size: 24),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: GridView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 0.85,
                ),
                itemCount: filteredCategories.length,
                itemBuilder: (context, index) {
                  final cat = filteredCategories[index];
                  return InkWell(
                    onTap: () => context.push(cat.path),
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF111827),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: cat.color.withOpacity(0.3)),
                        boxShadow: [
                          BoxShadow(
                            color: cat.color.withOpacity(0.05),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          )
                        ],
                      ),
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: cat.bgColor,
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Icon(cat.icon, color: cat.color, size: 28),
                          ),
                          const Spacer(),
                          Text(
                            cat.title,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            cat.desc,
                            style: const TextStyle(
                              color: Color(0xFF94a3b8),
                              fontSize: 12,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
