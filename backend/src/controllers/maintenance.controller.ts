import type { Request, Response } from "express";
import { MaintenanceStatus, VehicleStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError, notFound } from "../lib/errors.js";
import { contains, pagination, sortBy } from "../utils/query.js";

export async function listMaintenance(req: Request, res: Response) {
  const { skip, take, page, pageSize } = pagination(req.query);
  const where = {
    AND: [
      req.query.search ? { OR: [{ maintenanceType: contains(req.query.search) }, { description: contains(req.query.search) }] } : {},
      req.query.status ? { status: req.query.status as never } : {}
    ]
  };
  const [data, total] = await Promise.all([
    prisma.maintenanceLog.findMany({ where, skip, take, orderBy: sortBy(req.query, ["createdAt", "date", "cost", "status"]), include: { vehicle: true } }),
    prisma.maintenanceLog.count({ where })
  ]);
  res.json({ data, meta: { total, page, pageSize } });
}

export async function createMaintenance(req: Request, res: Response) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: req.body.vehicleId } });
  if (!vehicle) throw notFound("Vehicle");
  if (vehicle.status === VehicleStatus.RETIRED) throw new AppError(409, "Retired vehicles cannot enter maintenance");
  const data = await prisma.$transaction(async (tx) => {
    const log = await tx.maintenanceLog.create({ data: { ...req.body, date: new Date(req.body.date) } });
    if (log.status === MaintenanceStatus.IN_PROGRESS) await tx.vehicle.update({ where: { id: log.vehicleId }, data: { status: VehicleStatus.IN_SHOP } });
    return log;
  });
  res.status(201).json(data);
}

export async function updateMaintenance(req: Request, res: Response) {
  const data = await prisma.maintenanceLog.update({ where: { id: String(req.params.id) }, data: { ...req.body, date: new Date(req.body.date) } });
  res.json(data);
}

export async function startMaintenance(req: Request, res: Response) {
  const log = await prisma.maintenanceLog.findUnique({ where: { id: String(req.params.id) } });
  if (!log) throw notFound("Maintenance log");
  const data = await prisma.$transaction(async (tx) => {
    const updated = await tx.maintenanceLog.update({ where: { id: log.id }, data: { status: MaintenanceStatus.IN_PROGRESS } });
    await tx.vehicle.update({ where: { id: log.vehicleId }, data: { status: VehicleStatus.IN_SHOP } });
    return updated;
  });
  res.json(data);
}

export async function closeMaintenance(req: Request, res: Response) {
  const log = await prisma.maintenanceLog.findUnique({ where: { id: String(req.params.id) } });
  if (!log) throw notFound("Maintenance log");
  const data = await prisma.$transaction(async (tx) => {
    const updated = await tx.maintenanceLog.update({ where: { id: log.id }, data: { status: MaintenanceStatus.CLOSED } });
    await tx.vehicle.update({ where: { id: log.vehicleId }, data: { status: VehicleStatus.AVAILABLE } });
    return updated;
  });
  res.json(data);
}

export async function deleteMaintenance(req: Request, res: Response) {
  await prisma.maintenanceLog.delete({ where: { id: String(req.params.id) } });
  res.status(204).send();
}
