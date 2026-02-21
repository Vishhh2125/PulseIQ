import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Search,
  ChevronLeft,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader,
  X,
  Users,
  TrendingUp,
} from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";

export default function DoctorAppointment({ onBack }) {
  const { user } = useSelector((state) => state.auth);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  const [notes, setNotes] = useState("");

  // Fetch doctor's appointments
  useEffect(() => {
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      
      // Check if token exists
      if (!token) {
        setError("Please login as a doctor to view appointments");
        return;
      }

      console.log("Token exists:", token.substring(0, 20) + "..."); // Debug log

      const response = await fetch(
        "http://localhost:5000/api/v1/appointments/doctor",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      console.log("Response status:", response.status);

      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        setError("Session expired. Please login again.");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch appointments");
      }

      const data = await response.json();
      console.log("Appointments response:", data);

      const transformed = (data.data.appointments || []).map((apt) => {
        const appointmentDate = new Date(apt.appointmentDate);
        const patientName = apt.patientId?.username || "Patient";
        
        return {
          id: apt._id,
          patient: patientName,
          email: apt.patientId?.email || "N/A",
          phone: apt.patientPhoneNumber || "N/A",
          avatar: patientName.charAt(0).toUpperCase(),
          reason: apt.reason || "General Checkup",
          date: appointmentDate.toLocaleDateString("en-US", { 
            weekday: "short", 
            month: "short", 
            day: "numeric" 
          }),
          time: apt.appointmentTime,
          type: apt.mode === "online" ? "video" : "clinic",
          status: apt.status || "booked",
          createdAt: apt.createdAt,
        };
      });

      setBookings(transformed);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (user?.usertype === "doctor") {
    fetchAppointments();
  }
}, [user]);
  // Mark appointment as completed
  const handleMarkCompleted = async (appointmentId) => {
    try {
      setCompletingId(appointmentId);

      const response = await fetch(
        `http://localhost:5000/api/v1/appointments/${appointmentId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({ status: "completed" }),
        }
      );

      if (response.ok) {
        // Update local bookings
        setBookings((prev) =>
          prev.map((b) =>
            b.id === appointmentId ? { ...b, status: "completed" } : b
          )
        );
        setSelectedBooking(null);
        setNotes("");
        alert("✅ Appointment marked as completed!");
      } else {
        alert("❌ Failed to update appointment");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Error: " + err.message);
    } finally {
      setCompletingId(null);
    }
  };

  const bookedAppointments = bookings.filter((b) => b.status === "booked");
  const completedAppointments = bookings.filter((b) => b.status === "completed");

  const filtered = bookings.filter((b) =>
    b.patient.toLowerCase().includes(search.toLowerCase()) ||
    b.reason.toLowerCase().includes(search.toLowerCase())
  );

  if (!user || user.usertype !== "doctor") {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Please login as a doctor to view appointments</p>
          <button
            onClick={() => window.location.href = '/auth?mode=login'}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
}
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Header ── */}
     <div className="bg-white border-b border-slate-100">
  <div className="max-w-6xl mx-auto px-6 py-6 flex items-start justify-between">
    
    {/* Left Section */}
    <div>
      <button
        onClick={onBack || (() => window.history.back())}
        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 text-sm font-semibold transition-colors mb-4"
      >
        <ChevronLeft size={16} />
        Back
      </button>

      <h1 className="text-3xl font-bold text-slate-900">
        My Appointments
      </h1>

      <p className="text-slate-400 text-sm mt-1">
        View and manage patient bookings
      </p>
    </div>

    {/* Right Section */}
    <div>
      <ProfileDropdown />
    </div>

  </div>
</div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-semibold mb-1">Total Bookings</p>
                <p className="text-2xl font-bold text-slate-900">{bookings.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Users size={18} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-semibold mb-1">Booked</p>
                <p className="text-2xl font-bold text-slate-900">{bookedAppointments.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock size={18} className="text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-semibold mb-1">Completed</p>
                <p className="text-2xl font-bold text-slate-900">{completedAppointments.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 size={18} className="text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="mb-6">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name or reason..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            />
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader size={32} className="animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-slate-600 font-semibold">Loading appointments...</p>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex gap-4 mb-6">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-900 font-semibold text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* ── Appointments List ── */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {booking.avatar}
                    </div>

                    {/* Patient Info */}
                    <div>
                      <h3 className="text-slate-900 font-bold text-base mb-1">
                        {booking.patient}
                      </h3>
                      <p className="text-slate-500 text-xs mb-3">{booking.email}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <Phone size={12} />
                          {booking.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          {booking.date} at {booking.time}
                        </div>
                        <span className={`px-2 py-1 rounded-lg font-semibold ${
                          booking.type === "video"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {booking.type === "video" ? "Video Call" : "In-Clinic"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                      booking.status === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {booking.status === "completed" ? "Completed" : "Booked"}
                  </span>
                </div>

                {/* Reason */}
                <div className="bg-slate-50 rounded-xl p-3 mb-4">
                  <p className="text-xs text-slate-500 font-semibold mb-1">Reason for Visit</p>
                  <p className="text-sm text-slate-800">{booking.reason}</p>
                </div>

                {/* Actions */}
                {booking.status === "booked" && (
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all"
                  >
                    Mark as Completed
                  </button>
                )}
                {booking.status === "completed" && (
                  <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
                    <CheckCircle2 size={16} />
                    Appointment completed
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── No Appointments ── */}
        {!loading && filtered.length === 0 && !error && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <AlertCircle size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-600 font-semibold">No appointments found</p>
            <p className="text-slate-400 text-sm mt-1">
              Bookings will appear here when patients schedule appointments
            </p>
          </div>
        )}
      </div>

      {/* ── Confirm Modal ── */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedBooking(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">
                Mark as Completed?
              </h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-slate-600 text-sm mb-4">
              Are you sure you want to mark <strong>{selectedBooking.patient}</strong>'s appointment as completed?
            </p>

            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-sm">
              <div className="flex justify-between mb-2">
                <span className="text-slate-600">Patient:</span>
                <span className="font-semibold">{selectedBooking.patient}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-600">Date & Time:</span>
                <span className="font-semibold">{selectedBooking.date} • {selectedBooking.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Type:</span>
                <span className="font-semibold">
                  {selectedBooking.type === "video" ? "Video Call" : "In-Clinic"}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedBooking(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleMarkCompleted(selectedBooking.id)}
                disabled={completingId === selectedBooking.id}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                {completingId === selectedBooking.id ? "Completing..." : "Yes, Mark Completed"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}