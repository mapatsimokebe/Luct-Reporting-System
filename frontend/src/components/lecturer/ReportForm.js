// src/components/lecturer/ReportForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ReportForm = ({ currentUser }) => {
  const [formData, setFormData] = useState({
    facultyName: '',
    className: '',
    weekOfReporting: '',
    dateOfLecture: '',
    courseName: '',
    courseCode: '',
    lecturerName: currentUser.name,
    actualStudentsPresent: '',
    totalRegisteredStudents: '',
    venue: '',
    scheduledTime: '',
    topicTaught: '',
    learningOutcomes: '',
    recommendations: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Save report to localStorage (simulating backend)
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    const newReport = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString(),
      status: 'pending',
      lecturerId: currentUser.id
    };
    
    reports.push(newReport);
    localStorage.setItem('reports', JSON.stringify(reports));
    
    alert('Report submitted successfully!');
    navigate('/reports');
  };

  return (
    <div className="card">
      <div className="card-header">
        Lecturer Reporting Form
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="report-form-section">
            <h5>Basic Information</h5>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="facultyName" className="form-label">Faculty Name</label>
                <select 
                  className="form-select" 
                  id="facultyName"
                  name="facultyName"
                  value={formData.facultyName}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Faculty</option>
                  <option value="ict">Faculty of Information Communication Technology</option>
                  <option value="business">Faculty of Business</option>
                  <option value="design">Faculty of Design</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="className" className="form-label">Class Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="className"
                  name="className"
                  value={formData.className}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="weekOfReporting" className="form-label">Week of Reporting</label>
                <select 
                  className="form-select" 
                  id="weekOfReporting"
                  name="weekOfReporting"
                  value={formData.weekOfReporting}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Week</option>
                  {[...Array(10).keys()].map(week => (
                    <option key={week + 1} value={week + 1}>Week {week + 1}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="dateOfLecture" className="form-label">Date of Lecture</label>
                <input 
                  type="date" 
                  className="form-control" 
                  id="dateOfLecture"
                  name="dateOfLecture"
                  value={formData.dateOfLecture}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>
          </div>

          <div className="report-form-section">
            <h5>Course Details</h5>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="courseName" className="form-label">Course Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="courseName"
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="courseCode" className="form-label">Course Code</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="courseCode"
                  name="courseCode"
                  value={formData.courseCode}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="lecturerName" className="form-label">Lecturer's Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="lecturerName"
                  name="lecturerName"
                  value={formData.lecturerName}
                  onChange={handleChange}
                  required 
                  disabled
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="venue" className="form-label">Venue of the Class</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="venue"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>
          </div>

          <div className="report-form-section">
            <h5>Attendance Information</h5>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="actualStudentsPresent" className="form-label">Actual Number of Students Present</label>
                <input 
                  type="number" 
                  className="form-control" 
                  id="actualStudentsPresent"
                  name="actualStudentsPresent"
                  value={formData.actualStudentsPresent}
                  onChange={handleChange}
                  min="0" 
                  required 
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="totalRegisteredStudents" className="form-label">Total Number of Registered Students</label>
                <input 
                  type="number" 
                  className="form-control" 
                  id="totalRegisteredStudents"
                  name="totalRegisteredStudents"
                  value={formData.totalRegisteredStudents}
                  onChange={handleChange}
                  min="0" 
                  required 
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="scheduledTime" className="form-label">Scheduled Lecture Time</label>
                <input 
                  type="time" 
                  className="form-control" 
                  id="scheduledTime"
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>
          </div>

          <div className="report-form-section">
            <h5>Teaching Details</h5>
            <div className="mb-3">
              <label htmlFor="topicTaught" className="form-label">Topic Taught</label>
              <textarea 
                className="form-control" 
                id="topicTaught"
                name="topicTaught"
                value={formData.topicTaught}
                onChange={handleChange}
                rows="3" 
                required
              ></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="learningOutcomes" className="form-label">Learning Outcomes of the Topic</label>
              <textarea 
                className="form-control" 
                id="learningOutcomes"
                name="learningOutcomes"
                value={formData.learningOutcomes}
                onChange={handleChange}
                rows="3" 
                required
              ></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="recommendations" className="form-label">Lecturer's Recommendations</label>
              <textarea 
                className="form-control" 
                id="recommendations"
                name="recommendations"
                value={formData.recommendations}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>
          </div>

          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <button 
              type="button" 
              className="btn btn-secondary me-md-2" 
              onClick={() => navigate('/reports')}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">Submit Report</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;