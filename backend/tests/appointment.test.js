import request from "supertest";
import app from "../App.js";
import User from "../models/user.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import Appointment from "../models/appointment.model.js";

describe("Appointment API Tests", () => {
  const patientData = {
    username: "appt_patient",
    email: "appt_patient@test.com",
    password: "password123",
    dob: "1995-06-15",
    bloodGroup: "B+",
    gender: "male",
  };

  const doctorData = {
    username: "appt_doctor",
    email: "appt_doctor@test.com",
    password: "password123",
    specialization: "Orthopedics",
    licenseNumber: "LIC_APPT_001",
    experience: 7,
    clinicAddress: {
      street: "200 Bone Ave",
      city: "Houston",
      state: "TX",
      zipCode: "77001",
    },
    clinicTiming: [
      {
        day: "monday",
        isOpen: true,
        startTime: "09:00",
        endTime: "17:00",
      },
      {
        day: "wednesday",
        isOpen: true,
        startTime: "09:00",
        endTime: "17:00",
      },
      {
        day: "friday",
        isOpen: true,
        startTime: "09:00",
        endTime: "17:00",
      },
    ],
    consultationFee: 400,
  };

  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  let patientId, doctorId;
  let patientToken, doctorToken;

  beforeAll(async () => {
    await User.deleteMany({ email: { $in: [patientData.email, doctorData.email] } });
    await Doctor.deleteMany({ licenseNumber: doctorData.licenseNumber });

    const patientRes = await request(app)
      .post("/api/v1/users/auth/register/patient")
      .send(patientData);
    if (!patientRes.body.data) throw new Error(`Patient registration failed: ${patientRes.body.message}`);
    patientId = patientRes.body.data.userId;

    const doctorRes = await request(app)
      .post("/api/v1/users/auth/register/doctor")
      .send(doctorData);
    if (!doctorRes.body.data) throw new Error(`Doctor registration failed: ${doctorRes.body.message}`);
    doctorId = doctorRes.body.data.doctorId;

    const patientLogin = await request(app)
      .post("/api/v1/users/login")
      .send({ email: patientData.email, password: patientData.password });
    patientToken = patientLogin.body.data.accessToken;

    const doctorLogin = await request(app)
      .post("/api/v1/users/login")
      .send({ email: doctorData.email, password: doctorData.password });
    doctorToken = doctorLogin.body.data.accessToken;
  });

  afterAll(async () => {
    await Appointment.deleteMany({});
    await Patient.deleteMany({});
    await User.deleteMany({ email: { $in: [patientData.email, doctorData.email] } });
    await Doctor.deleteMany({ licenseNumber: doctorData.licenseNumber });
  });

  // ─── POST /api/v1/appointments ─────────────────────────────────────────────
  describe("POST /api/v1/appointments — Create appointment (Patient)", () => {
    afterEach(async () => {
      await Appointment.deleteMany({ appointmentTime: { $in: ["10:00", "11:00"] } });
    });

    it("should create an offline appointment successfully", async () => {
      const res = await request(app)
        .post("/api/v1/appointments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          doctorId,
          patientPhoneNumber: "+1-555-0101",
          appointmentDate: futureDate,
          appointmentTime: "10:00",
          reason: "Knee pain",
          mode: "offline_visit",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.appointment.mode).toBe("offline_visit");
      expect(res.body.data.appointment.status).toBe("pending");
      expect(res.body.data.appointment.meetingLink).toBeNull();
    });

    it("should create an online appointment successfully", async () => {
      const res = await request(app)
        .post("/api/v1/appointments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          doctorId,
          patientPhoneNumber: "+1-555-0102",
          appointmentDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
          appointmentTime: "11:00",
          reason: "Follow up",
          mode: "online",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.appointment.mode).toBe("online");
    });

    it("should return 400 when mode is missing", async () => {
      const res = await request(app)
        .post("/api/v1/appointments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          doctorId,
          patientPhoneNumber: "+1-555-0103",
          appointmentDate: futureDate,
          appointmentTime: "12:00",
          reason: "Test",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("mode is required");
    });

    it("should return 400 for an invalid mode value", async () => {
      const res = await request(app)
        .post("/api/v1/appointments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          doctorId,
          patientPhoneNumber: "+1-555-0104",
          appointmentDate: futureDate,
          appointmentTime: "12:00",
          reason: "Test",
          mode: "telepathy",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Invalid mode");
    });

    it("should return 400 when doctorId is missing", async () => {
      const res = await request(app)
        .post("/api/v1/appointments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          patientPhoneNumber: "+1-555-0105",
          appointmentDate: futureDate,
          appointmentTime: "12:00",
          mode: "offline_visit",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Doctor ID is required");
    });

    it("should return 400 when appointmentDate is missing", async () => {
      const res = await request(app)
        .post("/api/v1/appointments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          doctorId,
          patientPhoneNumber: "+1-555-0106",
          appointmentTime: "12:00",
          mode: "offline_visit",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Appointment date is required");
    });

    it("should return 400 when appointmentTime is missing", async () => {
      const res = await request(app)
        .post("/api/v1/appointments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          doctorId,
          patientPhoneNumber: "+1-555-0107",
          appointmentDate: futureDate,
          mode: "offline_visit",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Appointment time is required");
    });

    it("should return 400 when patientPhoneNumber is missing", async () => {
      const res = await request(app)
        .post("/api/v1/appointments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          doctorId,
          appointmentDate: futureDate,
          appointmentTime: "12:00",
          mode: "offline_visit",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("phone number is required");
    });

    it("should return 403 when a doctor tries to book", async () => {
      const res = await request(app)
        .post("/api/v1/appointments")
        .set("Authorization", `Bearer ${doctorToken}`)
        .send({
          doctorId,
          patientPhoneNumber: "+1-555-0108",
          appointmentDate: futureDate,
          appointmentTime: "13:00",
          mode: "offline_visit",
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("Only patients can book");
    });

    it("should return 401 when no token is provided", async () => {
      const res = await request(app)
        .post("/api/v1/appointments")
        .send({
          doctorId,
          patientPhoneNumber: "+1-555-0109",
          appointmentDate: futureDate,
          appointmentTime: "13:00",
          mode: "offline_visit",
        });

      expect(res.statusCode).toBe(401);
    });
  });

  // ─── Double-booking prevention ─────────────────────────────────────────────
  describe("Double-booking prevention", () => {
    const bookedTime = "14:00";
    const bookedDate = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString();

    beforeAll(async () => {
      await request(app)
        .post("/api/v1/appointments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          doctorId,
          patientPhoneNumber: "+1-555-0200",
          appointmentDate: bookedDate,
          appointmentTime: bookedTime,
          mode: "offline_visit",
        });
    });

    afterAll(async () => {
      await Appointment.deleteMany({ appointmentTime: bookedTime });
    });

    it("should return 409 when same slot is already pending/approved", async () => {
      const res = await request(app)
        .post("/api/v1/appointments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          doctorId,
          patientPhoneNumber: "+1-555-0201",
          appointmentDate: bookedDate,
          appointmentTime: bookedTime,
          mode: "online",
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toContain("already booked");
    });
  });

  // ─── GET /api/v1/appointments/my ──────────────────────────────────────────
  describe("GET /api/v1/appointments/my — Patient's appointments", () => {
    beforeAll(async () => {
      await request(app)
        .post("/api/v1/appointments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          doctorId,
          patientPhoneNumber: "+1-555-0300",
          appointmentDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          appointmentTime: "09:00",
          mode: "offline_visit",
          reason: "Routine check",
        });
    });

    it("should return patient's appointments", async () => {
      const res = await request(app)
        .get("/api/v1/appointments/my")
        .set("Authorization", `Bearer ${patientToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data.appointments)).toBe(true);
      expect(res.body.data.count).toBeGreaterThanOrEqual(1);
    });

    it("should include mode field in returned appointments", async () => {
      const res = await request(app)
        .get("/api/v1/appointments/my")
        .set("Authorization", `Bearer ${patientToken}`);

      expect(res.statusCode).toBe(200);
      const appt = res.body.data.appointments[0];
      expect(["offline_visit", "online"]).toContain(appt.mode);
    });

    it("should return 403 when a doctor calls this endpoint", async () => {
      const res = await request(app)
        .get("/api/v1/appointments/my")
        .set("Authorization", `Bearer ${doctorToken}`);

      expect(res.statusCode).toBe(403);
    });

    it("should return 401 without auth token", async () => {
      const res = await request(app).get("/api/v1/appointments/my");
      expect(res.statusCode).toBe(401);
    });
  });

  // ─── GET /api/v1/appointments/doctor ─────────────────────────────────────
  describe("GET /api/v1/appointments/doctor — Doctor's appointments", () => {
    it("should return doctor's appointments", async () => {
      const res = await request(app)
        .get("/api/v1/appointments/doctor")
        .set("Authorization", `Bearer ${doctorToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data.appointments)).toBe(true);
      expect(res.body.data.count).toBeGreaterThanOrEqual(1);
    });

    it("should filter appointments by status query param", async () => {
      const res = await request(app)
        .get("/api/v1/appointments/doctor?status=pending")
        .set("Authorization", `Bearer ${doctorToken}`);

      expect(res.statusCode).toBe(200);
      res.body.data.appointments.forEach((a) => {
        expect(a.status).toBe("pending");
      });
    });

    it("should return 400 for an invalid status filter", async () => {
      const res = await request(app)
        .get("/api/v1/appointments/doctor?status=unknown")
        .set("Authorization", `Bearer ${doctorToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Invalid status filter");
    });

    it("should return 403 when a patient calls this endpoint", async () => {
      const res = await request(app)
        .get("/api/v1/appointments/doctor")
        .set("Authorization", `Bearer ${patientToken}`);

      expect(res.statusCode).toBe(403);
    });

    it("should return 401 without auth token", async () => {
      const res = await request(app).get("/api/v1/appointments/doctor");
      expect(res.statusCode).toBe(401);
    });
  });

  // ─── PATCH /api/v1/appointments/:id/status ────────────────────────────────
  describe("PATCH /api/v1/appointments/:id/status — Doctor updates status", () => {
    let offlineApptId, onlineApptId;

    beforeAll(async () => {
      const offlineRes = await request(app)
        .post("/api/v1/appointments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          doctorId,
          patientPhoneNumber: "+1-555-0400",
          appointmentDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(),
          appointmentTime: "08:00",
          mode: "offline_visit",
        });
      offlineApptId = offlineRes.body.data.appointment._id;

      const onlineRes = await request(app)
        .post("/api/v1/appointments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          doctorId,
          patientPhoneNumber: "+1-555-0401",
          appointmentDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
          appointmentTime: "08:30",
          mode: "online",
        });
      onlineApptId = onlineRes.body.data.appointment._id;
    });

    it("should approve an offline appointment", async () => {
      const res = await request(app)
        .patch(`/api/v1/appointments/${offlineApptId}/status`)
        .set("Authorization", `Bearer ${doctorToken}`)
        .send({ status: "approved" });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.appointment.status).toBe("approved");
    });

    it("should approve an online appointment with meetingLink", async () => {
      const res = await request(app)
        .patch(`/api/v1/appointments/${onlineApptId}/status`)
        .set("Authorization", `Bearer ${doctorToken}`)
        .send({ status: "approved", meetingLink: "https://meet.google.com/xyz-abc" });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.appointment.status).toBe("approved");
      expect(res.body.data.appointment.meetingLink).toBe("https://meet.google.com/xyz-abc");
    });

    it("should return 400 when approving online appointment without meetingLink", async () => {
      const newOnline = await request(app)
        .post("/api/v1/appointments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          doctorId,
          patientPhoneNumber: "+1-555-0402",
          appointmentDate: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString(),
          appointmentTime: "09:30",
          mode: "online",
        });
      const newId = newOnline.body.data.appointment._id;

      const res = await request(app)
        .patch(`/api/v1/appointments/${newId}/status`)
        .set("Authorization", `Bearer ${doctorToken}`)
        .send({ status: "approved" });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Meeting link is required");
    });

    it("should reject an appointment", async () => {
      const newAppt = await request(app)
        .post("/api/v1/appointments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          doctorId,
          patientPhoneNumber: "+1-555-0403",
          appointmentDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          appointmentTime: "10:30",
          mode: "offline_visit",
        });
      const newId = newAppt.body.data.appointment._id;

      const res = await request(app)
        .patch(`/api/v1/appointments/${newId}/status`)
        .set("Authorization", `Bearer ${doctorToken}`)
        .send({ status: "rejected" });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.appointment.status).toBe("rejected");
    });

    it("should return 400 for an invalid status value", async () => {
      const res = await request(app)
        .patch(`/api/v1/appointments/${offlineApptId}/status`)
        .set("Authorization", `Bearer ${doctorToken}`)
        .send({ status: "maybe" });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Invalid status");
    });

    it("should return 400 when status is missing", async () => {
      const res = await request(app)
        .patch(`/api/v1/appointments/${offlineApptId}/status`)
        .set("Authorization", `Bearer ${doctorToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Status is required");
    });

    it("should return 403 when a patient tries to update status", async () => {
      const res = await request(app)
        .patch(`/api/v1/appointments/${offlineApptId}/status`)
        .set("Authorization", `Bearer ${patientToken}`)
        .send({ status: "approved" });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("Only doctors");
    });

    it("should return 404 for a non-existent appointment", async () => {
      const fakeId = "64a000000000000000000000";
      const res = await request(app)
        .patch(`/api/v1/appointments/${fakeId}/status`)
        .set("Authorization", `Bearer ${doctorToken}`)
        .send({ status: "approved" });

      expect(res.statusCode).toBe(404);
    });

    it("should return 401 without auth token", async () => {
      const res = await request(app)
        .patch(`/api/v1/appointments/${offlineApptId}/status`)
        .send({ status: "approved" });

      expect(res.statusCode).toBe(401);
    });
  });

  // ─── PATCH /api/v1/appointments/:id/cancel ────────────────────────────────
  describe("PATCH /api/v1/appointments/:id/cancel — Patient cancels appointment", () => {
    let pendingApptId, approvedApptId;

    beforeAll(async () => {
      const pendingRes = await request(app)
        .post("/api/v1/appointments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          doctorId,
          patientPhoneNumber: "+1-555-0500",
          appointmentDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          appointmentTime: "07:00",
          mode: "offline_visit",
        });
      pendingApptId = pendingRes.body.data.appointment._id;

      const approvedRes = await request(app)
        .post("/api/v1/appointments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          doctorId,
          patientPhoneNumber: "+1-555-0501",
          appointmentDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
          appointmentTime: "07:30",
          mode: "offline_visit",
        });
      approvedApptId = approvedRes.body.data.appointment._id;

      await request(app)
        .patch(`/api/v1/appointments/${approvedApptId}/status`)
        .set("Authorization", `Bearer ${doctorToken}`)
        .send({ status: "approved" });
    });

    it("should cancel a pending appointment", async () => {
      const res = await request(app)
        .patch(`/api/v1/appointments/${pendingApptId}/cancel`)
        .set("Authorization", `Bearer ${patientToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.appointment.status).toBe("cancelled");
    });

    it("should return 400 when trying to cancel an approved appointment", async () => {
      const res = await request(app)
        .patch(`/api/v1/appointments/${approvedApptId}/cancel`)
        .set("Authorization", `Bearer ${patientToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Cannot cancel");
    });

    it("should return 403 when a doctor tries to cancel", async () => {
      const newAppt = await request(app)
        .post("/api/v1/appointments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          doctorId,
          patientPhoneNumber: "+1-555-0502",
          appointmentDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString(),
          appointmentTime: "06:00",
          mode: "offline_visit",
        });
      const newId = newAppt.body.data.appointment._id;

      const res = await request(app)
        .patch(`/api/v1/appointments/${newId}/cancel`)
        .set("Authorization", `Bearer ${doctorToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("Only patients");
    });

    it("should return 404 for a non-existent appointment", async () => {
      const fakeId = "64a000000000000000000000";
      const res = await request(app)
        .patch(`/api/v1/appointments/${fakeId}/cancel`)
        .set("Authorization", `Bearer ${patientToken}`);

      expect(res.statusCode).toBe(404);
    });

    it("should return 401 without auth token", async () => {
      const res = await request(app).patch(`/api/v1/appointments/${pendingApptId}/cancel`);
      expect(res.statusCode).toBe(401);
    });
  });

  // ─── Appointment model – mode & meetingLink fields ────────────────────────
  describe("Appointment model – mode and meetingLink fields", () => {
    it("should reject creating appointment without mode", async () => {
      await expect(
        Appointment.create({
          doctorId,
          patientId,
          appointmentDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
          appointmentTime: "15:00",
          patientPhoneNumber: "+1-555-0600",
        })
      ).rejects.toThrow();
    });

    it("should reject an invalid mode value at the schema level", async () => {
      await expect(
        Appointment.create({
          doctorId,
          patientId,
          appointmentDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
          appointmentTime: "15:00",
          patientPhoneNumber: "+1-555-0601",
          mode: "carrier_pigeon",
        })
      ).rejects.toThrow();
    });

    it("should accept offline_visit as a valid mode", async () => {
      const appt = await Appointment.create({
        doctorId,
        patientId,
        appointmentDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        appointmentTime: "15:30",
        patientPhoneNumber: "+1-555-0602",
        mode: "offline_visit",
      });
      expect(appt.mode).toBe("offline_visit");
      expect(appt.meetingLink).toBeNull();
      await Appointment.findByIdAndDelete(appt._id);
    });

    it("should accept online as a valid mode", async () => {
      const appt = await Appointment.create({
        doctorId,
        patientId,
        appointmentDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        appointmentTime: "15:45",
        patientPhoneNumber: "+1-555-0603",
        mode: "online",
      });
      expect(appt.mode).toBe("online");
      await Appointment.findByIdAndDelete(appt._id);
    });

    it("should store meetingLink when set", async () => {
      const link = "https://meet.google.com/test-link";
      const appt = await Appointment.create({
        doctorId,
        patientId,
        appointmentDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        appointmentTime: "16:00",
        patientPhoneNumber: "+1-555-0604",
        mode: "online",
        meetingLink: link,
      });
      expect(appt.meetingLink).toBe(link);
      await Appointment.findByIdAndDelete(appt._id);
    });

    it("should default status to pending and include timestamps", async () => {
      const appt = await Appointment.create({
        doctorId,
        patientId,
        appointmentDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        appointmentTime: "16:15",
        patientPhoneNumber: "+1-555-0605",
        mode: "offline_visit",
      });

      expect(appt.status).toBe("pending");
      expect(appt.createdAt).toBeTruthy();
      expect(appt.updatedAt).toBeTruthy();
      await Appointment.findByIdAndDelete(appt._id);
    });
  });
});
