import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(20),
  JWT_REFRESH_SECRET: z.string().min(20),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  APP_PORT: z.coerce.number().default(4000),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  NODE_ENV: z.string().default("development")
});

export const env = envSchema.parse(process.env);
