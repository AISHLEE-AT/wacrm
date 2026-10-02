const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// 1. Get Groups (with optional phone filter)
router.get('/groups', async (req, res) => {
  const { phone } = req.query;
  try {
    if (phone) {
      const result = await pool.query(
        `SELECT DISTINCT g.* FROM groupo_groups g 
         LEFT JOIN groupo_members m ON m.group_id = g.id 
         WHERE g.leader_phone = $1 OR m.phone = $1 
         ORDER BY g.created_at DESC`,
        [phone]
      );
      return res.json(result.rows);
    }
    
    const result = await pool.query(`SELECT * FROM groupo_groups ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get User Status
router.get('/status', async (req, res) => {
  const { phone } = req.query;
  try {
    const leaderRes = await pool.query(`SELECT * FROM groupo_groups WHERE leader_phone = $1 LIMIT 1`, [phone]);
    if (leaderRes.rows.length > 0) {
       return res.json({ isLeader: true, isMember: true, role: 'President', group: leaderRes.rows[0] });
    }
    const memberRes = await pool.query(
      `SELECT m.*, g.name as group_name, g.category_label 
       FROM groupo_members m 
       JOIN groupo_groups g ON m.group_id = g.id 
       WHERE m.phone = $1 LIMIT 1`,
      [phone]
    );
    if (memberRes.rows.length > 0) {
       return res.json({
         isLeader: false,
         isMember: true,
         role: memberRes.rows[0].role,
         group: {
           id: memberRes.rows[0].group_id,
           name: memberRes.rows[0].group_name,
           category_label: memberRes.rows[0].category_label
         }
       });
    }
    res.json({ isLeader: false, isMember: false, role: 'None' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get Group Members
router.get('/groups/:groupId/members', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM groupo_members WHERE group_id = $1 ORDER BY created_at ASC`,
      [req.params.groupId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Update Member (e.g., mark paid)
router.patch('/members/:id', async (req, res) => {
  const { current_month_paid, savings_amount } = req.body;
  try {
    let updateQuery = `UPDATE groupo_members SET updated_at = NOW()`;
    const params = [];
    if (current_month_paid !== undefined) {
      params.push(current_month_paid);
      updateQuery += `, current_month_paid = $${params.length}`;
    }
    if (savings_amount !== undefined) {
      params.push(savings_amount);
      updateQuery += `, savings_amount = $${params.length}`;
    }
    params.push(req.params.id);
    updateQuery += ` WHERE id = $${params.length} RETURNING *`;

    const result = await pool.query(updateQuery, params);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
