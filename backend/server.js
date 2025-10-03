const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock users storage (in-memory for demo)
let users = [
  {
    id: 1,
    name: 'Dr. John Doe',
    email: 'lecturer@luct.ac.ls',
    password: 'password123',
    role: 'lecturer',
    faculty: 'Faculty of ICT'
  },
  {
    id: 2,
    name: 'Prof. Jane Smith',
    email: 'principal@luct.ac.ls',
    password: 'password123',
    role: 'principal_lecturer',
    faculty: 'Faculty of ICT'
  },
  {
    id: 3,
    name: 'Dr. Mike Johnson',
    email: 'programleader@luct.ac.ls',
    password: 'password123',
    role: 'program_leader',
    faculty: 'Faculty of ICT'
  },
  {
    id: 4,
    name: 'Student One',
    email: 'student@luct.ac.ls',
    password: 'password123',
    role: 'student',
    faculty: 'Faculty of ICT'
  }
];

// Mock reports data
const mockReports = [
  {
    id: 1,
    faculty_name: 'Faculty of ICT',
    class_name: 'IT-2023-A',
    week_of_reporting: 6,
    date_of_lecture: '2023-10-15',
    course_name: 'Web Development',
    course_code: 'DIWA2110',
    lecturer_name: 'Dr. John Doe',
    actual_students_present: 24,
    total_registered_students: 30,
    venue: 'Room 101',
    scheduled_time: '10:00',
    topic_taught: 'React Components and State Management',
    learning_outcomes: 'Understanding React components, state, and props',
    recommendations: 'More practical examples needed',
    status: 'approved'
  },
  {
    id: 2,
    faculty_name: 'Faculty of ICT',
    class_name: 'BIT-2023-B',
    week_of_reporting: 6,
    date_of_lecture: '2023-10-14',
    course_name: 'Database Systems',
    course_code: 'DBS2110',
    lecturer_name: 'Dr. John Doe',
    actual_students_present: 28,
    total_registered_students: 32,
    venue: 'Room 205',
    scheduled_time: '14:00',
    topic_taught: 'SQL Queries and Joins',
    learning_outcomes: 'Mastering SQL queries and database relationships',
    recommendations: 'Provide more exercises',
    status: 'pending'
  }
];

// Basic test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to LUCT Reporting System API!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API test route
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'API is working perfectly!',
    data: {
      service: 'LUCT Reporting System',
      status: 'Running',
      timestamp: new Date().toISOString()
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'LUCT Reporting Backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// FIXED: Register endpoint - properly saves new users
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role, faculty } = req.body;
  
  console.log('📝 REGISTRATION ATTEMPT:', { name, email, role });
  console.log('📋 CURRENT USERS BEFORE:', users.map(u => u.email));
  
  // Simple validation
  if (!name || !email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }
  
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters'
    });
  }

  // Check if user already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  // Create new user
  const newUser = {
    id: Date.now(), // Use timestamp for unique ID
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: password,
    role: role,
    faculty: faculty || 'Faculty of ICT',
    created_at: new Date().toISOString()
  };

  // Add to users array
  users.push(newUser);

  console.log('✅ NEW USER REGISTERED:', newUser);
  console.log('📋 CURRENT USERS AFTER:', users.map(u => u.email));
  console.log('👥 TOTAL USERS NOW:', users.length);

  // Return success
  res.status(201).json({
    success: true,
    message: 'Registration successful! You can now login.',
    data: {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        faculty: newUser.faculty
      }
    }
  });
});

// FIXED: Login endpoint - works with newly registered users
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  
  console.log('🔐 LOGIN ATTEMPT:', { email, password, role });
  console.log('📋 ALL REGISTERED USERS:', users.map(u => ({ email: u.email, role: u.role })));
  
  // Normalize email for comparison
  const normalizedEmail = email.trim().toLowerCase();
  
  // Find user by email and password
  const user = users.find(u => 
    u.email.toLowerCase() === normalizedEmail && 
    u.password === password
  );
  
  if (user) {
    console.log('✅ LOGIN SUCCESS for user:', user.email);
    res.json({
      success: true,
      message: 'Login successful!',
      data: {
        token: 'mock-jwt-token-' + user.id,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          faculty: user.faculty
        }
      }
    });
  } else {
    console.log('❌ LOGIN FAILED');
    res.status(400).json({
      success: false,
      message: 'Invalid email or password. Please check your credentials.'
    });
  }
});

// Debug endpoint to see all users
app.get('/api/debug/users', (req, res) => {
  res.json({
    success: true,
    data: {
      totalUsers: users.length,
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        faculty: user.faculty,
        password: user.password
      }))
    }
  });
});

// Get all users (for testing)
app.get('/api/auth/users', (req, res) => {
  res.json({
    success: true,
    data: {
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        faculty: user.faculty
      }))
    }
  });
});

// Mock reports endpoints
app.get('/api/reports', (req, res) => {
  const { search } = req.query;
  
  let reports = mockReports;
  
  // Simple search filter
  if (search) {
    reports = mockReports.filter(report => 
      report.course_name.toLowerCase().includes(search.toLowerCase()) ||
      report.lecturer_name.toLowerCase().includes(search.toLowerCase()) ||
      report.topic_taught.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  res.json({
    success: true,
    data: {
      reports,
      pagination: {
        page: 1,
        limit: 10,
        total: reports.length,
        pages: 1
      }
    }
  });
});

// Mock create report
app.post('/api/reports', (req, res) => {
  const reportData = req.body;
  
  const newReport = {
    id: mockReports.length + 1,
    ...reportData,
    status: 'pending',
    created_at: new Date().toISOString()
  };
  
  mockReports.push(newReport);
  
  res.status(201).json({
    success: true,
    message: 'Report created successfully',
    data: {
      report: newReport
    }
  });
});

// Mock export reports
app.get('/api/reports/export', (req, res) => {
  // Simple CSV export
  const csvHeaders = 'Week,Date,Faculty,Class,Course,Lecturer,Students Present,Total Students,Topic,Status\n';
  
  const csvData = mockReports.map(report => 
    `Week ${report.week_of_reporting},${report.date_of_lecture},${report.faculty_name},${report.class_name},${report.course_name},${report.lecturer_name},${report.actual_students_present},${report.total_registered_students},"${report.topic_taught}",${report.status}`
  ).join('\n');
  
  const csvContent = csvHeaders + csvData;
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=luct-reports.csv');
  res.send(csvContent);
});

// Mock courses
app.get('/api/courses', (req, res) => {
  const courses = [
    { id: 1, course_code: 'DIWA2110', course_name: 'Web Application Development', credits: 3 },
    { id: 2, course_code: 'DBS2110', course_name: 'Database Systems', credits: 3 },
    { id: 3, course_code: 'SE2110', course_name: 'Software Engineering', credits: 3 }
  ];
  
  res.json({
    success: true,
    data: { courses }
  });
});

// Mock classes
app.get('/api/classes', (req, res) => {
  const classes = [
    { id: 1, class_name: 'IT-2023-A', faculty_name: 'Faculty of ICT', total_registered_students: 30, venue: 'Room 101' },
    { id: 2, class_name: 'BIT-2023-B', faculty_name: 'Faculty of ICT', total_registered_students: 32, venue: 'Room 205' }
  ];
  
  res.json({
    success: true,
    data: { classes }
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found: ' + req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🎉 ============================================');
  console.log('🚀 LUCT Reporting System Backend Started!');
  console.log('📊 Mock Data API Server');
  console.log('📍 Port:', PORT);
  console.log('🔗 Local: http://localhost:' + PORT);
  console.log('🔗 API Test: http://localhost:' + PORT + '/api/test');
  console.log('🎉 ============================================');
  console.log('');
  console.log('📝 Available Login Credentials:');
  console.log('   👨‍🏫 Lecturer: lecturer@luct.ac.ls / password123');
  console.log('   👩‍🏫 Principal: principal@luct.ac.ls / password123');
  console.log('   👨‍💼 Program Leader: programleader@luct.ac.ls / password123');
  console.log('   👨‍🎓 Student: student@luct.ac.ls / password123');
  console.log('');
  console.log('👥 Total Registered Users:', users.length);
  console.log('');
  console.log('🐛 Debug URL: http://localhost:' + PORT + '/api/debug/users');
  console.log('');
});