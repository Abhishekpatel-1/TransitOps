import { Router } from "express";
import { createVehicle, deleteVehicle, getVehicle, listVehicles, updateVehicle } from "../controllers/vehicle.controller.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParam, listQuery } from "../validators/common.js";
import { vehicleSchema } from "../validators/domain.js";

export const vehicleRouter = Router();
vehicleRouter.use(requireAuth);
vehicleRouter.get("/", validate(listQuery), allowRoles("FLEET_MANAGER", "FINANCIAL_ANALYST"), asyncHandler(listVehicles));
vehicleRouter.get("/:id", validate(idParam), allowRoles("FLEET_MANAGER", "FINANCIAL_ANALYST"), asyncHandler(getVehicle));
vehicleRouter.post("/", validate(vehicleSchema), allowRoles("FLEET_MANAGER"), asyncHandler(createVehicle));
vehicleRouter.put("/:id", validate(idParam.merge(vehicleSchema)), allowRoles("FLEET_MANAGER"), asyncHandler(updateVehicle));
vehicleRouter.delete("/:id", validate(idParam), allowRoles("FLEET_MANAGER"), asyncHandler(deleteVehicle));
