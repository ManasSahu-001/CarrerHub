import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ── Rate Limiting ─────────────────────────────────────────────────────────────
// WHY? Prevents brute force attacks on auth endpoints
// Auth routes: 20 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI routes: 10 requests per hour (Gemini has rate limits)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    message: "AI request limit reached. Please try again after an hour.",
  },
});

// General API limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: "Too many requests, please slow down.",
  },
});

app.use("/api/", generalLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
import healthcheckRouter from "./routes/healthcheck.routes.js";
import authRouter        from "./routes/auth.routes.js";
import profileRouter     from "./routes/profile.routes.js";
import userRouter        from "./routes/user.routes.js";
import postRouter        from "./routes/post.routes.js";
import aiRouter          from "./routes/ai.routes.js";

app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/auth",        authLimiter, authRouter);
app.use("/api/v1/profile",     profileRouter);
app.use("/api/v1/users",       userRouter);
app.use("/api/v1/posts",       postRouter);
app.use("/api/v1/ai",          aiLimiter, aiRouter);

app.get("/", (req, res) => {
  res.send("ProLink API is running ✅");
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

export default app;
