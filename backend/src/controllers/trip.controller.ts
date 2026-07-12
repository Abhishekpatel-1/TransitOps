import type { Request, Response } from "express";
import { DriverStatus, TripStatus, VehicleStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError, notFound } from "../lib/errors.js";
import { contains, pagination, sortBy } from "../utils/query.js";

async function assertDispatchable(vehicleId: string, driverId: string, cargoWeight: number, tripId?: string) {
  const [vehicle, driver, vehicleTrip, driverTrip] = await Promise.all([
    prisma.vehicle.findUnique({ where: { id: vehicleId } }),
    prisma.driver.findUnique({ where: { id: driverId } }),
    prisma.trip.findFirst({ where: { vehicleId, status: TripStatus.DISPATCHED, NOT: tripId ? { id: tripId } : undefined } }),
    prisma.trip.findFirst({ where: { driverId, status: TripStatus.DISPATCHED, NOT: tripId ? { id: tripId } : undefined } })
  ]);
  if (!vehicle) throw notFound("Vehicle");
  if (!driver) throw notFound("Driver");
  if (vehicle.status !== VehicleStatus.AVAILABLE) throw new AppError(409, "Vehicle must be Available");
  if (driver.status !== DriverStatus.AVAILABLE) throw new AppError(409, "Driver must be Available");
  if (driver.licenseExpiry < new Date()) throw new AppError(409, "Driver license is expired");
  if (cargoWeight > vehicle.maximumCapacity) throw new AppError(409, "Cargo weight cannot exceed vehicle capacity");
  if (vehicleTrip) throw new AppError(409, "Vehicle already has an active trip");
  if (driverTrip) throw new AppError(409, "Driver already has an active trip");
}

export async function listTrips(req: Request, res: Response) {
  const { skip, take, page, pageSize } = pagination(req.query);
  const where = {
    AND: [
      req.user?.role === "DRIVER" && req.user.driverId ? { driverId: req.user.driverId } : {},
      req.query.search ? { OR: [{ source: contains(req.query.search) }, { destination: contains(req.query.search) }] } : {},
      req.query.status ? { status: req.query.status as never } : {},
      req.query.driverId ? { driverId: req.query.driverId as string } : {}
    ]
  };
  const [data, total] = await Promise.all([
    prisma.trip.findMany({ where, skip, take, orderBy: sortBy(req.query, ["createdAt", "source", "destination", "status", "plannedDistance"]), include: { vehicle: true, driver: true } }),
    prisma.trip.count({ where })
  ]);
  res.json({ data, meta: { total, page, pageSize } });
}

export async function getTrip(req: Request, res: Response) {
  const data = await prisma.trip.findUnique({ where: { id: String(req.params.id) }, include: { vehicle: true, driver: true } });
  if (!data) throw notFound("Trip");
  if (req.user?.role === "DRIVER" && req.user.driverId !== data.driverId) throw new AppError(403, "Trip is not assigned to this driver");
  res.json(data);
}

export async function createTrip(req: Request, res: Response) {
  if (req.body.status === TripStatus.DISPATCHED) await assertDispatchable(req.body.vehicleId, req.body.driverId, req.body.cargoWeight);
  const data = await prisma.$transaction(async (tx) => {
    const trip = await tx.trip.create({ data: req.body });
    if (trip.status === TripStatus.DISPATCHED) {
      await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: VehicleStatus.ON_TRIP } });
      await tx.driver.update({ where: { id: trip.driverId }, data: { status: DriverStatus.ON_TRIP } });
    }
    return trip;
  });
  res.status(201).json(data);
}

export async function updateTrip(req: Request, res: Response) {
  const existing = await prisma.trip.findUnique({ where: { id: String(req.params.id) } });
  if (!existing) throw notFound("Trip");
  if (existing.status !== TripStatus.DRAFT) throw new AppError(409, "Only draft trips can be edited");
  const data = await prisma.trip.update({ where: { id: String(req.params.id) }, data: req.body });
  res.json(data);
}

export async function dispatchTrip(req: Request, res: Response) {
  const trip = await prisma.trip.findUnique({ where: { id: String(req.params.id) } });
  if (!trip) throw notFound("Trip");
  if (trip.status !== TripStatus.DRAFT) throw new AppError(409, "Only draft trips can be dispatched");
  await assertDispatchable(trip.vehicleId, trip.driverId, trip.cargoWeight, trip.id);
  const data = await prisma.$transaction(async (tx) => {
    const updated = await tx.trip.update({ where: { id: trip.id }, data: { status: TripStatus.DISPATCHED, dispatchedAt: new Date() } });
    await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: VehicleStatus.ON_TRIP } });
    await tx.driver.update({ where: { id: trip.driverId }, data: { status: DriverStatus.ON_TRIP } });
    return updated;
  });
  res.json(data);
}

export async function completeTrip(req: Request, res: Response) {
  const trip = await prisma.trip.findUnique({ where: { id: String(req.params.id) } });
  if (!trip) throw notFound("Trip");
  if (req.user?.role === "DRIVER" && req.user.driverId !== trip.driverId) throw new AppError(403, "Trip is not assigned to this driver");
  if (trip.status !== TripStatus.DISPATCHED) throw new AppError(409, "Only dispatched trips can be completed");
  const data = await prisma.$transaction(async (tx) => {
    const updated = await tx.trip.update({ where: { id: trip.id }, data: { status: TripStatus.COMPLETED, actualDistance: req.body.actualDistance, fuelUsed: req.body.fuelUsed, completedAt: new Date() } });
    await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: VehicleStatus.AVAILABLE, odometer: { increment: req.body.actualDistance } } });
    await tx.driver.update({ where: { id: trip.driverId }, data: { status: DriverStatus.AVAILABLE } });
    return updated;
  });
  res.json(data);
}

export async function cancelTrip(req: Request, res: Response) {
  const trip = await prisma.trip.findUnique({ where: { id: String(req.params.id) } });
  if (!trip) throw notFound("Trip");
  if (trip.status === TripStatus.COMPLETED || trip.status === TripStatus.CANCELLED) throw new AppError(409, "Trip is already closed");
  const data = await prisma.$transaction(async (tx) => {
    const updated = await tx.trip.update({ where: { id: trip.id }, data: { status: TripStatus.CANCELLED, cancelledAt: new Date() } });
    if (trip.status === TripStatus.DISPATCHED) {
      await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: VehicleStatus.AVAILABLE } });
      await tx.driver.update({ where: { id: trip.driverId }, data: { status: DriverStatus.AVAILABLE } });
    }
    return updated;
  });
  res.json(data);
}

export async function deleteTrip(req: Request, res: Response) {
  const trip = await prisma.trip.findUnique({ where: { id: String(req.params.id) } });
  if (!trip) throw notFound("Trip");
  if (trip.status === TripStatus.DISPATCHED) throw new AppError(409, "Dispatched trips must be completed or cancelled before deletion");
  await prisma.trip.delete({ where: { id: String(req.params.id) } });
  res.status(204).send();
}
