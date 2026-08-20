import 'package:supabase_flutter/supabase_flutter.dart';

const String _teachoSupabaseUrl = 'https://jjgdatjthyeesmgunnlp.supabase.co';
const String _teachoSupabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZ2RhdGp0aHllZXNtZ3VubmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzU5NTYsImV4cCI6MjEwMDIxMTk1Nn0.iuSdvxW9VEtn_1yVLmf9ZN24CeXFxmF3aeVHEn-Dgcs';

class StudyNoteSection {
  final String sectionTitle;
  final String content;

  const StudyNoteSection({required this.sectionTitle, required this.content});

  factory StudyNoteSection.fromMap(Map<String, dynamic> map) {
    return StudyNoteSection(
      sectionTitle: map['sectionTitle']?.toString() ?? map['heading']?.toString() ?? 'Core Concept',
      content: map['content']?.toString() ?? map['body']?.toString() ?? '',
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

  const QuizQuestionItem({
    required this.question,
    required this.options,
    required this.correctIndex,
    required this.explanation,
  });

  factory QuizQuestionItem.fromMap(Map<String, dynamic> map) {
    final rawOptions = map['options'] as List<dynamic>? ?? [];
    return QuizQuestionItem(
      question: map['question']?.toString() ?? 'Question',
      options: rawOptions.map((e) => e.toString()).toList(),
      correctIndex: map['correctIndex'] is int ? map['correctIndex'] as int : (map['correct'] is int ? map['correct'] as int : 0),
      explanation: map['explanation']?.toString() ?? 'Detailed solution step.',
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
  final List<StudyNoteSection> studyNotes;
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
    required this.studyNotes,
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
      studyNotes: notesList,
      flashcards: flashcardList,
      quizQuestions: mcqList,
      bedtimeRecap: map['bedtimeRecap']?.toString() ?? '1-minute parent recap and student key learning summary for today.',
      xpReward: map['xpReward'] is int ? map['xpReward'] as int : 20,
    );
  }
}

class TeachoSupabaseService {
  static SupabaseClient? _client;

  static SupabaseClient get client {
    _client ??= SupabaseClient(_teachoSupabaseUrl, _teachoSupabaseAnonKey);
    return _client!;
  }

  static Future<LessonContent?> fetchLessonContent({
    required String courseId,
    required int dayNumber,
    required String topicTitle,
    required String subject,
    required String courseTitle,
  }) async {
    final String topicKey = '${courseId}_day_$dayNumber';

    try {
      final res = await client
          .from('kindle_content_cache')
          .select('kindle_json')
          .eq('topic_key', topicKey)
          .maybeSingle();

      if (res != null && res['kindle_json'] is Map<String, dynamic>) {
        return LessonContent.fromMap(res['kindle_json'] as Map<String, dynamic>);
      }
    } catch (e) {
      // Fallback
    }

    // Fallback deterministic lesson
    return LessonContent(
      topicKey: topicKey,
      topicTitle: topicTitle,
      courseTitle: courseTitle,
      subject: subject,
      dayNumber: dayNumber,
      videoId: '0TgLtF3PMOc',
      videoTitle: topicTitle,
      overview: 'Comprehensive Day $dayNumber lesson covering $topicTitle ($subject). Follow the step-by-step notes, interactive flashcards, and concept MCQs below.',
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
