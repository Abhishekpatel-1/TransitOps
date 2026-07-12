import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { comparePassword, hashToken, refreshExpiryDate, signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/security.js";
import { getDemoUserWithPassword } from "../lib/fallback-auth.js";

function publicUser(user: { id: string; name: string; email: string; role: { name: string } | string; driverId?: string | null }) {
  return { id: user.id, name: user.name, email: user.email, role: typeof user.role === "string" ? user.role : user.role.name, driverId: user.driverId };
}

async function loadUserFromDb(email: string) {
  try {
    return await prisma.user.findUnique({ where: { email }, include: { role: true } });
  } catch {
    return null;
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const dbUser = await loadUserFromDb(email);
  const demoUser = await getDemoUserWithPassword(email, password);

  const user = dbUser ?? demoUser;
  if (!user || !user.isActive || (!dbUser && !demoUser)) {
    throw new AppError(401, "Invalid credentials");
  }

  if (dbUser) {
    const passwordMatches = await comparePassword(password, dbUser.passwordHash);
    if (!passwordMatches) throw new AppError(401, "Invalid credentials");
  }

  const payload = { sub: user.id, role: typeof user.role === "string" ? user.role : user.role.name, email: user.email, driverId: user.driverId };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  if (dbUser) {
    await prisma.refreshToken.create({ data: { tokenHash: hashToken(refreshToken), userId: user.id, expiresAt: refreshExpiryDate() } });
  }

  res.json({ user: publicUser(user), accessToken, refreshToken });
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;
  const payload = verifyRefreshToken(refreshToken);
  const record = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(refreshToken) }, include: { user: { include: { role: true } } } });
  if (!record || record.revokedAt || record.expiresAt < new Date() || !record.user.isActive) throw new AppError(401, "Refresh token is invalid");
  await prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } });
  const nextPayload = { sub: payload.sub, role: record.user.role.name, email: record.user.email, driverId: record.user.driverId };
  const accessToken = signAccessToken(nextPayload);
  const nextRefreshToken = signRefreshToken(nextPayload);
  await prisma.refreshToken.create({ data: { tokenHash: hashToken(nextRefreshToken), userId: record.userId, expiresAt: refreshExpiryDate() } });
  res.json({ accessToken, refreshToken: nextRefreshToken, user: publicUser(record.user) });
}

export async function logout(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (refreshToken) await prisma.refreshToken.updateMany({ where: { tokenHash: hashToken(refreshToken) }, data: { revokedAt: new Date() } });
  res.status(204).send();
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, include: { role: true } });
  if (!user) throw new AppError(404, "User not found");
  res.json(publicUser(user));
}
