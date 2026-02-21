import { Router } from "express";
import { generateCarePlan } from "../controllers/carePlan.controller.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

// Generate care plan (protected route)
router.post("/generate", auth, generateCarePlan);

export default router;
