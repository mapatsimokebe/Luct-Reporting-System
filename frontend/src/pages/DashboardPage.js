// src/pages/DashboardPage.js
import React from 'react';

const DashboardPage = ({ currentUser }) => {
  const stats = [
    { title: 'Lectures This Week', value: 24, icon: 'fas fa-chalkboard-teacher', color: 'lectures' },
    { title: 'Students Present', value: 156, icon: 'fas fa-user-graduate', color: 'students' },
    { title: 'Active Courses', value: 12, icon: 'fas fa-book', color: 'courses' },
    { title: 'Reports Submitted', value: 48, icon: 'fas fa-file-alt', color: 'reports' }
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="h2">Dashboard</h1>
        <p className="text-muted">Welcome back, {currentUser.name}!</p>
      </div>

      <div className="row dashboard-stats">
        {stats.map((stat, index) => (
          <div className="col-md-3" key={index}>
            <div className={`stat-card ${stat.color}`}>
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
              <i className={`${stat.icon} fa-2x`}></i>
            </div>
          </div>
        ))}
      </div>

      <div className="row mt-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              Recent Reports
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Course</th>
                      <th>Lecturer</th>
                      <th>Students</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>2023-10-15</td>
                      <td>Web Development</td>
                      <td>Dr. Smith</td>
                      <td>24/30</td>
                      <td><span className="badge bg-success">Completed</span></td>
                    </tr>
                    <tr>
                      <td>2023-10-14</td>
                      <td>Database Systems</td>
                      <td>Prof. Johnson</td>
                      <td>28/32</td>
                      <td><span className="badge bg-success">Completed</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              Upcoming Lectures
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Web Development
                  <span className="badge bg-primary rounded-pill">Today, 10:00</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Database Systems
                  <span className="badge bg-primary rounded-pill">Tomorrow, 14:00</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;