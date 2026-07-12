import { Router } from "express";
import { createFuelLog, deleteFuelLog, listFuelLogs } from "../controllers/fuel.controller.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParam, listQuery } from "../validators/common.js";
import { fuelSchema } from "../validators/domain.js";

export const fuelRouter = Router();
fuelRouter.use(requireAuth, allowRoles("FLEET_MANAGER", "FINANCIAL_ANALYST"));
fuelRouter.get("/", validate(listQuery), asyncHandler(listFuelLogs));
fuelRouter.post("/", validate(fuelSchema), allowRoles("FLEET_MANAGER"), asyncHandler(createFuelLog));
fuelRouter.delete("/:id", validate(idParam), allowRoles("FLEET_MANAGER"), asyncHandler(deleteFuelLog));
