import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('login');
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // API functions
  const api = {
    login: async (credentials) => {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return await response.json();
    },

    register: async (userData) => {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return await response.json();
    },

    getReports: async () => {
      const response = await fetch('http://localhost:5000/api/reports');
      return await response.json();
    },

    createReport: async (reportData) => {
      const response = await fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      return await response.json();
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setCurrentPage('dashboard');
    }
    
    // Load initial reports
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response = await api.getReports();
      if (response.success) {
        setReports(response.data.reports);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const handleLogin = async (userData) => {
    setLoading(true);
    try {
      const response = await api.login(userData);
      if (response.success) {
        const user = { ...response.data.user, token: response.data.token };
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentPage('dashboard');
        await loadReports();
        alert('Login successful!');
      } else {
        alert(response.message || 'Login failed');
      }
    } catch (error) {
      alert('Login error: ' + error.message);
    }
    setLoading(false);
  };

  const handleRegister = async (userData) => {
    setLoading(true);
    try {
      const response = await api.register(userData);
      if (response.success) {
        alert('Registration successful! You can now login with your credentials.');
        setCurrentPage('login');
      } else {
        alert(response.message || 'Registration failed');
      }
    } catch (error) {
      alert('Registration error: ' + error.message);
    }
    setLoading(false);
  };

  const handleSubmitReport = async (reportData) => {
    setLoading(true);
    try {
      const response = await api.createReport(reportData);
      if (response.success) {
        alert('Report submitted successfully!');
        setCurrentPage('reports');
        await loadReports();
      } else {
        alert(response.message || 'Failed to submit report');
      }
    } catch (error) {
      alert('Submit error: ' + error.message);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setCurrentPage('login');
  };

  const exportToExcel = () => {
    window.open('http://localhost:5000/api/reports/export', '_blank');
  };

  const filteredReports = reports.filter(report =>
    report.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.lecturer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.topic_taught?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Login Component
  const Login = () => {
    const [formData, setFormData] = useState({
      email: '',
      password: '',
      role: 'student'
    });

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      handleLogin(formData);
    };

    return (
      <div style={styles.loginContainer}>
        <h2 style={styles.loginTitle}>📊 LUCT Faculty Reporting</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email address</label>
            <input
              type="email"
              style={styles.input}
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              style={styles.input}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Role</label>
            <select
              style={styles.select}
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
              <option value="principal_lecturer">Principal Lecturer</option>
              <option value="program_leader">Program Leader</option>
            </select>
          </div>
          <button type="submit" style={styles.primaryButton} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <div style={styles.authLink}>
            <a href="#" onClick={() => setCurrentPage('register')} style={styles.link}>
              Don't have an account? Register
            </a>
          </div>
        </form>
      </div>
    );
  };

  // Register Component
  const Register = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student'
    });

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
      }
      handleRegister(formData);
    };

    return (
      <div style={styles.loginContainer}>
        <h2 style={styles.loginTitle}>Create Account</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              style={styles.input}
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email address</label>
            <input
              type="email"
              style={styles.input}
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              style={styles.input}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password (min 6 characters)"
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              style={styles.input}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Role</label>
            <select
              style={styles.select}
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
            </select>
          </div>
          <button type="submit" style={styles.primaryButton} disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
          <div style={styles.authLink}>
            <a href="#" onClick={() => setCurrentPage('login')} style={styles.link}>
              Already have an account? Login
            </a>
          </div>
        </form>
      </div>
    );
  };

  // Report Form Component
  const ReportForm = () => {
    const [formData, setFormData] = useState({
      faculty_name: 'Faculty of ICT',
      class_name: '',
      week_of_reporting: '1',
      date_of_lecture: new Date().toISOString().split('T')[0],
      course_name: '',
      course_code: '',
      lecturer_name: currentUser?.name || '',
      actual_students_present: '',
      total_registered_students: '',
      venue: '',
      scheduled_time: '10:00',
      topic_taught: '',
      learning_outcomes: '',
      recommendations: ''
    });

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      handleSubmitReport(formData);
    };

    return (
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <span>📝 Lecturer Reporting Form</span>
          <button 
            style={styles.secondaryButton}
            onClick={() => setCurrentPage('reports')}
          >
            ← Back to Reports
          </button>
        </div>
        <div style={styles.cardBody}>
          <form onSubmit={handleSubmit}>
            <div style={styles.formSection}>
              <h5 style={styles.sectionTitle}>Basic Information</h5>
              <div style={styles.row}>
                <div style={styles.col6}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Faculty Name</label>
                    <input 
                      type="text" 
                      style={styles.input}
                      name="faculty_name"
                      value={formData.faculty_name}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </div>
                <div style={styles.col6}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Class Name</label>
                    <input 
                      type="text" 
                      style={styles.input}
                      name="class_name"
                      value={formData.class_name}
                      onChange={handleChange}
                      placeholder="e.g., IT-2023-A"
                      required 
                    />
                  </div>
                </div>
              </div>
              <div style={styles.row}>
                <div style={styles.col6}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Week of Reporting</label>
                    <select 
                      style={styles.select}
                      name="week_of_reporting"
                      value={formData.week_of_reporting}
                      onChange={handleChange}
                      required
                    >
                      {[...Array(10).keys()].map(week => (
                        <option key={week + 1} value={week + 1}>Week {week + 1}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={styles.col6}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Date of Lecture</label>
                    <input 
                      type="date" 
                      style={styles.input}
                      name="date_of_lecture"
                      value={formData.date_of_lecture}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.formSection}>
              <h5 style={styles.sectionTitle}>Course Details</h5>
              <div style={styles.row}>
                <div style={styles.col6}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Course Name</label>
                    <input 
                      type="text" 
                      style={styles.input}
                      name="course_name"
                      value={formData.course_name}
                      onChange={handleChange}
                      placeholder="e.g., Web Development"
                      required 
                    />
                  </div>
                </div>
                <div style={styles.col6}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Course Code</label>
                    <input 
                      type="text" 
                      style={styles.input}
                      name="course_code"
                      value={formData.course_code}
                      onChange={handleChange}
                      placeholder="e.g., DIWA2110"
                      required 
                    />
                  </div>
                </div>
              </div>
              <div style={styles.row}>
                <div style={styles.col6}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Lecturer's Name</label>
                    <input 
                      type="text" 
                      style={styles.input}
                      name="lecturer_name"
                      value={formData.lecturer_name}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </div>
                <div style={styles.col6}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Venue of the Class</label>
                    <input 
                      type="text" 
                      style={styles.input}
                      name="venue"
                      value={formData.venue}
                      onChange={handleChange}
                      placeholder="e.g., Room 101"
                      required 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.formSection}>
              <h5 style={styles.sectionTitle}>Attendance Information</h5>
              <div style={styles.row}>
                <div style={styles.col6}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Actual Number of Students Present</label>
                    <input 
                      type="number" 
                      style={styles.input}
                      name="actual_students_present"
                      value={formData.actual_students_present}
                      onChange={handleChange}
                      min="0" 
                      required 
                    />
                  </div>
                </div>
                <div style={styles.col6}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Total Number of Registered Students</label>
                    <input 
                      type="number" 
                      style={styles.input}
                      name="total_registered_students"
                      value={formData.total_registered_students}
                      onChange={handleChange}
                      min="0" 
                      required 
                    />
                  </div>
                </div>
              </div>
              <div style={styles.row}>
                <div style={styles.col6}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Scheduled Lecture Time</label>
                    <input 
                      type="time" 
                      style={styles.input}
                      name="scheduled_time"
                      value={formData.scheduled_time}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.formSection}>
              <h5 style={styles.sectionTitle}>Teaching Details</h5>
              <div style={styles.formGroup}>
                <label style={styles.label}>Topic Taught</label>
                <textarea 
                  style={styles.textarea}
                  name="topic_taught"
                  value={formData.topic_taught}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe the topic covered in this lecture..."
                  required
                ></textarea>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Learning Outcomes of the Topic</label>
                <textarea 
                  style={styles.textarea}
                  name="learning_outcomes"
                  value={formData.learning_outcomes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="What should students be able to do after this lecture?"
                  required
                ></textarea>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Lecturer's Recommendations</label>
                <textarea 
                  style={styles.textarea}
                  name="recommendations"
                  value={formData.recommendations}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any recommendations for improvement?"
                ></textarea>
              </div>
            </div>

            <div style={styles.formActions}>
              <button 
                type="button" 
                style={styles.secondaryButton}
                onClick={() => setCurrentPage('reports')}
              >
                Cancel
              </button>
              <button type="submit" style={styles.primaryButton} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Dashboard Component
  const Dashboard = () => {
    const stats = [
      { title: 'Total Reports', value: reports.length, icon: '📋', color: '#3498db' },
      { title: 'Approved Reports', value: reports.filter(r => r.status === 'approved').length, icon: '✅', color: '#2ecc71' },
      { title: 'Pending Reports', value: reports.filter(r => r.status === 'pending').length, icon: '⏳', color: '#f39c12' },
      { title: 'Students Present', value: reports.reduce((acc, report) => acc + parseInt(report.actual_students_present || 0), 0), icon: '👨‍🎓', color: '#9b59b6' }
    ];

    return (
      <div>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Dashboard</h1>
          <p style={styles.pageSubtitle}>Welcome back, {currentUser.name}!</p>
        </div>

        <div style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} style={{...styles.statCard, backgroundColor: stat.color}}>
              <div style={styles.statContent}>
                <h3 style={styles.statValue}>{stat.value}</h3>
                <p style={styles.statTitle}>{stat.title}</p>
              </div>
              <span style={styles.statIcon}>{stat.icon}</span>
            </div>
          ))}
        </div>

        <div style={styles.dashboardContent}>
          <div style={styles.mainContent}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                Recent Reports
              </div>
              <div style={styles.cardBody}>
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Date</th>
                        <th style={styles.tableHeader}>Course</th>
                        <th style={styles.tableHeader}>Lecturer</th>
                        <th style={styles.tableHeader}>Students</th>
                        <th style={styles.tableHeader}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.slice(0, 5).map(report => (
                        <tr key={report.id} style={styles.tableRow}>
                          <td style={styles.tableCell}>{report.date_of_lecture}</td>
                          <td style={styles.tableCell}>{report.course_name}</td>
                          <td style={styles.tableCell}>{report.lecturer_name}</td>
                          <td style={styles.tableCell}>{report.actual_students_present}/{report.total_registered_students}</td>
                          <td style={styles.tableCell}>
                            <span style={{
                              ...styles.badge,
                              backgroundColor: report.status === 'approved' ? '#28a745' : '#ffc107',
                              color: report.status === 'approved' ? 'white' : 'black'
                            }}>
                              {report.status === 'approved' ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {reports.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{...styles.tableCell, textAlign: 'center', color: '#6c757d'}}>
                            No reports yet. Create your first report!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div style={styles.sidebarContent}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                Quick Actions
              </div>
              <div style={styles.cardBody}>
                <div style={styles.buttonGroup}>
                  <button 
                    style={styles.primaryButton}
                    onClick={() => setCurrentPage('reports')}
                  >
                    📋 View All Reports
                  </button>
                  {currentUser.role === 'lecturer' && (
                    <button 
                      style={styles.successButton}
                      onClick={() => setCurrentPage('new-report')}
                    >
                      ➕ Create New Report
                    </button>
                  )}
                  <button 
                    style={styles.infoButton}
                    onClick={exportToExcel}
                  >
                    📊 Export Reports
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Reports Component
  const Reports = () => {
    return (
      <div>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Reports</h1>
          <div style={styles.headerActions}>
            <div style={styles.searchBox}>
              <input 
                type="text" 
                style={styles.searchInput}
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button style={styles.searchButton}>🔍</button>
            </div>
            <button style={styles.exportButton} onClick={exportToExcel}>
              📊 Export to CSV
            </button>
            {currentUser.role === 'lecturer' && (
              <button 
                style={styles.primaryButton}
                onClick={() => setCurrentPage('new-report')}
              >
                ➕ New Report
              </button>
            )}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            Lecture Reports
          </div>
          <div style={styles.cardBody}>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Week</th>
                    <th style={styles.tableHeader}>Date</th>
                    <th style={styles.tableHeader}>Course</th>
                    <th style={styles.tableHeader}>Lecturer</th>
                    <th style={styles.tableHeader}>Students Present</th>
                    <th style={styles.tableHeader}>Topic</th>
                    <th style={styles.tableHeader}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map(report => (
                    <tr key={report.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>Week {report.week_of_reporting}</td>
                      <td style={styles.tableCell}>{report.date_of_lecture}</td>
                      <td style={styles.tableCell}>{report.course_name} ({report.course_code})</td>
                      <td style={styles.tableCell}>{report.lecturer_name}</td>
                      <td style={styles.tableCell}>{report.actual_students_present}/{report.total_registered_students}</td>
                      <td style={styles.tableCell}>{report.topic_taught}</td>
                      <td style={styles.tableCell}>
                        <span style={{
                          ...styles.badge,
                          backgroundColor: report.status === 'approved' ? '#28a745' : '#ffc107',
                          color: report.status === 'approved' ? 'white' : 'black'
                        }}>
                          {report.status === 'approved' ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredReports.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{...styles.tableCell, textAlign: 'center', color: '#6c757d', padding: '2rem'}}>
                        No reports found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Sidebar Component
  const Sidebar = () => {
    const menuItems = [
      { id: 'dashboard', icon: '📊', label: 'Dashboard' },
      { id: 'reports', icon: '📋', label: 'Reports' },
    ];

    if (currentUser.role === 'lecturer') {
      menuItems.push({ id: 'new-report', icon: '➕', label: 'New Report' });
    }

    menuItems.push(
      { id: 'classes', icon: '👥', label: 'Classes' },
      { id: 'courses', icon: '📖', label: 'Courses' },
      { id: 'monitoring', icon: '📈', label: 'Monitoring' },
      { id: 'rating', icon: '⭐', label: 'Rating' }
    );

    if (currentUser.role === 'program_leader') {
      menuItems.push({ id: 'lecturers', icon: '👨‍🏫', label: 'Lecturers' });
    }

    return (
      <div style={styles.sidebar}>
        <div style={styles.sidebarContent}>
          {menuItems.map(item => (
            <button 
              key={item.id}
              style={{
                ...styles.sidebarItem,
                ...(currentPage === item.id ? styles.sidebarItemActive : {})
              }}
              onClick={() => setCurrentPage(item.id)}
            >
              <span style={styles.sidebarIcon}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Header Component
  const Header = () => {
    const getRoleDisplayName = (role) => {
      const roleMap = {
        student: 'Student',
        lecturer: 'Lecturer',
        principal_lecturer: 'Principal Lecturer',
        program_leader: 'Program Leader'
      };
      return roleMap[role] || role;
    };

    return (
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <span style={styles.logo}>
            <span style={styles.logoIcon}>📊</span>
            LUCT Faculty Reporting System
          </span>
          <div style={styles.userMenu}>
            <span style={styles.userInfo}>
              👤 {currentUser.name} ({getRoleDisplayName(currentUser.role)})
            </span>
            <button style={styles.logoutButton} onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </header>
    );
  };

  // Render appropriate page
  const renderPage = () => {
    switch(currentPage) {
      case 'login':
        return <Login />;
      case 'register':
        return <Register />;
      case 'new-report':
        return <ReportForm />;
      case 'dashboard':
        return <Dashboard />;
      case 'reports':
        return <Reports />;
      default:
        return (
          <div>
            <div style={styles.pageHeader}>
              <h1 style={styles.pageTitle}>
                {currentPage.charAt(0).toUpperCase() + currentPage.slice(1).replace('-', ' ')}
              </h1>
            </div>
            <div style={styles.card}>
              <div style={styles.cardBody}>
                <p style={styles.mutedText}>
                  This page is under development. Currently viewing: {currentPage}
                </p>
                <button 
                  style={styles.primaryButton}
                  onClick={() => setCurrentPage('reports')}
                >
                  Go to Reports
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  // Main render
  if (!currentUser) {
    return (
      <div style={styles.app}>
        {currentPage === 'login' ? <Login /> : <Register />}
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <Header />
      <div style={styles.container}>
        <Sidebar />
        <main style={styles.main}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

// Styles (copy the exact same styles object from previous working version)
const styles = {
  app: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    minHeight: '100vh',
    backgroundColor: '#f8f9fa'
  },
  container: {
    display: 'flex',
    minHeight: 'calc(100vh - 60px)'
  },
  main: {
    flex: 1,
    padding: '20px',
    marginLeft: '250px'
  },
  header: {
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '0 20px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  },
  logo: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center'
  },
  logoIcon: {
    marginRight: '10px',
    fontSize: '1.5rem'
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  userInfo: {
    fontSize: '0.9rem'
  },
  logoutButton: {
    background: 'none',
    border: '1px solid rgba(255,255,255,0.3)',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  sidebar: {
    width: '250px',
    backgroundColor: '#2c3e50',
    position: 'fixed',
    height: 'calc(100vh - 60px)',
    overflowY: 'auto'
  },
  sidebarContent: {
    padding: '20px 0'
  },
  sidebarItem: {
    width: '100%',
    padding: '12px 20px',
    border: 'none',
    background: 'none',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'left',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px'
  },
  sidebarItemActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white'
  },
  sidebarIcon: {
    marginRight: '10px',
    fontSize: '16px'
  },
  loginContainer: {
    maxWidth: '400px',
    margin: '100px auto',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'white'
  },
  loginTitle: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#2c3e50'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '500',
    color: '#495057'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
    backgroundColor: 'white'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: '80px'
  },
  primaryButton: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  successButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  infoButton: {
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  authLink: {
    textAlign: 'center',
    marginTop: '20px'
  },
  link: {
    color: '#3498db',
    textDecoration: 'none'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    overflow: 'hidden'
  },
  cardHeader: {
    padding: '15px 20px',
    borderBottom: '1px solid #e9ecef',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardBody: {
    padding: '20px'
  },
  formSection: {
    marginBottom: '25px',
    paddingBottom: '15px',
    borderBottom: '1px solid #e9ecef'
  },
  sectionTitle: {
    color: '#2c3e50',
    marginBottom: '15px',
    paddingBottom: '8px',
    borderBottom: '2px solid #3498db',
    display: 'inline-block'
  },
  row: {
    display: 'flex',
    gap: '20px',
    marginBottom: '15px'
  },
  col6: {
    flex: 1
  },
  formActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '20px'
  },
  pageHeader: {
    borderBottom: '1px solid #dee2e6',
    paddingBottom: '15px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  pageTitle: {
    color: '#2c3e50',
    margin: 0
  },
  pageSubtitle: {
    color: '#6c757d',
    margin: 0
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  searchInput: {
    border: 'none',
    padding: '8px 12px',
    outline: 'none',
    minWidth: '200px'
  },
  searchButton: {
    border: 'none',
    background: '#f8f9fa',
    padding: '8px 12px',
    cursor: 'pointer'
  },
  exportButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    borderRadius: '8px',
    padding: '20px',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statContent: {
    flex: 1
  },
  statValue: {
    fontSize: '2rem',
    margin: '0 0 5px 0',
    fontWeight: 'bold'
  },
  statTitle: {
    margin: 0,
    fontSize: '0.9rem',
    opacity: 0.9
  },
  statIcon: {
    fontSize: '2rem'
  },
  dashboardContent: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '20px'
  },
  mainContent: {
    gridColumn: '1'
  },
  sidebarContent: {
    gridColumn: '2'
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  tableContainer: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
    padding: '12px',
    textAlign: 'left',
    fontWeight: '600',
    borderBottom: '1px solid #dee2e6'
  },
  tableRow: {
    borderBottom: '1px solid #dee2e6'
  },
  tableCell: {
    padding: '12px',
    borderBottom: '1px solid #dee2e6'
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '500'
  },
  mutedText: {
    color: '#6c757d',
    marginBottom: '15px'
  }
};

export default App;