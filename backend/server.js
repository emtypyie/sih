import express from "express";
import { createServer } from "http";
import { resolve } from "path";
import { Server } from "socket.io";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";

import { env } from "./src/config/env.js";
import { connectDB } from "./src/config/db.js";
import { logger } from "./src/utils/logger.js";
import { errorHandler } from "./src/middleware/errorHandler.js";
import { setupSocket } from "./src/socket/index.js";

import authRoutes from "./src/routes/auth.js";
import patientRoutes from "./src/routes/patients.js";
import interviewRoutes from "./src/routes/interview.js";
import ocrRoutes from "./src/routes/ocr.js";
import tokenRoutes from "./src/routes/tokens.js";
import reportRoutes from "./src/routes/reports.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: env.ALLOWED_ORIGINS.split(","), methods: ["GET", "POST"] },
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
app.use("/api/ocr", ocrRoutes);
app.use("/api/tokens", tokenRoutes);
app.use("/api/reports", reportRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/uploads", express.static(resolve("uploads")));

app.get("*", (req, res) => {
  res.sendFile(resolve("../index.html"));
});

app.use(errorHandler);

await connectDB();

httpServer.listen(env.PORT, () => {
  logger.info(`MediKiosk backend running on port ${env.PORT}`);
  logger.info(`Frontend: http://localhost:${env.PORT}`);
  logger.info(`API: http://localhost:${env.PORT}/api/health`);
});
