import { logger } from "../utils/logger.js";

export function setupSocket(io) {
  io.on("connection", (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on("patient:progress", (data) => {
      io.emit("patient:update", data);
    });

    socket.on("join:counter", (counter) => {
      socket.join(`counter:${counter}`);
      logger.info(`Socket ${socket.id} joined counter:${counter}`);
    });

    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
}
