import { Router } from "express";
import { createDriver, deleteDriver, getDriver, listDrivers, suspendDriver, updateDriver } from "../controllers/driver.controller.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParam, listQuery } from "../validators/common.js";
import { driverSchema } from "../validators/domain.js";

export const driverRouter = Router();
driverRouter.use(requireAuth);
driverRouter.get("/", validate(listQuery), allowRoles("FLEET_MANAGER", "SAFETY_OFFICER"), asyncHandler(listDrivers));
driverRouter.get("/:id", validate(idParam), allowRoles("FLEET_MANAGER", "SAFETY_OFFICER"), asyncHandler(getDriver));
driverRouter.post("/", validate(driverSchema), allowRoles("FLEET_MANAGER"), asyncHandler(createDriver));
driverRouter.put("/:id", validate(idParam.merge(driverSchema)), allowRoles("FLEET_MANAGER", "SAFETY_OFFICER"), asyncHandler(updateDriver));
driverRouter.patch("/:id/suspend", validate(idParam), allowRoles("SAFETY_OFFICER", "FLEET_MANAGER"), asyncHandler(suspendDriver));
driverRouter.delete("/:id", validate(idParam), allowRoles("FLEET_MANAGER"), asyncHandler(deleteDriver));
