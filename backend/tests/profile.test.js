import request from "supertest";
import app from "../App.js";
import User from "../models/user.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

describe("User Profile API Tests", () => {
  const patientData = {
    username: "profile_patient",
    email: "profile_patient@test.com",
    password: "password123",
    dob: "1998-03-10",
    bloodGroup: "A-",
    gender: "female",
  };

  const doctorData = {
    username: "profile_doctor",
    email: "profile_doctor@test.com",
    password: "password123",
    specialization: "Neurology",
    licenseNumber: "LIC_PROFILE_001",
    experience: 10,
    clinicAddress: {
      street: "100 Brain Ave",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
    },
    clinicTiming: [
      {
        day: "monday",
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
    consultationFee: 1000,
    qualifications: [
      {
        degree: "MBBS",
        institution: "Top Medical University",
        year: 2012,
      },
      {
        degree: "MD Neurology",
        institution: "specialization hospital",
        year: 2015,
      },
    ],
    bio: "Top Neurologist in city",
  };

  let patientAccessToken, patientUserId;
  let doctorAccessToken, doctorUserId, doctorId;

  beforeAll(async () => {
    // Clean up any stale data before creating
    await User.deleteMany({ email: { $in: [patientData.email, doctorData.email] } });
    await Doctor.deleteMany({ licenseNumber: doctorData.licenseNumber });

    // Register patient
    const patientRes = await request(app)
      .post("/api/v1/users/auth/register/patient")
      .send(patientData);

    if (!patientRes.body.data) {
      throw new Error(`Patient registration failed: ${patientRes.body.message}`);
    }

    patientUserId = patientRes.body.data.userId;

    // Login patient to get token
    const patientLoginRes = await request(app)
      .post("/api/v1/users/login")
      .send({
        email: patientData.email,
        password: patientData.password,
      });

    patientAccessToken = patientLoginRes.headers['set-cookie'];

    // Register doctor
    const doctorRes = await request(app)
      .post("/api/v1/users/auth/register/doctor")
      .send(doctorData);

    if (!doctorRes.body.data) {
      throw new Error(`Doctor registration failed: ${doctorRes.body.message}`);
    }

    doctorUserId = doctorRes.body.data.userId;
    doctorId = doctorRes.body.data.doctorId;

    // Login doctor to get token
    const doctorLoginRes = await request(app)
      .post("/api/v1/users/login")
      .send({
        email: doctorData.email,
        password: doctorData.password,
      });

    doctorAccessToken = doctorLoginRes.headers['set-cookie'];
  });

  afterAll(async () => {
    await Patient.deleteMany({});
    await User.deleteMany({
      email: { $in: [patientData.email, doctorData.email] },
    });
    await Doctor.deleteMany({
      licenseNumber: doctorData.licenseNumber,
    });
  });

  // ─── GET CURRENT USER/PROFILE TESTS ────────────────────────────────────────
  describe("GET /api/v1/users/profile (Patient)", () => {
    it("should get patient profile with valid token", async () => {
      const res = await request(app)
        .get("/api/v1/users/profile")
        .set("Cookie", patientAccessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.statusCode).toBe(200);
      expect(res.body.message).toBe("User fetched successfully");
      expect(res.body.data.user).toBeTruthy();
    });

    it("should return patient user info correctly", async () => {
      const res = await request(app)
        .get("/api/v1/users/profile")
        .set("Cookie", patientAccessToken);

      expect(res.statusCode).toBe(200);

      const user = res.body.data.user;
      expect(user._id).toBe(patientUserId.toString());
      expect(user.username).toBe(patientData.username);
      expect(user.email).toBe(patientData.email);
      expect(user.usertype).toBe("patient");
    });

    it("should not return password in patient profile", async () => {
      const res = await request(app)
        .get("/api/v1/users/profile")
        .set("Cookie", patientAccessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.password).toBeUndefined();
      expect(res.body.data.user.token).toBeUndefined();
    });

    it("should not include doctor profile for patient", async () => {
      const res = await request(app)
        .get("/api/v1/users/profile")
        .set("Cookie", patientAccessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.doctor).toBeUndefined();
    });

    it("should return patient profile with dob, bloodGroup, gender", async () => {
      const res = await request(app)
        .get("/api/v1/users/profile")
        .set("Cookie", patientAccessToken);

      expect(res.statusCode).toBe(200);
      const patient = res.body.data.patient;
      expect(patient).toBeTruthy();
      expect(patient.bloodGroup).toBe(patientData.bloodGroup);
      expect(patient.gender).toBe(patientData.gender);
      expect(patient.dob).toBeTruthy();
    });

    it("should reject request without token", async () => {
      const res = await request(app).get("/api/v1/users/profile");

      // Should fail because no token provided (auth middleware will be added)
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });

    it("should reject request with invalid token", async () => {
      const res = await request(app)
        .get("/api/v1/users/profile")
        .set("Cookie", ["token=invalid_token_12345"]);

      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
  });

  // ─── GET CURRENT USER/PROFILE TESTS (DOCTOR) ──────────────────────────────
  describe("GET /api/v1/users/profile (Doctor)", () => {
    it("should get doctor profile with user and doctor info", async () => {
      const res = await request(app)
        .get("/api/v1/users/profile")
        .set("Cookie", doctorAccessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.statusCode).toBe(200);
      expect(res.body.data.user).toBeTruthy();
      expect(res.body.data.doctor).toBeTruthy();
    });

    it("should return doctor user info correctly", async () => {
      const res = await request(app)
        .get("/api/v1/users/profile")
        .set("Cookie", doctorAccessToken);

      expect(res.statusCode).toBe(200);

      const user = res.body.data.user;
      expect(user._id).toBe(doctorUserId.toString());
      expect(user.username).toBe(doctorData.username);
      expect(user.email).toBe(doctorData.email);
      expect(user.usertype).toBe("doctor");
    });

    it("should return doctor profile info", async () => {
      const res = await request(app)
        .get("/api/v1/users/profile")
        .set("Cookie", doctorAccessToken);

      expect(res.statusCode).toBe(200);

      const doctor = res.body.data.doctor;
      expect(doctor._id).toBe(doctorId.toString());
      expect(doctor.specialization).toBe(doctorData.specialization);
      expect(doctor.licenseNumber).toBe(doctorData.licenseNumber);
      expect(doctor.experience).toBe(doctorData.experience);
      expect(doctor.consultationFee).toBe(doctorData.consultationFee);
    });

    it("should include clinic address in doctor profile", async () => {
      const res = await request(app)
        .get("/api/v1/users/profile")
        .set("Cookie", doctorAccessToken);

      expect(res.statusCode).toBe(200);

      const doctor = res.body.data.doctor;
      expect(doctor.clinicAddress).toBeTruthy();
      expect(doctor.clinicAddress.street).toBe(doctorData.clinicAddress.street);
      expect(doctor.clinicAddress.city).toBe(doctorData.clinicAddress.city);
    });

    it("should include clinic timing in doctor profile", async () => {
      const res = await request(app)
        .get("/api/v1/users/profile")
        .set("Cookie", doctorAccessToken);

      expect(res.statusCode).toBe(200);

      const doctor = res.body.data.doctor;
      expect(Array.isArray(doctor.clinicTiming)).toBe(true);
      expect(doctor.clinicTiming.length).toBeGreaterThan(0);
      expect(doctor.clinicTiming[0].day).toBeTruthy();
      expect(doctor.clinicTiming[0].startTime).toBeTruthy();
      expect(doctor.clinicTiming[0].endTime).toBeTruthy();
    });

    it("should include qualifications in doctor profile", async () => {
      const res = await request(app)
        .get("/api/v1/users/profile")
        .set("Cookie", doctorAccessToken);

      expect(res.statusCode).toBe(200);

      const doctor = res.body.data.doctor;
      expect(Array.isArray(doctor.qualifications)).toBe(true);
      expect(doctor.qualifications.length).toBeGreaterThan(0);
      expect(doctor.qualifications[0].degree).toBe("MBBS");
      expect(doctor.qualifications[0].institution).toBeTruthy();
    });

    it("should include bio in doctor profile", async () => {
      const res = await request(app)
        .get("/api/v1/users/profile")
        .set("Cookie", doctorAccessToken);

      expect(res.statusCode).toBe(200);

      const doctor = res.body.data.doctor;
      expect(doctor.bio).toBe(doctorData.bio);
    });

    it("should not return password in doctor profile", async () => {
      const res = await request(app)
        .get("/api/v1/users/profile")
        .set("Cookie", doctorAccessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.password).toBeUndefined();
      expect(res.body.data.user.token).toBeUndefined();
    });
  });

  // ─── PROFILE TIMESTAMP TESTS ───────────────────────────────────────────────
  describe("User Profile Timestamps", () => {
    it("should include createdAt and updatedAt in patient profile", async () => {
      const res = await request(app)
        .get("/api/v1/users/profile")
        .set("Cookie", patientAccessToken);

      expect(res.statusCode).toBe(200);

      const user = res.body.data.user;
      expect(user.createdAt).toBeTruthy();
      expect(user.updatedAt).toBeTruthy();
    });

    it("should include createdAt and updatedAt in doctor profile", async () => {
      const res = await request(app)
        .get("/api/v1/users/profile")
        .set("Cookie", doctorAccessToken);

      expect(res.statusCode).toBe(200);

      const doctor = res.body.data.doctor;
      expect(doctor.createdAt).toBeTruthy();
      expect(doctor.updatedAt).toBeTruthy();
    });
  });
});
