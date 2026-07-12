import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from "../config/env.js";

export type TokenPayload = {
  sub: string;
  role: string;
  email: string;
  driverId?: string | null;
};

export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const comparePassword = (password: string, hash: string) => bcrypt.compare(password, hash);
export const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export function signAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN } as SignOptions);
}

export function signRefreshToken(payload: TokenPayload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as SignOptions);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}

export function refreshExpiryDate() {
  const days = Number.parseInt(env.JWT_REFRESH_EXPIRES_IN, 10) || 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
