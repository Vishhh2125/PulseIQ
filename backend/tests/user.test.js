import request from "supertest";
import app from "../App.js";
import User from "../models/user.model.js";
import Patient from "../models/patient.model.js";

const REGISTER_PATIENT = "/api/v1/users/auth/register/patient";
const LOGIN = "/api/v1/users/login";

describe("User API Tests", () => {
  const testUser = {
    username: "testuser123",
    email: "test@example.com",
    password: "password123",
    dob: "2000-07-25",
    bloodGroup: "AB+",
    gender: "male",
  };

  beforeEach(async () => {
    await Patient.deleteMany({});
    await User.deleteOne({ email: testUser.email });
    await User.deleteOne({ email: "different@example.com" });
  });

  afterAll(async () => {
    await Patient.deleteMany({});
    await User.deleteMany({ email: { $in: [testUser.email, "different@example.com"] } });
  });

  describe("POST /api/v1/users/auth/register/patient", () => {
    it("should return error if username is missing", async () => {
      const res = await request(app).post(REGISTER_PATIENT).send({
        email: "test@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Username is required");
    });

    it("should return error if email is missing", async () => {
      const res = await request(app).post(REGISTER_PATIENT).send({
        username: "testuser",
        password: "password123",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Email is required");
    });

    it("should return error if password is missing", async () => {
      const res = await request(app).post(REGISTER_PATIENT).send({
        username: "testuser",
        email: "test@example.com",
        usertype: "patient",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Password is required");
    });

    it("should return error if password is too short", async () => {
      const res = await request(app).post(REGISTER_PATIENT).send({
        username: "testuser",
        email: "test@example.com",
        password: "pass",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("at least 6 characters");
    });

    it("should return error if dob is missing", async () => {
      const { dob, ...withoutDob } = testUser;
      const res = await request(app).post(REGISTER_PATIENT).send(withoutDob);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Date of birth is required");
    });

    it("should return error if bloodGroup is missing", async () => {
      const { bloodGroup, ...withoutBloodGroup } = testUser;
      const res = await request(app).post(REGISTER_PATIENT).send(withoutBloodGroup);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Blood group is required");
    });

    it("should return error if gender is missing", async () => {
      const { gender, ...withoutGender } = testUser;
      const res = await request(app).post(REGISTER_PATIENT).send(withoutGender);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Gender is required");
    });

    it("should return error for invalid bloodGroup", async () => {
      const res = await request(app).post(REGISTER_PATIENT).send({ ...testUser, bloodGroup: "X+" });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Invalid blood group");
    });

    it("should return error for invalid gender", async () => {
      const res = await request(app).post(REGISTER_PATIENT).send({ ...testUser, gender: "robot" });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Invalid gender");
    });
  });

  describe("GET /test", () => {
    it("should return API is working", async () => {
      const res = await request(app).get("/test");

      expect(res.statusCode).toBe(200);
      expect(res.text).toContain("PulseIQ API is working");
    });
  });

  describe("POST /api/v1/users/auth/register/patient - Success", () => {
    it("should successfully register a new patient", async () => {
      const res = await request(app).post(REGISTER_PATIENT).send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.statusCode).toBe(201);
      expect(res.body.message).toBe("Patient registered successfully");

      const savedUser = await User.findOne({ email: testUser.email });
      expect(savedUser).toBeTruthy();
      expect(savedUser.username).toBe(testUser.username);
      expect(savedUser.usertype).toBe("patient");
    });

    it("should hash password before saving to database", async () => {
      const res = await request(app).post(REGISTER_PATIENT).send(testUser);

      expect(res.statusCode).toBe(201);

      const savedUser = await User.findOne({ email: testUser.email });
      expect(savedUser.password).not.toBe(testUser.password);
      expect(savedUser.password.length).toBeGreaterThan(20);
    });

    it("should reject duplicate email", async () => {
      await request(app).post(REGISTER_PATIENT).send(testUser);

      const res = await request(app).post(REGISTER_PATIENT).send({
        ...testUser,
        username: "differentuser",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Email is already registered");
    });

    it("should reject duplicate username", async () => {
      await request(app).post(REGISTER_PATIENT).send(testUser);

      const res = await request(app).post(REGISTER_PATIENT).send({
        ...testUser,
        email: "different@example.com",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Username is already taken");
    });
  });

  describe("POST /api/v1/users/login - Success", () => {
    beforeEach(async () => {
      await request(app).post(REGISTER_PATIENT).send(testUser);
    });

    it("should successfully login with correct credentials", async () => {
      const res = await request(app).post(LOGIN).send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.statusCode).toBe(200);
      expect(res.body.message).toBe("Logged in successfully");
      expect(res.body.data).toBeTruthy();
      expect(res.body.data.user).toBeTruthy();
          });

    it("should generate access token with correct payload", async () => {
      const res = await request(app).post(LOGIN).send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.headers['set-cookie'].some(c => c.startsWith('token='))).toBe(true);
    });

    it("should set refresh token in cookie", async () => {
      const res = await request(app).post(LOGIN).send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.headers["set-cookie"]).toBeTruthy();
      expect(res.headers["set-cookie"][0]).toContain("token=");
    });

    it("should return user data without password", async () => {
      const res = await request(app).post(LOGIN).send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.statusCode).toBe(200);
      const { user } = res.body.data;
      expect(user.email).toBe(testUser.email);
      expect(user.password).toBeUndefined();
      expect(user.token).toBeUndefined();
    });
  });

  describe("POST /api/v1/users/login - Failed", () => {
    beforeEach(async () => {
      await request(app).post(REGISTER_PATIENT).send(testUser);
    });

    it("should reject login with incorrect password", async () => {
      const res = await request(app).post(LOGIN).send({
        email: testUser.email,
        password: "wrongpassword",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain("Invalid password");
    });

    it("should reject login with non-existent email", async () => {
      const res = await request(app).post(LOGIN).send({
        email: "nonexistent@example.com",
        password: testUser.password,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("No account found");
    });

    it("should reject login if email is missing", async () => {
      const res = await request(app).post(LOGIN).send({ password: testUser.password });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Email is required");
    });

    it("should reject login if password is missing", async () => {
      const res = await request(app).post(LOGIN).send({ email: testUser.email });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Password is required");
    });
  });

  describe("Password Hashing & Token Verification", () => {
    beforeEach(async () => {
      await request(app).post(REGISTER_PATIENT).send(testUser);
    });

    it("should verify password correctly after hashing", async () => {
      const savedUser = await User.findOne({ email: testUser.email });
      const passwordMatches = await savedUser.isPasswordCorrect(testUser.password);
      expect(passwordMatches).toBe(true);
    });

    it("should reject incorrect password verification", async () => {
      const savedUser = await User.findOne({ email: testUser.email });
      const passwordMatches = await savedUser.isPasswordCorrect("wrongpassword");
      expect(passwordMatches).toBe(false);
    });

    it("should generate valid access token", async () => {
      const user = await User.findOne({ email: testUser.email });
      const accessToken = user.generateAccessToken();
      expect(accessToken).toBeTruthy();
      expect(typeof accessToken).toBe("string");
      expect(accessToken.split(".").length).toBe(3);
    });

    it("should include user info in access token payload", async () => {
      const user = await User.findOne({ email: testUser.email });
      const accessToken = user.generateAccessToken();
      const parts = accessToken.split(".");
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
      expect(payload._id).toBe(user._id.toString());
      expect(payload.email).toBe(testUser.email);
      expect(payload.usertype).toBe("patient");
    });

    it("should not expose generateRefreshToken method", async () => {
      const user = await User.findOne({ email: testUser.email });
      expect(typeof user.generateRefreshToken).toBe("undefined");
    });
  });
});