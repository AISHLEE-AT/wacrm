import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../data/curriculum365_engine.dart';
import '../services/tuto_oci_service.dart';

class TutoDailyPlannerCockpit extends StatefulWidget {
  final String courseId;
  final String courseTitle;
  final String selectedBoard;
  final String activeAmbitionId;
  final Function(String ambitionId) onSelectAmbition;
  final int dayNumber;
  final Function(int newDay)? onChangeDayNumber;
  final Function(int dayNum)? onOpenCoursePlayer;
  final Function(String category, String subject)? onOpenTest;
  final Function(int dayNum, String? topicHint)? onOpenExplainer;
  final String userPhone;

  const TutoDailyPlannerCockpit({
    super.key,
    required this.courseId,
    required this.courseTitle,
    this.selectedBoard = 'TNSB',
    required this.activeAmbitionId,
    required this.onSelectAmbition,
    required this.dayNumber,
    this.onChangeDayNumber,
    this.onOpenCoursePlayer,
    this.onOpenTest,
    this.onOpenExplainer,
    this.userPhone = '',
  });

  @override
  State<TutoDailyPlannerCockpit> createState() => _TutoDailyPlannerCockpitState();
}

class _TutoDailyPlannerCockpitState extends State<TutoDailyPlannerCockpit> {
  late int _activeDay;
  List<DayClassItem> _classes = [];
  DayYogaPlan? _yoga;
  DayTestPlan? _dailyTest;

  List<int> _completedClasses = [];
  bool _yogaCompleted = false;
  bool _testCompleted = false;
  int _dailyXp = 0;
  int _streak = 1;
  int _totalXp = 0;

  final Map<int, bool> _expandedStages = {1: true, 2: true, 3: true, 4: true};

  // Submission State
  String _submissionStatus = 'none'; // 'none' | 'submitted' | 'approved'
  bool _isSubmittingMission = false;
  String? _submissionSuccessMsg;
  final TextEditingController _studentNotesController = TextEditingController();

  // Active Teacher Alert
  Map<String, dynamic>? _activeAlert;

  @override
  void initState() {
    super.initState();
    _activeDay = widget.dayNumber;
    _initDayPlan();
  }

  @override
  void didUpdateWidget(covariant TutoDailyPlannerCockpit oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.dayNumber != widget.dayNumber) {
      _activeDay = widget.dayNumber;
      _initDayPlan();
    }
    if (oldWidget.activeAmbitionId != widget.activeAmbitionId || oldWidget.courseId != widget.courseId) {
      _initDayPlan();
    }
  }

  @override
  void dispose() {
    _studentNotesController.dispose();
    super.dispose();
  }

  void _initDayPlan() {
    // 1. Load deterministic baseline
    final baseline = generateUniqueTenClassesForDay(widget.courseId, widget.activeAmbitionId, _activeDay, widget.selectedBoard);
    setState(() {
      _classes = baseline.classes;
      _yoga = baseline.yoga;
      _dailyTest = baseline.dailyTest;
    });

    // 2. Fetch OCI remote state & alerts
    _fetchRemotePlanner(_activeDay);
    _fetchStudentAlerts();
    _checkSubmissionStatus(_activeDay);
  }

  Future<void> _checkSubmissionStatus(int targetDay) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final saved = prefs.getString('tuto_sub_status_${widget.courseId}_day_$targetDay');
      setState(() {
        _submissionStatus = (saved == 'submitted' || saved == 'approved') ? saved! : 'none';
      });
    } catch (_) {}
  }

  Future<void> _fetchRemotePlanner(int targetDay) async {
    final cleanPhone = widget.userPhone.isNotEmpty ? widget.userPhone : 'anonymous';
    final data = await TutoOciService.fetchTodayPlanner(
      phone: cleanPhone,
      courseId: widget.courseId,
      ambitionId: widget.activeAmbitionId,
      dayNumber: targetDay,
    );

    if (data != null && mounted) {
      setState(() {
        if (data['classes'] is List) {
          _classes = (data['classes'] as List).map((c) => DayClassItem.fromMap(c as Map<String, dynamic>)).toList();
        }
        if (data['yoga'] is Map) {
          _yoga = DayYogaPlan.fromMap(data['yoga'] as Map<String, dynamic>);
        }
        if (data['dailyTest'] is Map) {
          _dailyTest = DayTestPlan.fromMap(data['dailyTest'] as Map<String, dynamic>);
        }

        final prog = data['progress'];
        if (prog is Map) {
          _completedClasses = (prog['completedClasses'] as List? ?? []).map((e) => int.parse(e.toString())).toList();
          _yogaCompleted = prog['yogaCompleted'] == true;
          _testCompleted = prog['dailyTestCompleted'] == true;
          _dailyXp = prog['dailyXpEarned'] is int ? prog['dailyXpEarned'] as int : 0;
          _streak = prog['currentStreak'] is int ? prog['currentStreak'] as int : 1;
          _totalXp = prog['totalXp'] is int ? prog['totalXp'] as int : 0;
        }
      });
    }
  }

  Future<void> _fetchStudentAlerts() async {
    final cleanPhone = widget.userPhone.isNotEmpty ? widget.userPhone : '';
    if (cleanPhone.isEmpty) return;
    final alerts = await TutoOciService.fetchStudentAlerts(cleanPhone);
    if (alerts.isNotEmpty && mounted) {
      setState(() => _activeAlert = alerts.first);
    }
  }

  Future<void> _handleDismissAlert() async {
    if (_activeAlert == null) return;
    final bonusXp = _activeAlert!['bonus_xp'] is int ? _activeAlert!['bonus_xp'] as int : 0;
    setState(() {
      if (bonusXp > 0) {
        _totalXp += bonusXp;
        _dailyXp += bonusXp;
      }
    });
    await TutoOciService.dismissAlert(_activeAlert!['id']);
    if (mounted) setState(() => _activeAlert = null);
  }

  void _handleDayChange(int newDay) {
    final clamped = newDay.clamp(1, 365);
    setState(() => _activeDay = clamped);
    widget.onChangeDayNumber?.call(clamped);
    _initDayPlan();
  }

  Future<void> _handleToggleClass(int classId, int xp) async {
    final isDone = _completedClasses.contains(classId);
    final nextDone = !isDone;

    setState(() {
      if (nextDone) {
        _completedClasses.add(classId);
        _dailyXp += xp;
        _totalXp += xp;
      } else {
        _completedClasses.remove(classId);
        _dailyXp = (_dailyXp - xp).clamp(0, 999999);
        _totalXp = (_totalXp - xp).clamp(0, 999999);
      }
    });

    final cleanPhone = widget.userPhone.isNotEmpty ? widget.userPhone : 'anonymous';
    await TutoOciService.toggleTask(
      phone: cleanPhone,
      courseId: widget.courseId,
      dayNumber: _activeDay,
      taskType: 'class',
      classIndex: classId,
      completed: nextDone,
      xp: xp,
    );
  }

  Future<void> _handleToggleYoga() async {
    final nextDone = !_yogaCompleted;
    setState(() {
      _yogaCompleted = nextDone;
      if (nextDone) {
        _dailyXp += 50;
        _totalXp += 50;
      } else {
        _dailyXp = (_dailyXp - 50).clamp(0, 999999);
        _totalXp = (_totalXp - 50).clamp(0, 999999);
      }
    });

    final cleanPhone = widget.userPhone.isNotEmpty ? widget.userPhone : 'anonymous';
    await TutoOciService.toggleTask(
      phone: cleanPhone,
      courseId: widget.courseId,
      dayNumber: _activeDay,
      taskType: 'yoga',
      completed: nextDone,
      xp: 50,
    );
  }

  Future<void> _handleSubmitDayMission() async {
    setState(() => _isSubmittingMission = true);
    try {
      final prefs = await SharedPreferences.getInstance();
      final studentName = prefs.getString('user-name') ?? 'SuprO Scholar';
      final cleanPhone = widget.userPhone.isNotEmpty ? widget.userPhone : (prefs.getString('user-phone') ?? '9876543210');

      final success = await TutoOciService.submitDayMission(
        studentName: studentName,
        studentPhone: cleanPhone,
        academicClass: widget.courseId,
        ambitionId: widget.activeAmbitionId,
        courseId: widget.courseId,
        dayNumber: _activeDay,
        classesCompleted: _completedClasses.length,
        totalClasses: 10,
        yogaCompleted: _yogaCompleted,
        testScore: _testCompleted ? 100 : 0,
        xpEarned: _dailyXp,
        studentNotes: _studentNotesController.text.trim(),
      );

      if (success) {
        setState(() {
          _submissionStatus = 'submitted';
          _submissionSuccessMsg = '🎉 Mission Day $_activeDay successfully submitted to Teacher for review!';
        });
        await prefs.setString('tuto_sub_status_${widget.courseId}_day_$_activeDay', 'submitted');
        Navigator.of(context, rootNavigator: true).pop(); // Close dialog

        Future.delayed(const Duration(seconds: 6), () {
          if (mounted) setState(() => _submissionSuccessMsg = null);
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not submit mission. Please try again.')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      if (mounted) setState(() => _isSubmittingMission = false);
    }
  }

  // ─── Modal: Yoga Guide ───
  void _openYogaModal() {
    if (_yoga == null) return;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setMState) => Container(
          height: MediaQuery.of(context).size.height * 0.75,
          padding: const EdgeInsets.all(20),
          decoration: const BoxDecoration(
            color: Color(0xFF0F172A),
            borderRadius: BorderRadius.only(topLeft: Radius.circular(22), topRight: Radius.circular(22)),
            border: Border(top: BorderSide(color: Color(0xFF1E293B))),
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
                      Text('DAY $_activeDay WELLNESS', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF00D084), letterSpacing: 0.5)),
                      const SizedBox(height: 2),
                      Text(_yoga!.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white)),
                      if (_yoga!.sanskrit != null)
                        Text(_yoga!.sanskrit!, style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: Color(0xFFA5B4FC))),
                    ],
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(ctx),
                    icon: const Icon(LucideIcons.x, size: 18, color: Color(0xFF94A3B8)),
                  ),
                ],
              ),
              const Divider(color: Color(0xFF1E293B), height: 24),
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildYogaSection('🌿 Key Benefits:', _yoga!.benefits.map((b) => '• $b').join('\n')),
                      _buildYogaSection('🧘 Step-by-Step Instructions:', _yoga!.steps.asMap().entries.map((e) => '${e.key + 1}. ${e.value}').join('\n')),
                      _buildYogaSection('💨 Breathing Pattern:', _yoga!.breathing),
                      _buildYogaSection('⚡ Brain Booster Fact:', _yoga!.brainBooster),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    _handleToggleYoga();
                    Navigator.pop(ctx);
                  },
                  icon: const Icon(LucideIcons.checkCircle2, size: 18, color: Color(0xFF0B1120)),
                  label: Text(
                    _yogaCompleted ? 'Completed (50 XP Awarded)' : 'Mark Yoga Completed (+50 XP)',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF0B1120)),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF00D084),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildYogaSection(String title, String content) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFFFBBF24))),
          const SizedBox(height: 4),
          Text(content, style: const TextStyle(fontSize: 11, color: Color(0xFFCBD5E1), height: 1.4)),
        ],
      ),
    );
  }

  // ─── Modal: Module 1 Mission Submission ───
  void _openSubmitMissionModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setMState) => Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Color(0xFF0F172A),
              borderRadius: BorderRadius.only(topLeft: Radius.circular(22), topRight: Radius.circular(22)),
              border: Border(top: BorderSide(color: Color(0xFF1E293B))),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('MODULE 1 • STUDENT SUBMISSION', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFF00D084), letterSpacing: 0.5)),
                        const SizedBox(height: 2),
                        Text('Submit Day $_activeDay Mission', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white)),
                        const SizedBox(height: 2),
                        const Text('Your guide will review your classes & reflection notes.', style: TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
                      ],
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(ctx),
                      icon: const Icon(LucideIcons.x, size: 18, color: Color(0xFF94A3B8)),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Metrics Grid
                Row(
                  children: [
                    _buildMetricBox('CLASSES', '${_completedClasses.length}/10'),
                    const SizedBox(width: 6),
                    _buildMetricBox('TEST SCORE', _testCompleted ? '100%' : 'Pending'),
                    const SizedBox(width: 6),
                    _buildMetricBox('YOGA', _yogaCompleted ? 'Done' : 'Pending'),
                    const SizedBox(width: 6),
                    _buildMetricBox('EARNED XP', '+${_dailyXp} XP', color: const Color(0xFFFBBF24)),
                  ],
                ),
                const SizedBox(height: 14),

                const Text('Student Reflection & Doubts for Teacher:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFFCBD5E1))),
                const SizedBox(height: 6),
                TextField(
                  controller: _studentNotesController,
                  maxLines: 3,
                  style: const TextStyle(color: Colors.white, fontSize: 12),
                  decoration: InputDecoration(
                    hintText: 'Write what you learned today or questions you have for your guide...',
                    hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
                    filled: true,
                    fillColor: const Color(0xFF1E293B),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 16),

                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _isSubmittingMission ? null : _handleSubmitDayMission,
                    icon: _isSubmittingMission
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0B1120)))
                        : const Icon(LucideIcons.send, size: 16, color: Color(0xFF0B1120)),
                    label: Text(
                      _isSubmittingMission ? 'Submitting...' : 'Send Day $_activeDay Mission to Teacher',
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF0B1120)),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF00D084),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMetricBox(String label, String value, {Color color = Colors.white}) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          children: [
            Text(label, style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w800, color: Color(0xFF94A3B8))),
            const SizedBox(height: 2),
            Text(value, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: color)),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final currentAmbition = AMBITION_CURRICULA[widget.activeAmbitionId] ?? AMBITION_CURRICULA['jr-ias']!;
    final nextClass = _classes.firstWhere(
      (c) => !_completedClasses.contains(c.id),
      orElse: () => _classes.isNotEmpty ? _classes.first : const DayClassItem(id: 1, type: 'academic', title: 'Lesson', subject: 'Core', duration: '15m', xp: 20, icon: '📚'),
    );

    final termText = _activeDay <= 120
        ? 'Term 1: Foundations'
        : _activeDay <= 240
            ? 'Term 2: Applied & Lab'
            : 'Term 3: Advanced Revision';

    final progressPercent = ((_completedClasses.length / 10) * 100).clamp(0, 100).toInt();

    // 4 Pedagogical Stages
    final stages = [
      {
        'id': 1,
        'title': 'Stage 1: Morning Academic & Language Core',
        'subtitle': 'Maths, Science, Languages & Social Science (Classes 1 to 4)',
        'icon': '🌅',
        'classes': _classes.where((c) => c.id >= 1 && c.id <= 4).toList(),
      },
      {
        'id': 2,
        'title': 'Stage 2: Daily Skill, Penmanship & GK',
        'subtitle': 'Milestone GK, Handwriting Laboratory & Life Skills (Classes 5 to 7)',
        'icon': '✍️',
        'classes': _classes.where((c) => c.id >= 5 && c.id <= 7).toList(),
      },
      {
        'id': 3,
        'title': 'Stage 3: Futuristic Ambition & Visual Media',
        'subtitle': '${currentAmbition.short} Career Track & Video Masterclass (Classes 8 & 9)',
        'icon': '🚀',
        'classes': _classes.where((c) => c.id >= 8 && c.id <= 9).toList(),
      },
      {
        'id': 4,
        'title': 'Stage 4: Evening Assessment & Daily Mock',
        'subtitle': '5 Concept-Aligned Bedtime Questions (Class 10)',
        'icon': '🌙',
        'classes': _classes.where((c) => c.id == 10).toList(),
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ─── 0. 365-DAY TIMELINE & NAVIGATION BAR ───
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.25)),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  ElevatedButton.icon(
                    onPressed: _activeDay <= 1 ? null : () => _handleDayChange(_activeDay - 1),
                    icon: const Icon(LucideIcons.chevronLeft, size: 14, color: Colors.white),
                    label: const Text('Prev', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white.withOpacity(0.08),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                  Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF6366F1).withOpacity(0.2),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.4)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(LucideIcons.calendar, size: 12, color: Color(0xFFFBBF24)),
                            const SizedBox(width: 6),
                            Text('Day $_activeDay of 365', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Colors.white)),
                          ],
                        ),
                      ),
                      const SizedBox(height: 3),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFF3B82F6).withOpacity(0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(termText.toUpperCase(), style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: Color(0xFF93C5FD))),
                      ),
                    ],
                  ),
                  ElevatedButton(
                    onPressed: _activeDay >= 365 ? null : () => _handleDayChange(_activeDay + 1),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white.withOpacity(0.08),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
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
              // Quick Jump Chips
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    const Text('Quick Jump: ', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF94A3B8))),
                    const SizedBox(width: 4),
                    ...[1, 50, 100, 180, 250, 365].map((d) {
                      final isSelected = _activeDay == d;
                      return Padding(
                        padding: const EdgeInsets.only(right: 6),
                        child: InkWell(
                          onTap: () => _handleDayChange(d),
                          borderRadius: BorderRadius.circular(8),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: isSelected ? const Color(0xFFFBBF24) : Colors.white.withOpacity(0.06),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              'D$d',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                color: isSelected ? const Color(0xFF0B1120) : const Color(0xFF94A3B8),
                              ),
                            ),
                          ),
                        ),
                      );
                    }),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // ─── CELEBRATORY TEACHER ALERT BANNER ───
        if (_activeAlert != null) ...[
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF1E1B4B),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFF59E0B)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Text('🎉', style: TextStyle(fontSize: 22)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Teacher Review & Commendation!', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFFFDE68A))),
                          Text('Guide ${_activeAlert!['teacher_name']} reviewed Day ${_activeAlert!['day_number']}', style: const TextStyle(fontSize: 11, color: Color(0xFFCBD5E1))),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: const Color(0xFFF59E0B).withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                      child: Text('+${_activeAlert!['bonus_xp']} XP', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFFFBBF24))),
                    ),
                  ],
                ),
                if (_activeAlert!['comments'] != null && _activeAlert!['comments'].toString().isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(color: Colors.black.withOpacity(0.2), borderRadius: BorderRadius.circular(10)),
                    child: Text('“${_activeAlert!['comments']}”', style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: Colors.white)),
                  ),
                ],
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _handleDismissAlert,
                    icon: const Icon(LucideIcons.checkCircle2, size: 16, color: Color(0xFF0B1120)),
                    label: const Text('Celebrate & Claim XP 🎉', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF0B1120))),
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFBBF24), padding: const EdgeInsets.symmetric(vertical: 8)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
        ],

        // ─── SUCCESS TOAST ───
        if (_submissionSuccessMsg != null) ...[
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF00D084).withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF00D084).withOpacity(0.3)),
            ),
            child: Row(
              children: [
                const Icon(LucideIcons.checkCircle2, size: 16, color: Color(0xFF00D084)),
                const SizedBox(width: 8),
                Expanded(child: Text(_submissionSuccessMsg!, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF00D084)))),
              ],
            ),
          ),
          const SizedBox(height: 12),
        ],

        // ─── MODULE 1: DAY MISSION SUBMISSION CARD ───
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFF0E172A),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.3)),
          ),
          child: Row(
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: const Color(0xFF6366F1).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                alignment: Alignment.center,
                child: Text(
                  _submissionStatus == 'approved' ? '🎖️' : _submissionStatus == 'submitted' ? '⏳' : '🚀',
                  style: const TextStyle(fontSize: 20),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text('Day $_activeDay Mission', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Colors.white)),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: _submissionStatus == 'approved'
                                ? const Color(0xFF00D084).withOpacity(0.2)
                                : _submissionStatus == 'submitted'
                                    ? const Color(0xFFFBBF24).withOpacity(0.2)
                                    : const Color(0xFF818CF8).withOpacity(0.2),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            _submissionStatus == 'approved' ? 'Approved' : _submissionStatus == 'submitted' ? 'Under Review' : 'Ready to Submit',
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w800,
                              color: _submissionStatus == 'approved' ? const Color(0xFF00D084) : _submissionStatus == 'submitted' ? const Color(0xFFFBBF24) : const Color(0xFF818CF8),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${_completedClasses.length}/10 Classes • Yoga: ${_yogaCompleted ? "Done" : "Pending"} • +${_dailyXp} XP',
                      style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
                    ),
                  ],
                ),
              ),
              ElevatedButton.icon(
                onPressed: _openSubmitMissionModal,
                icon: Icon(LucideIcons.send, size: 12, color: _submissionStatus == 'none' ? const Color(0xFF0B1120) : Colors.white),
                label: Text(
                  _submissionStatus == 'approved' ? 'Review' : _submissionStatus == 'submitted' ? 'Update' : 'Submit',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: _submissionStatus == 'none' ? const Color(0xFF0B1120) : Colors.white),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _submissionStatus == 'none' ? const Color(0xFF00D084) : const Color(0xFF1E293B),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // ─── 1. HERO ACTIVE MISSION BANNER ───
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF1E1B4B),
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.4)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(color: const Color(0xFFF59E0B).withOpacity(0.2), borderRadius: BorderRadius.circular(12)),
                    child: Row(
                      children: [
                        const Icon(LucideIcons.flame, size: 12, color: Color(0xFFF59E0B)),
                        const SizedBox(width: 4),
                        Text('$_streak Day Streak', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xFFFBBF24))),
                      ],
                    ),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(color: const Color(0xFF6366F1).withOpacity(0.2), borderRadius: BorderRadius.circular(12)),
                    child: Row(
                      children: [
                        const Icon(LucideIcons.star, size: 12, color: Color(0xFF818CF8)),
                        const SizedBox(width: 4),
                        Text('$_totalXp XP Total', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xFFA5B4FC))),
                      ],
                    ),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(color: const Color(0xFF00D084).withOpacity(0.2), borderRadius: BorderRadius.circular(12)),
                    child: Text('Day $_activeDay of 365', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xFF00D084))),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // Up Next
              Text(
                'UP NEXT · CLASS ${nextClass.id} OF 10 (${nextClass.subject.toUpperCase()})',
                style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Color(0xFFA5B4FC), letterSpacing: 0.5),
              ),
              const SizedBox(height: 2),
              Text(
                nextClass.title,
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Colors.white),
              ),
              const SizedBox(height: 10),

              // Ambition Track Switcher
              const Text('CAREER TRACK:', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Color(0xFF94A3B8))),
              const SizedBox(height: 4),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: AMBITION_CURRICULA.entries.map((entry) {
                    final trk = entry.value;
                    final isAct = widget.activeAmbitionId == entry.key;
                    return Padding(
                      padding: const EdgeInsets.only(right: 6),
                      child: InkWell(
                        onTap: () => widget.onSelectAmbition(entry.key),
                        borderRadius: BorderRadius.circular(10),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: isAct ? const Color(0xFFFBBF24) : Colors.white.withOpacity(0.08),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Row(
                            children: [
                              Text(trk.icon, style: const TextStyle(fontSize: 13)),
                              const SizedBox(width: 4),
                              Text(
                                trk.short,
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: isAct ? FontWeight.w900 : FontWeight.w700,
                                  color: isAct ? const Color(0xFF0B1120) : Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 10),

              // Primary Action
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => widget.onOpenCoursePlayer?.call(_activeDay),
                  icon: const Icon(LucideIcons.play, size: 16, color: Color(0xFF0B1120)),
                  label: Text('Resume Lesson (${nextClass.duration})', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF0B1120))),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF00D084),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
              const SizedBox(height: 4),
              Center(
                child: Text(
                  'Progress: ${_completedClasses.length}/10 Classes ($progressPercent%)',
                  style: const TextStyle(fontSize: 10, color: Color(0xFFCBD5E1)),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // ─── QUICK TOOLS ROW ───
        Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                onPressed: _openYogaModal,
                icon: const Text('🧘', style: TextStyle(fontSize: 16)),
                label: Text('Daily Yoga ${_yogaCompleted ? "✓" : ""}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0E172A),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                    side: BorderSide(color: Colors.white.withOpacity(0.08)),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () => widget.onOpenTest?.call(widget.courseId, 'ALL'),
                icon: const Icon(LucideIcons.zap, size: 14, color: Color(0xFFFBBF24)),
                label: const Text('Daily CBT Test (10 Qs)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0E172A),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                    side: BorderSide(color: Colors.white.withOpacity(0.08)),
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),

        // ─── 4 PEDAGOGICAL STAGES ───
        Column(
          children: stages.map((stg) {
            final stgId = stg['id'] as int;
            final isExp = _expandedStages[stgId] ?? true;
            final stgClasses = stg['classes'] as List<DayClassItem>;
            final stgCompleted = stgClasses.where((c) => _completedClasses.contains(c.id)).length;

            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF0E172A),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: Colors.white.withOpacity(0.08)),
              ),
              child: Column(
                children: [
                  InkWell(
                    onTap: () => setState(() => _expandedStages[stgId] = !isExp),
                    borderRadius: BorderRadius.circular(18),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Row(
                        children: [
                          Text(stg['icon'] as String, style: const TextStyle(fontSize: 18)),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(stg['title'] as String, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Colors.white)),
                                Text(stg['subtitle'] as String, style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
                              ],
                            ),
                          ),
                          Text('$stgCompleted/${stgClasses.length}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF38BDF8))),
                          const SizedBox(width: 6),
                          Icon(isExp ? LucideIcons.chevronUp : LucideIcons.chevronDown, size: 16, color: const Color(0xFF94A3B8)),
                        ],
                      ),
                    ),
                  ),
                  if (isExp)
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      child: Column(
                        children: stgClasses.map((cls) {
                          final isDone = _completedClasses.contains(cls.id);
                          return Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: isDone ? const Color(0xFF1E293B).withOpacity(0.5) : const Color(0xFF1E293B),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: Row(
                              children: [
                                IconButton(
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(),
                                  onPressed: () => _handleToggleClass(cls.id, cls.xp),
                                  icon: Icon(
                                    isDone ? LucideIcons.checkCircle2 : LucideIcons.circle,
                                    size: 20,
                                    color: isDone ? const Color(0xFF00D084) : const Color(0xFF475569),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Text('CLASS ${cls.id}', style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFFFBBF24))),
                                          const SizedBox(width: 6),
                                          Text(cls.subject.toUpperCase(), style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: Color(0xFF94A3B8))),
                                          const SizedBox(width: 6),
                                          Text('⏱ ${cls.duration}', style: const TextStyle(fontSize: 9, color: Color(0xFF64748B))),
                                          const Spacer(),
                                          Text('+${cls.xp} XP', style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Color(0xFF00D084))),
                                        ],
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        cls.title,
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w800,
                                          color: isDone ? const Color(0xFF94A3B8) : Colors.white,
                                          decoration: isDone ? TextDecoration.lineThrough : null,
                                        ),
                                      ),
                                      if (cls.microTopic != null) ...[
                                        const SizedBox(height: 2),
                                        Text(cls.microTopic!, style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
                                      ],
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 8),
                                IconButton(
                                  icon: const Icon(LucideIcons.play, size: 14, color: Color(0xFF00D084)),
                                  onPressed: () => widget.onOpenCoursePlayer?.call(_activeDay),
                                  style: IconButton.styleFrom(
                                    backgroundColor: Colors.white.withOpacity(0.08),
                                    padding: const EdgeInsets.all(6),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                ],
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}
