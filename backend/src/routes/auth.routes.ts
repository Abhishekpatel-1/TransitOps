import { Router } from "express";
import { login, logout, me, refresh } from "../controllers/auth.controller.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, refreshSchema } from "../validators/domain.js";

export const authRouter = Router();
authRouter.post("/login", validate(loginSchema), asyncHandler(login));
authRouter.post("/refresh", validate(refreshSchema), asyncHandler(refresh));
authRouter.post("/logout", asyncHandler(logout));
authRouter.get("/me", requireAuth, asyncHandler(me));
