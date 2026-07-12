import { Router } from "express";
import { driverPerformance, fleetUtilization, fuelEfficiency, maintenanceCost, operationalCost, vehicleRoi } from "../controllers/report.controller.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";

export const reportRouter = Router();
reportRouter.use(requireAuth, allowRoles("FLEET_MANAGER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"));
reportRouter.get("/fuel-efficiency", asyncHandler(fuelEfficiency));
reportRouter.get("/operational-cost", asyncHandler(operationalCost));
reportRouter.get("/fleet-utilization", asyncHandler(fleetUtilization));
reportRouter.get("/driver-performance", asyncHandler(driverPerformance));
reportRouter.get("/maintenance-cost", asyncHandler(maintenanceCost));
reportRouter.get("/vehicle-roi", asyncHandler(vehicleRoi));
