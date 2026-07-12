import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { notFound } from "../lib/errors.js";
import { contains, pagination, sortBy } from "../utils/query.js";

export async function listVehicles(req: Request, res: Response) {
  const { skip, take, page, pageSize } = pagination(req.query);
  const where = {
    AND: [
      req.query.search ? { OR: [{ registrationNumber: contains(req.query.search) }, { vehicleName: contains(req.query.search) }, { model: contains(req.query.search) }] } : {},
      req.query.status ? { status: req.query.status as never } : {},
      req.query.type ? { type: req.query.type as string } : {},
      req.query.region ? { region: req.query.region as string } : {}
    ]
  };
  const [data, total] = await Promise.all([
    prisma.vehicle.findMany({ where, skip, take, orderBy: sortBy(req.query, ["createdAt", "vehicleName", "registrationNumber", "status", "odometer"]) }),
    prisma.vehicle.count({ where })
  ]);
  res.json({ data, meta: { total, page, pageSize } });
}

export async function getVehicle(req: Request, res: Response) {
  const data = await prisma.vehicle.findUnique({ where: { id: String(req.params.id) }, include: { trips: true, maintenanceLogs: true, fuelLogs: true, expenses: true } });
  if (!data) throw notFound("Vehicle");
  res.json(data);
}

export async function createVehicle(req: Request, res: Response) {
  const data = await prisma.vehicle.create({ data: req.body });
  res.status(201).json(data);
}

export async function updateVehicle(req: Request, res: Response) {
  const data = await prisma.vehicle.update({ where: { id: String(req.params.id) }, data: req.body });
  res.json(data);
}

export async function deleteVehicle(req: Request, res: Response) {
  await prisma.vehicle.delete({ where: { id: String(req.params.id) } });
  res.status(204).send();
}
