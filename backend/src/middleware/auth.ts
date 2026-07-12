import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { verifyAccessToken } from "../lib/security.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        driverId?: string | null;
      };
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return next(new AppError(401, "Missing bearer token"));

  const payload = verifyAccessToken(header.slice(7));
  const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { role: true } });
  if (!user?.isActive) return next(new AppError(401, "Inactive or unknown user"));

  req.user = { id: user.id, email: user.email, role: user.role.name, driverId: user.driverId };
  return next();
}

export function allowRoles(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError(401, "Authentication required"));
    if (!roles.includes(req.user.role)) return next(new AppError(403, "Insufficient permissions"));
    return next();
  };
}
