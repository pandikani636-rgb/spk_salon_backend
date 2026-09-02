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

/* =========================================================
   BASIC CONFIG
========================================================= */

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

/* =========================================================
   HELMET
========================================================= */

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

/* =========================================================
   CORS
========================================================= */

const normalizeOrigin = (origin) => {
  if (!origin) return "";

  return origin
    .trim()
    .replace(/\/+$/, "");
};

const allowedOrigins = [
  process.env.FRONTEND_URL,

  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : []),
]
  .map(normalizeOrigin)
  .filter(Boolean);

console.log("Environment:", NODE_ENV);
console.log("Vercel:", process.env.VERCEL ? "YES" : "NO");
console.log("Allowed Origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins for the deployment to prevent CORS blocks
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 204,
  })
);

/* =========================================================
   BODY PARSER
========================================================= */

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

/* =========================================================
   LOGGER
========================================================= */

app.use(morgan("dev"));

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Apex Salon API is running",
    status: "OK",
    environment: NODE_ENV,
  });
});

/* =========================================================
   ROOT ROUTE
========================================================= */

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to the Apex Salon Booking API",
    status: "Running",
  });
});

/* =========================================================
   DATABASE CONNECTION
========================================================= */

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error);

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error:
        NODE_ENV === "production"
          ? undefined
          : error.message,
    });
  }
});

/* =========================================================
   REQUEST LOGGER
========================================================= */

app.use((req, res, next) => {
  console.log(
    `Incoming request: ${req.method} ${req.originalUrl}`
  );

  next();
});

/* =========================================================
   API ROUTES
========================================================= */

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/users", userRoutes);

app.use("/api/v1/salons", salonRoutes);

app.use("/api/v1/appointments", appointmentRoutes);

app.use("/api/v1/reviews", reviewRoutes);

app.use("/api/v1/admin", adminRoutes);

app.use("/api/v1/owner", ownerRoutes);

app.use("/api/v1/notifications", notificationRoutes);

app.use("/api/v1/categories", categoryRoutes);

app.use(
  "/api/v1/salon-categories",
  salonCategoryRoutes
);

app.use("/api/v1/locations", locationRoutes);

app.use("/api/v1/banners", bannerRoutes);

app.use("/api/v1/content", contentRoutes);

app.use("/api/v1/upload", uploadRoutes);

app.use("/api/v1/leaves", leaveRoutes);

/* =========================================================
   UPLOADS
========================================================= */

const __dirname = path.resolve();

/*
  IMPORTANT:
  Vercel serverless filesystem is temporary.
  For permanent images, use Cloudinary / external storage.

  This is kept only for local development / temporary files.
*/

if (process.env.VERCEL) {
  app.use(
    "/uploads",
    express.static("/tmp/uploads")
  );
} else {
  app.use(
    "/uploads",
    express.static(
      path.join(__dirname, "uploads")
    )
  );
}

/* =========================================================
   404 HANDLER
========================================================= */

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use(errorHandler);

/* =========================================================
   LOCAL SERVER
========================================================= */

if (
  NODE_ENV !== "production" &&
  !process.env.VERCEL
) {
  app.listen(PORT, () => {
    console.log(
      `Server running locally on port ${PORT}`
    );
  });
}

/* =========================================================
   IMPORTANT: DEFAULT EXPORT
========================================================= */

export default app;