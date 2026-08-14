import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class TestoScreen extends StatefulWidget {
  const TestoScreen({super.key});

  @override
  State<TestoScreen> createState() => _TestoScreenState();
}

class _TestoScreenState extends State<TestoScreen> {
  List<Map<String, dynamic>> sections = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchTests();
  }

  Future<void> _fetchTests() async {
    try {
      final response = await Supabase.instance.client
          .from('unified_master_data')
          .select('*')
          .eq('item_type', 'o_test')
          .limit(500);

      Map<String, List<dynamic>> groups = {};

      for (var item in (response as List<dynamic>)) {
        dynamic ai = item['additional_info'];
        if (ai is String) {
          try {
            ai = jsonDecode(ai);
          } catch (_) {}
        }

        if (ai != null && ai['questions'] != null && (ai['questions'] as List).isNotEmpty) {
          String title = item['title_name'] ?? '';
          String courseName = 'General Tests';
          String testName = title;

          if (title.contains(':')) {
            var parts = title.split(':');
            courseName = parts[0].trim();
            testName = parts.sublist(1).join(':').trim();
          }

          item['displayTitle'] = testName;
          item['questionsList'] = ai['questions'];
          item['questionCount'] = (ai['questions'] as List).length;

          if (!groups.containsKey(courseName)) {
            groups[courseName] = [];
          }
          groups[courseName]!.add(item);
        }
      }

      // Add fallback sample tests if DB empty
      if (groups.isEmpty) {
        groups['TNPSC General Studies'] = [
          {
            'displayTitle': 'Tamil Nadu History & Culture Mock Test 1',
            'questionCount': 5,
            'questionsList': [
              {
                'question': 'Which Chola king built the Brihadeeswarar Temple in Thanjavur?',
                'options': ['Rajaraja Chola I', 'Rajendra Chola I', 'Karikala Chola', 'Kulothunga Chola'],
                'correctAnswer': 0,
                'explanation': 'Rajaraja Chola I built the famous Brihadeeswarar Temple (Big Temple) in Thanjavur around 1010 CE.'
              },
              {
                'question': 'What is the state animal of Tamil Nadu?',
                'options': ['Spotted Deer', 'Nilgiri Tahr', 'Bengal Tiger', 'Indian Elephant'],
                'correctAnswer': 1,
                'explanation': 'The Nilgiri Tahr is the state animal of Tamil Nadu, endemic to the Western Ghats.'
              },
              {
                'question': 'Which river is known as the "Dakshin Ganga" or lifeline of Tamil Nadu?',
                'options': ['Vaigai', 'Palar', 'Cauvery', 'Thamirabarani'],
                'correctAnswer': 2,
                'explanation': 'The Cauvery river is the principal river of Tamil Nadu.'
              },
              {
                'question': 'Who composed the Tamil national anthem "Thamizh Thaai Vaazhthu"?',
                'options': ['Subramania Bharati', 'Manonmaniam Sundaram Pillai', 'Bharathidasan', 'Kavimani Desigavinayagam'],
                'correctAnswer': 1,
                'explanation': 'Manonmaniam Sundaram Pillai composed Thamizh Thaai Vaazhthu.'
              },
              {
                'question': 'Which port city was the ancient capital of the Early Pandyas?',
                'options': ['Korkai', 'Poompuhar', 'Muziris', 'Kaveripoompattinam'],
                'correctAnswer': 0,
                'explanation': 'Korkai was the primary ancient seaport of the Early Pandyan Kingdom.'
              }
            ]
          }
        ];
      }

      setState(() {
        sections = groups.entries.map((e) => {'title': e.key, 'data': e.value}).toList();
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
    }
  }

  void _openExamEngine(dynamic test) {
    final questions = test['questionsList'] as List<dynamic>? ?? [];
    if (questions.isEmpty) return;

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ExamEngineScreen(
          testTitle: test['displayTitle'] ?? 'Mock Test',
          questions: questions,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      appBar: AppBar(
        title: const Text('TestO Examination Hub', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0A0F1E),
        elevation: 0,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF8B5CF6)))
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: sections.length,
              separatorBuilder: (_, __) => const SizedBox(height: 20),
              itemBuilder: (context, sIdx) {
                final section = sections[sIdx];
                final tests = section['data'] as List<dynamic>;

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      section['title'],
                      style: const TextStyle(color: Color(0xFF8B5CF6), fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    ...tests.map((t) => Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: const Color(0xFF111827),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFF1E293B)),
                          ),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: const BoxDecoration(
                                  color: Color(0x268B5CF6),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(LucideIcons.fileCheck2, color: Color(0xFF8B5CF6), size: 24),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      t['displayTitle'],
                                      style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      '${t['questionCount']} Questions • 15 Mins',
                                      style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                                    ),
                                  ],
                                ),
                              ),
                              ElevatedButton(
                                onPressed: () => _openExamEngine(t),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF8B5CF6),
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                                child: const Text('Start'),
                              ),
                            ],
                          ),
                        )),
                  ],
                );
              },
            ),
    );
  }
}

// ─── INTERACTIVE EXAM ENGINE SCREEN ───
class ExamEngineScreen extends StatefulWidget {
  final String testTitle;
  final List<dynamic> questions;

  const ExamEngineScreen({super.key, required this.testTitle, required this.questions});

  @override
  State<ExamEngineScreen> createState() => _ExamEngineScreenState();
}

class _ExamEngineScreenState extends State<ExamEngineScreen> {
  int _currentIndex = 0;
  final Map<int, int> _userAnswers = {};
  int _secondsRemaining = 15 * 60;
  Timer? _timer;
  bool _isSubmitted = false;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_secondsRemaining <= 1) {
        t.cancel();
        _submitExam();
      } else {
        setState(() => _secondsRemaining--);
      }
    });
  }

  void _submitExam() {
    _timer?.cancel();
    setState(() => _isSubmitted = true);
  }

  int get _score {
    int total = 0;
    for (int i = 0; i < widget.questions.length; i++) {
      final q = widget.questions[i];
      final correct = q['correctAnswer'] ?? q['answer'] ?? 0;
      if (_userAnswers[i] == correct) {
        total++;
      }
    }
    return total;
  }

  @override
  Widget build(BuildContext context) {
    if (_isSubmitted) {
      return _buildScoreReportView();
    }

    final q = widget.questions[_currentIndex];
    final qText = q['question'] ?? 'Question Text';
    final options = (q['options'] as List<dynamic>? ?? ['Option A', 'Option B', 'Option C', 'Option D']).map((e) => e.toString()).toList();
    final selectedOption = _userAnswers[_currentIndex];

    final mins = _secondsRemaining ~/ 60;
    final secs = _secondsRemaining % 60;

    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0F1E),
        title: Text(widget.testTitle, style: const TextStyle(fontSize: 16)),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(10)),
            child: Row(
              children: [
                const Icon(LucideIcons.timer, color: Color(0xFF8B5CF6), size: 16),
                const SizedBox(width: 6),
                Text(
                  '${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          )
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Question Tracker Header
            Text(
              'Question ${_currentIndex + 1} of ${widget.questions.length}',
              style: const TextStyle(color: Color(0xFF8B5CF6), fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Text(
              qText,
              style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600, height: 1.4),
            ),
            const SizedBox(height: 24),

            // Options List
            Expanded(
              child: ListView.separated(
                itemCount: options.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, oIdx) {
                  final isSelected = selectedOption == oIdx;
                  return GestureDetector(
                    onTap: () => setState(() => _userAnswers[_currentIndex] = oIdx),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0x268B5CF6) : const Color(0xFF111827),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isSelected ? const Color(0xFF8B5CF6) : const Color(0xFF1E293B),
                          width: isSelected ? 2 : 1,
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              color: isSelected ? const Color(0xFF8B5CF6) : const Color(0xFF1E293B),
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: Text(
                                String.fromCharCode(65 + oIdx),
                                style: TextStyle(color: isSelected ? Colors.white : const Color(0xFF94A3B8), fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Text(
                              options[oIdx],
                              style: TextStyle(color: isSelected ? Colors.white : const Color(0xFFCBD5E1), fontSize: 15),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),

            // Footer Stepper Controls
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                if (_currentIndex > 0)
                  OutlinedButton(
                    onPressed: () => setState(() => _currentIndex--),
                    style: OutlinedButton.styleFrom(side: const BorderSide(color: Color(0xFF1E293B))),
                    child: const Text('Previous', style: TextStyle(color: Colors.white)),
                  )
                else
                  const SizedBox.shrink(),
                if (_currentIndex < widget.questions.length - 1)
                  ElevatedButton(
                    onPressed: () => setState(() => _currentIndex++),
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF8B5CF6)),
                    child: const Text('Next Question', style: TextStyle(color: Colors.white)),
                  )
                else
                  ElevatedButton(
                    onPressed: _submitExam,
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
                    child: const Text('Submit Test', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScoreReportView() {
    final score = _score;
    final total = widget.questions.length;
    final pct = ((score / total) * 100).round();

    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      appBar: AppBar(
        title: const Text('Test Results'),
        backgroundColor: const Color(0xFF0A0F1E),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: pct >= 50 ? const Color(0xFF10B981) : Colors.redAccent),
              ),
              child: Column(
                children: [
                  Icon(
                    pct >= 50 ? LucideIcons.award : LucideIcons.alertTriangle,
                    size: 64,
                    color: pct >= 50 ? const Color(0xFF10B981) : Colors.redAccent,
                  ),
                  const SizedBox(height: 16),
                  Text('$score / $total', style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w900)),
                  Text('Score: $pct%', style: TextStyle(color: pct >= 50 ? const Color(0xFF10B981) : Colors.redAccent, fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text(
                    pct >= 50 ? 'Great job! You passed the assessment.' : 'Keep practicing to improve your score.',
                    style: const TextStyle(color: Color(0xFF94A3B8)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF8B5CF6),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text('Back to Tests Hub', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
