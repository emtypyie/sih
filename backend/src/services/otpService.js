import axios from "axios";
import { env } from "../config/env.js";
import { generateOTP } from "../utils/helpers.js";
import { Session } from "../models/Session.js";
import { AppError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

export async function sendOTP(phone) {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

  Session.deleteExpired();
  Session.create({ phone, otp, expiresAt });

  if (env.FAST2SMS_API_KEY && env.FAST2SMS_API_KEY !== "YOUR_FAST2SMS_API_KEY_HERE") {
    try {
      await axios.post(
        "https://www.fast2sms.com/dev/bulkV2",
        { variables_values: otp, route: env.FAST2SMS_ROUTE, numbers: phone },
        { headers: { authorization: env.FAST2SMS_API_KEY, "Content-Type": "application/json" } }
      );
      logger.info(`OTP sent to ${phone}`);
    } catch (err) {
      logger.warn("Fast2SMS API failed, OTP:", otp);
    }
  } else {
    logger.info(`[DEV] OTP for ${phone}: ${otp}`);
  }

  return { message: "OTP sent", expiresIn: env.OTP_EXPIRY_MINUTES * 60 };
}

export async function verifyOTP(phone, otp) {
  const session = Session.findOne({ phone });
  if (!session) throw new AppError("No active OTP session", 400);
  if (new Date() > new Date(session.expires_at)) {
    Session.update(session.id, { verified: true });
    throw new AppError("OTP expired", 400);
  }
  if (session.otp !== otp) throw new AppError("Invalid OTP", 400);
  Session.update(session.id, { verified: true });
  return session;
}
