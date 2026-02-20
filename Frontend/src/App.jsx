import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './App.css';
import HomePage from './Components/HomePage.jsx';
import AuthPage from './Components/Register.jsx';
import MainPage from './Components/MainPage.jsx';
import DoctorAppointment from './Components/DoctorAppointment.jsx';

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
