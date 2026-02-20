import request from "supertest";
import app from "../App.js";
import User from "../models/user.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import mongoose from "mongoose";

describe("Authentication & Doctor Registration Tests", () => {
  const patientData = {
    username: "patient_test",
    email: "patient@test.com",
    password: "password123",
    dob: "1990-01-20",
    bloodGroup: "O+",
    gender: "female",
  };

  const doctorData = {
    username: "doctor_test",
    email: "doctor@test.com",
    password: "password123",
    specialization: "Cardiology",
    licenseNumber: "LIC123456",
    experience: 5,
    clinicAddress: {
      street: "123 Medical St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
    },
    clinicTiming: [
      {
        day: "monday",
        isOpen: true,
        startTime: "09:00",
        endTime: "17:00",
      },
      {
        day: "tuesday",
        isOpen: true,
        startTime: "09:00",
        endTime: "17:00",
      },
      {
        day: "saturday",
        isOpen: false,
        startTime: "",
        endTime: "",
      },
    ],
    consultationFee: 500,
    qualifications: [
      {
        degree: "MBBS",
        institution: "Medical College",
        year: 2015,
      },
    ],
    bio: "Experienced cardiologist with 5 years of experience",
  };

  afterEach(async () => {
    // Clean up test data
    await User.deleteMany({
      email: { $in: [patientData.email, doctorData.email] },
    });
    await Doctor.deleteMany({
      licenseNumber: doctorData.licenseNumber,
    });
  });

  afterAll(async () => {
    // Cleanup handled by setup.js
  });

  // ─── PATIENT REGISTRATION TESTS ────────────────────────────────────────────
  describe("POST /api/v1/users/auth/register/patient", () => {
    it("should successfully register a patient", async () => {
      const res = await request(app)
        .post("/api/v1/users/auth/register/patient")
        .send(patientData);

      expect(res.statusCode).toBe(201);
      expect(res.body.statusCode).toBe(201);
      expect(res.body.message).toBe("Patient registered successfully");
      expect(res.body.data.userId).toBeTruthy();

      // Verify user is saved with correct usertype
      const savedUser = await User.findOne({ email: patientData.email });
      expect(savedUser.usertype).toBe("patient");
    });

    it("should hash password for patient registration", async () => {
      const res = await request(app)
        .post("/api/v1/users/auth/register/patient")
        .send(patientData);

      expect(res.statusCode).toBe(201);

      const savedUser = await User.findOne({ email: patientData.email });
      expect(savedUser.password).not.toBe(patientData.password);
    });

    it("should reject patient registration with missing username", async () => {
      const res = await request(app)
        .post("/api/v1/users/auth/register/patient")
        .send({
          email: patientData.email,
          password: patientData.password,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Username is required");
    });

    it("should reject patient registration with duplicate email", async () => {
      await request(app)
        .post("/api/v1/users/auth/register/patient")
        .send(patientData);

      const res = await request(app)
        .post("/api/v1/users/auth/register/patient")
        .send({
          ...patientData,
          username: "different_patient",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Email is already registered");
    });

    it("should reject patient registration with short password", async () => {
      const res = await request(app)
        .post("/api/v1/users/auth/register/patient")
        .send({
          ...patientData,
          password: "pass",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("at least 6 characters");
    });
  });

  // ─── DOCTOR REGISTRATION TESTS ─────────────────────────────────────────────
  describe("POST /api/v1/users/auth/register/doctor", () => {
    it("should successfully register a doctor", async () => {
      const res = await request(app)
        .post("/api/v1/users/auth/register/doctor")
        .send(doctorData);

      expect(res.statusCode).toBe(201);
      expect(res.body.statusCode).toBe(201);
      expect(res.body.message).toBe("Doctor registered successfully");
      expect(res.body.data.userId).toBeTruthy();
      expect(res.body.data.doctorId).toBeTruthy();

      // Verify user is saved with doctor usertype
      const savedUser = await User.findOne({ email: doctorData.email });
      expect(savedUser.usertype).toBe("doctor");

      // Verify doctor profile is created
      const savedDoctor = await Doctor.findById(res.body.data.doctorId);
      expect(savedDoctor).toBeTruthy();
      expect(savedDoctor.specialization).toBe(doctorData.specialization);
      expect(savedDoctor.licenseNumber).toBe(doctorData.licenseNumber);
    });

    it("should reject doctor registration without specialization", async () => {
      const { specialization, ...incompleteData } = doctorData;

      const res = await request(app)
        .post("/api/v1/users/auth/register/doctor")
        .send(incompleteData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Specialization is required");
    });

    it("should reject doctor registration without license number", async () => {
      const { licenseNumber, ...incompleteData } = doctorData;

      const res = await request(app)
        .post("/api/v1/users/auth/register/doctor")
        .send(incompleteData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("License number is required");
    });

    it("should reject doctor registration without clinic address", async () => {
      const { clinicAddress, ...incompleteData } = doctorData;

      const res = await request(app)
        .post("/api/v1/users/auth/register/doctor")
        .send(incompleteData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Clinic address is required");
    });

    it("should reject doctor registration without clinic timing", async () => {
      const { clinicTiming, ...incompleteData } = doctorData;

      const res = await request(app)
        .post("/api/v1/users/auth/register/doctor")
        .send(incompleteData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Clinic timing is required");
    });

    it("should reject doctor registration with duplicate license number", async () => {
      await request(app)
        .post("/api/v1/users/auth/register/doctor")
        .send(doctorData);

      const res = await request(app)
        .post("/api/v1/users/auth/register/doctor")
        .send({
          ...doctorData,
          username: "different_doctor",
          email: "different@test.com",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("License number already registered");
    });

    it("should save optional doctor fields correctly", async () => {
      const res = await request(app)
        .post("/api/v1/users/auth/register/doctor")
        .send(doctorData);

      expect(res.statusCode).toBe(201);

      const savedDoctor = await Doctor.findById(res.body.data.doctorId);
      expect(savedDoctor.experience).toBe(doctorData.experience);
      expect(savedDoctor.consultationFee).toBe(doctorData.consultationFee);
      expect(savedDoctor.qualifications[0].degree).toBe("MBBS");
      expect(savedDoctor.bio).toContain("cardiologist");
    });

    it("should set default values for optional fields", async () => {
      const minimalDoctorData = {
        username: "minimal_doc",
        email: "minimal@test.com",
        password: "password123",
        specialization: "Dermatology",
        licenseNumber: "LIC999999",
        clinicAddress: {
          street: "456 Medical Ave",
          city: "Los Angeles",
          state: "CA",
          zipCode: "90001",
        },
        clinicTiming: [
          {
            day: "monday",
            isOpen: true,
            startTime: "10:00",
            endTime: "18:00",
          },
        ],
      };

      const res = await request(app)
        .post("/api/v1/users/auth/register/doctor")
        .send(minimalDoctorData);

      expect(res.statusCode).toBe(201);

      const savedDoctor = await Doctor.findById(res.body.data.doctorId);
      expect(savedDoctor.experience).toBe(0);
      expect(savedDoctor.consultationFee).toBe(0);
      expect(savedDoctor.qualifications).toEqual([]);
      expect(savedDoctor.bio).toBe("");

      // Clean up
      await User.deleteOne({ email: minimalDoctorData.email });
      await Doctor.deleteOne({ _id: res.body.data.doctorId });
    });
  });

  // ─── LOGIN TESTS ───────────────────────────────────────────────────────────
  describe("POST /api/v1/users/login - Patient & Doctor", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/v1/users/auth/register/patient")
        .send(patientData);

      await request(app)
        .post("/api/v1/users/auth/register/doctor")
        .send(doctorData);
    });

    it("should login patient successfully", async () => {
      const res = await request(app)
        .post("/api/v1/users/login")
        .send({
          email: patientData.email,
          password: patientData.password,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.usertype).toBe("patient");
      expect(res.body.data.accessToken).toBeTruthy();
    });

    it("should login doctor successfully", async () => {
      const res = await request(app)
        .post("/api/v1/users/login")
        .send({
          email: doctorData.email,
          password: doctorData.password,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.usertype).toBe("doctor");
      expect(res.body.data.accessToken).toBeTruthy();
    });

    it("should not expose password in login response", async () => {
      const res = await request(app)
        .post("/api/v1/users/login")
        .send({
          email: patientData.email,
          password: patientData.password,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.password).toBeUndefined();
    });
  });
});
