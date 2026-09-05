import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../data/curriculum365_engine.dart';
import '../data/whole_year_day_plan_engine.dart';
import '../widgets/student_onboarding_dialog.dart';
import '../widgets/tuto_daily_planner_cockpit.dart';
import 'teacho_player_sheet.dart';

class TeachoScreen extends StatefulWidget {
  const TeachoScreen({super.key});

  @override
  State<TeachoScreen> createState() => _TeachoScreenState();
}

class _TeachoScreenState extends State<TeachoScreen> {
  String _activeTab = 'daily_mission'; // 'daily_mission' | 'curriculum_grid' | 'aim_tracks'
  String _activeAmbitionId = 'jr-ias';

  String _selectedCourseId = 'school-std-10';
  String _selectedCourseTitle = 'Class 10th (SSLC) Academic Deck';
  String _selectedBoard = 'TNSB';
  String _studentName = 'SuprO Scholar';
  String _studentPhone = '';

  int _playerDayNumber = 1;
  Set<int> _completedDays = {};
  int _maxUnlockedDay = 1;
  List<DayPlanSummaryItem> _releasedDays = [];
  bool _isLoadingDays = true;

  String _daySearchQuery = '';
  dynamic _selectedWeek = 'ALL'; // 'ALL' | int

  @override
  void initState() {
    super.initState();
    _loadInitialState();
  }

  Future<void> _loadInitialState() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedCourseId = prefs.getString('tuto_active_course_id');
      final savedAmbition = prefs.getString('tuto_active_ambition_id');
      final savedBoard = prefs.getString('user-board');
      final savedName = prefs.getString('user-name');
      final savedPhone = prefs.getString('user-phone');

      if (savedCourseId != null && savedCourseId.isNotEmpty) {
        _selectedCourseId = savedCourseId;
        _selectedCourseTitle = _getCourseTitle(savedCourseId);
      }
      if (savedAmbition != null && savedAmbition.isNotEmpty) {
        _activeAmbitionId = savedAmbition;
      }
      if (savedBoard != null && savedBoard.isNotEmpty) {
        _selectedBoard = savedBoard;
      }
      if (savedName != null && savedName.isNotEmpty) {
        _studentName = savedName;
      }
      if (savedPhone != null && savedPhone.isNotEmpty) {
        _studentPhone = savedPhone;
      }

      final doneSet = await getCompletedDaysForCourse(_selectedCourseId);
      final maxDay = await getMaxUnlockedDay(_selectedCourseId);

      setState(() {
        _completedDays = doneSet;
        _maxUnlockedDay = maxDay;
      });

      await _refreshReleasedDays(doneSet);

      // Check if onboarding is completed
      final onboardingDone = prefs.getString('tuto_student_onboarding_completed');
      if (onboardingDone != 'true' && mounted) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _openOnboardingModal();
        });
      }
    } catch (e) {
      print('TeachoScreen._loadInitialState error: $e');
    }
  }

  String _getCourseTitle(String courseId) {
    if (courseId.contains('lkg')) return 'LKG (Lower KG) Academic Deck';
    if (courseId.contains('ukg')) return 'UKG (Upper KG) Academic Deck';
    if (courseId.contains('neet')) return 'NEET Medical Entrance Master Deck';
    if (courseId.contains('tnpsc')) return 'TNPSC Group Examination Deck';
    if (courseId.contains('std-10')) return 'Class 10th (SSLC) Academic Deck';
    if (courseId.contains('std-12')) return 'Class 12th (HSC) Academic Deck';
    return 'Comprehensive 365 Academic Deck';
  }

  Future<void> _refreshReleasedDays(Set<int> doneSet) async {
    setState(() => _isLoadingDays = true);
    try {
      final list = await getReleasedDaySummariesForCourse(
        courseId: _selectedCourseId,
        courseTitle: _selectedCourseTitle,
        schoolBoard: _selectedBoard,
        completedDaySet: doneSet,
      );
      if (mounted) {
        setState(() {
          _releasedDays = list;
          _isLoadingDays = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoadingDays = false);
    }
  }

  Future<void> _handleSelectAmbition(String ambitionId) async {
    setState(() => _activeAmbitionId = ambitionId);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('tuto_active_ambition_id', ambitionId);
  }

  Future<void> _handleToggleDone(int dayNum) async {
    final isDone = await toggleDayCompletion(_selectedCourseId, dayNum);
    final next = Set<int>.from(_completedDays);
    if (isDone) {
      next.add(dayNum);
    } else {
      next.remove(dayNum);
    }
    final maxDay = await getMaxUnlockedDay(_selectedCourseId);
    setState(() {
      _completedDays = next;
      _maxUnlockedDay = maxDay;
    });
    await _refreshReleasedDays(next);
  }

  void _openOnboardingModal() {
    StudentOnboardingDialog.show(
      context,
      initialName: _studentName,
      userPhone: _studentPhone,
      onComplete: (courseId, board, ambitionId, name) async {
        setState(() {
          _selectedCourseId = courseId;
          _selectedCourseTitle = _getCourseTitle(courseId);
          _selectedBoard = board;
          _activeAmbitionId = ambitionId;
          _studentName = name;
        });
        final doneSet = await getCompletedDaysForCourse(courseId);
        _refreshReleasedDays(doneSet);
      },
    );
  }

  void _openCoursePicker() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        final options = [
          {'id': 'school-lkg', 'title': 'LKG (Lower KG) Academic Deck'},
          {'id': 'school-ukg', 'title': 'UKG (Upper KG) Academic Deck'},
          {'id': 'school-std-1', 'title': 'Class 1st Std Academic Deck'},
          {'id': 'school-std-5', 'title': 'Class 5th Std Academic Deck'},
          {'id': 'school-std-8', 'title': 'Class 8th Std Academic Deck'},
          {'id': 'school-std-10', 'title': 'Class 10th (SSLC) Academic Deck'},
          {'id': 'school-std-12', 'title': 'Class 12th (HSC +2) Academic Deck'},
          {'id': 'exam-neet', 'title': 'NEET-UG Medical Master Deck'},
          {'id': 'exam-tnpsc', 'title': 'TNPSC Group 1/2/4 Exam Deck'},
          {'id': 'jr-ias', 'title': '🏛️ JrIAS Civil Services Track'},
          {'id': 'jr-er', 'title': '💻 JrER Coding & AI Robotics Track'},
          {'id': 'jr-dr', 'title': '🩺 JrDR Clinical Doctor Track'},
        ];

        return Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Switch Academic Course / Track', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white)),
              const SizedBox(height: 12),
              Expanded(
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: options.length,
                  itemBuilder: (c, i) {
                    final item = options[i];
                    final isSel = _selectedCourseId == item['id'];
                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      decoration: BoxDecoration(
                        color: isSel ? const Color(0xFF00D084).withOpacity(0.1) : const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: isSel ? const Color(0xFF00D084) : Colors.transparent),
                      ),
                      child: ListTile(
                        dense: true,
                        title: Text(item['title']!, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: isSel ? const Color(0xFF00D084) : Colors.white)),
                        trailing: isSel ? const Icon(LucideIcons.checkCircle2, color: Color(0xFF00D084), size: 18) : null,
                        onTap: () async {
                          Navigator.pop(ctx);
                          setState(() {
                            _selectedCourseId = item['id']!;
                            _selectedCourseTitle = item['title']!;
                          });
                          final prefs = await SharedPreferences.getInstance();
                          await prefs.setString('tuto_active_course_id', item['id']!);
                          final doneSet = await getCompletedDaysForCourse(item['id']!);
                          _refreshReleasedDays(doneSet);
                        },
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _openDayPlayer(int dayNum) {
    TeachoPlayerSheet.show(
      context,
      courseId: _selectedCourseId,
      courseTitle: _selectedCourseTitle,
      dayNumber: dayNum,
      topicTitle: 'Day $dayNum Structured Lesson',
      subject: 'Core Academic',
      onComplete: (xp) {
        _handleToggleDone(dayNum);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final currentAmbition = AMBITION_CURRICULA[_activeAmbitionId] ?? AMBITION_CURRICULA['jr-ias']!;
    final releasedTotal = _releasedDays.length;
    final completedCount = _releasedDays.where((d) => _completedDays.contains(d.dayNumber)).length;
    final progressPercent = releasedTotal > 0 ? ((completedCount / releasedTotal) * 100).clamp(0, 100).toInt() : 0;

    return Scaffold(
      backgroundColor: const Color(0xFF070C18),
      body: SafeArea(
        child: Column(
          children: [
            // ─── 1. TOP BRAND BAR ───
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              color: const Color(0xFF0E172A),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(
                              color: const Color(0xFF00D084).withOpacity(0.15),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0xFF00D084).withOpacity(0.5)),
                            ),
                            child: const Icon(LucideIcons.graduationCap, size: 20, color: Color(0xFF00D084)),
                          ),
                          const SizedBox(width: 8),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Text('TutO', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -0.5)),
                                  const SizedBox(width: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(color: const Color(0xFF00D084).withOpacity(0.2), borderRadius: BorderRadius.circular(4)),
                                    child: const Text('100% OCI CLOUD', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Color(0xFF00D084))),
                                  ),
                                ],
                              ),
                              const Text('Curated 365 Day Plans Deck', style: TextStyle(fontSize: 10, color: Color(0xFF94A3B8), fontWeight: FontWeight.w600)),
                            ],
                          ),
                        ],
                      ),
                      // Admin Studio Button
                      ElevatedButton.icon(
                        onPressed: () => context.push('/tuto_admin'),
                        icon: const Icon(LucideIcons.shieldCheck, size: 12, color: Color(0xFF38BDF8)),
                        label: const Text('Admin Studio', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xFF38BDF8))),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF131F37),
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8), side: BorderSide(color: const Color(0xFF38BDF8).withOpacity(0.4))),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // ─── 2. ACTIVE PURCHASED COURSE CARD & SWITCH BUTTON ───
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF131F37),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF1E293B)),
                    ),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                color: const Color(0xFF00D084).withOpacity(0.15),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(LucideIcons.layers, size: 16, color: Color(0xFF00D084)),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('ENROLLED COURSE', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w800, color: Color(0xFF00D084), letterSpacing: 0.5)),
                                  Text(_selectedCourseTitle, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.white)),
                                ],
                              ),
                            ),
                            InkWell(
                              onTap: _openOnboardingModal,
                              borderRadius: BorderRadius.circular(6),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 5),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF38BDF8).withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(color: const Color(0xFF38BDF8).withOpacity(0.35)),
                                ),
                                child: Row(
                                  children: const [
                                    Icon(LucideIcons.target, size: 11, color: Color(0xFF38BDF8)),
                                    SizedBox(width: 3),
                                    Text('Goals & Class', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xFF38BDF8))),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(width: 6),
                            ElevatedButton(
                              onPressed: _openCoursePicker,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF00D084),
                                foregroundColor: const Color(0xFF070C18),
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                              ),
                              child: Row(
                                children: const [
                                  Text('Change', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900)),
                                  SizedBox(width: 2),
                                  Icon(LucideIcons.arrowRight, size: 11),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),

                        // Progress Bar & Stats
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('$completedCount of $releasedTotal Released Days Done', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF94A3B8))),
                            Text('$progressPercent% Done', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF00D084))),
                          ],
                        ),
                        const SizedBox(height: 4),
                        LinearProgressIndicator(
                          value: releasedTotal > 0 ? (completedCount / releasedTotal) : 0,
                          backgroundColor: const Color(0xFF070C18),
                          valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF00D084)),
                          minHeight: 5,
                          borderRadius: BorderRadius.circular(3),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // ─── 3. THREE PRIMARY NAVIGATION TABS ───
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: const Color(0xFF070C18),
              child: Row(
                children: [
                  _buildPrimaryTab('daily_mission', LucideIcons.flame, "Today's Mission", const Color(0xFFFBBF24)),
                  const SizedBox(width: 6),
                  _buildPrimaryTab('curriculum_grid', LucideIcons.layers, '365 Roadmap', const Color(0xFF38BDF8)),
                  const SizedBox(width: 6),
                  _buildPrimaryTab('aim_tracks', LucideIcons.compass, '⭐ ${currentAmbition.short}', const Color(0xFFA78BFA)),
                ],
              ),
            ),

            // ─── 4. TAB CONTENT ───
            Expanded(
              child: _activeTab == 'daily_mission'
                  ? SingleChildScrollView(
                      padding: const EdgeInsets.all(14),
                      child: TutoDailyPlannerCockpit(
                        courseId: _selectedCourseId,
                        courseTitle: _selectedCourseTitle,
                        selectedBoard: _selectedBoard,
                        activeAmbitionId: _activeAmbitionId,
                        onSelectAmbition: _handleSelectAmbition,
                        dayNumber: _playerDayNumber,
                        onChangeDayNumber: (d) => setState(() => _playerDayNumber = d),
                        onOpenCoursePlayer: _openDayPlayer,
                        userPhone: _studentPhone,
                      ),
                    )
                  : _activeTab == 'aim_tracks'
                      ? _buildAimTracksExplorer()
                      : _buildRoadmapTab(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPrimaryTab(String tabId, IconData icon, String label, Color accentColor) {
    final isAct = _activeTab == tabId;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _activeTab = tabId),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 9),
          decoration: BoxDecoration(
            color: isAct ? const Color(0xFF00D084) : const Color(0xFF0E172A),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: isAct ? const Color(0xFF00D084) : Colors.white.withOpacity(0.08)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 13, color: isAct ? const Color(0xFF070C18) : accentColor),
              const SizedBox(width: 4),
              Flexible(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: isAct ? FontWeight.w900 : FontWeight.w800,
                    color: isAct ? const Color(0xFF070C18) : const Color(0xFF94A3B8),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ─── TAB 2: 365 ROADMAP TAB ───
  Widget _buildRoadmapTab() {
    final filtered = _releasedDays.where((d) {
      if (_selectedWeek is int && d.weekNumber != _selectedWeek) return false;
      if (_daySearchQuery.isNotEmpty) {
        final q = _daySearchQuery.toLowerCase();
        return d.dayNumber.toString() == q || d.topicTitle.toLowerCase().contains(q) || d.subject.toLowerCase().contains(q);
      }
      return true;
    }).toList();

    return Column(
      children: [
        // Search bar
        Padding(
          padding: const EdgeInsets.fromLTRB(14, 10, 14, 6),
          child: TextField(
            style: const TextStyle(color: Colors.white, fontSize: 12),
            decoration: InputDecoration(
              hintText: 'Search released days (e.g. 1, 5, topic name)...',
              hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
              prefixIcon: const Icon(LucideIcons.search, size: 16, color: Color(0xFF00D084)),
              filled: true,
              fillColor: const Color(0xFF0E172A),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF1E293B))),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF1E293B))),
            ),
            onChanged: (txt) => setState(() => _daySearchQuery = txt.trim()),
          ),
        ),

        // Results count
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          child: Align(
            alignment: Alignment.centerLeft,
            child: Text(
              'Showing ${filtered.length} Admin-Released Day Plans',
              style: const TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
            ),
          ),
        ),

        // List
        Expanded(
          child: _isLoadingDays
              ? const Center(child: CircularProgressIndicator(color: Color(0xFF00D084)))
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  itemCount: filtered.length,
                  itemBuilder: (ctx, i) {
                    final item = filtered[i];
                    final isDone = _completedDays.contains(item.dayNumber);

                    return Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: item.isMondayHoliday ? const Color(0xFF09151F) : const Color(0xFF0E172A),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isDone ? const Color(0xFF00D084).withOpacity(0.6) : item.isMondayHoliday ? const Color(0xFF00D084).withOpacity(0.3) : const Color(0xFF1E293B),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: isDone ? const Color(0xFF00D084).withOpacity(0.2) : const Color(0xFF38BDF8).withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(color: isDone ? const Color(0xFF00D084) : const Color(0xFF38BDF8).withOpacity(0.4)),
                                    ),
                                    child: Text('DAY ${item.dayNumber}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white)),
                                  ),
                                  const SizedBox(width: 8),
                                  Text('Week ${item.weekNumber} · ${item.dayOfWeekName}', style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8), fontWeight: FontWeight.w700)),
                                ],
                              ),
                              Row(
                                children: [
                                  if (item.isMondayHoliday)
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(color: const Color(0xFF00D084).withOpacity(0.15), borderRadius: BorderRadius.circular(4)),
                                      child: const Text('🌿 MONDAY REVIEW', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Color(0xFF00D084))),
                                    )
                                  else
                                    Text('+${item.totalXpReward} XP', style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Color(0xFFF59E0B))),
                                  const SizedBox(width: 8),
                                  IconButton(
                                    padding: EdgeInsets.zero,
                                    constraints: const BoxConstraints(),
                                    icon: Icon(isDone ? LucideIcons.checkCircle2 : LucideIcons.circle, size: 18, color: isDone ? const Color(0xFF00D084) : const Color(0xFF64748B)),
                                    onPressed: () => _handleToggleDone(item.dayNumber),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(item.topicTitle, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Colors.white)),
                          if (item.topicTamilTitle != null) ...[
                            const SizedBox(height: 2),
                            Text(item.topicTamilTitle!, style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
                          ],
                          const SizedBox(height: 8),

                          // 4 Pillars Row
                          Row(
                            children: [
                              _buildPillarTag(LucideIcons.video, '3 Videos', const Color(0xFF38BDF8)),
                              const SizedBox(width: 6),
                              _buildPillarTag(LucideIcons.fileText, '3 Notes', const Color(0xFFA78BFA)),
                              const SizedBox(width: 6),
                              _buildPillarTag(LucideIcons.award, '5 MCQs', const Color(0xFF10B981)),
                              const SizedBox(width: 6),
                              _buildPillarTag(LucideIcons.smile, 'Yoga', const Color(0xFFF43F5E)),
                            ],
                          ),
                          const SizedBox(height: 8),

                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: () => _openDayPlayer(item.dayNumber),
                              icon: const Icon(LucideIcons.play, size: 12, color: Color(0xFF070C18)),
                              label: Text(
                                item.isMondayHoliday ? 'Open Monday Review (Day ${item.dayNumber}) 🌿' : 'Start Day ${item.dayNumber} Player ▶️',
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFF070C18)),
                              ),
                              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00D084), padding: const EdgeInsets.symmetric(vertical: 8), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
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

  Widget _buildPillarTag(IconData icon, String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
      decoration: BoxDecoration(color: const Color(0xFF131F37), borderRadius: BorderRadius.circular(4)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 10, color: color),
          const SizedBox(width: 3),
          Text(text, style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w700, color: Color(0xFFCBD5E1))),
        ],
      ),
    );
  }

  // ─── TAB 3: CAREER TRACKS EXPLORER ───
  Widget _buildAimTracksExplorer() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF1E1B4B),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.4)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('⭐ Futuristic Ambitions & Career Tracks', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Colors.white)),
                SizedBox(height: 4),
                Text('Select your dream profession to personalize all 365 daily lessons, case studies, and practical skills.', style: TextStyle(fontSize: 11, color: Color(0xFFCBD5E1))),
              ],
            ),
          ),
          const SizedBox(height: 12),

          ...AMBITION_CURRICULA.entries.map((entry) {
            final trk = entry.value;
            final isAct = _activeAmbitionId == entry.key;

            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isAct ? const Color(0xFF1E1B4B) : const Color(0xFF0E172A),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isAct ? const Color(0xFFF59E0B) : Colors.white.withOpacity(0.08)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(trk.icon, style: const TextStyle(fontSize: 24)),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(trk.title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Colors.white)),
                                if (isAct)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(color: const Color(0xFFF59E0B), borderRadius: BorderRadius.circular(4)),
                                    child: const Text('ACTIVE', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Color(0xFF0B1120))),
                                  ),
                              ],
                            ),
                            Text(trk.roleTag, style: const TextStyle(fontSize: 10, color: Color(0xFF38BDF8))),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(trk.desc, style: const TextStyle(fontSize: 11, color: Color(0xFFCBD5E1))),
                  const SizedBox(height: 10),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => _handleSelectAmbition(entry.key),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isAct ? const Color(0xFF00D084) : const Color(0xFF1E293B),
                        foregroundColor: isAct ? const Color(0xFF070C18) : Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: Text(
                        isAct ? '✓ Currently Enrolled in 365 Plan' : 'Switch to this Career Aim →',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800),
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
}
