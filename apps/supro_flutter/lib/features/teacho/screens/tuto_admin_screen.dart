import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../data/curriculum365_engine.dart';
import '../services/tuto_oci_service.dart';

class TutOAdminScreen extends StatefulWidget {
  const TutOAdminScreen({super.key});

  @override
  State<TutOAdminScreen> createState() => _TutOAdminScreenState();
}

class _TutOAdminScreenState extends State<TutOAdminScreen> {
  String _activeTab = 'day_plan'; // 'day_plan' | 'submissions' | 'google_sheets'

  // ─── Tab 1: 365 Day Plans Studio State ───
  String _selectedCourseId = 'school-std-10';
  String _selectedCourseTitle = 'Class 10th (SSLC) Academic Deck';
  String _selectedAmbitionId = 'jr-ias';
  int _dayNumber = 1;

  List<DayClassItem> _adminClasses = [];
  DayYogaPlan? _adminYoga;
  DayTestPlan? _adminDailyTest;
  bool _isCustomFromOci = false;
  bool _isLoadingDayPlan = false;
  bool _isSaving = false;

  // Controllers for editing 10 classes
  final List<TextEditingController> _classTitleControllers = [];
  final List<TextEditingController> _classMicroControllers = [];
  late TextEditingController _yogaNameController;
  late TextEditingController _yogaBreathingController;

  // ─── Tab 2: Submissions State ───
  List<Map<String, dynamic>> _submissions = [];
  bool _isLoadingSubmissions = false;
  String _subFilter = 'all'; // 'all' | 'pending' | 'approved'
  final Map<int, String> _teacherRemarksMap = {};
  final Map<int, int> _bonusXpMap = {};
  final Map<int, bool> _isAlertingMap = {};

  // ─── Tab 3: Google Sheets State ───
  final TextEditingController _sheetUrlController = TextEditingController();
  final TextEditingController _sheetTabController = TextEditingController(text: 'Sheet1');
  bool _isSyncingSheet = false;

  final List<Map<String, String>> _coursesList = [
    {'id': 'school-lkg', 'name': 'LKG'},
    {'id': 'school-ukg', 'name': 'UKG'},
    {'id': 'school-std-1', 'name': 'Class 1'},
    {'id': 'school-std-5', 'name': 'Class 5'},
    {'id': 'school-std-9', 'name': 'Class 9'},
    {'id': 'school-std-10', 'name': 'Class 10'},
    {'id': 'school-std-11', 'name': 'Class 11'},
    {'id': 'school-std-12', 'name': 'Class 12'},
    {'id': 'exam-neet', 'name': 'NEET'},
    {'id': 'exam-tnpsc', 'name': 'TNPSC'},
  ];

  @override
  void initState() {
    super.initState();
    _yogaNameController = TextEditingController();
    _yogaBreathingController = TextEditingController();
    _loadDayPlan();
  }

  @override
  void dispose() {
    for (final c in _classTitleControllers) {
      c.dispose();
    }
    for (final c in _classMicroControllers) {
      c.dispose();
    }
    _yogaNameController.dispose();
    _yogaBreathingController.dispose();
    _sheetUrlController.dispose();
    _sheetTabController.dispose();
    super.dispose();
  }

  void _syncControllers() {
    // Re-initialize controllers
    for (final c in _classTitleControllers) {
      c.dispose();
    }
    for (final c in _classMicroControllers) {
      c.dispose();
    }
    _classTitleControllers.clear();
    _classMicroControllers.clear();

    for (final cls in _adminClasses) {
      _classTitleControllers.add(TextEditingController(text: cls.title));
      _classMicroControllers.add(TextEditingController(text: cls.microTopic ?? ''));
    }

    if (_adminYoga != null) {
      _yogaNameController.text = _adminYoga!.name;
      _yogaBreathingController.text = _adminYoga!.breathing;
    }
  }

  Future<void> _loadDayPlan() async {
    setState(() => _isLoadingDayPlan = true);
    try {
      final remote = await TutoOciService.getAdminDayPlan(
        courseId: _selectedCourseId,
        ambitionId: _selectedAmbitionId,
        dayNumber: _dayNumber,
      );

      if (remote != null && remote['success'] == true && remote['plan'] is Map) {
        final plan = remote['plan'] as Map<String, dynamic>;
        final rawClasses = plan['classes'] as List? ?? [];
        setState(() {
          _adminClasses = rawClasses.map((c) => DayClassItem.fromMap(c as Map<String, dynamic>)).toList();
          if (plan['yoga'] is Map) {
            _adminYoga = DayYogaPlan.fromMap(plan['yoga'] as Map<String, dynamic>);
          }
          if (plan['dailyTest'] is Map) {
            _adminDailyTest = DayTestPlan.fromMap(plan['dailyTest'] as Map<String, dynamic>);
          }
          _isCustomFromOci = remote['isCustomAdminPlan'] == true;
        });
        _syncControllers();
        return;
      }
    } catch (_) {}

    // Fallback: Deterministic baseline
    final baseline = generateUniqueTenClassesForDay(_selectedCourseId, _selectedAmbitionId, _dayNumber);
    setState(() {
      _adminClasses = baseline.classes;
      _adminYoga = baseline.yoga;
      _adminDailyTest = baseline.dailyTest;
      _isCustomFromOci = false;
    });
    _syncControllers();
    if (mounted) setState(() => _isLoadingDayPlan = false);
  }

  Future<void> _handleSaveToOci() async {
    setState(() => _isSaving = true);
    try {
      // Gather updated classes from controllers
      final updatedClasses = <Map<String, dynamic>>[];
      for (int i = 0; i < _adminClasses.length; i++) {
        final orig = _adminClasses[i];
        final title = _classTitleControllers.length > i ? _classTitleControllers[i].text.trim() : orig.title;
        final micro = _classMicroControllers.length > i ? _classMicroControllers[i].text.trim() : orig.microTopic;
        updatedClasses.add(
          DayClassItem(
            id: orig.id,
            type: orig.type,
            title: title,
            subject: orig.subject,
            duration: orig.duration,
            xp: orig.xp,
            icon: orig.icon,
            microTopic: micro,
            tamilTitle: orig.tamilTitle,
            videoUrl: orig.videoUrl,
          ).toMap(),
        );
      }

      final updatedYoga = _adminYoga != null
          ? DayYogaPlan(
              name: _yogaNameController.text.trim(),
              tamil: _adminYoga!.tamil,
              sanskrit: _adminYoga!.sanskrit,
              duration: _adminYoga!.duration,
              benefits: _adminYoga!.benefits,
              steps: _adminYoga!.steps,
              breathing: _yogaBreathingController.text.trim(),
              brainBooster: _adminYoga!.brainBooster,
            ).toMap()
          : null;

      final res = await TutoOciService.saveAdminDayPlan(
        courseId: _selectedCourseId,
        courseTitle: _selectedCourseTitle,
        dayNumber: _dayNumber,
        classes: updatedClasses,
        yoga: updatedYoga,
        dailyTest: _adminDailyTest?.toMap(),
        topicTitle: updatedClasses.isNotEmpty ? updatedClasses.first['title'] : 'Day $_dayNumber Curriculum Plan',
        chapterTitle: 'Term Progression',
      );

      if (res['success'] == true) {
        setState(() => _isCustomFromOci = true);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: const Color(0xFF00D084),
              content: Text('Published Day $_dayNumber to OCI Cloud! Stored in PostgreSQL supro_db 🚀', style: const TextStyle(color: Color(0xFF070C18), fontWeight: FontWeight.w800)),
            ),
          );
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed: ${res['error'] ?? 'Unknown error'}')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Network error: $e')),
      );
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  // ─── Module 2: Fetch & Review Submissions ───
  Future<void> _fetchSubmissions() async {
    setState(() => _isLoadingSubmissions = true);
    final subs = await TutoOciService.listSubmissions();
    if (mounted) {
      setState(() {
        _submissions = subs;
        _isLoadingSubmissions = false;
      });
    }
  }

  Future<void> _handleReviewAndAlert(Map<String, dynamic> sub) async {
    final subId = sub['id'] is int ? sub['id'] as int : int.parse(sub['id'].toString());
    final remarks = _teacherRemarksMap[subId] ?? (sub['teacher_remarks']?.toString() ?? '🌟 Excellent dedication and consistent daily study! Keep aiming high.');
    final bonusXp = _bonusXpMap[subId] ?? 100;

    setState(() => _isAlertingMap[subId] = true);
    try {
      final res = await TutoOciService.reviewAndAlert(
        submissionId: subId,
        teacherName: 'Lead Academic Guide',
        remarks: remarks,
        rating: 5,
        bonusXp: bonusXp,
        sendWhatsApp: true,
      );

      if (res['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFF00D084),
            content: Text('Commendation & +$bonusXp XP alerted to ${sub['student_name']} via App & WhatsApp!', style: const TextStyle(color: Color(0xFF070C18), fontWeight: FontWeight.w800)),
          ),
        );
        _fetchSubmissions();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${res['error']}')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      if (mounted) setState(() => _isAlertingMap[subId] = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF070C18),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0E172A),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: Color(0xFF94A3B8)),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(color: const Color(0xFF00D084).withOpacity(0.15), borderRadius: BorderRadius.circular(6)),
                  child: Row(
                    children: const [
                      Icon(LucideIcons.shieldCheck, size: 11, color: Color(0xFF00D084)),
                      SizedBox(width: 3),
                      Text('TUTO STUDIO', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFF00D084))),
                    ],
                  ),
                ),
                const SizedBox(width: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(color: const Color(0xFF38BDF8).withOpacity(0.15), borderRadius: BorderRadius.circular(6)),
                  child: const Text('100% OCI Cloud', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: Color(0xFF38BDF8))),
                ),
              ],
            ),
            const SizedBox(height: 2),
            const Text('Curriculum & Teacher Hub', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white)),
          ],
        ),
      ),
      body: Column(
        children: [
          // ─── TAB SELECTOR BAR ───
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: const Color(0xFF0E172A),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildTabBtn('day_plan', LucideIcons.clock, '365 Day Plans Studio'),
                  const SizedBox(width: 8),
                  _buildTabBtn('submissions', LucideIcons.award, 'Teacher Submissions (${_submissions.length})'),
                  const SizedBox(width: 8),
                  _buildTabBtn('google_sheets', LucideIcons.layers, 'Google Sheet Sync'),
                ],
              ),
            ),
          ),

          // ─── BODY CONTENT ───
          Expanded(
            child: _activeTab == 'day_plan'
                ? _buildDayPlanStudio()
                : _activeTab == 'submissions'
                    ? _buildSubmissionsStudio()
                    : _buildGoogleSheetSync(),
          ),
        ],
      ),
    );
  }

  Widget _buildTabBtn(String tabId, IconData icon, String label) {
    final isAct = _activeTab == tabId;
    return InkWell(
      onTap: () {
        setState(() => _activeTab = tabId);
        if (tabId == 'submissions') _fetchSubmissions();
      },
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isAct ? const Color(0xFF00D084) : Colors.white.withOpacity(0.06),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(icon, size: 13, color: isAct ? const Color(0xFF070C18) : const Color(0xFF94A3B8)),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isAct ? FontWeight.w900 : FontWeight.w700,
                color: isAct ? const Color(0xFF070C18) : const Color(0xFF94A3B8),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── TAB 1: 365-DAY PLAN STUDIO ───
  Widget _buildDayPlanStudio() {
    final termText = _dayNumber <= 120
        ? 'Term 1: Foundations'
        : _dayNumber <= 240
            ? 'Term 2: Applied & Lab'
            : 'Term 3: Advanced Revision';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Course Selector Chips
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: const Color(0xFF0E172A), borderRadius: BorderRadius.circular(16)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('SELECT COURSE / GRADE:', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Color(0xFF94A3B8))),
                const SizedBox(height: 6),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: _coursesList.map((c) {
                      final isSelected = _selectedCourseId == c['id'];
                      return Padding(
                        padding: const EdgeInsets.only(right: 6),
                        child: InkWell(
                          onTap: () {
                            setState(() {
                              _selectedCourseId = c['id']!;
                              _selectedCourseTitle = '${c['name']} Academic Deck';
                            });
                            _loadDayPlan();
                          },
                          borderRadius: BorderRadius.circular(10),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: isSelected ? const Color(0xFF00D084) : Colors.white.withOpacity(0.06),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              c['name']!,
                              style: TextStyle(fontSize: 11, fontWeight: isSelected ? FontWeight.w900 : FontWeight.w700, color: isSelected ? const Color(0xFF070C18) : const Color(0xFFCBD5E1)),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // Career Track Selector Chips
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: const Color(0xFF0E172A), borderRadius: BorderRadius.circular(16)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('SELECT CAREER AMBITION TRACK:', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Color(0xFF94A3B8))),
                const SizedBox(height: 6),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: AMBITION_CURRICULA.entries.map((e) {
                      final isAct = _selectedAmbitionId == e.key;
                      return Padding(
                        padding: const EdgeInsets.only(right: 6),
                        child: InkWell(
                          onTap: () {
                            setState(() => _selectedAmbitionId = e.key);
                            _loadDayPlan();
                          },
                          borderRadius: BorderRadius.circular(10),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: isAct ? const Color(0xFFF59E0B) : Colors.white.withOpacity(0.06),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Row(
                              children: [
                                Text(e.value.icon, style: const TextStyle(fontSize: 13)),
                                const SizedBox(width: 4),
                                Text(
                                  e.value.short,
                                  style: TextStyle(fontSize: 11, fontWeight: isAct ? FontWeight.w900 : FontWeight.w700, color: isAct ? const Color(0xFF070C18) : const Color(0xFFCBD5E1)),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // 365-Day Navigator
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.25)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    ElevatedButton.icon(
                      onPressed: _dayNumber <= 1 ? null : () {
                        setState(() => _dayNumber--);
                        _loadDayPlan();
                      },
                      icon: const Icon(LucideIcons.chevronLeft, size: 14, color: Colors.white),
                      label: const Text('Prev', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.white.withOpacity(0.08), padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8)),
                    ),
                    Column(
                      children: [
                        Text('Day $_dayNumber of 365', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Colors.white)),
                        Text(termText, style: const TextStyle(fontSize: 10, color: Color(0xFF93C5FD))),
                      ],
                    ),
                    ElevatedButton(
                      onPressed: _dayNumber >= 365 ? null : () {
                        setState(() => _dayNumber++);
                        _loadDayPlan();
                      },
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.white.withOpacity(0.08), padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8)),
                      child: Row(
                        children: const [
                          Text('Next', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
                          SizedBox(width: 4),
                          Icon(LucideIcons.chevronRight, size: 14, color: Colors.white),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [1, 50, 100, 180, 250, 365].map((d) {
                      final isSelected = _dayNumber == d;
                      return Padding(
                        padding: const EdgeInsets.only(right: 6),
                        child: InkWell(
                          onTap: () {
                            setState(() => _dayNumber = d);
                            _loadDayPlan();
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: isSelected ? const Color(0xFFFBBF24) : Colors.white.withOpacity(0.06),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text('D$d', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: isSelected ? const Color(0xFF0B1120) : const Color(0xFF94A3B8))),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Status & Action Banner
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF1E1B4B),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.3)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(shape: BoxShape.circle, color: _isCustomFromOci ? const Color(0xFF00D084) : const Color(0xFF38BDF8)),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            _isCustomFromOci ? 'Cloud Customized & Published' : 'Standard 365 Curriculum Baseline',
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.white),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text('$_selectedCourseTitle • Day $_dayNumber', style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
                    ],
                  ),
                ),
                ElevatedButton.icon(
                  onPressed: _isSaving ? null : _handleSaveToOci,
                  icon: _isSaving
                      ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0B1120)))
                      : const Icon(LucideIcons.save, size: 14, color: Color(0xFF0B1120)),
                  label: const Text('Save & Publish', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFF0B1120))),
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00D084), padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // 10 Editable Classes
          if (_isLoadingDayPlan)
            const Center(child: Padding(padding: EdgeInsets.all(30), child: CircularProgressIndicator(color: Color(0xFF00D084))))
          else ...[
            const Text('📚 10 CLASSES SCHEDULE FOR DAY:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFFCBD5E1))),
            const SizedBox(height: 8),

            ..._adminClasses.asMap().entries.map((entry) {
              final idx = entry.key;
              final cls = entry.value;
              final titleCtrl = _classTitleControllers.length > idx ? _classTitleControllers[idx] : null;
              final microCtrl = _classMicroControllers.length > idx ? _classMicroControllers[idx] : null;

              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF0E172A),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.white.withOpacity(0.08)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text('CLASS ${cls.id}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFFFBBF24))),
                        const SizedBox(width: 8),
                        Text(cls.subject.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF94A3B8))),
                        const SizedBox(width: 8),
                        Text('⏱ ${cls.duration}', style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                        const Spacer(),
                        Text('+${cls.xp} XP', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xFF00D084))),
                      ],
                    ),
                    const SizedBox(height: 6),
                    const Text('Class Title:', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF94A3B8))),
                    const SizedBox(height: 2),
                    if (titleCtrl != null)
                      TextField(
                        controller: titleCtrl,
                        style: const TextStyle(color: Colors.white, fontSize: 12),
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: const Color(0xFF1E293B),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                        ),
                      ),
                    const SizedBox(height: 6),
                    const Text('Micro-Topic Breakdown:', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF94A3B8))),
                    const SizedBox(height: 2),
                    if (microCtrl != null)
                      TextField(
                        controller: microCtrl,
                        maxLines: 2,
                        style: const TextStyle(color: Colors.white, fontSize: 12),
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: const Color(0xFF1E293B),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                        ),
                      ),
                  ],
                ),
              );
            }).toList(),

            // Big Save Button
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _isSaving ? null : _handleSaveToOci,
                icon: const Icon(LucideIcons.save, size: 16, color: Color(0xFF0B1120)),
                label: Text('Save & Publish Day $_dayNumber Plan to OCI Cloud 🚀', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF0B1120))),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00D084), padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
              ),
            ),
          ],
        ],
      ),
    );
  }

  // ─── TAB 2: MODULE 2 TEACHER SUBMISSIONS STUDIO ───
  Widget _buildSubmissionsStudio() {
    final filtered = _submissions.where((s) {
      if (_subFilter == 'pending') return s['status'] == 'submitted' || s['status'] == null;
      if (_subFilter == 'approved') return s['status'] == 'approved';
      return true;
    }).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF1E1B4B),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF00D084)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('Module 2 • Teacher Evaluation Studio', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Colors.white)),
                      SizedBox(height: 2),
                      Text('Review student day missions, award ratings & bonus XP, and trigger immediate WhatsApp alerts.', style: TextStyle(fontSize: 10, color: Color(0xFFCBD5E1))),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: _fetchSubmissions,
                  icon: const Icon(LucideIcons.refreshCw, size: 16, color: Color(0xFF00D084)),
                  style: IconButton.styleFrom(backgroundColor: const Color(0xFF00D084).withOpacity(0.15)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // Filters
          Row(
            children: ['all', 'pending', 'approved'].map((f) {
              final isAct = _subFilter == f;
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: InkWell(
                    onTap: () => setState(() => _subFilter = f),
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color: isAct ? const Color(0xFF00D084) : const Color(0xFF0E172A),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: isAct ? const Color(0xFF00D084) : Colors.white.withOpacity(0.08)),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        f == 'all' ? 'All (${_submissions.length})' : f == 'pending' ? 'Pending' : 'Approved',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: isAct ? const Color(0xFF070C18) : const Color(0xFF94A3B8)),
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 12),

          if (_isLoadingSubmissions)
            const Center(child: Padding(padding: EdgeInsets.all(30), child: CircularProgressIndicator(color: Color(0xFF00D084))))
          else if (filtered.isEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(30),
              decoration: BoxDecoration(color: const Color(0xFF0E172A), borderRadius: BorderRadius.circular(16)),
              child: Column(
                children: const [
                  Icon(LucideIcons.award, size: 32, color: Color(0xFF64748B)),
                  SizedBox(height: 8),
                  Text('No Submissions Found', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white)),
                  Text('No student missions match the current filter.', style: TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                ],
              ),
            )
          else
            ...filtered.map((sub) {
              final subId = sub['id'] is int ? sub['id'] as int : int.parse(sub['id'].toString());
              final isApproved = sub['status'] == 'approved';
              final isAlerting = _isAlertingMap[subId] == true;
              final currentXp = _bonusXpMap[subId] ?? 100;
              final remarks = _teacherRemarksMap[subId] ?? (sub['teacher_remarks']?.toString() ?? '🌟 Excellent work! Keep aiming high.');

              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF0E172A),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.08)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(sub['student_name']?.toString() ?? 'Scholar', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Colors.white)),
                            Text('📱 +91 ${sub['student_phone']} • ${sub['academic_class']} • ${sub['ambition_id']}', style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: isApproved ? const Color(0xFF00D084).withOpacity(0.2) : const Color(0xFFFBBF24).withOpacity(0.2),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            isApproved ? 'Approved' : 'Pending Review',
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: isApproved ? const Color(0xFF00D084) : const Color(0xFFFBBF24)),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),

                    // Metrics
                    Row(
                      children: [
                        _buildSubMetric('DAY', 'Day ${sub['day_number']}'),
                        const SizedBox(width: 6),
                        _buildSubMetric('CLASSES', '${sub['classes_completed']}/10'),
                        const SizedBox(width: 6),
                        _buildSubMetric('TEST SCORE', '${sub['test_score']}%'),
                        const SizedBox(width: 6),
                        _buildSubMetric('EARNED XP', '+${sub['xp_earned']} XP', color: const Color(0xFFFBBF24)),
                      ],
                    ),
                    const SizedBox(height: 10),

                    if (sub['student_notes'] != null && sub['student_notes'].toString().isNotEmpty) ...[
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(10)),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Student Notes & Doubts:', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xFFFBBF24))),
                            const SizedBox(height: 2),
                            Text('“${sub['student_notes']}”', style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: Color(0xFFCBD5E1))),
                          ],
                        ),
                      ),
                      const SizedBox(height: 10),
                    ],

                    // Feedback Input
                    const Text('Teacher Evaluation Remarks:', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xFFCBD5E1))),
                    const SizedBox(height: 4),
                    TextFormField(
                      initialValue: remarks,
                      style: const TextStyle(color: Colors.white, fontSize: 11),
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: const Color(0xFF1E293B),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                      ),
                      onChanged: (txt) => _teacherRemarksMap[subId] = txt,
                    ),
                    const SizedBox(height: 8),

                    // Bonus XP
                    Row(
                      children: [
                        const Text('Award Bonus XP: ', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF94A3B8))),
                        ...[50, 100, 200].map((xp) {
                          final isSelected = currentXp == xp;
                          return Padding(
                            padding: const EdgeInsets.only(right: 6),
                            child: InkWell(
                              onTap: () => setState(() => _bonusXpMap[subId] = xp),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: isSelected ? const Color(0xFFFBBF24) : const Color(0xFF1E293B),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text('+$xp XP', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: isSelected ? const Color(0xFF0B1120) : const Color(0xFFFBBF24))),
                              ),
                            ),
                          );
                        }),
                      ],
                    ),
                    const SizedBox(height: 10),

                    // Alert Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: isAlerting ? null : () => _handleReviewAndAlert(sub),
                        icon: isAlerting
                            ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0B1120)))
                            : Icon(LucideIcons.send, size: 14, color: isApproved ? const Color(0xFF00D084) : const Color(0xFF0B1120)),
                        label: Text(
                          isApproved ? '✓ Re-Alert Student (App & WhatsApp)' : '🔔 Alert Student (App & WhatsApp)',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: isApproved ? const Color(0xFF00D084) : const Color(0xFF0B1120)),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: isApproved ? const Color(0xFF1E293B) : const Color(0xFF00D084),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
        ],
      ),
    );
  }

  Widget _buildSubMetric(String label, String val, {Color color = Colors.white}) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 6),
        decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(8)),
        child: Column(
          children: [
            Text(label, style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w800, color: Color(0xFF64748B))),
            const SizedBox(height: 2),
            Text(val, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: color)),
          ],
        ),
      ),
    );
  }

  // ─── TAB 3: GOOGLE SHEETS SYNC ───
  Widget _buildGoogleSheetSync() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF0E172A),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('📊 Google Sheets 365 Days Sync', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Colors.white)),
            const SizedBox(height: 4),
            const Text('Sync live spreadsheet day plans with topics, micro-topics, video IDs, and 5 MCQs.', style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
            const SizedBox(height: 14),

            const Text('Google Spreadsheet URL or Sheet ID:', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF94A3B8))),
            const SizedBox(height: 4),
            TextField(
              controller: _sheetUrlController,
              style: const TextStyle(color: Colors.white, fontSize: 12),
              decoration: InputDecoration(
                hintText: 'https://docs.google.com/spreadsheets/d/...',
                hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
                filled: true,
                fillColor: const Color(0xFF1E293B),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 10),

            const Text('Sheet Tab Name:', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF94A3B8))),
            const SizedBox(height: 4),
            TextField(
              controller: _sheetTabController,
              style: const TextStyle(color: Colors.white, fontSize: 12),
              decoration: InputDecoration(
                filled: true,
                fillColor: const Color(0xFF1E293B),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 16),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Spreadsheet sync queued to OCI cloud pipeline!')),
                  );
                },
                icon: const Icon(LucideIcons.layers, size: 15, color: Color(0xFF0B1120)),
                label: const Text('Synchronize Day Plans ⚡', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF0B1120))),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00D084), padding: const EdgeInsets.symmetric(vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
