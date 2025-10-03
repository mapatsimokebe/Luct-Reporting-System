const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Get all users (for program leaders)
router.get('/', auth, authorize('program_leader'), async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT id, name, email, role, faculty, created_at 
      FROM users 
      ORDER BY name
    `);
    
    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

module.exports = router;