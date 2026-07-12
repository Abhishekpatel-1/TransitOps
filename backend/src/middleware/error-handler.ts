import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "../lib/errors.js";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, `Route ${req.method} ${req.path} not found`));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(422).json({ message: "Validation failed", errors: err.flatten() });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") return res.status(409).json({ message: "Unique constraint violation", meta: err.meta });
    if (err.code === "P2025") return res.status(404).json({ message: "Record not found" });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }

  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
}
