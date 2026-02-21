// src/store/authSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authAPI } from "../utils/api.js";

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null, // read from localStorage
  error: null,
  isLoading: false,
};

// Async thunks for API calls
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.registerPatient(userData);
      // After registration, automatically login
      const loginResponse = await authAPI.login({
        email: userData.email,
        password: userData.password,
      });
      return loginResponse.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const registerDoctor = createAsyncThunk(
  'auth/registerDoctor',
  async (doctorData, { rejectWithValue }) => {
    try {
      const response = await authAPI.registerDoctor(doctorData);
      // After registration, automatically login
      const loginResponse = await authAPI.login({
        email: doctorData.email,
        password: doctorData.password,
      });
      return loginResponse.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Doctor registration failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      return null;
    } catch (error) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getCurrentUser();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get user');
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    initializeAuth(state) {
      // Check if user is logged in by checking for token
      const token = localStorage.getItem('accessToken');
      if (token) {
        // Token exists, but we don't have user data yet
        // User data will be fetched when needed
        state.user = { token };
      }
    },
  },
  extraReducers: (builder) => {
    // Register User
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        localStorage.setItem('user', JSON.stringify(action.payload.user)); // save user
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.user = null;
      });

    // Register Doctor
    builder
      .addCase(registerDoctor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerDoctor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        localStorage.setItem('user', JSON.stringify(action.payload.user)); // save user
        state.error = null;
      })
      .addCase(registerDoctor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.user = null;
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        localStorage.setItem('user', JSON.stringify(action.payload.user)); // save user
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.user = null;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        localStorage.removeItem('user'); // clear user
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.user = null;
        localStorage.removeItem('user'); // clear user even on error
      });

    // Get Current User
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        localStorage.setItem('user', JSON.stringify(action.payload.user)); // update user
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.user = null;
        localStorage.removeItem('user'); // clear on 401
      });

  },
});

export const { clearError, setError, initializeAuth } = authSlice.actions;
export default authSlice.reducer;