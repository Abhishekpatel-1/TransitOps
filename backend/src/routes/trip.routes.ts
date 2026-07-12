import { Router } from "express";
import { cancelTrip, completeTrip, createTrip, deleteTrip, dispatchTrip, getTrip, listTrips, updateTrip } from "../controllers/trip.controller.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParam, listQuery } from "../validators/common.js";
import { completeTripSchema, tripSchema } from "../validators/domain.js";

export const tripRouter = Router();
tripRouter.use(requireAuth);
tripRouter.get("/", validate(listQuery), allowRoles("FLEET_MANAGER", "DRIVER"), asyncHandler(listTrips));
tripRouter.get("/:id", validate(idParam), allowRoles("FLEET_MANAGER", "DRIVER"), asyncHandler(getTrip));
tripRouter.post("/", validate(tripSchema), allowRoles("FLEET_MANAGER"), asyncHandler(createTrip));
tripRouter.put("/:id", validate(idParam.merge(tripSchema)), allowRoles("FLEET_MANAGER"), asyncHandler(updateTrip));
tripRouter.patch("/:id/dispatch", validate(idParam), allowRoles("FLEET_MANAGER"), asyncHandler(dispatchTrip));
tripRouter.patch("/:id/complete", validate(idParam.merge(completeTripSchema)), allowRoles("FLEET_MANAGER", "DRIVER"), asyncHandler(completeTrip));
tripRouter.patch("/:id/cancel", validate(idParam), allowRoles("FLEET_MANAGER"), asyncHandler(cancelTrip));
tripRouter.delete("/:id", validate(idParam), allowRoles("FLEET_MANAGER"), asyncHandler(deleteTrip));
