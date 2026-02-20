// API configuration and utility functions
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('accessToken');

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include', // Important for cookies
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// Auth API functions
export const authAPI = {
  // Register Patient
  registerPatient: async (userData) => {
    const response = await apiRequest('/users/auth/register/patient', {
      method: 'POST',
      body: JSON.stringify({
        username: userData.name || userData.username,
        email: userData.email,
        password: userData.password,
      }),
    });
    return response;
  },

  // Register Doctor
  registerDoctor: async (doctorData) => {
    const response = await apiRequest('/users/auth/register/doctor', {
      method: 'POST',
      body: JSON.stringify({
        username: doctorData.name || doctorData.username,
        email: doctorData.email,
        password: doctorData.password,
        specialization: doctorData.specialty || doctorData.specialization,
        licenseNumber: doctorData.licenseNumber || `LIC-${Date.now()}`,
        clinicAddress: doctorData.clinicAddress || doctorData.address,
        clinicTiming: doctorData.clinicTiming,
        experience: doctorData.experience || 0,
        consultationFee: doctorData.consultationFee || 0,
        qualifications: doctorData.qualifications || [],
        bio: doctorData.bio || '',
      }),
    });
    return response;
  },

  // Login
  login: async (credentials) => {
    const response = await apiRequest('/users/login', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });
    
    // Store access token
    if (response.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    
    return response;
  },

  // Logout
  logout: async () => {
    try {
      await apiRequest('/users/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiRequest('/users/profile', {
      method: 'GET',
    });
    return response;
  },
};

export default apiRequest;
