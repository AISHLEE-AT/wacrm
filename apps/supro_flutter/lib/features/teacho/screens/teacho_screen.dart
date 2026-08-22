import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../shared/widgets/payment_qr_dialog.dart';
import '../data/courses_catalog.dart';
import '../data/curriculum_resolver.dart';
import '../services/teacho_whatsapp_service.dart';
import 'teacho_player_sheet.dart';

class TeachoScreen extends StatefulWidget {
  const TeachoScreen({super.key});

  @override
  State<TeachoScreen> createState() => _TeachoScreenState();
}

class _TeachoScreenState extends State<TeachoScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  
  // Active Enrolled Program State
  late TeachoCourse _activeCourse;
  final List<String> _enrolledCourseIds = ['tnsb-en-1', 'cbse-10', 'tnpsc-grp4', 'skill-python'];
  int _courseDay = 1;
  int _courseStreak = 7;
  int _courseXP = 380;
  final Set<String> _completedTaskIds = {};
  
  // Search & Catalog Filter
  String _searchQuery = '';
  String _selectedCategory = 'all';

  // AI Doubt Chat State
  final TextEditingController _chatController = TextEditingController();
  final List<Map<String, String>> _chatMessages = [
    {
      'role': 'assistant',
      'text': '👋 Hello! I am your 24/7 TeachO AI Personal Tutor. Ask me any doubt about today\'s lessons, homework problems, formulas, or exams in English அல்லது தமிழில் கேட்கலாம்!',
      'time': '9:00 AM',
    }
  ];
  bool _isAiLoading = false;

  final List<Map<String, String>> _categoryTabs = [
    {'id': 'all', 'label': 'All Programs', 'icon': '🎒'},
    {'id': 'school_tnsb_en', 'label': 'TNSB English', 'icon': '🎒'},
    {'id': 'school_tnsb_ta', 'label': 'TNSB தமிழ் வழி', 'icon': '🎒'},
    {'id': 'school_cbse', 'label': 'CBSE NCERT', 'icon': '🎒'},
    {'id': 'school_matric', 'label': 'Matriculation', 'icon': '🎒'},
    {'id': 'tnpsc', 'label': 'TNPSC Exams', 'icon': '🏛️'},
    {'id': 'upsc_central', 'label': 'UPSC / Central', 'icon': '🇮🇳'},
    {'id': 'entrance', 'label': 'Entrance Exams', 'icon': '🩺'},
    {'id': 'college_degree', 'label': 'College Degrees', 'icon': '🎓'},
    {'id': 'skills', 'label': 'Tech & AI Skills', 'icon': '💻'},
    {'id': 'kids_skills', 'label': 'Kids Skills', 'icon': '⭐'},
  ];

  @override
  void initState() {
    super.initState();
    _activeCourse = defaultTeachoCourse;
    _tabController = TabController(length: 5, vsync: this);
    _loadSavedState();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _chatController.dispose();
    super.dispose();
  }

  bool _isCoursePurchased = false;

  Future<void> _loadSavedState() async {
    final prefs = await SharedPreferences.getInstance();
    final savedId = prefs.getString('teacho_active_course_id');
    final savedDay = prefs.getInt('teacho_course_day');
    final savedXP = prefs.getInt('teacho_course_xp');
    final isPurchased = prefs.getBool('purchased_course_${savedId ?? _activeCourse.id}') ?? false;

    setState(() {
      if (savedId != null) {
        final found = teachoMasterCourses.firstWhere(
          (c) => c.id == savedId,
          orElse: () => defaultTeachoCourse,
        );
        _activeCourse = found;
      }
      if (savedDay != null) _courseDay = savedDay;
      if (savedXP != null) _courseXP = savedXP;
      _isCoursePurchased = isPurchased;
    });
  }

  Future<void> _saveState() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('teacho_active_course_id', _activeCourse.id);
    await prefs.setInt('teacho_course_day', _courseDay);
    await prefs.setInt('teacho_course_xp', _courseXP);
  }

  void _handleSelectCourse(TeachoCourse course) {
    setState(() {
      _activeCourse = course;
      if (!_enrolledCourseIds.contains(course.id)) {
        _enrolledCourseIds.add(course.id);
      }
    });
    _saveState();

    // Auto dispatch registration welcome alert on WhatsApp
    TeachoWhatsAppService.sendCourseRegistrationWelcome(
      studentPhone: '9486335870',
      studentName: 'Learner',
      courseTitle: course.title,
      totalDays: course.totalDays,
    );
  }

  void _handleCompleteTask(String taskId, int xp) {
    setState(() {
      _completedTaskIds.add(taskId);
      _courseXP += xp;
    });
    _saveState();
  }

  void _sendMessage() {
    final text = _chatController.text.trim();
    if (text.isEmpty || _isAiLoading) return;

    setState(() {
      _chatMessages.add({
        'role': 'user',
        'text': text,
        'time': '${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')}',
      });
      _isAiLoading = true;
    });
    _chatController.clear();

    Future.delayed(const Duration(milliseconds: 900), () {
      if (mounted) {
        setState(() {
          _chatMessages.add({
            'role': 'assistant',
            'text': 'Here is the step-by-step guidance for "$text":\n\n1. Review the foundational concepts for Day $_courseDay in ${_activeCourse.title}.\n2. Apply the relevant formulas carefully.\n3. Make sure to double check your steps for full exam marks! (தமிழில்: எளிய முறையில் நினைவில் கொள்ள முக்கிய விதிகளை பயன்படுத்தவும்).',
            'time': '${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')}',
          });
          _isAiLoading = false;
        });
      }
    });
  }

  List<TeachoCourse> get _filteredCourses {
    var list = teachoMasterCourses;
    if (_selectedCategory != 'all') {
      list = list.where((c) => c.category == _selectedCategory).toList();
    }
    if (_searchQuery.trim().isNotEmpty) {
      final q = _searchQuery.trim().toLowerCase();
      list = list.where((c) {
        final full = '${c.title} ${c.short} ${c.subtitle} ${c.board} ${c.gradeLevel} ${c.medium}'.toLowerCase();
        return full.contains(q);
      }).toList();
    }
    return list;
  }

  int _getCategoryCount(String catId) {
    if (catId == 'all') return teachoMasterCourses.length;
    return teachoMasterCourses.where((c) => c.category == catId).length;
  }

  @override
  Widget build(BuildContext context) {
    final dailyPlan = resolveMasterCurriculumPlan(_activeCourse, _courseDay);

    return Scaffold(
      backgroundColor: const Color(0xFF070B14),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0C1322),
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFF10B981), Color(0xFF14B8A6)]),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(LucideIcons.bookOpen, color: Color(0xFF022C22), size: 18),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'TeachO Tuition',
                  style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
                Text(
                  '${teachoMasterCourses.length} Master Programs (K-12 & Exams)',
                  style: const TextStyle(color: Colors.white54, fontSize: 10),
                ),
              ],
            ),
          ],
        ),
        actions: [
          // Active Course Button
          GestureDetector(
            onTap: _showCoursePickerSheet,
            child: Container(
              margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  Text(_activeCourse.icon, style: const TextStyle(fontSize: 16)),
                  const SizedBox(width: 6),
                  ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 100),
                    child: Text(
                      _activeCourse.short,
                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const Icon(LucideIcons.chevronDown, color: Colors.white54, size: 14),
                ],
              ),
            ),
          ),

          // Top Course Purchase & Pricing Info
          if (_isCoursePurchased)
            Container(
              margin: const EdgeInsets.symmetric(vertical: 8),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
              ),
              child: const Row(
                children: [
                  Icon(LucideIcons.shieldCheck, size: 12, color: Color(0xFF10B981)),
                  SizedBox(width: 4),
                  Text('UNLOCKED', style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold)),
                ],
              ),
            )
          else
            GestureDetector(
              onTap: () {
                PaymentQrDialog.show(
                  context,
                  title: '${_activeCourse.title} (Full ${_activeCourse.totalDays} Days)',
                  amount: 499,
                  itemId: _activeCourse.id,
                  itemType: 'course',
                  onSuccess: () {
                    setState(() => _isCoursePurchased = true);
                  },
                );
              },
              child: Container(
                margin: const EdgeInsets.symmetric(vertical: 8),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.amber,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.amber.withValues(alpha: 0.3),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: const Row(
                  children: [
                    Icon(LucideIcons.shoppingCart, size: 12, color: Colors.black),
                    SizedBox(width: 4),
                    Text('₹499', style: TextStyle(color: Colors.black, fontSize: 10, fontWeight: FontWeight.w900)),
                  ],
                ),
              ),
            ),

          const SizedBox(width: 6),

          // XP Badge
          Container(
            margin: const EdgeInsets.only(right: 12, top: 8, bottom: 8),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.amber.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.amber.withValues(alpha: 0.3)),
            ),
            child: Row(
              children: [
                const Icon(LucideIcons.award, size: 14, color: Colors.amber),
                const SizedBox(width: 4),
                Text(
                  '$_courseXP XP',
                  style: const TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          indicatorColor: const Color(0xFF10B981),
          indicatorWeight: 2.5,
          labelColor: const Color(0xFF10B981),
          unselectedLabelColor: Colors.white54,
          labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
          tabs: [
            Tab(text: "Today's Routine (${dailyPlan.tasks.length})"),
            const Tab(text: '86-Course Catalog'),
            const Tab(text: 'Syllabus & Phases'),
            const Tab(text: '24/7 AI Tutor'),
            const Tab(text: 'Parent Report'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // TAB 1: DAILY ROUTINE
          _buildDailyRoutineTab(dailyPlan),

          // TAB 2: 86-COURSE CATALOG
          _buildCourseCatalogTab(),

          // TAB 3: SYLLABUS & PHASES
          _buildSyllabusTab(),

          // TAB 4: AI TUTOR
          _buildAiTutorTab(),

          // TAB 5: PARENT REPORT
          _buildParentReportTab(),
        ],
      ),
    );
  }

  // ─── TAB 1: TODAY'S ROUTINE ────────────────────────────────────────────────
  Widget _buildDailyRoutineTab(DailyPlan plan) {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      children: [
        // 👑 Course Master Access Unlock Banner
        if (_isCoursePurchased)
          Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF10B981).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
            ),
            child: const Row(
              children: [
                Icon(LucideIcons.shieldCheck, color: Color(0xFF10B981), size: 18),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'PREMIUM ACCESS UNLOCKED • All Days & Tests Accessible',
                    style: TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          )
        else
          Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.amber.withValues(alpha: 0.15),
                  const Color(0xFF0F172A),
                  const Color(0xFF10B981).withValues(alpha: 0.12),
                ],
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.amber.withValues(alpha: 0.35)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.amber.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(LucideIcons.shoppingCart, color: Colors.amber, size: 18),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Text(
                            'Unlock Full Master Course',
                            style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                            decoration: BoxDecoration(color: Colors.amber, borderRadius: BorderRadius.circular(4)),
                            child: const Text('₹499', style: TextStyle(color: Colors.black, fontSize: 9, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      const Text(
                        'Instant 1-Tap UPI Pay with GPay/PhonePe or coupon.',
                        style: TextStyle(color: Colors.white54, fontSize: 10),
                      ),
                    ],
                  ),
                ),
                ElevatedButton(
                  onPressed: () {
                    PaymentQrDialog.show(
                      context,
                      title: '${_activeCourse.title} (Full ${_activeCourse.totalDays} Days)',
                      amount: 499,
                      itemId: _activeCourse.id,
                      itemType: 'course',
                      onSuccess: () {
                        setState(() => _isCoursePurchased = true);
                      },
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFBBF24),
                    foregroundColor: const Color(0xFF0A0F1D),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('Unlock', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),

        // 📲 WhatsApp CRM Daily Study Sync Card
        Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFF0C1322),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF1E293B)),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF25D366).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(LucideIcons.messageSquare, color: Color(0xFF25D366), size: 18),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Text(
                          'WhatsApp CRM Study Sync',
                          style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                          decoration: BoxDecoration(
                            color: const Color(0xFF10B981).withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                          ),
                          child: const Text('Auto-Notify', style: TextStyle(color: Color(0xFF10B981), fontSize: 8, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Send Day $_courseDay 4-step micro-lessons to student WhatsApp.',
                      style: const TextStyle(color: Colors.white54, fontSize: 10),
                    ),
                  ],
                ),
              ),
              OutlinedButton.icon(
                onPressed: () {
                  TeachoWhatsAppService.sendDayPlanAlert(
                    studentPhone: '9486335870',
                    studentName: 'Learner',
                    courseTitle: _activeCourse.title,
                    currentDay: _courseDay,
                    totalDays: _activeCourse.totalDays,
                    tasks: plan.tasks,
                    streak: _courseStreak,
                    xp: _courseXP,
                  );
                },
                icon: const Icon(LucideIcons.send, size: 11, color: Color(0xFF25D366)),
                label: const Text('Send Alert', style: TextStyle(fontSize: 10, color: Color(0xFF25D366), fontWeight: FontWeight.bold)),
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: const Color(0xFF25D366).withValues(alpha: 0.4)),
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ],
          ),
        ),

        // Hero Course Summary Card
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF0F172A), Color(0xFF0B1120)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: const Color(0xFF1E293B)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                    ),
                    child: Text(
                      _activeCourse.badge,
                      style: const TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                  Text(
                    '${_activeCourse.medium} • ${_activeCourse.totalDays} Days',
                    style: const TextStyle(color: Colors.white54, fontSize: 11),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Text(_activeCourse.icon, style: const TextStyle(fontSize: 24)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _activeCourse.title,
                      style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              // Day Navigation Bar
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  ElevatedButton(
                    onPressed: _courseDay > 1
                        ? () {
                            setState(() => _courseDay--);
                            _saveState();
                          }
                        : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1E293B),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: const Text('← Prev Day', style: TextStyle(fontSize: 11)),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                    ),
                    child: Text(
                      'DAY $_courseDay / ${_activeCourse.totalDays}',
                      style: const TextStyle(color: Color(0xFF10B981), fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                  ),
                  ElevatedButton(
                    onPressed: _courseDay < _activeCourse.totalDays
                        ? () {
                            setState(() => _courseDay++);
                            _saveState();
                          }
                        : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      foregroundColor: const Color(0xFF022C22),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: const Text('Next Day →', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Day $_courseDay Schedule (${plan.tasks.length} Modules)',
              style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
            ),
            Text(
              '~${plan.totalMinutes} Mins',
              style: const TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Task Cards List
        ...plan.tasks.asMap().entries.map((entry) {
          final idx = entry.key;
          final task = entry.value;
          final isDone = _completedTaskIds.contains(task.id);

          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDone ? const Color(0xFF064E3B).withValues(alpha: 0.15) : const Color(0xFF0C1322),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: isDone ? const Color(0xFF10B981).withValues(alpha: 0.5) : const Color(0xFF1E293B)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        task.rawSubject,
                        style: const TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                    Row(
                      children: [
                        Text(task.duration, style: const TextStyle(color: Colors.white54, fontSize: 11)),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.amber.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text(
                            '+20 XP',
                            style: TextStyle(color: Colors.amber, fontSize: 9, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Text(task.icon, style: const TextStyle(fontSize: 20)),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            task.title,
                            style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            task.rawTopic,
                            style: const TextStyle(color: Colors.white54, fontSize: 11),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Contextual Action Chips: Ask AI Doubt & Test Heading
                    Row(
                      children: [
                        InkWell(
                          onTap: () {
                            final prompt = 'I am studying "${task.rawSubject.isNotEmpty ? task.rawSubject : _activeCourse.title}" - Topic: "${task.rawTopic.isNotEmpty ? task.rawTopic : task.title}" (Day $_courseDay, Module #${idx + 1} of course "${_activeCourse.title}"). Please explain this topic step-by-step with key concepts, rules/formulas, practical examples, and 3 high-yield exam tips in Tamil & English.';
                            _chatController.text = prompt;
                            _tabController.animateTo(3);
                          },
                          borderRadius: BorderRadius.circular(8),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                            decoration: BoxDecoration(
                              color: Colors.purple.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.purple.withValues(alpha: 0.3)),
                            ),
                            child: const Row(
                              children: [
                                Icon(LucideIcons.bot, size: 12, color: Colors.purpleAccent),
                                SizedBox(width: 4),
                                Text('Ask AI Doubt', style: TextStyle(color: Colors.purpleAccent, fontSize: 10, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),
                        InkWell(
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('Practice tests for: "${task.rawTopic.isNotEmpty ? task.rawTopic : task.title}"'),
                                backgroundColor: const Color(0xFF1E293B),
                              ),
                            );
                          },
                          borderRadius: BorderRadius.circular(8),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                            decoration: BoxDecoration(
                              color: Colors.amber.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.amber.withValues(alpha: 0.3)),
                            ),
                            child: const Row(
                              children: [
                                Icon(LucideIcons.award, size: 12, color: Colors.amber),
                                SizedBox(width: 4),
                                Text('Test Heading', style: TextStyle(color: Colors.amber, fontSize: 10, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),

                    ElevatedButton.icon(
                      onPressed: () {
                        TeachoPlayerSheet.show(
                          context,
                          topicTitle: task.title,
                          subject: task.rawSubject,
                          courseTitle: _activeCourse.title,
                          courseId: _activeCourse.id,
                          dayNumber: _courseDay,
                          onComplete: (xp) => _handleCompleteTask(task.id, xp),
                        );
                      },
                      icon: const Icon(LucideIcons.playCircle, size: 14),
                      label: Text(isDone ? 'Review' : 'Start'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isDone ? const Color(0xFF1E293B) : const Color(0xFF10B981),
                        foregroundColor: isDone ? const Color(0xFF10B981) : const Color(0xFF022C22),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  // ─── TAB 2: 86-COURSE CATALOG ──────────────────────────────────────────────
  Widget _buildCourseCatalogTab() {
    return Column(
      children: [
        // Search Bar
        Padding(
          padding: const EdgeInsets.all(12),
          child: TextField(
            onChanged: (v) => setState(() => _searchQuery = v),
            style: const TextStyle(color: Colors.white, fontSize: 13),
            decoration: InputDecoration(
              hintText: 'Search 86 programs by name, grade, board...',
              hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
              prefixIcon: const Icon(LucideIcons.search, color: Colors.white38, size: 16),
              filled: true,
              fillColor: const Color(0xFF111827),
              contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: Color(0xFF1E293B)),
              ),
            ),
          ),
        ),

        // 10 Category Tabs Bar
        SizedBox(
          height: 38,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            itemCount: _categoryTabs.length,
            itemBuilder: (ctx, idx) {
              final tab = _categoryTabs[idx];
              final isSelected = _selectedCategory == tab['id'] && _searchQuery.isEmpty;
              final count = _getCategoryCount(tab['id']!);

              return GestureDetector(
                onTap: () => setState(() {
                  _selectedCategory = tab['id']!;
                  _searchQuery = '';
                }),
                child: Container(
                  margin: const EdgeInsets.only(right: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFF10B981) : const Color(0xFF111827),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isSelected ? const Color(0xFF10B981) : const Color(0xFF1E293B),
                    ),
                  ),
                  child: Row(
                    children: [
                      Text(
                        '${tab['icon']} ${tab['label']}',
                        style: TextStyle(
                          color: isSelected ? const Color(0xFF022C22) : Colors.white70,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                        decoration: BoxDecoration(
                          color: isSelected ? Colors.black26 : const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '$count',
                          style: TextStyle(
                            color: isSelected ? Colors.black : Colors.white54,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),

        const SizedBox(height: 8),

        // Courses List
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(12),
            itemCount: _filteredCourses.length,
            itemBuilder: (ctx, idx) {
              final c = _filteredCourses[idx];
              final isSelected = c.id == _activeCourse.id;

              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: isSelected ? const Color(0xFF10B981).withValues(alpha: 0.1) : const Color(0xFF0C1322),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isSelected ? const Color(0xFF10B981) : const Color(0xFF1E293B),
                  ),
                ),
                child: Row(
                  children: [
                    Text(c.icon, style: const TextStyle(fontSize: 26)),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF10B981).withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  c.badge,
                                  style: const TextStyle(color: Color(0xFF10B981), fontSize: 9, fontWeight: FontWeight.bold),
                                ),
                              ),
                              const SizedBox(width: 6),
                              Text('${c.totalDays} Days • ${c.medium}', style: const TextStyle(color: Colors.white38, fontSize: 10)),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            c.title,
                            style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                          Text(
                            c.subtitle,
                            style: const TextStyle(color: Colors.white54, fontSize: 11),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: () => _handleSelectCourse(c),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isSelected ? const Color(0xFF10B981) : const Color(0xFF1E293B),
                        foregroundColor: isSelected ? const Color(0xFF022C22) : Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: Text(
                        isSelected ? '✓ Active' : 'Switch',
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  // ─── TAB 3: SYLLABUS & PHASES ──────────────────────────────────────────────
  Widget _buildSyllabusTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF0C1322),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: const Color(0xFF1E293B)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${_activeCourse.icon} ${_activeCourse.title}',
                style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                'Authentic Curriculum & Phase Breakdown across ${_activeCourse.totalDays} Days',
                style: const TextStyle(color: Colors.white54, fontSize: 12),
              ),
              const Divider(color: Color(0xFF1E293B), height: 24),
              const Text(
                'ENROLLED SUBJECTS & TAXONOMY',
                style: TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
              ),
              const SizedBox(height: 10),
              ..._activeCourse.subjects.map((s) => Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF111827),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Text(s.icon, style: const TextStyle(fontSize: 18)),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            s.name,
                            style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                          ),
                        ),
                        if (s.code != null)
                          Text(s.code!, style: const TextStyle(color: Colors.white38, fontSize: 11, fontFamily: 'monospace')),
                      ],
                    ),
                  )),
            ],
          ),
        ),
      ],
    );
  }

  // ─── TAB 4: AI TUTOR ───────────────────────────────────────────────────────
  Widget _buildAiTutorTab() {
    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: _chatMessages.length,
            itemBuilder: (ctx, idx) {
              final msg = _chatMessages[idx];
              final isUser = msg['role'] == 'user';

              return Align(
                alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                child: Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(14),
                  constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
                  decoration: BoxDecoration(
                    color: isUser ? const Color(0xFF10B981) : const Color(0xFF111827),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isUser ? Colors.transparent : const Color(0xFF1E293B),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        msg['text']!,
                        style: TextStyle(
                          color: isUser ? const Color(0xFF022C22) : Colors.white,
                          fontSize: 12,
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        msg['time']!,
                        style: TextStyle(
                          color: isUser ? Colors.black45 : Colors.white38,
                          fontSize: 9,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        if (_isAiLoading)
          const Padding(
            padding: EdgeInsets.all(8.0),
            child: Text('AI Tutor is thinking...', style: TextStyle(color: Color(0xFF10B981), fontSize: 11)),
          ),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: const BoxDecoration(
            color: Color(0xFF0C1322),
            border: Border(top: BorderSide(color: Color(0xFF1E293B))),
          ),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _chatController,
                  style: const TextStyle(color: Colors.white, fontSize: 12),
                  decoration: InputDecoration(
                    hintText: 'Ask any doubt in English or தமிழில்...',
                    hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
                    filled: true,
                    fillColor: const Color(0xFF111827),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF1E293B)),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                icon: const Icon(LucideIcons.send, color: Color(0xFF10B981), size: 20),
                onPressed: _sendMessage,
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ─── TAB 5: PARENT REPORT ──────────────────────────────────────────────────
  Widget _buildParentReportTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF451A03), Color(0xFF0F172A)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.amber.withValues(alpha: 0.3)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(LucideIcons.shieldCheck, color: Colors.amber, size: 20),
                  SizedBox(width: 8),
                  Text(
                    'PARENT ADVISORY & COMPANION',
                    style: TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                'Weekly Advisory for ${_activeCourse.title}',
                style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 6),
              const Text(
                'Ensure daily ~45 minutes of quiet evening study. Monitor Sunday mock exam scores and encourage flashcard review.',
                style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.5),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF0C1322),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF1E293B)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Current Day', style: TextStyle(color: Colors.white54, fontSize: 11)),
                    const SizedBox(height: 4),
                    Text('Day $_courseDay', style: const TextStyle(color: Color(0xFF10B981), fontSize: 18, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF0C1322),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF1E293B)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('XP Earned', style: TextStyle(color: Colors.white54, fontSize: 11)),
                    const SizedBox(height: 4),
                    Text('$_courseXP XP', style: const TextStyle(color: Colors.amber, fontSize: 18, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // ─── MODAL: 86-COURSE SELECTOR SHEET ───────────────────────────────────────
  void _showCoursePickerSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(context).size.height * 0.85,
        decoration: const BoxDecoration(
          color: Color(0xFF0B1120),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          children: [
            Container(
              margin: const EdgeInsets.symmetric(vertical: 10),
              width: 40,
              height: 4,
              decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(2)),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Select Program',
                        style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      Text('${teachoMasterCourses.length} Master Academic & Exam Courses', style: const TextStyle(color: Colors.white54, fontSize: 11)),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(LucideIcons.x, color: Colors.white70, size: 20),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.all(14),
                itemCount: teachoMasterCourses.length,
                itemBuilder: (cCtx, idx) {
                  final c = teachoMasterCourses[idx];
                  final isSelected = c.id == _activeCourse.id;

                  return GestureDetector(
                    onTap: () {
                      _handleSelectCourse(c);
                      Navigator.of(context).pop();
                    },
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFF10B981).withValues(alpha: 0.15) : const Color(0xFF111827),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isSelected ? const Color(0xFF10B981) : const Color(0xFF1E293B),
                        ),
                      ),
                      child: Row(
                        children: [
                          Text(c.icon, style: const TextStyle(fontSize: 22)),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  c.title,
                                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                                ),
                                Text(
                                  '${c.badge} • ${c.totalDays} Days',
                                  style: const TextStyle(color: Colors.white54, fontSize: 10),
                                ),
                              ],
                            ),
                          ),
                          if (isSelected)
                            const Icon(LucideIcons.check, color: Color(0xFF10B981), size: 18),
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
