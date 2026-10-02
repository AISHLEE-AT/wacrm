const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// 1. Get Coin / Point Balances
router.get('/balance', async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.json({ testo_points: 100, farm_points: 100, nitro_balance: 0 });

    const result = await pool.query('SELECT * FROM public.gameo_balances WHERE user_id = $1', [user_id]);
    if (result.rows.length === 0) {
      await pool.query('INSERT INTO public.gameo_balances (user_id, testo_points, farm_points, nitro_balance) VALUES ($1, 100, 100, 0)', [user_id]);
      return res.json({ testo_points: 100, farm_points: 100, nitro_balance: 0 });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. Sync Points from Gaming / Completing Tasks
router.post('/sync', async (req, res) => {
  try {
    const { user_id, testo_points = 0, farm_points = 0 } = req.body;
    if (!user_id) return res.status(400).json({ error: 'Missing user_id' });

    await pool.query(
      `INSERT INTO public.gameo_balances (user_id, testo_points, farm_points, nitro_balance)
       VALUES ($1, $2, $3, 0)
       ON CONFLICT (user_id) DO UPDATE SET 
         testo_points = public.gameo_balances.testo_points + EXCLUDED.testo_points,
         farm_points = public.gameo_balances.farm_points + EXCLUDED.farm_points,
         updated_at = NOW()`,
      [user_id, testo_points, farm_points]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. Redeem Points for Coupons
router.post('/redeem', async (req, res) => {
  try {
    const { user_id, reward_id, reward_type, points_cost = 100 } = req.body;
    if (!user_id || !reward_type) return res.status(400).json({ error: 'Missing parameters' });

    const code = 'SUPRO-' + reward_type.toUpperCase() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();

    await pool.query(
      `INSERT INTO public.gameo_coupons (user_id, coupon_code, reward_type, reward_id, points_spent)
       VALUES ($1, $2, $3, $4, $5)`,
      [user_id, code, reward_type, reward_id || 'reward', points_cost]
    );

    const field = reward_type === 'farm' ? 'farm_points' : 'testo_points';
    await pool.query(
      `UPDATE public.gameo_balances SET ${field} = GREATEST(0, ${field} - $1) WHERE user_id = $2`,
      [points_cost, user_id]
    );

    return res.json({ success: true, coupon_code: code });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. Get Redeemed Coupons
router.get('/coupons', async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.json([]);

    const result = await pool.query(
      'SELECT * FROM public.gameo_coupons WHERE user_id = $1 ORDER BY created_at DESC',
      [user_id]
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 5. Convert Nitro to SuprO Points
router.post('/convert', async (req, res) => {
  try {
    const { user_id, nitro_spent = 10 } = req.body;
    const suproCoinsGained = Math.floor(nitro_spent / 10) * 5;

    await pool.query(
      `INSERT INTO public.gameo_balances (user_id, testo_points, farm_points, nitro_balance)
       VALUES ($1, $2, 0, 0)
       ON CONFLICT (user_id) DO UPDATE SET
         testo_points = public.gameo_balances.testo_points + $2,
         updated_at = NOW()`,
      [user_id, suproCoinsGained]
    );

    return res.json({
      success: true,
      new_nitro_balance: 0,
      supro_gained: suproCoinsGained
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 6. TestO Mock Exams Aggregator
router.get('/testo/tests', async (req, res) => {
  try {
    const subjectsRes = await pool.query(
      `SELECT subject, count(*) as qcount FROM public.edu_question_bank GROUP BY subject HAVING count(*) >= 5 ORDER BY qcount DESC LIMIT 8`
    );

    const tests = [];
    for (const s of subjectsRes.rows) {
      const qRes = await pool.query(
        `SELECT id, question_text, question_text_ta, options, options_ta, correct_option, explanation, sequence_number 
         FROM public.edu_question_bank 
         WHERE subject = $1 
         ORDER BY id ASC LIMIT 10`,
        [s.subject]
      );

      tests.push({
        id: 'test_' + s.subject.toLowerCase().replace(/\s+/g, '_'),
        title_name: `${s.subject}: Speed Mastery Mock Exam`,
        additional_info: {
          questions: qRes.rows.map((q, idx) => ({
            id: q.id,
            q_num: idx + 1,
            question_text: q.question_text,
            options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
            correct_option: q.correct_option,
            explanation: q.explanation
          }))
        }
      });
    }

    return res.json(tests);
  } catch (err) {
    console.error('Error in /api/testo/tests:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
