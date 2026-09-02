import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UnauthorizedError } from "../utils/errors.js";

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new UnauthorizedError("No token provided"));
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.patientId = decoded.patientId;
    req.userRole = decoded.role || "patient";
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
}
