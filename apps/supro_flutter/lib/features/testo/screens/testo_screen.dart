import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:lucide_icons_flutter/lucide_icons.dart';

const String _eduSupabaseUrl = 'https://jjgdatjthyeesmgunnlp.supabase.co';
const String _eduAnonKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZ2RhdGp0aHllZXNtZ3VubmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzU5NTYsImV4cCI6MjEwMDIxMTk1Nn0.iuSdvxW9VEtn_1yVLmf9ZN24CeXFxmF3aeVHEn-Dgcs';

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
      final testsUri = Uri.parse('$_eduSupabaseUrl/rest/v1/unified_master_data?item_type=eq.o_test&limit=500');
      final res = await http.get(testsUri, headers: {
        'apikey': _eduAnonKey,
        'Authorization': 'Bearer $_eduAnonKey',
      });

      Map<String, List<dynamic>> groups = {};

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as List<dynamic>;
        for (var item in data) {
          dynamic ai = item['additional_info'] ?? item['metadata'];
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
      }

      // Fallback high-yield mock tests if DB is empty
      if (groups.isEmpty) {
        groups['TNPSC General Studies'] = [
          {
            'displayTitle': 'Tamil Nadu History & Culture Mock Test 1',
            'questionCount': 5,
            'questionsList': [
              {
                'question': 'Which Chola king built the Brihadeeswarar Temple in Thanjavur?',
                'options': ['Rajaraja Chola I', 'Rajendra Chola I', 'Karikala Chola', 'Kulothunga Chola'],
                'correctAnswer': 'Rajaraja Chola I',
                'explanation': 'Rajaraja Chola I built the famous Brihadeeswarar Temple (Big Temple) in Thanjavur around 1010 CE.'
              },
              {
                'question': 'What is the state animal of Tamil Nadu?',
                'options': ['Spotted Deer', 'Nilgiri Tahr', 'Bengal Tiger', 'Indian Elephant'],
                'correctAnswer': 'Nilgiri Tahr',
                'explanation': 'The Nilgiri Tahr is the state animal of Tamil Nadu, endemic to the Western Ghats.'
              },
              {
                'question': 'Which river is known as the "Dakshin Ganga" or lifeline of Tamil Nadu?',
                'options': ['Vaigai', 'Palar', 'Cauvery', 'Thamirabarani'],
                'correctAnswer': 'Cauvery',
                'explanation': 'The Cauvery river is the principal river of Tamil Nadu.'
              },
              {
                'question': 'Who composed the Tamil national anthem "Thamizh Thaai Vaazhthu"?',
                'options': ['Subramania Bharati', 'Manonmaniam Sundaram Pillai', 'Bharathidasan', 'Kavimani Desigavinayagam'],
                'correctAnswer': 'Manonmaniam Sundaram Pillai',
                'explanation': 'Manonmaniam Sundaram Pillai composed Thamizh Thaai Vaazhthu.'
              },
              {
                'question': 'Which port city was the ancient capital of the Early Pandyas?',
                'options': ['Korkai', 'Poompuhar', 'Muziris', 'Kaveripoompattinam'],
                'correctAnswer': 'Korkai',
                'explanation': 'Korkai was the primary ancient seaport of the Early Pandyan Kingdom.'
              }
            ]
          }
        ];
      }

      if (mounted) {
        setState(() {
          sections = groups.entries.map((e) => {'title': e.key, 'data': e.value}).toList();
          isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => isLoading = false);
    }
  }

  String _searchQuery = '';

  List<Map<String, dynamic>> get _filteredSections {
    if (_searchQuery.trim().isEmpty) return sections;
    final q = _searchQuery.toLowerCase();

    return sections
        .map((sec) {
          final tests = (sec['data'] as List<dynamic>).where((t) {
            final title = (t['displayTitle'] ?? t['title_name'] ?? '').toString().toLowerCase();
            final sTitle = (sec['title'] ?? '').toString().toLowerCase();
            return title.contains(q) || sTitle.contains(q);
          }).toList();

          return {'title': sec['title'], 'data': tests};
        })
        .where((sec) => (sec['data'] as List).isNotEmpty)
        .toList();
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
    final displaySections = _filteredSections;

    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      appBar: AppBar(
        title: const Text('TestO Examination Hub', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF111827),
        elevation: 0,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF10B981)))
          : Column(
              children: [
                // Search Input
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF111827),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF1E293B)),
                    ),
                    child: Row(
                      children: [
                        const Icon(LucideIcons.search, color: Color(0xFF94A3B8), size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            style: const TextStyle(color: Colors.white, fontSize: 14),
                            decoration: const InputDecoration(
                              hintText: 'Search mock tests, TNPSC, Banking...',
                              hintStyle: TextStyle(color: Color(0xFF64748B), fontSize: 13),
                              border: InputBorder.none,
                            ),
                            onChanged: (v) => setState(() => _searchQuery = v),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Tests List
                Expanded(
                  child: displaySections.isEmpty
                      ? const Center(
                          child: Text('No mock tests match your search.', style: TextStyle(color: Color(0xFF64748B))),
                        )
                      : ListView.separated(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          itemCount: displaySections.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 20),
                          itemBuilder: (context, sIdx) {
                            final section = displaySections[sIdx];
                            final tests = section['data'] as List<dynamic>;

                            return Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  section['title'],
                                  style: const TextStyle(color: Color(0xFF10B981), fontSize: 18, fontWeight: FontWeight.bold),
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
                                  color: Color(0x2610B981),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(LucideIcons.fileCheck2, color: Color(0xFF10B981), size: 24),
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
                                  backgroundColor: const Color(0xFF10B981),
                                  foregroundColor: const Color(0xFF0A0F1E),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                                child: const Text('Start', style: TextStyle(fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                        )),
                  ],
                );
              },
            ),
          ),
        ],
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
  final Map<int, String> _userAnswers = {};
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
      final correct = (q['correct_answer'] ?? q['correctAnswer'] ?? q['answer'] ?? '').toString();
      if (_userAnswers[i] != null && _userAnswers[i] == correct) {
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
    final qText = q['question'] ?? q['q'] ?? 'Question Text';
    final options = (q['options'] as List<dynamic>? ?? ['Option A', 'Option B', 'Option C', 'Option D']).map((e) => e.toString()).toList();
    final selectedOption = _userAnswers[_currentIndex];

    final mins = _secondsRemaining ~/ 60;
    final secs = _secondsRemaining % 60;

    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF111827),
        title: Text(widget.testTitle, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(10)),
            child: Row(
              children: [
                const Icon(LucideIcons.timer, color: Color(0xFF10B981), size: 16),
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
            Text(
              'Question ${_currentIndex + 1} of ${widget.questions.length}',
              style: const TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold),
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
                  final opt = options[oIdx];
                  final isSelected = selectedOption == opt;
                  return GestureDetector(
                    onTap: () => setState(() => _userAnswers[_currentIndex] = opt),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0x2610B981) : const Color(0xFF111827),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isSelected ? const Color(0xFF10B981) : const Color(0xFF1E293B),
                          width: isSelected ? 2 : 1,
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              color: isSelected ? const Color(0xFF10B981) : const Color(0xFF1E293B),
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: Text(
                                String.fromCharCode(65 + oIdx),
                                style: TextStyle(color: isSelected ? const Color(0xFF0A0F1E) : const Color(0xFF94A3B8), fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Text(
                              opt,
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
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981), foregroundColor: const Color(0xFF0A0F1E)),
                    child: const Text('Next Question', style: TextStyle(fontWeight: FontWeight.bold)),
                  )
                else
                  ElevatedButton(
                    onPressed: _submitExam,
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFF59E0B), foregroundColor: const Color(0xFF0A0F1E)),
                    child: const Text('Submit Test', style: TextStyle(fontWeight: FontWeight.bold)),
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
    final pct = total > 0 ? ((score / total) * 100).round() : 0;
    final isPassed = pct >= 40;
    final certId = 'EDU-VRF-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';

    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      appBar: AppBar(
        title: const Text('Performance Report', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF111827),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Scorecard
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: isPassed ? const Color(0xFF10B981) : Colors.redAccent),
              ),
              child: Column(
                children: [
                  Icon(
                    isPassed ? LucideIcons.award : LucideIcons.alertTriangle,
                    size: 54,
                    color: isPassed ? const Color(0xFF10B981) : Colors.redAccent,
                  ),
                  const SizedBox(height: 12),
                  Text('$score / $total', style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w900)),
                  Text('Accuracy: $pct%', style: TextStyle(color: isPassed ? const Color(0xFF10B981) : Colors.redAccent, fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  Text(
                    isPassed ? 'GRADE A • QUALIFIED' : 'GRADE F • NEEDS IMPROVEMENT',
                    style: TextStyle(color: isPassed ? const Color(0xFF10B981) : Colors.redAccent, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Verifiable Digital Certificate Box
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0x80F59E0B)),
              ),
              child: Column(
                children: [
                  const Text('🏆 EDUPERSE AI VERIFIED CERTIFICATE', style: TextStyle(color: Color(0xFFF59E0B), fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                  const SizedBox(height: 4),
                  Text(widget.testTitle, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text('Certificate ID: $certId', style: const TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Question Solutions Review Header
            const Align(
              alignment: Alignment.centerLeft,
              child: Text('Detailed Question Solutions', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 10),

            // Solutions List
            ...List.generate(widget.questions.length, (idx) {
              final q = widget.questions[idx];
              final uAns = _userAnswers[idx] ?? 'Not Answered';
              final cAns = (q['correct_answer'] ?? q['correctAnswer'] ?? q['answer'] ?? '').toString();
              final isCorrect = uAns == cAns;

              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF111827),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF1E293B)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Q${idx + 1}', style: const TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                        Text(isCorrect ? 'Correct (+1)' : 'Incorrect', style: TextStyle(color: isCorrect ? const Color(0xFF10B981) : Colors.redAccent, fontSize: 12, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(q['question'] ?? q['q'] ?? '', style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    Text('Your Answer: $uAns', style: TextStyle(color: isCorrect ? const Color(0xFF10B981) : Colors.redAccent, fontSize: 12)),
                    Text('Correct Answer: $cAns', style: const TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.bold)),
                    if (q['explanation'] != null) ...[
                      const SizedBox(height: 6),
                      Text('💡 ${q['explanation']}', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                    ],
                  ],
                ),
              );
            }),

            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  foregroundColor: const Color(0xFF0A0F1E),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: const Text('Back to TestO Hub', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

