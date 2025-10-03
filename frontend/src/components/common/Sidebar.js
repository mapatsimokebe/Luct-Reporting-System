// src/components/common/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ currentUser }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const getMenuItems = () => {
    const baseItems = [
      { path: '/dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
      { path: '/classes', icon: 'fas fa-users', label: 'Classes' },
      { path: '/reports', icon: 'fas fa-file-alt', label: 'Reports' },
      { path: '/courses', icon: 'fas fa-book', label: 'Courses' },
      { path: '/monitoring', icon: 'fas fa-chart-line', label: 'Monitoring' },
      { path: '/rating', icon: 'fas fa-star', label: 'Rating' }
    ];

    if (currentUser.role === 'program_leader') {
      baseItems.push({ path: '/lecturers', icon: 'fas fa-user-tie', label: 'Lecturers' });
    }

    return baseItems;
  };

  return (
    <div className="col-md-3 col-lg-2 d-md-block sidebar collapse">
      <div className="position-sticky pt-3">
        <ul className="nav flex-column">
          {getMenuItems().map((item, index) => (
            <li className="nav-item" key={index}>
              <Link 
                to={item.path} 
                className={`nav-link ${isActive(item.path)}`}
              >
                <i className={item.icon}></i>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;