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
import MedicationAdherenceTracker from './Components/MedicationAdherenceTracker.jsx';
import Appointmentbooking from './Components/Appointmentbooking.jsx';
import SmartCarePlanGenerator from './Components/SmartCarePlanGenerator.jsx';
import SkinDetection from './Components/SkinDetection.jsx';
import NutritionPlanner from './Components/NutritionPlanner.jsx';
import { getCurrentUser } from './store/authSlice.js';

// Generic auth guard — redirects to login if not logged in
function ProtectedRoute({ children }) {
  const { user } = useSelector((state) => state.auth);
  const savedUser = localStorage.getItem('user');

  if (!user && !savedUser) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  return children;
}

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      dispatch(getCurrentUser());
    }
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />

      <Route path="/main" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
      <Route path="/fitness-dashboard" element={<ProtectedRoute><FitnessDashboard /></ProtectedRoute>} />
      <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
      <Route path="/skin-detection" element={<ProtectedRoute><SkinDetection /></ProtectedRoute>} />
      <Route path="/nutrition-planner" element={<ProtectedRoute><NutritionPlanner /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><ChatBot /></ProtectedRoute>} />
      <Route path="/upload-report" element={<ProtectedRoute><UserReportUpload /></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute><Appointmentbooking /></ProtectedRoute>} />
      <Route path="/medication-tracker" element={<ProtectedRoute><MedicationAdherenceTracker /></ProtectedRoute>} />
      <Route path="/care-plan" element={<ProtectedRoute><SmartCarePlanGenerator /></ProtectedRoute>} />
      <Route path="/doctor/appointments" element={<ProtectedRoute><DoctorAppointment /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
