import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  MONGODB_URI: z.string().default("mongodb://localhost:27017/medikiosk"),
  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string().default("24h"),
  FAST2SMS_API_KEY: z.string().default("YOUR_FAST2SMS_API_KEY_HERE"),
  FAST2SMS_ROUTE: z.string().default("otp"),
  OTP_EXPIRY_MINUTES: z.coerce.number().default(5),
  ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),
  NODE_ENV: z.string().default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
