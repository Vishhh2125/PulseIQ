import mongoose from "mongoose";
import User from "../models/user.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

// ─── Register Patient ───────────────────────────────────────────────────────
const registerPatient = asyncHandler(async (req, res) => {
  const { username, email, password, dob, bloodGroup, gender } = req.body;

  if (!username) throw new ApiError(400, "Username is required");
  if (!email) throw new ApiError(400, "Email is required");
  if (!password) throw new ApiError(400, "Password is required");
  if (password.length < 6)
    throw new ApiError(400, "Password must be at least 6 characters");
  if (!dob) throw new ApiError(400, "Date of birth is required");
  if (!bloodGroup) throw new ApiError(400, "Blood group is required");
  if (!gender) throw new ApiError(400, "Gender is required");

  const validBloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  if (!validBloodGroups.includes(bloodGroup))
    throw new ApiError(400, "Invalid blood group. Must be one of A+, A-, B+, B-, AB+, AB-, O+, O-");

  const validGenders = ["male", "female", "other"];
  if (!validGenders.includes(gender))
    throw new ApiError(400, "Invalid gender. Must be male, female, or other");

  const existingByEmail = await User.findOne({ email });
  if (existingByEmail) throw new ApiError(400, "Email is already registered");

  const existingByUsername = await User.findOne({ username });
  if (existingByUsername) throw new ApiError(400, "Username is already taken");

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const [user] = await User.create(
      [{ username, email, password, usertype: "patient" }],
      { session }
    );

    const [patient] = await Patient.create(
      [{ userId: user._id, dob: new Date(dob), bloodGroup, gender }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { userId: user._id, patientId: patient._id },
          "Patient registered successfully"
        )
      );
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

// ─── Register Doctor ────────────────────────────────────────────────────────
const registerDoctor = asyncHandler(async (req, res) => {
  const {
    username,
    email,
    password,
    specialization,
    licenseNumber,
    experience,
    clinicAddress,
    clinicTiming,
    consultationFee,
    qualifications,
    bio,
  } = req.body;

  // User validations
  if (!username) throw new ApiError(400, "Username is required");
  if (!email) throw new ApiError(400, "Email is required");
  if (!password) throw new ApiError(400, "Password is required");
  if (password.length < 6)
    throw new ApiError(400, "Password must be at least 6 characters");

  // Doctor validations
  if (!specialization) throw new ApiError(400, "Specialization is required");
  if (!licenseNumber) throw new ApiError(400, "License number is required");
  if (!clinicAddress) throw new ApiError(400, "Clinic address is required");
  if (!clinicTiming || clinicTiming.length === 0) throw new ApiError(400, "Clinic timing is required");

  const existingByEmail = await User.findOne({ email });
  if (existingByEmail) throw new ApiError(400, "Email is already registered");

  const existingByUsername = await User.findOne({ username });
  if (existingByUsername) throw new ApiError(400, "Username is already taken");

  const existingLicense = await Doctor.findOne({ licenseNumber });
  if (existingLicense) throw new ApiError(400, "License number already registered");

  // ── Atomic transaction: both User + Doctor created or neither ──
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const [user] = await User.create(
      [{ username, email, password, usertype: "doctor" }],
      { session }
    );

    const [doctor] = await Doctor.create(
      [
        {
          userId: user._id,
          specialization,
          licenseNumber,
          experience: experience || 0,
          clinicAddress,
          clinicTiming,
          consultationFee: consultationFee || 0,
          qualifications: qualifications || [],
          bio: bio || "",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { userId: user._id, doctorId: doctor._id },
          "Doctor registered successfully"
        )
      );
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err; // re-throw so errorHandler sends proper response
  }
});

// ─── Register User (Legacy) ──────────────────────────────────────────────────
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, usertype } = req.body;

  if (!username) throw new ApiError(400, "Username is required");
  if (!email) throw new ApiError(400, "Email is required");
  if (!password) throw new ApiError(400, "Password is required");
  if (!usertype) throw new ApiError(400, "User type is required");
  if (!["doctor", "patient", "admin"].includes(usertype))
    throw new ApiError(400, "Invalid user type. Must be doctor, patient, or admin");
  if (password.length < 6)
    throw new ApiError(400, "Password must be at least 6 characters");

  const existingByEmail = await User.findOne({ email });
  if (existingByEmail) throw new ApiError(400, "Email is already registered");

  const existingByUsername = await User.findOne({ username });
  if (existingByUsername) throw new ApiError(400, "Username is already taken");

  await User.create({ username, email, password, usertype });

  return res
    .status(201)
    .json(new ApiResponse(201, {}, "User registered successfully"));
});

// ─── Login ────────────────────────────────────────────────────────────────────
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) throw new ApiError(400, "Email is required");
  if (!password) throw new ApiError(400, "Password is required");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(400, "No account found with this email");

  const passwordMatch = await user.isPasswordCorrect(password);
  if (!passwordMatch) throw new ApiError(401, "Invalid password");

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Persist refresh token in the token field
  user.token = refreshToken;
  await user.save({ validateBeforeSave: false });

  const { password: _pw, token: _tk, ...safeUser } = user.toObject();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: safeUser, accessToken },
        "Logged in successfully"
      )
    );
});

// ─── Logout ───────────────────────────────────────────────────────────────────
const logoutUser = asyncHandler(async (req, res) => {
  // req.user is set by auth middleware
  await User.findByIdAndUpdate(req.user._id, { token: null });

  res.clearCookie("refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// ─── Refresh Access Token ─────────────────────────────────────────────────────
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;
  if (!incomingRefreshToken)
    throw new ApiError(401, "Refresh token not found, please login again");

  try {
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decoded._id);
    if (!user) throw new ApiError(401, "Invalid refresh token");

    // Validate stored token matches
    if (user.token !== incomingRefreshToken)
      throw new ApiError(401, "Refresh token is expired or already used");

    const accessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.token = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(200)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json(
        new ApiResponse(200, { accessToken }, "Access token refreshed successfully")
      );
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token, please login again");
  }
});

// ─── Change Password ──────────────────────────────────────────────────────────
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword) throw new ApiError(400, "Current password is required");
  if (!newPassword) throw new ApiError(400, "New password is required");
  if (newPassword.length < 6)
    throw new ApiError(400, "New password must be at least 6 characters");

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  const passwordMatch = await user.isPasswordCorrect(oldPassword);
  if (!passwordMatch) throw new ApiError(401, "Current password is incorrect");

  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// ─── Get Current User ─────────────────────────────────────────────────────────
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;
  const { password: _pw, token: _tk, ...safeUser } = user.toObject();

  // If user is a doctor, fetch and include doctor profile
  if (user.usertype === "doctor") {
    const doctor = await Doctor.findOne({ userId: user._id });
    return res
      .status(200)
      .json(
        new ApiResponse(200, { user: safeUser, doctor }, "User fetched successfully")
      );
  }

  if (user.usertype === "patient") {
    const patient = await Patient.findOne({ userId: user._id });
    return res
      .status(200)
      .json(
        new ApiResponse(200, { user: safeUser, patient }, "User fetched successfully")
      );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { user: safeUser }, "User fetched successfully"));
});

export {
  registerUser,
  registerPatient,
  registerDoctor,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
};
