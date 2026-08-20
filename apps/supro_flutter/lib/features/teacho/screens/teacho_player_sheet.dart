import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../services/teacho_supabase_service.dart';

class TeachoPlayerSheet extends StatefulWidget {
  final String topicTitle;
  final String subject;
  final String courseTitle;
  final String courseId;
  final int dayNumber;
  final Function(int xp)? onComplete;

  const TeachoPlayerSheet({
    super.key,
    required this.topicTitle,
    required this.subject,
    required this.courseTitle,
    required this.courseId,
    required this.dayNumber,
    this.onComplete,
  });

  static Future<void> show(
    BuildContext context, {
    required String topicTitle,
    required String subject,
    required String courseTitle,
    required String courseId,
    required int dayNumber,
    Function(int xp)? onComplete,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => TeachoPlayerSheet(
        topicTitle: topicTitle,
        subject: subject,
        courseTitle: courseTitle,
        courseId: courseId,
        dayNumber: dayNumber,
        onComplete: onComplete,
      ),
    );
  }

  @override
  State<TeachoPlayerSheet> createState() => _TeachoPlayerSheetState();
}

class _TeachoPlayerSheetState extends State<TeachoPlayerSheet> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  LessonContent? _content;
  bool _isLoading = true;
  bool _isPlaying = true;
  int _currentFlashcardIndex = 0;
  bool _isCardFlipped = false;
  final Map<int, int> _selectedAnswers = {};
  bool _isCompleted = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _loadLessonContent();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadLessonContent() async {
    setState(() => _isLoading = true);
    final lesson = await TeachoSupabaseService.fetchLessonContent(
      courseId: widget.courseId,
      dayNumber: widget.dayNumber,
      topicTitle: widget.topicTitle,
      subject: widget.subject,
      courseTitle: widget.courseTitle,
    );
    if (mounted) {
      setState(() {
        _content = lesson;
        _isLoading = false;
      });
    }
  }

  void _handleSelectOption(int questionIndex, int optionIndex) {
    if (_selectedAnswers.containsKey(questionIndex)) return;
    setState(() {
      _selectedAnswers[questionIndex] = optionIndex;
    });
  }

  void _handleClaimCompletion() {
    setState(() => _isCompleted = true);
    widget.onComplete?.call(_content?.xpReward ?? 20);
    Future.delayed(const Duration(milliseconds: 600), () {
      if (mounted) Navigator.of(context).pop();
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final height = MediaQuery.of(context).size.height * 0.92;

    return Container(
      height: height,
      decoration: const BoxDecoration(
        color: Color(0xFF0B1120),
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        border: Border(
          top: BorderSide(color: Color(0xFF1E293B), width: 1.5),
        ),
      ),
      child: Column(
        children: [
          // Drag Handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 10, bottom: 4),
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Top Header Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                  ),
                  child: Text(
                    'DAY ${widget.dayNumber}',
                    style: const TextStyle(
                      color: Color(0xFF10B981),
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.topicTitle,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        '${widget.subject} • ${widget.courseTitle}',
                        style: const TextStyle(
                          color: Colors.white54,
                          fontSize: 11,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.amber.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.amber.withValues(alpha: 0.3)),
                  ),
                  child: const Row(
                    children: [
                      Icon(LucideIcons.award, size: 13, color: Colors.amber),
                      SizedBox(width: 4),
                      Text(
                        '+20 XP',
                        style: TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 4),
                IconButton(
                  icon: const Icon(LucideIcons.x, color: Colors.white70, size: 20),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
          ),

          // Video Simulation / Player Container
          Container(
            height: 180,
            width: double.infinity,
            margin: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: Stack(
              children: [
                Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withValues(alpha: 0.2),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(LucideIcons.play, color: Color(0xFF10B981), size: 28),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _content?.videoTitle ?? widget.topicTitle,
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                        textAlign: TextAlign.center,
                        maxLines: 1,
                      ),
                      const Text(
                        'HD Masterclass • TeachO AI Player',
                        style: TextStyle(color: Colors.white54, fontSize: 10),
                      ),
                    ],
                  ),
                ),
                // Play / Pause / Replay Controls Overlay
                Positioned(
                  bottom: 8,
                  left: 12,
                  right: 12,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          GestureDetector(
                            onTap: () => setState(() => _isPlaying = !_isPlaying),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFF10B981),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                children: [
                                  Icon(_isPlaying ? LucideIcons.pause : LucideIcons.play, size: 12, color: Colors.black),
                                  const SizedBox(width: 4),
                                  Text(
                                    _isPlaying ? 'Pause' : 'Play',
                                    style: const TextStyle(color: Colors.black, fontSize: 10, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          GestureDetector(
                            onTap: () => setState(() => _isPlaying = true),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1E293B),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Row(
                                children: [
                                  Icon(LucideIcons.rotateCcw, size: 12, color: Colors.white70),
                                  SizedBox(width: 4),
                                  Text(
                                    'Replay',
                                    style: TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                      const Text(
                        '0ms Stream',
                        style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 10),

          // 4 Module Tabs Bar
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: Color(0xFF1E293B))),
            ),
            child: TabBar(
              controller: _tabController,
              isScrollable: true,
              tabAlignment: TabAlignment.start,
              indicatorColor: const Color(0xFF10B981),
              indicatorWeight: 2.5,
              labelColor: const Color(0xFF10B981),
              unselectedLabelColor: Colors.white54,
              labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
              tabs: const [
                Tab(icon: Icon(LucideIcons.bookOpen, size: 14), text: 'Study Notes'),
                Tab(icon: Icon(LucideIcons.sparkles, size: 14), text: 'Flashcards'),
                Tab(icon: Icon(LucideIcons.helpCircle, size: 14), text: 'Practice Quiz'),
                Tab(icon: Icon(LucideIcons.moon, size: 14), text: 'Bedtime Recap'),
              ],
            ),
          ),

          // Tab Views
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: Color(0xFF10B981)),
                  )
                : TabBarView(
                    controller: _tabController,
                    children: [
                      // TAB 1: STUDY NOTES
                      _buildStudyNotesTab(),

                      // TAB 2: FLASHCARDS
                      _buildFlashcardsTab(),

                      // TAB 3: PRACTICE QUIZ (DPQ)
                      _buildQuizTab(),

                      // TAB 4: BEDTIME RECAP
                      _buildBedtimeRecapTab(),
                    ],
                  ),
          ),

          // Complete & Claim XP Footer
          Container(
            padding: const EdgeInsets.all(14),
            decoration: const BoxDecoration(
              color: Color(0xFF0F172A),
              border: Border(top: BorderSide(color: Color(0xFF1E293B))),
            ),
            child: SafeArea(
              top: false,
              child: Row(
                children: [
                  const Icon(LucideIcons.checkCircle2, color: Color(0xFF10B981), size: 18),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      'Day Study Lesson Ready',
                      style: TextStyle(color: Colors.white70, fontSize: 12),
                    ),
                  ),
                  ElevatedButton.icon(
                    onPressed: _isCompleted ? null : _handleClaimCompletion,
                    icon: const Icon(LucideIcons.award, size: 16),
                    label: Text(_isCompleted ? '✓ Completed' : 'Complete (+20 XP)'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      foregroundColor: const Color(0xFF022C22),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
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

  Widget _buildStudyNotesTab() {
    final notes = _content?.studyNotes ?? [];
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (_content?.overview != null && _content!.overview.isNotEmpty)
          Container(
            padding: const EdgeInsets.all(14),
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: const Color(0xFF111827),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'LESSON OVERVIEW',
                  style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                ),
                const SizedBox(height: 6),
                Text(
                  _content!.overview,
                  style: const TextStyle(color: Colors.white, fontSize: 12, height: 1.5),
                ),
              ],
            ),
          ),

        ...notes.map((sec) => Container(
              padding: const EdgeInsets.all(14),
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    sec.sectionTitle,
                    style: const TextStyle(color: Color(0xFF10B981), fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    sec.content,
                    style: const TextStyle(color: Colors.white70, fontSize: 12, height: 1.5),
                  ),
                ],
              ),
            )),
      ],
    );
  }

  Widget _buildFlashcardsTab() {
    final flashcards = _content?.flashcards ?? [];
    if (flashcards.isEmpty) {
      return const Center(child: Text('No flashcards for this topic.', style: TextStyle(color: Colors.white54)));
    }

    final card = flashcards[_currentFlashcardIndex];

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          GestureDetector(
            onTap: () => setState(() => _isCardFlipped = !_isCardFlipped),
            child: Container(
              width: double.infinity,
              height: 200,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF111827), Color(0xFF0F172A)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    _isCardFlipped ? 'ANSWER & REASON' : 'CONCEPT QUESTION (${_currentFlashcardIndex + 1}/${flashcards.length})',
                    style: const TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                  Expanded(
                    child: Center(
                      child: Text(
                        _isCardFlipped ? card.back : card.front,
                        style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
                  const Text('👆 Tap anywhere to flip card', style: TextStyle(color: Colors.white38, fontSize: 10)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ElevatedButton.icon(
                onPressed: _currentFlashcardIndex > 0
                    ? () => setState(() {
                          _currentFlashcardIndex--;
                          _isCardFlipped = false;
                        })
                    : null,
                icon: const Icon(LucideIcons.chevronLeft, size: 14),
                label: const Text('Prev'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E293B),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(width: 16),
              ElevatedButton.icon(
                onPressed: _currentFlashcardIndex < flashcards.length - 1
                    ? () => setState(() {
                          _currentFlashcardIndex++;
                          _isCardFlipped = false;
                        })
                    : null,
                icon: const Icon(LucideIcons.chevronRight, size: 14),
                label: const Text('Next'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  foregroundColor: const Color(0xFF022C22),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuizTab() {
    final questions = _content?.quizQuestions ?? [];
    if (questions.isEmpty) {
      return const Center(child: Text('Quiz questions compiling...', style: TextStyle(color: Colors.white54)));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: questions.length,
      itemBuilder: (ctx, qIdx) {
        final q = questions[qIdx];
        final selected = _selectedAnswers[qIdx];
        final isAnswered = selected != null;

        return Container(
          padding: const EdgeInsets.all(14),
          margin: const EdgeInsets.only(bottom: 14),
          decoration: BoxDecoration(
            color: const Color(0xFF111827),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF1E293B)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Q${qIdx + 1}: ${q.question}',
                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 10),
              ...List.generate(q.options.length, (optIdx) {
                final opt = q.options[optIdx];
                Color bgColor = const Color(0xFF080D1A);
                Color borderColor = const Color(0xFF1E293B);
                Color textColor = Colors.white70;

                if (isAnswered) {
                  if (optIdx == q.correctIndex) {
                    bgColor = const Color(0xFF10B981).withValues(alpha: 0.2);
                    borderColor = const Color(0xFF10B981);
                    textColor = const Color(0xFF10B981);
                  } else if (selected == optIdx) {
                    bgColor = Colors.red.withValues(alpha: 0.2);
                    borderColor = Colors.red;
                    textColor = Colors.redAccent;
                  }
                }

                return GestureDetector(
                  onTap: () => _handleSelectOption(qIdx, optIdx),
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    margin: const EdgeInsets.only(bottom: 6),
                    decoration: BoxDecoration(
                      color: bgColor,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: borderColor),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            opt,
                            style: TextStyle(color: textColor, fontSize: 12, fontWeight: isAnswered && optIdx == q.correctIndex ? FontWeight.bold : FontWeight.normal),
                          ),
                        ),
                        if (isAnswered && optIdx == q.correctIndex)
                          const Icon(LucideIcons.checkCircle2, color: Color(0xFF10B981), size: 16),
                      ],
                    ),
                  ),
                );
              }),
              if (isAnswered)
                Container(
                  margin: const EdgeInsets.only(top: 8),
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.black38,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '💡 Explanation: ${q.explanation}',
                    style: const TextStyle(color: Colors.white70, fontSize: 11),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildBedtimeRecapTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF1E1B4B), Color(0xFF0F172A)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.indigo.withValues(alpha: 0.4)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(LucideIcons.moon, color: Colors.indigoAccent, size: 20),
                  SizedBox(width: 8),
                  Text(
                    'BEDTIME & PARENT RECAP',
                    style: TextStyle(color: Colors.indigoAccent, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                'Day ${widget.dayNumber} Summary for ${widget.topicTitle}',
                style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                _content?.bedtimeRecap ?? 'Day ${widget.dayNumber} learning successfully completed with core conceptual breakdown, flashcard exercises, and practice questions.',
                style: const TextStyle(color: Colors.white70, fontSize: 12, height: 1.5),
              ),
              const Divider(color: Colors.white12, height: 24),
              const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Session Time: ~20 Mins', style: TextStyle(color: Colors.white54, fontSize: 11)),
                  Text('100% Curriculum Sync', style: TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold)),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}
