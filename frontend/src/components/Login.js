// src/components/auth/Login.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate authentication
    const user = {
      id: 1,
      name: 'John Doe',
      email: formData.email,
      role: formData.role
    };
    localStorage.setItem('currentUser', JSON.stringify(user));
    onLogin(user);
  };

  return (
    <div className="login-container">
      <h2 className="text-center mb-4">LUCT Faculty Reporting</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email address</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="role" className="form-label">Role</label>
          <select
            className="form-select"
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="">Select Role</option>
            <option value="student">Student</option>
            <option value="lecturer">Lecturer</option>
            <option value="principal_lecturer">Principal Lecturer</option>
            <option value="program_leader">Program Leader</option>
          </select>
        </div>
        <div className="d-grid">
          <button type="submit" className="btn btn-primary">Login</button>
        </div>
        <div className="text-center mt-3">
          <Link to="/register">Don't have an account? Register</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;