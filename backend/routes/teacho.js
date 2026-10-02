const express = require('express');
const router = express.Router();
const https = require('https');
const { pool } = require('../db');
const { generateUniqueTenClassesForDay } = require('../curriculum365');
const { sendWhatsAppMessage } = require('../services/whatsapp');

// In-memory Course Catalog Cache (60s TTL)
let cachedCourses = null;
let cachedCoursesTime = 0;

// 1. Tuto Courses Catalog
router.get('/courses', async (req, res) => {
  try {
    const now = Date.now();
    if (cachedCourses && (now - cachedCoursesTime < 60000)) {
      return res.json(cachedCourses);
    }
    const result = await pool.query(`SELECT * FROM tuto_courses ORDER BY title ASC`);
    cachedCourses = result.rows;
    cachedCoursesTime = now;
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Tuto Course Day Summaries
router.get('/courses/:courseId/days', async (req, res) => {
  const { courseId } = req.params;
  try {
    let sql = `
      SELECT day_number, week_number, day_of_week, title, subject, subject_code,
             chapter_title, topic_title, topic_tamil_title, estimated_minutes, xp_reward, task_count, admin_released
      FROM tuto_day_plans
      WHERE course_id = $1
      ORDER BY day_number ASC
    `;
    let result = await pool.query(sql, [courseId]);

    if (result.rows.length === 0) {
      if (courseId === 'school-std-10') {
        result = await pool.query(sql, ['tnsb-ta-10']);
      } else if (courseId === 'school-std-12') {
        result = await pool.query(sql, ['tnsb-ta-12-sci']);
      } else if (courseId === 'tnpsc-group4') {
        result = await pool.query(sql, ['exam-tnpsc-grp4']);
      } else if (courseId === 'entrance-neet') {
        result = await pool.query(sql, ['exam-neet-ug']);
      }
    }

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Tuto Single Day Plan
router.get('/courses/:courseId/days/:dayNumber', async (req, res) => {
  const { courseId, dayNumber } = req.params;
  try {
    let sql = `SELECT * FROM tuto_day_plans WHERE course_id = $1 AND day_number = $2 LIMIT 1`;
    let result = await pool.query(sql, [courseId, parseInt(dayNumber, 10)]);

    if (result.rows.length === 0) {
      const aliasMap = {
        'school-std-10': 'tnsb-ta-10',
        'school-std-12': 'tnsb-ta-12-sci',
        'tnpsc-group4': 'exam-tnpsc-grp4',
        'entrance-neet': 'exam-neet-ug'
      };
      if (aliasMap[courseId]) {
        result = await pool.query(sql, [aliasMap[courseId], parseInt(dayNumber, 10)]);
      }
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Day plan not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Tuto Micro-Topic Content
router.get('/content', async (req, res) => {
  const { topicKey, courseId, dayNumber, taskNumber } = req.query;
  try {
    let result;
    if (topicKey) {
      result = await pool.query(`SELECT * FROM tuto_micro_topic_contents WHERE topic_key = $1 LIMIT 1`, [topicKey]);
    } else if (courseId && dayNumber) {
      const dNum = parseInt(dayNumber, 10);
      const tNum = parseInt(taskNumber || '1', 10);

      const aliasMap = {
        'school-std-10': ['school-std-10', 'tnsb-ta-10', 'tnsb-en-10'],
        'school-std-12': ['school-std-12', 'tnsb-ta-12-sci', 'tnsb-en-12-sci'],
        'tnpsc-group4': ['tnpsc-group4', 'exam-tnpsc-grp4'],
        'entrance-neet': ['entrance-neet', 'exam-neet-ug'],
        'entrance-jee': ['entrance-jee', 'exam-jee-main'],
        'school-cbse-10': ['school-cbse-10', 'cbse-10']
      };
      const candidates = aliasMap[courseId] || [courseId];

      result = await pool.query(
        `SELECT * FROM tuto_micro_topic_contents 
         WHERE (course_id = ANY($1::varchar[]) OR course_id ILIKE $2) AND day_number = $3 AND task_number = $4 
         LIMIT 1`,
        [candidates, `%${courseId}%`, dNum, tNum]
      );
      if (result.rows.length === 0) {
        result = await pool.query(
          `SELECT * FROM tuto_micro_topic_contents 
           WHERE (course_id = ANY($1::varchar[]) OR course_id ILIKE $2) AND day_number = $3 
           LIMIT 1`,
          [candidates, `%${courseId}%`, dNum]
        );
      }

      if (result.rows.length === 0) {
        const dpRes = await pool.query(
          `SELECT * FROM tuto_day_plans WHERE (course_id = ANY($1::varchar[]) OR course_id ILIKE $2) AND day_number = $3 LIMIT 1`,
          [candidates, `%${courseId}%`, dNum]
        );
        if (dpRes.rows.length > 0) {
          const dp = dpRes.rows[0];
          return res.json({
            success: true,
            content: {
              topicTitle: dp.topic_tamil_title || dp.topic_title || dp.title,
              subject: dp.subject,
              overview: `Daily curriculum study guide for Day ${dp.day_number}: ${dp.chapter_title} - ${dp.topic_title}.`,
              learningObjectives: [
                `Master foundational principles of ${dp.topic_title}`,
                `Complete daily tasks and practice assessments`,
                `Consolidate key formulas and definitions`
              ],
              studyNotes: Array.isArray(dp.notes) && dp.notes.length > 0 ? dp.notes.map((n, i) => ({
                sectionTitle: n.title || `Core Section ${i+1}`,
                content: n.content || n.contentTamil || 'Refer to curriculum guidelines.'
              })) : [
                {
                  sectionTitle: '1. Chapter Overview & Foundations',
                  content: `${dp.chapter_title}: ${dp.topic_title}. Daily active study schedule with authentic curriculum notes.`
                }
              ],
              flashcards: [
                { front: `What is the core topic for Day ${dp.day_number}?`, back: `${dp.topic_title}` },
                { front: `Which subject is covered?`, back: `${dp.subject}` }
              ],
              practiceQuiz: Array.isArray(dp.mcqs) ? dp.mcqs.map((m) => ({
                question: m.question || m.questionTamil,
                options: [m.options?.A || 'A', m.options?.B || 'B', m.options?.C || 'C', m.options?.D || 'D'],
                correctIndex: m.correctOption === 'B' ? 1 : m.correctOption === 'C' ? 2 : m.correctOption === 'D' ? 3 : 0,
                explanation: m.explanation || m.explanationTamil || 'Curriculum solution verified.'
              })) : [],
              bedtimeRecap: `Today we studied Day ${dp.day_number}: ${dp.topic_title} in ${dp.subject}. Review key concepts to retain long term.`,
              dayNumber: dp.day_number,
              courseId: dp.course_id
            },
            _meta: { source: 'tuto_day_plans', dayNumber: dp.day_number }
          });
        }
      }
    }

    if (!result || result.rows.length === 0) {
      return res.status(404).json({ error: 'Micro-topic content not found' });
    }

    const row = result.rows[0];
    const payload = row.raw_content && Object.keys(row.raw_content).length > 0 ? row.raw_content : {
      topicTitle: row.topic_title,
      subject: row.subject,
      overview: row.overview,
      tamilExplanation: row.tamil_explanation,
      coreConcepts: row.core_concepts,
      notes: row.notes,
      formulasAndMnemonics: row.formulas_and_mnemonics,
      bookBackSolutions: row.book_back_solutions,
      solvedProblems: row.solved_problems,
      diagramsAndVisuals: row.diagrams_and_visuals,
      vsaqs: row.vsaqs,
      mcqs: row.mcqs,
      videoMeta: row.video_meta
    };

    res.json({
      success: true,
      content: payload,
      _meta: { source: 'oci-postgresql', topicKey: row.topic_key }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Question Bank Search
router.get(['/qbank/search', '/search'], async (req, res) => {
  const { query, subject, category, difficulty, format, offset = 0, limit = 50 } = req.query;
  try {
    const params = [];
    let whereClauses = [];

    const trimmed = (query || '').trim();
    const rangeMatch = trimmed.match(/^(\d+)\s*(?:to|-|\.\.)\s*(\d+)$/i);
    const singleNumMatch = trimmed.match(/^#?(\d+)$/);

    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      params.push(Math.min(start, end), Math.max(start, end));
      whereClauses.push(`sequence_number BETWEEN $${params.length - 1} AND $${params.length}`);
    } else if (singleNumMatch) {
      params.push(parseInt(singleNumMatch[1], 10));
      whereClauses.push(`sequence_number = $${params.length}`);
    } else if (trimmed.length > 0) {
      params.push(trimmed);
      whereClauses.push(
        `to_tsvector('simple', question_text || ' ' || COALESCE(question_text_ta, '') || ' ' || explanation) @@ plainto_tsquery('simple', $${params.length})`
      );
    }

    if (subject && subject !== 'ALL') {
      params.push(subject);
      whereClauses.push(`(subject_code = $${params.length} OR subject ILIKE '%' || $${params.length} || '%')`);
    }

    if (category && category !== 'ALL') {
      params.push(category);
      whereClauses.push(`exam_category ILIKE '%' || $${params.length} || '%'`);
    }

    if (difficulty && difficulty !== 'ALL') {
      params.push(difficulty);
      whereClauses.push(`difficulty ILIKE $${params.length}`);
    }

    if (format && format !== 'ALL') {
      params.push(format);
      whereClauses.push(`question_format = $${params.length}`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    params.push(Math.min(parseInt(limit, 10) || 50, 100));
    const limitParam = `$${params.length}`;
    params.push(Math.max(parseInt(offset, 10) || 0, 0));
    const offsetParam = `$${params.length}`;

    const sql = `
      SELECT id, question_uid, sequence_number, subject, subject_code, domain,
             topic, subtopic, microtopic, difficulty, exam_category, question_format,
             question_text, question_text_ta, options, options_ta, correct_option,
             explanation, explanation_ta, formula_or_law, blank_answer
      FROM edu_question_bank
      ${whereSql}
      ORDER BY sequence_number ASC
      LIMIT ${limitParam} OFFSET ${offsetParam}
    `;

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Question Bank Sequential Range
router.get('/qbank/range', async (req, res) => {
  const { start = 1, end = 50, subject, category } = req.query;
  try {
    const s = Math.max(1, parseInt(start, 10));
    const e = Math.max(s, parseInt(end, 10));
    const params = [s, e];
    let whereClauses = [`sequence_number BETWEEN $1 AND $2`];

    if (subject && subject !== 'ALL') {
      params.push(subject);
      whereClauses.push(`(subject_code = $${params.length} OR subject ILIKE '%' || $${params.length} || '%')`);
    }
    if (category && category !== 'ALL') {
      params.push(category);
      whereClauses.push(`exam_category ILIKE '%' || $${params.length} || '%'`);
    }

    const sql = `
      SELECT id, question_uid, sequence_number, subject, subject_code, domain,
             topic, subtopic, microtopic, difficulty, exam_category, question_format,
             question_text, question_text_ta, options, options_ta, correct_option,
             explanation, explanation_ta, formula_or_law, blank_answer
      FROM edu_question_bank
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY sequence_number ASC
      LIMIT 100
    `;

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Student Day Progress & XP
router.get('/progress/:courseId', async (req, res) => {
  const { courseId } = req.params;
  const { phone } = req.query;
  try {
    const params = [courseId];
    let sql = `SELECT day_number, score, status, completed_at FROM tuto_student_day_progress WHERE course_id = $1`;
    if (phone) {
      params.push(phone);
      sql += ` AND user_phone = $2`;
    }
    const result = await pool.query(sql, params);
    const completedDays = result.rows.map(r => r.day_number);
    res.json({
      courseId,
      completedDays,
      completedCount: completedDays.length,
      records: result.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/progress', async (req, res) => {
  const { user_phone, user_name, course_id, day_number, score, status = 'completed' } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO tuto_student_day_progress (user_phone, user_name, course_id, day_number, score, status, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [user_phone || 'anonymous', user_name || 'Student', course_id, parseInt(day_number, 10), parseInt(score || '100', 10), status]
    );
    res.json({ success: true, record: result.rows[0] || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/submissions', async (req, res) => {
  const { user_phone, user_name, course_id, day_number, feedback_text, video_drive_file_id, status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO tuto_student_day_progress (user_phone, user_name, course_id, day_number, video_file_id, review_feedback, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [user_phone, user_name, course_id, day_number, video_drive_file_id, feedback_text, status]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Generate Mock Test
router.get('/test/generate', async (req, res) => {
  const { category = 'ALL', subject = 'ALL', count = 20, difficulty = 'ALL', courseId } = req.query;
  try {
    let whereClauses = [];
    const params = [];
    let cat = category;
    if ((!cat || cat === 'ALL') && courseId) cat = courseId;

    if (cat && cat !== 'ALL') {
      const lower = cat.toLowerCase();
      if (lower.includes('tnpsc') || lower.includes('group')) {
        params.push('%TNPSC%');
        whereClauses.push(`exam_category ILIKE $${params.length}`);
      } else if (lower.includes('neet') || lower.includes('jee') || lower.includes('entrance')) {
        params.push('%NEET%');
        whereClauses.push(`exam_category ILIKE $${params.length}`);
      } else if (lower.includes('10') || lower.includes('tenth') || lower.includes('std-10')) {
        params.push('%10th%');
        whereClauses.push(`exam_category ILIKE $${params.length}`);
      } else if (lower.includes('12') || lower.includes('twelfth') || lower.includes('std-12')) {
        params.push('%12th%');
        whereClauses.push(`exam_category ILIKE $${params.length}`);
      } else if (lower.includes('lkg') || lower.includes('primary') || lower.includes('grade')) {
        params.push('%Grade%');
        whereClauses.push(`exam_category ILIKE $${params.length}`);
      } else {
        params.push(`%${cat}%`);
        whereClauses.push(`exam_category ILIKE $${params.length}`);
      }
    }

    if (subject && subject !== 'ALL') {
      params.push(subject);
      whereClauses.push(`(subject_code = $${params.length} OR subject ILIKE '%' || $${params.length} || '%')`);
    }

    if (difficulty && difficulty !== 'ALL') {
      params.push(difficulty);
      whereClauses.push(`difficulty ILIKE $${params.length}`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const targetCount = Math.min(Math.max(parseInt(count, 10) || 20, 5), 100);

    params.push(targetCount);
    const result = await pool.query(`
      SELECT id, question_uid, sequence_number, subject, subject_code, domain,
             topic, subtopic, microtopic, difficulty, exam_category, question_format,
             question_text, question_text_ta, options, options_ta, correct_option,
             explanation, explanation_ta, formula_or_law
      FROM edu_question_bank
      ${whereSql}
      ORDER BY RANDOM()
      LIMIT $${params.length}
    `, params);

    res.json({
      success: true,
      category: cat || 'ALL',
      subject,
      count: result.rows.length,
      questions: result.rows
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/test/submit', async (req, res) => {
  const {
    user_phone = 'anonymous', user_name = 'Student', test_title = 'Online Practice Test',
    category = 'General', subject = 'ALL', total_questions = 10, correct_count = 0,
    wrong_count = 0, skipped_count = 0, score = 0, accuracy_percentage = 0,
    time_spent_seconds = 0, answers_summary = {}
  } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO tuto_student_test_results (
        user_phone, user_name, test_title, category, subject,
        total_questions, correct_count, wrong_count, skipped_count,
        score, accuracy_percentage, time_spent_seconds, answers_summary, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      RETURNING *
    `, [
      user_phone, user_name, test_title, category, subject,
      parseInt(total_questions, 10), parseInt(correct_count, 10), parseInt(wrong_count, 10), parseInt(skipped_count, 10),
      parseFloat(score), parseFloat(accuracy_percentage), parseInt(time_spent_seconds, 10), JSON.stringify(answers_summary)
    ]);
    res.json({ success: true, result: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/test/history', async (req, res) => {
  const { phone } = req.query;
  try {
    const params = [];
    let sql = `SELECT * FROM tuto_student_test_results`;
    if (phone) {
      params.push(phone);
      sql += ` WHERE user_phone = $1`;
    }
    sql += ` ORDER BY created_at DESC LIMIT 20`;
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Daily Planner Cockpit
router.get('/planner/today', async (req, res) => {
  const { phone = 'anonymous', courseId = 'school-std-5', ambitionId = 'jr-ias', dayNumber = 1 } = req.query;
  const day = parseInt(dayNumber, 10) || 1;
  try {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10) || 'anonymous';
    
    let profile = { full_name: 'Student', current_streak: 1, total_xp: 0, academic_class: 'class_10', school_board: 'TNSB', futuristic_ambition: ambitionId };
    if (cleanPhone !== 'anonymous') {
      const pRes = await pool.query('SELECT * FROM tuto_student_profiles WHERE user_phone = $1', [cleanPhone]);
      if (pRes.rows.length > 0) profile = pRes.rows[0];
    }

    let progress = { completed_classes: [], yoga_completed: false, daily_test_completed: false, test_score: 0, daily_xp_earned: 0 };
    if (cleanPhone !== 'anonymous') {
      const progRes = await pool.query(
        'SELECT * FROM tuto_student_daily_progress WHERE user_phone = $1 AND course_id = $2 AND day_number = $3',
        [cleanPhone, courseId, day]
      );
      if (progRes.rows.length > 0) progress = progRes.rows[0];
    }

    let classes = null;
    let yoga = null;
    let dailyTest = null;
    let isCustomAdminPlan = false;
    let topicTitle = '';

    try {
      const customPlanRes = await pool.query(
        'SELECT * FROM tuto_course_day_plans WHERE course_id = $1 AND day_number = $2',
        [courseId, day]
      );
      if (customPlanRes.rows.length > 0 && Array.isArray(customPlanRes.rows[0].classes) && customPlanRes.rows[0].classes.length > 0) {
        const row = customPlanRes.rows[0];
        classes = row.classes;
        yoga = row.yoga_task || null;
        dailyTest = row.daily_test || null;
        topicTitle = row.topic_title || '';
        isCustomAdminPlan = true;
      }
    } catch (dbErr) {}

    if (!classes || classes.length === 0) {
      const generated = generateUniqueTenClassesForDay(courseId, ambitionId, day);
      classes = generated.classes;
      yoga = generated.yoga;
      dailyTest = generated.dailyTest;
      topicTitle = generated.themeOfTheDay;
    }

    res.json({
      success: true,
      dayNumber: day,
      date: new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }),
      courseId,
      ambitionId,
      topicTitle,
      isCustomAdminPlan,
      profile,
      classes,
      yoga,
      dailyTest,
      progress: {
        completedClasses: progress.completed_classes || [],
        yogaCompleted: !!progress.yoga_completed,
        dailyTestCompleted: !!progress.daily_test_completed,
        testScore: progress.test_score || 0,
        dailyXpEarned: progress.daily_xp_earned || 0,
        currentStreak: profile.current_streak || 1,
        totalXp: profile.total_xp || 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Admin Day Plan Save & Get
router.post('/admin/day-plan/save', async (req, res) => {
  try {
    const { courseId, courseTitle = 'TutO Course', dayNumber, classes, yoga, dailyTest, topicTitle, chapterTitle } = req.body;
    const day = parseInt(dayNumber, 10);
    if (!courseId || !day) return res.status(400).json({ success: false, error: 'courseId and dayNumber required' });

    const week = Math.ceil(day / 7);
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayOfWeek = daysOfWeek[(day - 1) % 7];
    const firstClass = (Array.isArray(classes) && classes[0]) || {};
    const finalTopic = topicTitle || firstClass.title || `Day ${day} Mastery`;
    const finalChapter = chapterTitle || firstClass.subject || 'Core Curriculum';
    const subject = firstClass.subject || 'General';
    const subjectCode = (subject.slice(0, 3) || 'GEN').toUpperCase();
    const conceptCode = `${subjectCode}-D${day}`;

    const upsertQuery = `
      INSERT INTO tuto_course_day_plans (
        course_id, course_title, day_number, week_number, day_of_week,
        subject, subject_code, chapter_title, topic_title, concept_code,
        classes, yoga_task, daily_test, admin_released, release_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, CURRENT_DATE)
      ON CONFLICT (course_id, day_number)
      DO UPDATE SET
        classes = EXCLUDED.classes,
        yoga_task = EXCLUDED.yoga_task,
        daily_test = EXCLUDED.daily_test,
        topic_title = EXCLUDED.topic_title,
        chapter_title = EXCLUDED.chapter_title,
        admin_released = true,
        release_date = CURRENT_DATE;
    `;

    await pool.query(upsertQuery, [
      courseId, courseTitle, day, week, dayOfWeek, subject, subjectCode, finalChapter, finalTopic, conceptCode,
      JSON.stringify(classes || []), JSON.stringify(yoga || {}), JSON.stringify(dailyTest || {})
    ]);

    res.json({ success: true, message: `Day ${day} plan successfully saved!`, dayNumber: day, courseId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/admin/day-plan/get', async (req, res) => {
  try {
    const { courseId = 'school-std-5', dayNumber = 1, ambitionId = 'jr-ias' } = req.query;
    const day = parseInt(dayNumber, 10) || 1;

    const customRes = await pool.query(
      'SELECT * FROM tuto_course_day_plans WHERE course_id = $1 AND day_number = $2',
      [courseId, day]
    );

    if (customRes.rows.length > 0 && Array.isArray(customRes.rows[0].classes) && customRes.rows[0].classes.length > 0) {
      const row = customRes.rows[0];
      return res.json({
        success: true, isCustom: true, dayNumber: day, courseId, ambitionId,
        classes: row.classes, yoga: row.yoga_task || null, dailyTest: row.daily_test || null,
        topicTitle: row.topic_title || '', chapterTitle: row.chapter_title || ''
      });
    }

    const generated = generateUniqueTenClassesForDay(courseId, ambitionId, day);
    res.json({
      success: true, isCustom: false, dayNumber: day, courseId, ambitionId,
      classes: generated.classes, yoga: generated.yoga, dailyTest: generated.dailyTest,
      topicTitle: generated.themeOfTheDay, term: generated.term
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Toggle Planner Task
router.post('/planner/task/toggle', async (req, res) => {
  const { phone = 'anonymous', courseId = 'school-std-5', dayNumber = 1, taskType = 'class', classIndex, completed = true, xp = 25 } = req.body;
  const day = parseInt(dayNumber, 10) || 1;
  const cleanPhone = phone.replace(/\D/g, '').slice(-10) || 'anonymous';
  const xpValue = parseInt(xp, 10) || 25;

  try {
    const existing = await pool.query(
      'SELECT * FROM tuto_student_daily_progress WHERE user_phone = $1 AND course_id = $2 AND day_number = $3',
      [cleanPhone, courseId, day]
    );

    let completedClasses = [];
    let yogaDone = false;
    let testDone = false;
    let currentDailyXp = 0;

    if (existing.rows.length > 0) {
      completedClasses = Array.isArray(existing.rows[0].completed_classes) ? existing.rows[0].completed_classes : [];
      yogaDone = existing.rows[0].yoga_completed;
      testDone = existing.rows[0].daily_test_completed;
      currentDailyXp = existing.rows[0].daily_xp_earned || 0;
    }

    if (taskType === 'class' && classIndex !== undefined) {
      const idx = parseInt(classIndex, 10);
      if (completed && !completedClasses.includes(idx)) {
        completedClasses.push(idx);
        currentDailyXp += xpValue;
      } else if (!completed && completedClasses.includes(idx)) {
        completedClasses = completedClasses.filter(c => c !== idx);
        currentDailyXp = Math.max(0, currentDailyXp - xpValue);
      }
    } else if (taskType === 'yoga') {
      yogaDone = completed;
      if (completed) currentDailyXp += 50;
      else currentDailyXp = Math.max(0, currentDailyXp - 50);
    }

    await pool.query(`
      INSERT INTO tuto_student_daily_progress (user_phone, course_id, day_number, completed_classes, yoga_completed, daily_test_completed, daily_xp_earned, completed_at)
      VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, NOW())
      ON CONFLICT (user_phone, course_id, day_number)
      DO UPDATE SET
        completed_classes = EXCLUDED.completed_classes,
        yoga_completed = EXCLUDED.yoga_completed,
        daily_xp_earned = EXCLUDED.daily_xp_earned,
        completed_at = NOW()
    `, [cleanPhone, courseId, day, JSON.stringify(completedClasses), yogaDone, testDone, currentDailyXp]);

    await pool.query(`
      INSERT INTO tuto_student_profiles (user_phone, total_xp, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (user_phone)
      DO UPDATE SET total_xp = tuto_student_profiles.total_xp + $3, updated_at = NOW()
    `, [cleanPhone, currentDailyXp, completed ? xpValue : -xpValue]);

    res.json({ success: true, completedClasses, yogaCompleted: yogaDone, dailyXpEarned: currentDailyXp });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. Student Profile Sync
router.post('/profile/sync', async (req, res) => {
  const { phone, fullName, academicClass, schoolBoard, futuristicAmbition, activeCourseId, geminiApiKey } = req.body;
  if (!phone) return res.status(400).json({ success: false, error: 'Phone number required' });

  try {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const result = await pool.query(`
      INSERT INTO tuto_student_profiles (
        user_phone, full_name, academic_class, school_board,
        futuristic_ambition, active_course_id, gemini_api_key, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (user_phone)
      DO UPDATE SET
        full_name = COALESCE($2, tuto_student_profiles.full_name),
        academic_class = COALESCE($3, tuto_student_profiles.academic_class),
        school_board = COALESCE($4, tuto_student_profiles.school_board),
        futuristic_ambition = COALESCE($5, tuto_student_profiles.futuristic_ambition),
        active_course_id = COALESCE($6, tuto_student_profiles.active_course_id),
        gemini_api_key = COALESCE($7, tuto_student_profiles.gemini_api_key),
        updated_at = NOW()
      RETURNING *
    `, [cleanPhone, fullName || 'Student', academicClass || 'class_10', schoolBoard || 'TNSB', futuristicAmbition || 'jr-ias', activeCourseId || 'school-std-10', geminiApiKey || null]);

    res.json({ success: true, profile: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 13. Dynamic AI Topic Generator
router.post('/ai/generate-topic', async (req, res) => {
  const { courseId = 'school-std-5', dayNumber = 1, topicTitle, subject = 'General', userApiKey } = req.body;
  if (!topicTitle) return res.status(400).json({ success: false, error: 'topicTitle is required' });

  const cacheKey = `${courseId}_day_${dayNumber}_${topicTitle}`.toLowerCase().replace(/[^a-z0-9]/g, '_');

  try {
    const cached = await pool.query('SELECT content FROM tuto_ai_content_cache WHERE cache_key = $1', [cacheKey]);
    if (cached.rows.length > 0) {
      return res.json({ success: true, source: 'oci_cache', content: cached.rows[0].content });
    }

    const apiKey = (userApiKey || process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey) {
      return res.status(400).json({ success: false, error: 'Gemini API key is required' });
    }

    const prompt = `You are the Master TutO AI Academic Engine. Generate an authentic, comprehensive learning package in JSON for this syllabus topic:
Course: ${courseId}
Subject: ${subject}
Day: ${dayNumber}
Topic: ${topicTitle}

Respond ONLY with valid parseable JSON matching:
{
  "topicTitle": "${topicTitle}",
  "subject": "${subject}",
  "overview": "3 sentence clear concept overview in English",
  "tamilExplanation": "தமிழ் விளக்கம் (3-4 sentences in simple Tamil)",
  "learningObjectives": ["Objective 1", "Objective 2", "Objective 3"],
  "studyNotes": [
    {"sectionTitle": "1. Core Principles", "content": "Detailed explanation with real world examples..."},
    {"sectionTitle": "2. Formulas and Laws", "content": "Key rules, equations, and definitions..."}
  ],
  "flashcards": [
    {"front": "Definition question 1", "back": "Clear concise answer"},
    {"front": "Key rule 2", "back": "Clear concise explanation"}
  ],
  "practiceQuiz": [
    {
      "question": "Clear multiple choice question 1?",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "correctIndex": 0,
      "explanation": "Why this answer is correct"
    }
  ],
  "bedtimeRecap": "Bullet 1 \\nBullet 2 \\nBullet 3 (quick 1-minute revision for night before exam)"
}`;

    const postData = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) },
      timeout: 25000
    };

    const apiReq = https.request(options, (apiRes) => {
      let body = '';
      apiRes.on('data', chunk => body += chunk);
      apiRes.on('end', async () => {
        try {
          const parsed = JSON.parse(body);
          const rawText = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!rawText) throw new Error(parsed.error?.message || 'Empty response from Gemini API');
          const cleanJson = JSON.parse(rawText.trim());

          await pool.query(`
            INSERT INTO tuto_ai_content_cache (cache_key, course_id, topic_title, day_number, content)
            VALUES ($1, $2, $3, $4, $5::jsonb)
            ON CONFLICT (cache_key) DO UPDATE SET content = EXCLUDED.content
          `, [cacheKey, courseId, topicTitle, dayNumber, JSON.stringify(cleanJson)]);

          return res.json({ success: true, source: 'gemini_api_generated', content: cleanJson });
        } catch (e) {
          return res.status(500).json({ success: false, error: e.message });
        }
      });
    });

    apiReq.on('error', (err) => res.status(500).json({ success: false, error: err.message }));
    apiReq.write(postData);
    apiReq.end();
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 14. School Homework Assistant
router.post('/homework/assist', async (req, res) => {
  const { questionText, subject = 'General', grade = '10th', userApiKey } = req.body;
  if (!questionText) return res.status(400).json({ success: false, error: 'questionText is required' });

  try {
    const apiKey = (userApiKey || process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey) return res.status(400).json({ success: false, error: 'Gemini API Key required' });

    const prompt = `You are the TutO School Homework Guide for Class ${grade} (${subject}).
Question: "${questionText}"

Provide an educational, encouraging response in JSON format:
{
  "conceptTitle": "Core concept behind this question",
  "hint": "Gentle guiding hint to stimulate student thinking",
  "stepByStepSolution": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
  "finalAnswer": "The concise final answer / solution",
  "tamilSummary": "சுருக்கமான விளக்கம் தமிழில் (2-3 வாக்கியங்கள்)"
}`;

    const postData = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) },
      timeout: 20000
    };

    const apiReq = https.request(options, (apiRes) => {
      let body = '';
      apiRes.on('data', chunk => body += chunk);
      apiRes.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          const rawText = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!rawText) throw new Error(parsed.error?.message || 'Empty response');
          const cleanJson = JSON.parse(rawText.trim());
          return res.json({ success: true, solution: cleanJson });
        } catch (e) {
          return res.status(500).json({ success: false, error: e.message });
        }
      });
    });

    apiReq.on('error', (err) => res.status(500).json({ success: false, error: err.message }));
    apiReq.write(postData);
    apiReq.end();
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 15. Submissions and Teacher Alert
router.post('/submissions/submit', async (req, res) => {
  try {
    const {
      studentName = 'SuprO Scholar', studentPhone, academicClass = 'class_5', ambitionId = 'jr-ias',
      courseId = 'school-std-5', dayNumber = 1, classesCompleted = 0, totalClasses = 10,
      yogaCompleted = false, testScore = 0, xpEarned = 0, studentNotes = '', homeworkUrl = ''
    } = req.body;

    const cleanPhone = (studentPhone || '').replace(/\D/g, '').slice(-10);

    const query = `
      INSERT INTO public.tuto_day_submissions 
      (student_name, student_phone, academic_class, ambition_id, course_id, day_number, classes_completed, total_classes, yoga_completed, test_score, xp_earned, student_notes, homework_url, status, submitted_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'submitted', NOW(), NOW())
      RETURNING *;
    `;
    const values = [
      studentName, cleanPhone, academicClass, ambitionId, courseId,
      parseInt(dayNumber) || 1, parseInt(classesCompleted) || 0, parseInt(totalClasses) || 10,
      !!yogaCompleted, parseInt(testScore) || 0, parseInt(xpEarned) || 0,
      studentNotes, homeworkUrl
    ];

    const result = await pool.query(query, values);
    return res.json({ success: true, submission: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/submissions/list', async (req, res) => {
  try {
    const { status, limit = 50, dayNumber } = req.query;
    let query = 'SELECT * FROM public.tuto_day_submissions';
    const conditions = [];
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (dayNumber) {
      params.push(parseInt(dayNumber));
      conditions.push(`day_number = $${params.length}`);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY submitted_at DESC LIMIT $' + (params.length + 1);
    params.push(parseInt(limit) || 50);

    const result = await pool.query(query, params);
    return res.json({ success: true, submissions: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/submissions/review-and-alert', async (req, res) => {
  try {
    const { submissionId, teacherRemarks, teacherBonusXp = 50, teacherRating = 5, teacherName = 'Lead Academic Guide', status = 'approved' } = req.body;
    if (!submissionId) return res.status(400).json({ success: false, error: 'submissionId is required' });

    const updateQuery = `
      UPDATE public.tuto_day_submissions
      SET teacher_remarks = $1, teacher_bonus_xp = $2, teacher_rating = $3, teacher_name = $4, status = $5, alerted_at = NOW(), updated_at = NOW()
      WHERE id = $6
      RETURNING *;
    `;
    const updateRes = await pool.query(updateQuery, [
      teacherRemarks || 'Outstanding effort! Mission verified by academic guide.',
      parseInt(teacherBonusXp) || 50,
      parseInt(teacherRating) || 5,
      teacherName, status, submissionId
    ]);

    if (updateRes.rows.length === 0) return res.status(404).json({ success: false, error: 'Submission not found' });
    const sub = updateRes.rows[0];

    const alertTitle = `🎉 Day ${sub.day_number} Mission Approved by Teacher!`;
    const alertMsg = teacherRemarks || `Well done! Your teacher has evaluated your Day ${sub.day_number} mission and awarded +${teacherBonusXp} bonus XP!`;

    await pool.query(
      `INSERT INTO public.tuto_student_alerts (student_phone, student_name, submission_id, title, message, teacher_name, bonus_xp, is_read, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false, NOW())`,
      [sub.student_phone, sub.student_name, sub.id, alertTitle, alertMsg, teacherName, parseInt(teacherBonusXp) || 50]
    );

    let whatsappSent = false;
    if (sub.student_phone && sub.student_phone.length >= 10) {
      const waText = `🎓 *TutO LMS — Teacher Evaluation Alert* 🌟\n\nDear *${sub.student_name}*,\n\nYour Academic Guide (*${teacherName}*) has reviewed your *Day ${sub.day_number} Mission*!\n\n💬 *Teacher Feedback:* ${teacherRemarks || 'Outstanding work today!'}\n⭐ *Rating:* ${'⭐'.repeat(sub.teacher_rating || 5)}\n⚡ *Bonus Awarded:* +${teacherBonusXp} XP!\n\nKeep up the stellar consistency! Open your TutO Cockpit to view your new score: https://watscrm.vercel.app/tuto`;
      sendWhatsAppMessage(sub.student_phone, waText).catch(() => {});
    }

    return res.json({ success: true, submission: sub, whatsappSent });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/student/alerts', async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.json({ success: true, alerts: [] });
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    const result = await pool.query(
      `SELECT * FROM public.tuto_student_alerts 
       WHERE student_phone = $1 AND is_read = false 
       ORDER BY created_at DESC LIMIT 5`,
      [cleanPhone]
    );
    return res.json({ success: true, alerts: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/student/alerts/dismiss', async (req, res) => {
  try {
    const { alertId, phone } = req.body;
    if (alertId) {
      await pool.query(`UPDATE public.tuto_student_alerts SET is_read = true WHERE id = $1`, [alertId]);
    } else if (phone) {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      await pool.query(`UPDATE public.tuto_student_alerts SET is_read = true WHERE student_phone = $1`, [cleanPhone]);
    }
    return res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
