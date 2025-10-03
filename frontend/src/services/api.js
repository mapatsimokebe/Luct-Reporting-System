const API_URL = 'http://localhost:5000/api';

// Simple API service with error handling
export const api = {
  // Auth endpoints
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        throw new Error('Registration failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Reports endpoints
  getReports: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await fetch(`${API_URL}/reports?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get reports error:', error);
      throw error;
    }
  },

  createReport: async (reportData) => {
    try {
      const response = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create report');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Create report error:', error);
      throw error;
    }
  },

  exportReports: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await fetch(`${API_URL}/reports/export?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  },

  // Courses endpoint
  getCourses: async () => {
    try {
      const response = await fetch(`${API_URL}/courses`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get courses error:', error);
      throw error;
    }
  },

  // Classes endpoint  
  getClasses: async () => {
    try {
      const response = await fetch(`${API_URL}/classes`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get classes error:', error);
      throw error;
    }
  },
};

export default api;