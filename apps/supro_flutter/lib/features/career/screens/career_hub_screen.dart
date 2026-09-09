import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/env.dart';

class JobAlertItem {
  final String id;
  final String title;
  final String org;
  final String location;
  final String type;
  final Color badgeColor;
  final String vacancies;
  final String deadline;
  final String qualification;
  final String url;

  const JobAlertItem({
    required this.id,
    required this.title,
    required this.org,
    required this.location,
    required this.type,
    required this.badgeColor,
    required this.vacancies,
    required this.deadline,
    required this.qualification,
    required this.url,
  });
}

class CareerHubScreen extends ConsumerStatefulWidget {
  const CareerHubScreen({super.key});

  @override
  ConsumerState<CareerHubScreen> createState() => _CareerHubScreenState();
}

class _CareerHubScreenState extends ConsumerState<CareerHubScreen> {
  String _selectedCategory = 'ALL';
  String _searchQuery = '';

  final List<JobAlertItem> _jobAlerts = const [
    JobAlertItem(
      id: '1',
      title: 'TNPSC Group 4 & VAO Recruitment 2026',
      org: 'Tamil Nadu Public Service Commission',
      location: 'Tamil Nadu (State Govt)',
      type: 'TN Govt',
      badgeColor: Color(0xFF10B981),
      vacancies: '6,244 Posts',
      deadline: 'Apply before 30th Sep',
      qualification: '10th / SSLC Pass',
      url: 'https://www.tnpsc.gov.in',
    ),
    JobAlertItem(
      id: '2',
      title: 'SBI Junior Associate (Clerk) 2026',
      org: 'State Bank of India',
      location: 'Tamil Nadu & All India',
      type: 'Banking',
      badgeColor: Color(0xFF3B82F6),
      vacancies: '8,773 Posts',
      deadline: 'Exam: Nov 2026',
      qualification: 'Any Degree Graduate',
      url: 'https://sbi.co.in/careers',
    ),
    JobAlertItem(
      id: '3',
      title: 'TNUSRB Sub-Inspector (SI Taluk & AR)',
      org: 'TN Uniformed Services Recruitment Board',
      location: 'Tamil Nadu Police',
      type: 'TN Govt',
      badgeColor: Color(0xFFF59E0B),
      vacancies: '969 Posts',
      deadline: 'Notification Live',
      qualification: 'Any Degree + Physical Fit',
      url: 'https://www.tnusrb.tn.gov.in',
    ),
    JobAlertItem(
      id: '4',
      title: 'Graduate Software Engineer / Trainee',
      org: 'Zoho Corporation',
      location: 'Chennai / Tenkasi / Madurai',
      type: 'IT Software',
      badgeColor: Color(0xFFA855F7),
      vacancies: 'Open Hiring (Freshers)',
      deadline: 'Immediate Joining',
      qualification: 'B.E / B.Tech / B.Sc / BCA / MCA',
      url: 'https://www.zoho.com/careers',
    ),
    JobAlertItem(
      id: '5',
      title: 'SSC CGL Combined Graduate Level',
      org: 'Staff Selection Commission',
      location: 'Central Govt Ministries',
      type: 'Central Govt',
      badgeColor: Color(0xFF06B6D4),
      vacancies: '17,727 Posts',
      deadline: 'Tier-1 CBT Soon',
      qualification: 'Any Bachelor Degree',
      url: 'https://ssc.gov.in',
    ),
    JobAlertItem(
      id: '6',
      title: 'RRB NTPC Non-Technical Popular Categories',
      org: 'Railway Recruitment Control Board',
      location: 'Southern Railway (Chennai Div)',
      type: 'Central Govt',
      badgeColor: Color(0xFFEC4899),
      vacancies: '11,558 Posts',
      deadline: 'Ongoing Application',
      qualification: '12th Pass / Graduate',
      url: 'https://www.rrbchennai.gov.in',
    ),
  ];

  void _openUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  void _consultCareerMentor(String jobTitle) async {
    final text = 'வணக்கம் SuprO Career AI! எனக்கு "$jobTitle" தேர்வுக்கான தயாரிப்பு திட்டம், பாடத்திட்டம் மற்றும் மாதிரித் தேர்வு வழிகாட்டுதல் தேவை.';
    final clean = AppEnv.wabaPhone.replaceAll(RegExp(r'\D'), '');
    final uri = Uri.parse('https://wa.me/$clean?text=${Uri.encodeComponent(text)}');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _jobAlerts.where((j) {
      final matchesCat = _selectedCategory == 'ALL' || (j.type == _selectedCategory);
      final q = _searchQuery.toLowerCase();
      final title = j.title.toLowerCase();
      final org = j.org.toLowerCase();
      final qual = j.qualification.toLowerCase();
      final matchesSearch = q.isEmpty || title.contains(q) || org.contains(q) || qual.contains(q);
      return matchesCat && matchesSearch;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0F1E),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
          onPressed: () => context.canPop() ? context.pop() : context.go('/home'),
        ),
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'JobO • வேலைவாய்ப்பு மையம்',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            Text(
              'Career Hub & Govt / Private Job Alerts',
              style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
            ),
          ],
        ),
      ),
      body: CustomScrollView(
        slivers: [
          // Hero Banner
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF064E3B), Color(0xFF065F46), Color(0xFF047857)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF10B981).withOpacity(0.2),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(LucideIcons.briefcase, color: Colors.white, size: 28),
                        ),
                        const SizedBox(width: 14),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Tamil Nadu Career Portal',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              SizedBox(height: 4),
                              Text(
                                'Daily curated TNPSC, Bank, Police, Railway & Tech jobs with free syllabus test prep on TutO.',
                                style: TextStyle(color: Color(0xFFA7F3D0), fontSize: 11, height: 1.3),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Search
                  Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFF334155)),
                    ),
                    child: TextField(
                      onChanged: (val) => setState(() => _searchQuery = val),
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        hintText: 'Search jobs, exam, board, qualification...',
                        hintStyle: TextStyle(color: Color(0xFF64748B), fontSize: 13),
                        prefixIcon: Icon(LucideIcons.search, color: Color(0xFF94A3B8), size: 18),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Filter chips
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _filterChip('ALL', 'All Vacancies'),
                        _filterChip('TN Govt', 'TNPSC / State'),
                        _filterChip('Central Govt', 'SSC / Railway'),
                        _filterChip('Banking', 'SBI / IBPS'),
                        _filterChip('IT Software', 'Zoho / Tech'),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Job list
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final job = filtered[index];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 14),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFF334155)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: job.badgeColor.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: job.badgeColor.withOpacity(0.4)),
                              ),
                              child: Text(
                                job.type,
                                style: TextStyle(
                                  color: job.badgeColor,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            const Spacer(),
                            const Icon(LucideIcons.calendar, color: Color(0xFF94A3B8), size: 13),
                            const SizedBox(width: 4),
                            Text(
                              job.deadline,
                              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),

                        Text(
                          job.title,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          job.org,
                          style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 12),
                        ),
                        const SizedBox(height: 10),

                        Row(
                          children: [
                            const Icon(LucideIcons.award, color: Color(0xFFF59E0B), size: 14),
                            const SizedBox(width: 4),
                            Text(
                              'Vacancies: ${job.vacancies}',
                              style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 12, fontWeight: FontWeight.w600),
                            ),
                            const Spacer(),
                            const Icon(LucideIcons.graduationCap, color: Color(0xFFA78BFA), size: 14),
                            const SizedBox(width: 4),
                            Text(
                              job.qualification,
                              style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),

                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: () => _openUrl(job.url),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF10B981),
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                ),
                                icon: const Icon(LucideIcons.externalLink, size: 14),
                                label: const Text('Official Notification', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                              ),
                            ),
                            const SizedBox(width: 8),
                            IconButton(
                              onPressed: () => _consultCareerMentor(job.title),
                              style: IconButton.styleFrom(
                                backgroundColor: const Color(0xFF8B5CF6).withOpacity(0.15),
                                foregroundColor: const Color(0xFFA78BFA),
                                padding: const EdgeInsets.all(10),
                              ),
                              icon: const Icon(LucideIcons.sparkles, size: 18),
                              tooltip: 'AI Exam Mentor & Syllabus',
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
                childCount: filtered.length,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _filterChip(String id, String label) {
    final isSelected = _selectedCategory == id;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        labelStyle: TextStyle(
          color: isSelected ? Colors.white : const Color(0xFF94A3B8),
          fontSize: 12,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
        selected: isSelected,
        selectedColor: const Color(0xFF10B981),
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(
            color: isSelected ? const Color(0xFF10B981) : const Color(0xFF334155),
          ),
        ),
        onSelected: (_) => setState(() => _selectedCategory = id),
      ),
    );
  }
}
