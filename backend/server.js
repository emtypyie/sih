import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import axios from "axios";

import { env } from "./src/config/env.js";
import { connectDB } from "./src/config/db.js";
import { logger } from "./src/utils/logger.js";
import { errorHandler } from "./src/middleware/errorHandler.js";
import { setupSocket } from "./src/socket/index.js";

import authRoutes from "./src/routes/auth.js";
import patientRoutes from "./src/routes/patients.js";
import interviewRoutes from "./src/routes/interview.js";
import tokenRoutes from "./src/routes/tokens.js";
import reportRoutes from "./src/routes/reports.js";
import doctorRoutes from "./src/routes/doctor.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: env.ALLOWED_ORIGINS.split(","), methods: ["GET", "POST", "PUT"] },
});

app.set("io", io);
setupSocket(io);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: env.ALLOWED_ORIGINS.split(",") }));
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
app.use("/api/", limiter);

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/tokens", tokenRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/doctor", doctorRoutes);

// Proxy OCR requests to Python OCR service
app.use("/api/ocr", async (req, res) => {
  try {
    const ocrBase = env.OCR_SERVICE_URL || "http://localhost:3001";
    const config = {
      method: req.method,
      url: `${ocrBase}${req.url}`,
      headers: { ...req.headers },
      timeout: 60000,
    };
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      if (req.is("multipart/form-data")) {
        config.data = req;
        config.headers["content-type"] = req.headers["content-type"];
      } else {
        config.data = req.body;
      }
    }
    const ocrRes = await axios(config);
    const contentType = ocrRes.headers["content-type"];
    if (contentType) res.setHeader("Content-Type", contentType);
    res.status(ocrRes.status).send(ocrRes.data);
  } catch (err) {
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(502).json({ success: false, error: "OCR service unavailable" });
    }
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

await connectDB();

httpServer.listen(env.PORT, () => {
  logger.info(`MediKiosk backend running on port ${env.PORT}`);
  logger.info(`API: http://localhost:${env.PORT}/api/health`);
});

export default app;
