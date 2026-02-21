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
        dob: userData.dob,
        bloodGroup: userData.bloodGroup,
        gender: userData.gender,
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

// ML API configuration for medical RAG
const ML_API_BASE_URL = import.meta.env.VITE_ML_API_BASE_URL || 'http://localhost:8000';

// ML API functions for chatbot and report upload
export const mlAPI = {
  // Chat with AI health assistant
  chat: async (userId, question, watchData = null) => {
    const url = `${ML_API_BASE_URL}/chat/`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: String(userId),
          question: question,
          watch_data: watchData || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Chat API error:', error);
      throw error;
    }
  },

  // Upload medical record
  uploadMedicalRecord: async (userId, file) => {
    const url = `${ML_API_BASE_URL}/upload-medical-record/?user_id=${encodeURIComponent(userId)}`;
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Upload API error:', error);
      throw error;
    }
  },

  // Save chat for digital twin analysis
  saveChat: async (userId, question, response, personalizedMode = false) => {
    const url = `${ML_API_BASE_URL}/save-chat/`;
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: String(userId),
          question: question,
          response: response,
          personalized_mode: personalizedMode,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to save chat: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error('Save chat error:', error);
      throw error;
    }
  },

  // Get digital twin analysis
  getDigitalTwin: async (userId) => {
    const url = `${ML_API_BASE_URL}/digital-twin/${userId}`;
    
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to get digital twin: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Digital twin error:', error);
      throw error;
    }
  },

  // Get chat history
  getChatHistory: async (userId, limit = 50) => {
    const url = `${ML_API_BASE_URL}/chat-history/${userId}?limit=${limit}`;
    
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to get chat history: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Chat history error:', error);
      throw error;
    }
  },
};

export default apiRequest;
