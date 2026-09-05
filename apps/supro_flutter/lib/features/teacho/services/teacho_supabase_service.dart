import 'dart:convert';
import 'package:http/http.dart' as http;

class StudyNoteSection {
  final String sectionTitle;
  final String content;
  final String? example;

  const StudyNoteSection({
    required this.sectionTitle,
    required this.content,
    this.example,
  });

  factory StudyNoteSection.fromMap(Map<String, dynamic> map) {
    return StudyNoteSection(
      sectionTitle: map['sectionTitle']?.toString() ?? map['heading']?.toString() ?? 'Core Concept',
      content: map['content']?.toString() ?? map['body']?.toString() ?? '',
      example: map['example']?.toString() ?? map['formulaOrExample']?.toString(),
    );
  }
}

class TamilExplanation {
  final String simpleTitle;
  final String colloquialIntro;
  final String everydayAnalogy;
  final List<String> keyPoints;

  const TamilExplanation({
    required this.simpleTitle,
    required this.colloquialIntro,
    required this.everydayAnalogy,
    required this.keyPoints,
  });

  factory TamilExplanation.fromMap(Map<String, dynamic> map) {
    final kpList = <String>[];
    if (map['keyPointsTamil'] is List) {
      for (final k in (map['keyPointsTamil'] as List)) {
        kpList.add(k.toString());
      }
    }
    return TamilExplanation(
      simpleTitle: map['simpleTitle']?.toString() ?? 'பாடத்தின் தமிழ் விளக்கம்',
      colloquialIntro: map['colloquialIntro']?.toString() ?? 'பாடத்தின் அடிப்படைக் கருத்துக்களை எளிமையாகப் புரிந்து கொள்ளவும்.',
      everydayAnalogy: map['everydayAnalogy']?.toString() ?? 'நடைமுறை வாழ்க்கையோடு ஒப்பிட்டுப் படிக்கும் போது நினைவில் எளிதாக நிற்கும்!',
      keyPoints: kpList,
    );
  }
}

class FormulaItem {
  final String name;
  final String formula;
  final String tip;

  const FormulaItem({
    required this.name,
    required this.formula,
    this.tip = '',
  });

  factory FormulaItem.fromMap(Map<String, dynamic> map) {
    return FormulaItem(
      name: map['name']?.toString() ?? 'Core Rule',
      formula: map['formula']?.toString() ?? '',
      tip: map['tip']?.toString() ?? map['mnemonic']?.toString() ?? '',
    );
  }
}

class SolvedProblemItem {
  final String question;
  final int marks;
  final List<String> solutionSteps;
  final String? keyTip;

  const SolvedProblemItem({
    required this.question,
    required this.marks,
    required this.solutionSteps,
    this.keyTip,
  });

  factory SolvedProblemItem.fromMap(Map<String, dynamic> map) {
    final steps = <String>[];
    if (map['solutionSteps'] is List) {
      for (final s in (map['solutionSteps'] as List)) {
        steps.add(s.toString());
      }
    } else if (map['keyPointsToInclude'] is List) {
      for (final s in (map['keyPointsToInclude'] as List)) {
        steps.add(s.toString());
      }
    } else if (map['modelAnswer'] != null) {
      steps.add(map['modelAnswer'].toString());
    }

    return SolvedProblemItem(
      question: map['question']?.toString() ?? 'Solved Problem',
      marks: map['marks'] is int ? map['marks'] as int : 2,
      solutionSteps: steps,
      keyTip: map['keyTips']?.toString() ?? map['diagramOrFormulaNote']?.toString(),
    );
  }
}

class FlashcardItem {
  final String front;
  final String back;

  const FlashcardItem({required this.front, required this.back});

  factory FlashcardItem.fromMap(Map<String, dynamic> map) {
    return FlashcardItem(
      front: map['front']?.toString() ?? map['question']?.toString() ?? '',
      back: map['back']?.toString() ?? map['answer']?.toString() ?? '',
    );
  }
}

class QuizQuestionItem {
  final String question;
  final List<String> options;
  final int correctIndex;
  final String explanation;
  final String difficulty;

  const QuizQuestionItem({
    required this.question,
    required this.options,
    required this.correctIndex,
    required this.explanation,
    this.difficulty = 'Medium',
  });

  factory QuizQuestionItem.fromMap(Map<String, dynamic> map) {
    final rawOptions = map['options'] as List<dynamic>? ?? [];
    return QuizQuestionItem(
      question: map['question']?.toString() ?? 'Question',
      options: rawOptions.map((e) => e.toString()).toList(),
      correctIndex: map['correctIndex'] is int ? map['correctIndex'] as int : (map['correct'] is int ? map['correct'] as int : 0),
      explanation: map['explanation']?.toString() ?? 'Detailed solution step.',
      difficulty: map['difficulty']?.toString() ?? 'Medium',
    );
  }
}

class LessonContent {
  final String topicKey;
  final String topicTitle;
  final String courseTitle;
  final String subject;
  final int dayNumber;
  final String videoId;
  final String videoTitle;
  final String overview;
  final List<String> keyPoints;
  final List<StudyNoteSection> studyNotes;
  final TamilExplanation? tamilExplanation;
  final List<FormulaItem> formulas;
  final List<SolvedProblemItem> solvedProblems;
  final List<FlashcardItem> flashcards;
  final List<QuizQuestionItem> quizQuestions;
  final String bedtimeRecap;
  final int xpReward;

  const LessonContent({
    required this.topicKey,
    required this.topicTitle,
    required this.courseTitle,
    required this.subject,
    required this.dayNumber,
    required this.videoId,
    required this.videoTitle,
    required this.overview,
    required this.keyPoints,
    required this.studyNotes,
    this.tamilExplanation,
    required this.formulas,
    required this.solvedProblems,
    required this.flashcards,
    required this.quizQuestions,
    required this.bedtimeRecap,
    this.xpReward = 20,
  });

  factory LessonContent.fromMap(Map<String, dynamic> map, {String fallbackVideoId = '0TgLtF3PMOc'}) {
    final notesList = <StudyNoteSection>[];
    if (map['studyNotes'] is List) {
      for (final n in (map['studyNotes'] as List)) {
        if (n is Map<String, dynamic>) notesList.add(StudyNoteSection.fromMap(n));
      }
    } else if (map['notes'] is Map && (map['notes']['coreConcepts'] is List)) {
      for (final n in (map['notes']['coreConcepts'] as List)) {
        if (n is Map<String, dynamic>) notesList.add(StudyNoteSection.fromMap(n));
      }
    }

    final keyPointsList = <String>[];
    if (map['notes'] is Map && map['notes']['keyPoints'] is List) {
      for (final k in (map['notes']['keyPoints'] as List)) {
        keyPointsList.add(k.toString());
      }
    } else if (map['keyPoints'] is List) {
      for (final k in (map['keyPoints'] as List)) {
        keyPointsList.add(k.toString());
      }
    }

    TamilExplanation? tamilExp;
    if (map['tamilExplanation'] is Map) {
      tamilExp = TamilExplanation.fromMap(map['tamilExplanation'] as Map<String, dynamic>);
    } else if (map['notes'] is Map && map['notes']['bilingualExplanation'] is Map) {
      final bi = map['notes']['bilingualExplanation'] as Map<String, dynamic>;
      if (bi['tamil'] != null) {
        tamilExp = TamilExplanation(
          simpleTitle: 'பாடத்தின் தமிழ் விளக்கம்',
          colloquialIntro: bi['tamil'].toString(),
          everydayAnalogy: bi['tamil'].toString(),
          keyPoints: keyPointsList,
        );
      }
    }

    final formulaList = <FormulaItem>[];
    if (map['notes'] is Map && map['notes']['formulasAndShortcuts'] is List) {
      for (final f in (map['notes']['formulasAndShortcuts'] as List)) {
        if (f is Map<String, dynamic>) formulaList.add(FormulaItem.fromMap(f));
      }
    } else if (map['formulasAndMnemonics'] is List) {
      for (final f in (map['formulasAndMnemonics'] as List)) {
        if (f is Map<String, dynamic>) formulaList.add(FormulaItem.fromMap(f));
      }
    }

    final solvedList = <SolvedProblemItem>[];
    if (map['twoMarkQuestions'] is List) {
      for (final s in (map['twoMarkQuestions'] as List)) {
        if (s is Map<String, dynamic>) solvedList.add(SolvedProblemItem.fromMap(s));
      }
    }
    if (map['fiveMarkQuestions'] is List) {
      for (final s in (map['fiveMarkQuestions'] as List)) {
        if (s is Map<String, dynamic>) solvedList.add(SolvedProblemItem.fromMap(s));
      }
    }

    final flashcardList = <FlashcardItem>[];
    if (map['flashcards'] is List) {
      for (final f in (map['flashcards'] as List)) {
        if (f is Map<String, dynamic>) flashcardList.add(FlashcardItem.fromMap(f));
      }
    } else if (map['oneLineQnA'] is List) {
      for (final f in (map['oneLineQnA'] as List)) {
        if (f is Map<String, dynamic>) flashcardList.add(FlashcardItem.fromMap(f));
      }
    }

    final mcqList = <QuizQuestionItem>[];
    final rawQuiz = map['practiceQuiz'] ?? map['mcqs'];
    if (rawQuiz is List) {
      for (final q in (rawQuiz as List)) {
        if (q is Map<String, dynamic>) mcqList.add(QuizQuestionItem.fromMap(q));
      }
    }

    final videoMeta = map['videoMeta'] is Map ? map['videoMeta'] as Map<String, dynamic> : null;
    final vId = map['videoId']?.toString() ?? videoMeta?['youtubeVideoId']?.toString() ?? fallbackVideoId;
    final vTitle = map['videoTitle']?.toString() ?? videoMeta?['videoTitle']?.toString() ?? (map['topicTitle']?.toString() ?? 'Lesson Video');

    return LessonContent(
      topicKey: map['topicKey']?.toString() ?? '',
      topicTitle: map['topicTitle']?.toString() ?? 'Lesson Topic',
      courseTitle: map['courseTitle']?.toString() ?? '',
      subject: map['subject']?.toString() ?? 'Core Subject',
      dayNumber: map['dayNumber'] is int ? map['dayNumber'] as int : 1,
      videoId: vId,
      videoTitle: vTitle,
      overview: map['overview']?.toString() ?? (map['notes'] is Map ? map['notes']['overview']?.toString() ?? '' : ''),
      keyPoints: keyPointsList,
      studyNotes: notesList,
      tamilExplanation: tamilExp,
      formulas: formulaList,
      solvedProblems: solvedList,
      flashcards: flashcardList,
      quizQuestions: mcqList,
      bedtimeRecap: map['bedtimeRecap']?.toString() ?? '1-minute parent recap and student key learning summary for today.',
      xpReward: map['xpReward'] is int ? map['xpReward'] as int : 20,
    );
  }
}

class TeachoSupabaseService {
  static Future<LessonContent?> fetchLessonContent({
    required String courseId,
    required int dayNumber,
    required String topicTitle,
    required String subject,
    required String courseTitle,
    String? explicitTopicKey,
  }) async {

    // 2. Try Cloudflare R2 Primary DB Direct Fetch
    if (courseId.isNotEmpty) {
      final r2Urls = [
        'https://pub-672098863d97ed3208c7c47a8091e5dd.r2.dev/course_json/batch_curriculum/$courseId/${courseId}_day_${dayNumber}_task_1.json',
        'https://pub-672098863d97ed3208c7c47a8091e5dd.r2.dev/course_json/batch_curriculum/$courseId/${courseId}_day_$dayNumber.json',
      ];

      for (final url in r2Urls) {
        try {
          final response = await http.get(Uri.parse(url)).timeout(const Duration(seconds: 4));
          if (response.statusCode == 200) {
            final decoded = jsonDecode(utf8.decode(response.bodyBytes));
            if (decoded is Map<String, dynamic>) {
              return LessonContent.fromMap(decoded);
            }
          }
        } catch (e) {
          // Non-blocking fallback
        }
      }
    }

    // Fallback deterministic lesson
    return LessonContent(
      topicKey: '${courseId}_day_$dayNumber',
      topicTitle: topicTitle,
      courseTitle: courseTitle,
      subject: subject,
      dayNumber: dayNumber,
      videoId: '0TgLtF3PMOc',
      videoTitle: topicTitle,
      overview: 'Comprehensive Day $dayNumber lesson covering $topicTitle ($subject). Follow the step-by-step notes, interactive flashcards, and concept MCQs below.',
      keyPoints: [
        'Focus on core conceptual definitions and derivations.',
        'Review real-world applications and previous exam questions.',
      ],
      studyNotes: [
        StudyNoteSection(
          sectionTitle: '1. Core Concept & Detailed Breakdown',
          content: 'Detailed study notes for $topicTitle. Remember key formulas, foundational principles, and step-by-step illustrations.',
        ),
        StudyNoteSection(
          sectionTitle: '2. Real-World Applications',
          content: 'Practical application of $topicTitle in everyday scenarios and examinations.',
        ),
        StudyNoteSection(
          sectionTitle: '3. Common Exam Pitfalls',
          content: 'Avoid calculation errors, ensure correct units, and write clean steps.',
        ),
      ],
      tamilExplanation: TamilExplanation(
        simpleTitle: 'பாடத்தின் தமிழ் விளக்கம்',
        colloquialIntro: '$topicTitle பாடத்தின் முக்கியக் கருத்துக்களை எளிமையான தமிழில் புரிந்துகொள்ளவும்.',
        everydayAnalogy: 'நடைமுறை வாழ்க்கையோடு ஒப்பிட்டுப் படிக்கும் போது நினைவில் எளிதாக நிற்கும்!',
        keyPoints: ['மூலக் கருத்துக்களைத் தெளிவாகக் கற்றல்.', 'முக்கிய மாதிரி வினாக்களைப் பயிற்சி செய்தல்.'],
      ),
      formulas: [
        FormulaItem(name: 'Core Formula', formula: 'Standard Method -> Step Analysis -> Verification', tip: 'Check units carefully'),
      ],
      solvedProblems: [
        SolvedProblemItem(
          question: 'Explain the fundamental derivation of $topicTitle.',
          marks: 2,
          solutionSteps: ['Step 1: State the core definition.', 'Step 2: Apply the governing rule.', 'Step 3: Conclude with final units.'],
          keyTip: 'Include all intermediate working steps.',
        ),
      ],
      flashcards: [
        FlashcardItem(front: 'What is the core definition of $topicTitle?', back: 'Fundamental concept for Day $dayNumber in $courseTitle.'),
        FlashcardItem(front: 'What is the main exam shortcut or rule?', back: 'Apply the standard derivation method and verify answer.'),
      ],
      quizQuestions: [
        QuizQuestionItem(
          question: 'Which of the following best represents $topicTitle?',
          options: ['A) Core Principle 1', 'B) Principle 2', 'C) Option 3', 'D) All of the above'],
          correctIndex: 0,
          explanation: 'Option A is the primary textbook definition.',
        ),
        QuizQuestionItem(
          question: 'What is the key takeaway for Day $dayNumber?',
          options: ['A) Foundation Mastery', 'B) Speed Drill', 'C) Revision', 'D) Concept Practice'],
          correctIndex: 0,
          explanation: 'Day $dayNumber builds foundational concept mastery.',
        ),
      ],
      bedtimeRecap: 'Day $dayNumber completed: $topicTitle in $subject. Student practiced interactive flashcards and concept MCQs.',
    );
  }
}

