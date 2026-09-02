import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";

import { connectDB } from "./config/db.js";
import { errorHandler } from "./middlewares/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import salonRoutes from "./routes/salonRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import ownerRoutes from "./routes/ownerRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import salonCategoryRoutes from "./routes/salonCategoryRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";

dotenv.config();

const app = express();

/* =========================
   SECURITY
========================= */

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

/* =========================
   CORS
========================= */

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL.trim()]
    : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without origin
      // such as Postman/server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      // Development
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }

      // Production
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

/* =========================
   BODY PARSER
========================= */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* =========================
   LOGGER
========================= */

app.use(morgan("dev"));

/* =========================
   DATABASE
========================= */

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection error:", error);

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

/* =========================
   REQUEST LOGGER
========================= */

app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
  );

  next();
});

/* =========================
   API ROUTES
========================= */

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/salons", salonRoutes);
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/owner", ownerRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/salon-categories", salonCategoryRoutes);
app.use("/api/v1/locations", locationRoutes);
app.use("/api/v1/banners", bannerRoutes);
app.use("/api/v1/content", contentRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/leaves", leaveRoutes);

/* =========================
   HEALTH CHECK
========================= */

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to the Apex Salon Booking API",
    status: "Running",
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "API is healthy",
    status: "OK",
  });
});

/* =========================
   UPLOADS
========================= */

const __dirname = path.resolve();

if (process.env.VERCEL) {
  app.use("/uploads", express.static("/tmp/uploads"));
} else {
  app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
  );
}

/* =========================
   404 HANDLER
========================= */

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */

app.use(errorHandler);

/* =========================
   LOCAL SERVER
========================= */

if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

/* =========================
   VERCEL EXPORT
========================= */

export default app;