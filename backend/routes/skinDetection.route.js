import { Router } from "express";
import { analyzeSkinCondition } from "../controllers/skinDetection.controller.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

// Analyze skin condition (protected route)
router.post("/analyze", auth, analyzeSkinCondition);

export default router;
