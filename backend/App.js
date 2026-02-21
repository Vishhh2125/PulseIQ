import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";

const app = express();

// ✅ CORS configuration BEFORE routes
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];
    
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie", "Authorization"],
  preflightContinue: false,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());

// Session middleware for Google OAuth
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fit_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// ─── Routes ───────────────────────────────────────────────────────────────────
import userRouter from "./routes/user.route.js";
import doctorRouter from "./routes/doctor.route.js";
import appointmentRouter from "./routes/appointment.route.js";
import fitnessRouter from "./routes/fitness.route.js";
import assessmentRouter from "./routes/assessment.route.js";
import skinDetectionRouter from "./routes/skinDetection.route.js";
import carePlanRouter from "./routes/carePlan.route.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/doctors", doctorRouter);
app.use("/api/v1/appointments", appointmentRouter);
app.use("/", fitnessRouter);
app.use("/api", assessmentRouter);
app.use("/api/v1/skin-detection", skinDetectionRouter);
app.use("/api/v1/care-plan", carePlanRouter);

app.get("/test", (req, res) => {
  res.send("PulseIQ API is working");
});

// ─── Error Handler ────────────────────────────────────────────────────────────
import { errorHandler } from "./middlewares/errorHandler.js";
app.use(errorHandler);

export default app;
