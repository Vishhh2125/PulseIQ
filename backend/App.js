import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────────────────────────
import userRouter from "./routes/user.route.js";
import doctorRouter from "./routes/doctor.route.js";
import appointmentRouter from "./routes/appointment.route.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/doctors", doctorRouter);
app.use("/api/v1/appointments", appointmentRouter);

app.get("/test", (req, res) => {
  res.send("PulseIQ API is working");
});

// ─── Error Handler ────────────────────────────────────────────────────────────
import { errorHandler } from "./middlewares/errorHandler.js";
app.use(errorHandler);

export default app;
