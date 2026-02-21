import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import './App.css';
import HomePage from './Components/HomePage.jsx';
import AuthPage from './Components/Register.jsx';
import MainPage from './Components/MainPage.jsx';
import DoctorAppointment from './Components/DoctorAppointment.jsx';

import FitnessDashboard from './Components/FitnessDashboard.jsx';
import ChatBot from './Components/ChatBot.jsx';
import UserReportUpload from './Components/UserReportUpload.jsx';
import Assessment from './Components/Assessment.jsx';
import SkinDetection from './Components/SkinDetection.jsx';
import NutritionPlanner from './Components/NutritionPlanner.jsx';
import { getCurrentUser } from './store/authSlice.js';

// Generic auth guard (any logged-in user)
function ProtectedRoute({ children }) {
  const { user } = useSelector((state) => state.auth);
  const token = localStorage.getItem('accessToken');

  if (!user && !token) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  return children;
}

// Patient-only route
function PatientRoute({ children }) {
  const { user } = useSelector((state) => state.auth);
  const token = localStorage.getItem('accessToken');

  if (!user && !token) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  // If we know the role and it's not patient, send doctors to their home
  if (user && user.usertype && user.usertype !== 'patient') {
    return <Navigate to="/doctor/appointments" replace />;
  }

  return children;
}

// Doctor-only route
function DoctorRoute({ children }) {
  const { user } = useSelector((state) => state.auth);
  const token = localStorage.getItem('accessToken');

  if (!user && !token) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  // If we know the role and it's not doctor, send patients to their home
  if (user && user.usertype && user.usertype !== 'doctor') {
    return <Navigate to="/main" replace />;
  }

  return children;
}

function App() {
  const dispatch = useDispatch();

  // Initialize auth on app load - restore user data if token exists
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Attempt to restore user data from backend
      dispatch(getCurrentUser());
    }
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />

      {/* Patient area */}
      <Route
        path="/main"
        element={
          <PatientRoute>
            <MainPage />
          </PatientRoute>
        }
      />

      {/* Fitness Dashboard */}
      <Route
        path="/fitness-dashboard"
        element={
          <PatientRoute>
            <FitnessDashboard />
          </PatientRoute>
        }
      />

      {/* Assessment - CBT, DBT, PHQ-9 */}
      <Route
        path="/assessment"
        element={
          <PatientRoute>
            <Assessment />
          </PatientRoute>
        }
      />

      {/* Skin Detection */}
      <Route
        path="/skin-detection"
        element={
          <PatientRoute>
            <SkinDetection />
          </PatientRoute>
        }
      />

      {/* Nutrition Planner */}
      <Route
        path="/nutrition-planner"
        element={
          <PatientRoute>
            <NutritionPlanner />
          </PatientRoute>
        }
      />

      {/* Chat Bot */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatBot />
          </ProtectedRoute>
        }
      />

      {/* Upload Medical Report */}
      <Route
        path="/upload-report"
        element={
          <ProtectedRoute>
            <UserReportUpload />
          </ProtectedRoute>
        }
      />

      {/* Doctor area */}
      <Route
        path="/doctor/appointments"
        element={
          <DoctorRoute>
            <DoctorAppointment />
          </DoctorRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
