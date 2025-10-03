const { pool } = require('../config/database');
const ExcelJS = require('exceljs');

// Create report
const createReport = async (req, res) => {
  try {
    const {
      class_id,
      course_id,
      week_of_reporting,
      date_of_lecture,
      actual_students_present,
      topic_taught,
      learning_outcomes,
      recommendations
    } = req.body;

    const lecturer_id = req.user.id;

    // Validation
    if (!class_id || !course_id || !week_of_reporting || !date_of_lecture || 
        !actual_students_present || !topic_taught || !learning_outcomes) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Get class details to verify total registered students
    const [classes] = await pool.execute(
      'SELECT total_registered_students FROM classes WHERE id = ?',
      [class_id]
    );

    if (classes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO reports (
        lecturer_id, class_id, course_id, week_of_reporting, date_of_lecture,
        actual_students_present, topic_taught, learning_outcomes, recommendations
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        lecturer_id, class_id, course_id, week_of_reporting, date_of_lecture,
        actual_students_present, topic_taught, learning_outcomes, recommendations || ''
      ]
    );

    // Get the created report with joins
    const [reports] = await pool.execute(
      `SELECT r.*, u.name as lecturer_name, c.class_name, c.faculty_name, 
              co.course_code, co.course_name
       FROM reports r
       JOIN users u ON r.lecturer_id = u.id
       JOIN classes c ON r.class_id = c.id
       JOIN courses co ON r.course_id = co.id
       WHERE r.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: {
        report: reports[0]
      }
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating report'
    });
  }
};

// Get all reports
const getReports = async (req, res) => {
  try {
    const { search, status, week, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT r.*, u.name as lecturer_name, c.class_name, c.faculty_name, 
             co.course_code, co.course_name, c.total_registered_students
      FROM reports r
      JOIN users u ON r.lecturer_id = u.id
      JOIN classes c ON r.class_id = c.id
      JOIN courses co ON r.course_id = co.id
      WHERE 1=1
    `;
    const params = [];

    // Role-based filtering
    if (req.user.role === 'lecturer') {
      query += ' AND r.lecturer_id = ?';
      params.push(req.user.id);
    }

    if (search) {
      query += ' AND (co.course_name LIKE ? OR co.course_code LIKE ? OR u.name LIKE ? OR r.topic_taught LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }

    if (week) {
      query += ' AND r.week_of_reporting = ?';
      params.push(week);
    }

    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [reports] = await pool.execute(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM reports r WHERE 1=1';
    const countParams = [];

    if (req.user.role === 'lecturer') {
      countQuery += ' AND r.lecturer_id = ?';
      countParams.push(req.user.id);
    }

    if (search) {
      countQuery += ' AND (r.topic_taught LIKE ?)';
      countParams.push(`%${search}%`);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reports'
    });
  }
};

// Get single report
const getReport = async (req, res) => {
  try {
    const { id } = req.params;

    const [reports] = await pool.execute(
      `SELECT r.*, u.name as lecturer_name, c.class_name, c.faculty_name, 
              co.course_code, co.course_name, c.total_registered_students,
              fb.name as feedback_by_name
       FROM reports r
       JOIN users u ON r.lecturer_id = u.id
       JOIN classes c ON r.class_id = c.id
       JOIN courses co ON r.course_id = co.id
       LEFT JOIN users fb ON r.feedback_by = fb.id
       WHERE r.id = ?`,
      [id]
    );

    if (reports.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: {
        report: reports[0]
      }
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching report'
    });
  }
};

// Update report status (for principal lecturers)
const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const [result] = await pool.execute(
      'UPDATE reports SET status = ?, feedback = ?, feedback_by = ? WHERE id = ?',
      [status, feedback || '', req.user.id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      message: 'Report updated successfully'
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating report'
    });
  }
};

// Export reports to Excel
const exportReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = `
      SELECT r.*, u.name as lecturer_name, c.class_name, c.faculty_name, 
             co.course_code, co.course_name, c.total_registered_students
      FROM reports r
      JOIN users u ON r.lecturer_id = u.id
      JOIN classes c ON r.class_id = c.id
      JOIN courses co ON r.course_id = co.id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'lecturer') {
      query += ' AND r.lecturer_id = ?';
      params.push(req.user.id);
    }

    if (startDate && endDate) {
      query += ' AND r.date_of_lecture BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY r.date_of_lecture DESC';

    const [reports] = await pool.execute(query, params);

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Lecture Reports');

    // Add headers
    worksheet.columns = [
      { header: 'Week', key: 'week', width: 10 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Faculty', key: 'faculty', width: 20 },
      { header: 'Class', key: 'class', width: 15 },
      { header: 'Course Code', key: 'course_code', width: 15 },
      { header: 'Course Name', key: 'course_name', width: 25 },
      { header: 'Lecturer', key: 'lecturer', width: 20 },
      { header: 'Students Present', key: 'students_present', width: 15 },
      { header: 'Total Students', key: 'total_students', width: 15 },
      { header: 'Topic', key: 'topic', width: 30 },
      { header: 'Status', key: 'status', width: 12 }
    ];

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    };

    // Add data
    reports.forEach(report => {
      worksheet.addRow({
        week: report.week_of_reporting,
        date: report.date_of_lecture,
        faculty: report.faculty_name,
        class: report.class_name,
        course_code: report.course_code,
        course_name: report.course_name,
        lecturer: report.lecturer_name,
        students_present: report.actual_students_present,
        total_students: report.total_registered_students,
        topic: report.topic_taught,
        status: report.status
      });
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=luct-reports.xlsx');

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Export reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting reports'
    });
  }
};

module.exports = {
  createReport,
  getReports,
  getReport,
  updateReportStatus,
  exportReports
};