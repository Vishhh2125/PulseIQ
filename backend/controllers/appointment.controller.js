import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// ─── Create Appointment (Patient) ─────────────────────────────────────────────
const createAppointment = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.usertype !== "patient") {
    throw new ApiError(403, "Only patients can book appointments");
  }

  const { doctorId, patientPhoneNumber, appointmentDate, appointmentTime, reason, mode } =
    req.body;

  if (!doctorId) throw new ApiError(400, "Doctor ID is required");
  if (!patientPhoneNumber) throw new ApiError(400, "Patient phone number is required");
  if (!appointmentDate) throw new ApiError(400, "Appointment date is required");
  if (!appointmentTime) throw new ApiError(400, "Appointment time is required");
  if (!mode) throw new ApiError(400, "Appointment mode is required");
  if (!["offline_visit", "online"].includes(mode)) {
    throw new ApiError(400, "Invalid mode. Must be 'offline_visit' or 'online'");
  }

  // Verify doctor exists
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new ApiError(404, "Doctor not found");

  // Double-booking check: same doctor, same date+time, not rejected/cancelled/completed
  const existing = await Appointment.findOne({
    doctorId,
    appointmentDate: new Date(appointmentDate),
    appointmentTime,
    status: { $in: ["pending", "approved"] },
  });
  if (existing) {
    throw new ApiError(409, "This time slot is already booked. Please choose a different time.");
  }

  const appointment = await Appointment.create({
    doctorId,
    patientId: user._id,
    patientPhoneNumber,
    appointmentDate: new Date(appointmentDate),
    appointmentTime,
    reason: reason || "",
    mode,
    status: "pending",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { appointment }, "Appointment booked successfully"));
});

// ─── Get Patient's Appointments (Patient) ────────────────────────────────────
const getPatientAppointments = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.usertype !== "patient") {
    throw new ApiError(403, "Only patients can access their appointments");
  }

  const appointments = await Appointment.find({ patientId: user._id })
    .populate({
      path: "doctorId",
      select: "specialization consultationFee",
      populate: { path: "userId", select: "username email" },
    })
    .sort({ appointmentDate: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { appointments, count: appointments.length },
        "Appointments fetched successfully"
      )
    );
});

// ─── Get Doctor's Appointments (Doctor) ──────────────────────────────────────
const getDoctorAppointments = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.usertype !== "doctor") {
    throw new ApiError(403, "Only doctors can access their appointment list");
  }

  const doctor = await Doctor.findOne({ userId: user._id });
  if (!doctor) throw new ApiError(404, "Doctor profile not found");

  const { status } = req.query; // optional filter by status

  const filter = { doctorId: doctor._id };
  if (status) {
    if (!["pending", "approved", "rejected", "completed", "cancelled"].includes(status)) {
      throw new ApiError(400, "Invalid status filter");
    }
    filter.status = status;
  }

  const appointments = await Appointment.find(filter)
    .populate("patientId", "username email")
    .sort({ appointmentDate: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { appointments, count: appointments.length },
        "Appointments fetched successfully"
      )
    );
});

// ─── Accept / Reject Appointment (Doctor) ────────────────────────────────────
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const user = req.user;
  const { appointmentId } = req.params;
  const { status, meetingLink } = req.body;

  if (user.usertype !== "doctor") {
    throw new ApiError(403, "Only doctors can update appointment status");
  }

  if (!status) throw new ApiError(400, "Status is required");
  if (!["approved", "rejected", "completed"].includes(status)) {
    throw new ApiError(400, "Invalid status. Must be 'approved', 'rejected', or 'completed'");
  }

  const doctor = await Doctor.findOne({ userId: user._id });
  if (!doctor) throw new ApiError(404, "Doctor profile not found");

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new ApiError(404, "Appointment not found");

  // Ensure this appointment belongs to the requesting doctor
  if (appointment.doctorId.toString() !== doctor._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this appointment");
  }

  // Cannot act on already rejected/cancelled appointments
  if (["rejected", "cancelled"].includes(appointment.status)) {
    throw new ApiError(400, `Cannot update an appointment that is already ${appointment.status}`);
  }

  appointment.status = status;

  // Set meeting link only for online approved appointments
  if (status === "approved" && appointment.mode === "online") {
    if (!meetingLink) {
      throw new ApiError(400, "Meeting link is required when approving an online appointment");
    }
    appointment.meetingLink = meetingLink;
  }

  await appointment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { appointment }, "Appointment status updated successfully"));
});

// ─── Cancel Appointment (Patient) ─────────────────────────────────────────────
const cancelAppointment = asyncHandler(async (req, res) => {
  const user = req.user;
  const { appointmentId } = req.params;

  if (user.usertype !== "patient") {
    throw new ApiError(403, "Only patients can cancel their appointments");
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new ApiError(404, "Appointment not found");

  // Ensure the appointment belongs to this patient
  if (appointment.patientId.toString() !== user._id.toString()) {
    throw new ApiError(403, "You are not authorized to cancel this appointment");
  }

  if (appointment.status !== "pending") {
    throw new ApiError(
      400,
      `Cannot cancel an appointment that is already ${appointment.status}`
    );
  }

  appointment.status = "cancelled";
  await appointment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { appointment }, "Appointment cancelled successfully"));
});

export {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
};
