const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'luct_reporting',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Initialize database and tables
const initializeDatabase = async () => {
  try {
    // Create database if it doesn't exist
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });

    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    console.log('Database created or already exists');

    await connection.end();

    // Create tables
    await createTables();
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

const createTables = async () => {
  try {
    // Users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('student', 'lecturer', 'principal_lecturer', 'program_leader') NOT NULL,
        faculty VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Courses table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        course_code VARCHAR(50) UNIQUE NOT NULL,
        course_name VARCHAR(255) NOT NULL,
        description TEXT,
        credits INT,
        program_leader_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (program_leader_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Classes table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS classes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        class_name VARCHAR(100) NOT NULL,
        faculty_name VARCHAR(255) NOT NULL,
        total_registered_students INT NOT NULL,
        venue VARCHAR(100),
        scheduled_time TIME,
        lecturer_id INT,
        course_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lecturer_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
      )
    `);

    // Reports table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS reports (
        id INT PRIMARY KEY AUTO_INCREMENT,
        lecturer_id INT NOT NULL,
        class_id INT NOT NULL,
        course_id INT NOT NULL,
        week_of_reporting INT NOT NULL,
        date_of_lecture DATE NOT NULL,
        actual_students_present INT NOT NULL,
        topic_taught TEXT NOT NULL,
        learning_outcomes TEXT NOT NULL,
        recommendations TEXT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        feedback TEXT,
        feedback_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (lecturer_id) REFERENCES users(id),
        FOREIGN KEY (class_id) REFERENCES classes(id),
        FOREIGN KEY (course_id) REFERENCES courses(id),
        FOREIGN KEY (feedback_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Ratings table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS ratings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        report_id INT NOT NULL,
        user_id INT NOT NULL,
        rating_value INT CHECK (rating_value >= 1 AND rating_value <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Insert sample data
    await insertSampleData();

    console.log('All tables created successfully');
  } catch (error) {
    console.error('Table creation error:', error);
  }
};

const insertSampleData = async () => {
  try {
    // Check if sample data already exists
    const [users] = await pool.execute('SELECT COUNT(*) as count FROM users');
    if (users[0].count > 0) {
      console.log('Sample data already exists');
      return;
    }

    console.log('Inserting sample data...');

    // Insert sample users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const sampleUsers = [
      ['John Doe', 'lecturer@luct.ac.ls', hashedPassword, 'lecturer', 'Faculty of ICT'],
      ['Jane Smith', 'principal@luct.ac.ls', hashedPassword, 'principal_lecturer', 'Faculty of ICT'],
      ['Mike Johnson', 'programleader@luct.ac.ls', hashedPassword, 'program_leader', 'Faculty of ICT'],
      ['Student One', 'student@luct.ac.ls', hashedPassword, 'student', 'Faculty of ICT']
    ];

    for (const user of sampleUsers) {
      await pool.execute(
        'INSERT IGNORE INTO users (name, email, password, role, faculty) VALUES (?, ?, ?, ?, ?)',
        user
      );
    }

    // Get user IDs for relationships
    const [lecturers] = await pool.execute('SELECT id FROM users WHERE role = "lecturer"');
    const [principals] = await pool.execute('SELECT id FROM users WHERE role = "principal_lecturer"');
    const [leaders] = await pool.execute('SELECT id FROM users WHERE role = "program_leader"');

    // Insert sample courses
    const sampleCourses = [
      ['DIWA2110', 'Web Application Development', 'Learn modern web development technologies', 3, leaders[0]?.id],
      ['DBS2110', 'Database Systems', 'Database design and implementation', 3, leaders[0]?.id],
      ['SE2110', 'Software Engineering', 'Software development methodologies', 3, leaders[0]?.id]
    ];

    for (const course of sampleCourses) {
      await pool.execute(
        'INSERT IGNORE INTO courses (course_code, course_name, description, credits, program_leader_id) VALUES (?, ?, ?, ?, ?)',
        course
      );
    }

    // Get course IDs
    const [courses] = await pool.execute('SELECT id FROM courses');

    // Insert sample classes
    const sampleClasses = [
      ['IT-2023-A', 'Faculty of ICT', 30, 'Room 101', '10:00:00', lecturers[0]?.id, courses[0]?.id],
      ['BIT-2023-B', 'Faculty of ICT', 32, 'Room 205', '14:00:00', lecturers[0]?.id, courses[1]?.id]
    ];

    for (const cls of sampleClasses) {
      await pool.execute(
        'INSERT IGNORE INTO classes (class_name, faculty_name, total_registered_students, venue, scheduled_time, lecturer_id, course_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        cls
      );
    }

    // Get class IDs
    const [classes] = await pool.execute('SELECT id FROM classes');

    // Insert sample reports
    const sampleReports = [
      [
        lecturers[0]?.id, classes[0]?.id, courses[0]?.id, 6, '2023-10-15',
        24, 'React Components and State Management', 
        'Understanding React components, state, and props', 
        'More practical examples needed'
      ],
      [
        lecturers[0]?.id, classes[1]?.id, courses[1]?.id, 6, '2023-10-14',
        28, 'SQL Queries and Joins', 
        'Mastering SQL queries and database relationships', 
        'Provide more exercises'
      ]
    ];

    for (const report of sampleReports) {
      await pool.execute(
        `INSERT INTO reports (
          lecturer_id, class_id, course_id, week_of_reporting, date_of_lecture,
          actual_students_present, topic_taught, learning_outcomes, recommendations
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        report
      );
    }

    console.log('Sample data inserted successfully');
  } catch (error) {
    console.error('Sample data insertion error:', error);
  }
};

module.exports = { pool, initializeDatabase };