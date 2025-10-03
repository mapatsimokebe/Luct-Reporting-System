const express = require('express');
const { auth } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Get all courses
router.get('/', auth, async (req, res) => {
  try {
    const [courses] = await pool.execute(`
      SELECT c.*, u.name as program_leader_name 
      FROM courses c 
      LEFT JOIN users u ON c.program_leader_id = u.id
      ORDER BY c.course_code
    `);
    
    res.json({
      success: true,
      data: { courses }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching courses'
    });
  }
});

module.exports = router;