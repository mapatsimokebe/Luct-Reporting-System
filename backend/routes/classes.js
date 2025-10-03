const express = require('express');
const { auth } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Get all classes
router.get('/', auth, async (req, res) => {
  try {
    const [classes] = await pool.execute(`
      SELECT cl.*, u.name as lecturer_name, co.course_name, co.course_code
      FROM classes cl
      LEFT JOIN users u ON cl.lecturer_id = u.id
      LEFT JOIN courses co ON cl.course_id = co.id
      ORDER BY cl.class_name
    `);
    
    res.json({
      success: true,
      data: { classes }
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching classes'
    });
  }
});

module.exports = router;