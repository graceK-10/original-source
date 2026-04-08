// server/index.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import contactRoutes from "./routes/contact.js";
import { connectToDatabase } from "./services/db.js";

// Controllers used for direct endpoints
import {
  validatePNumberEndpoint,
  getCurrentUser,
  reloadCSVData,
} from "./controllers/authController.js";

import { getProducts } from "./controllers/ordersController.js";
import { auth, requireValidated } from "./middleware/auth.js";

// Routers
import authRoutes from "./routes/auth.js";
import ordersRouter from "./routes/orders.js";
import paymentRoutes from "./routes/payment.js";
import instaPayRoutes from "./routes/instapay.js";

dotenv.config();

const app = express();

// We’re behind a proxy (so secure cookies & protocol work properly)
app.set("trust proxy", 1);

/* =======================
   CORS (bare origins only)
   ======================= */
const ENV_ORIGINS = (process.env.CLIENT_ORIGINS || "")
  .split(",").map(s => s.trim()).filter(Boolean);

const PROD_ORIGINS = [
  "https://originalsource.co.za",
  "https://www.originalsource.co.za",
];

const DEV_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const ALLOW_ORIGINS = [...PROD_ORIGINS, ...DEV_ORIGINS, ...ENV_ORIGINS];
console.log("CORS origins configured:", ALLOW_ORIGINS);

const corsConfig = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // same-origin / curl / server-to-server
    const allowed = ALLOW_ORIGINS.includes(origin);
    if (allowed) return cb(null, true);
    // Comment the next line if you prefer silent denial:
    console.warn(`[CORS] Blocked origin: ${origin}`);
    // Hard fail (better visibility during setup):
    return cb(new Error(`CORS blocked for ${origin}`));
    // Or: return cb(null, false); // silent deny
  },
  credentials: true,
  methods: ["GET","HEAD","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","X-Requested-With"],
  exposedHeaders: ["Authorization"],
};

// Apply CORS and parsers before routes
app.use(cors(corsConfig));
app.options("*", cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* =======================
   Health check
   ======================= */
app.get("/api/health", (_req, res) => res.json({ ok: true }));

/* =======================
   API Routers
   ======================= */
app.use("/api/auth", authRoutes);
app.use("/api", ordersRouter);
app.use("/api/payment", paymentRoutes);
app.use("/api/instapay", instaPayRoutes);
app.use("/api", contactRoutes);

/* =======================
   Direct endpoints
   ======================= */
app.get("/api/auth/validate-pnumber", validatePNumberEndpoint);
app.get("/api/auth/user", auth, getCurrentUser);
app.post("/api/auth/reload-csv", reloadCSVData);

app.get("/api/protected", auth, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

app.get("/api/validated", auth, requireValidated, (req, res) => {
  res.json({ message: "This route requires validation", user: req.user });
});

// Simple products endpoint (if still used)
app.get("/api/products", getProducts);

/* =======================
   404 for unknown /api routes
   ======================= */
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

/* =======================
   Error handler
   ======================= */
app.use((err, req, res, next) => {
  void next;
  console.error("[Server Error]", err?.stack || err?.message || err);

  const status =
    err?.status || (String(err?.message || "").startsWith("CORS") ? 403 : 500);

  res.status(status).json({ error: err?.message || "Internal Server Error" });
});

/* =======================
   Start server
   ======================= */
const PORT = Number(process.env.PORT || 4040);
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
      console.log("Allowed CORS origins:", ALLOW_ORIGINS.join(", "));
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error?.message || error);
    process.exit(1);
  });
