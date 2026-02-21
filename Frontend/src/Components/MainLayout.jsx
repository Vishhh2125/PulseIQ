import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';

export default function MainLayout({ children }) {
  const { user } = useSelector((state) => state.auth);
  
  // Hide sidebar if user is a doctor
  const isDoctor = user?.role === 'doctor' || user?.usertype === 'doctor';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ── Sidebar (Hidden for Doctors) ── */}
      {!isDoctor && <Sidebar />}

      {/* ── Page Content ── */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}