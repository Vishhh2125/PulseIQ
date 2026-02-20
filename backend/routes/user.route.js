import { Router } from "express";
import {
  registerPatient,
  registerDoctor,
  loginUser,
  logoutUser,
  changePassword,
  getCurrentUser,
} from "../controllers/user.controller.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

// Public routes
router.post("/auth/register/patient", registerPatient);
router.post("/auth/register/doctor", registerDoctor);
router.post("/login", loginUser);

// Protected routes
router.post("/logout", auth, logoutUser);
router.post("/change-password", auth, changePassword);
router.get("/profile", auth, getCurrentUser);

export default router;
