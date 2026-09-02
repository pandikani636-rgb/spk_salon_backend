const normalizeOrigin = (origin) => {
  if (!origin) return "";

  return origin.trim().replace(/\/+$/, "");
};

const allowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.ALLOWED_ORIGINS || "").split(","),
]
  .map(normalizeOrigin)
  .filter(Boolean);

console.log("Allowed Origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Postman / mobile / server-to-server
      if (!origin) {
        return callback(null, true);
      }

      const requestOrigin = normalizeOrigin(origin);

      // Development
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }

      // Production
      if (allowedOrigins.includes(requestOrigin)) {
        return callback(null, true);
      }

      console.error("❌ CORS BLOCKED:", requestOrigin);

      return callback(null, false);
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
    ],

    optionsSuccessStatus: 204,
  })
);