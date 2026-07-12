import { Router } from "express";
import { closeMaintenance, createMaintenance, deleteMaintenance, listMaintenance, startMaintenance, updateMaintenance } from "../controllers/maintenance.controller.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParam, listQuery } from "../validators/common.js";
import { maintenanceSchema } from "../validators/domain.js";

export const maintenanceRouter = Router();
maintenanceRouter.use(requireAuth, allowRoles("FLEET_MANAGER"));
maintenanceRouter.get("/", validate(listQuery), asyncHandler(listMaintenance));
maintenanceRouter.post("/", validate(maintenanceSchema), asyncHandler(createMaintenance));
maintenanceRouter.put("/:id", validate(idParam.merge(maintenanceSchema)), asyncHandler(updateMaintenance));
maintenanceRouter.patch("/:id/start", validate(idParam), asyncHandler(startMaintenance));
maintenanceRouter.patch("/:id/close", validate(idParam), asyncHandler(closeMaintenance));
maintenanceRouter.delete("/:id", validate(idParam), asyncHandler(deleteMaintenance));
