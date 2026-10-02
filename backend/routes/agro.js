const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// 1. Get Agro Media
router.get(['/media', '/agro/media'], async (req, res) => {
  try {
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Daily News Feed
router.get('/news', async (req, res) => {
  try {
    const { module: mod } = req.query;
    let sql = 'SELECT * FROM public.daily_news';
    let params = [];
    if (mod && mod !== 'all') {
      sql += ' WHERE module = $1';
      params.push(mod);
    }
    sql += ' ORDER BY created_at DESC LIMIT 50';
    const result = await pool.query(sql, params);
    return res.json(result.rows);
  } catch (err) {
    console.error('Error in /api/agro/news:', err);
    return res.status(500).json({ error: err.message });
  }
});

router.post('/news/bulk', async (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : [req.body];
    for (const item of items) {
      await pool.query(
        `INSERT INTO public.daily_news 
         (module, title, description, image_url, source_name, link, published_date, loaded_date, data_type, extra_data)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          item.module || 'general',
          item.title || 'Untitled',
          item.description || '',
          item.image_url || null,
          item.source_name || 'SuprO News',
          item.link || '',
          item.published_date || new Date().toISOString().slice(0, 10),
          item.loaded_date || new Date().toISOString().slice(0, 10),
          item.data_type || 'rss',
          item.extra_data ? JSON.stringify(item.extra_data) : null
        ]
      );
    }
    return res.json({ success: true, inserted: items.length });
  } catch (err) {
    console.error('Error in news/bulk:', err);
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/news/today', async (req, res) => {
  try {
    const { module: mod } = req.query;
    const today = new Date().toISOString().slice(0, 10);
    if (mod) {
      await pool.query('DELETE FROM public.daily_news WHERE loaded_date = $1 AND module = $2', [today, mod]);
    } else {
      await pool.query('DELETE FROM public.daily_news WHERE loaded_date = $1', [today]);
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
