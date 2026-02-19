import { Router } from "express";
import {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
} from "../controllers/appointment.controller.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

// Patient: book a new appointment
router.post("/", auth, createAppointment);

// Patient: view own appointments
router.get("/my", auth, getPatientAppointments);

// Doctor: view all appointments assigned to them (optional ?status= filter)
router.get("/doctor", auth, getDoctorAppointments);

// Doctor: approve / reject / complete an appointment
router.patch("/:appointmentId/status", auth, updateAppointmentStatus);

// Patient: cancel a pending appointment
router.patch("/:appointmentId/cancel", auth, cancelAppointment);

export default router;
