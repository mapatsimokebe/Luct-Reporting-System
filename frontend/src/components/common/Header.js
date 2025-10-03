// src/components/common/Header.js
import React from 'react';

const Header = ({ currentUser, onLogout }) => {
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
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          <i className="fas fa-chalkboard-teacher me-2"></i>
          LUCT Faculty Reporting System
        </a>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown">
                <i className="fas fa-user-circle me-1"></i> 
                {currentUser.name} ({getRoleDisplayName(currentUser.role)})
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#"><i className="fas fa-user me-2"></i>Profile</a></li>
                <li><a className="dropdown-item" href="#"><i className="fas fa-cog me-2"></i>Settings</a></li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item" onClick={onLogout}>
                    <i className="fas fa-sign-out-alt me-2"></i>Logout
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;