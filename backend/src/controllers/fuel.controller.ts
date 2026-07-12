import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { notFound } from "../lib/errors.js";
import { pagination, sortBy } from "../utils/query.js";

export async function listFuelLogs(req: Request, res: Response) {
  const { skip, take, page, pageSize } = pagination(req.query);
  const where = {
    AND: [
      req.query.status ? { vehicle: { status: req.query.status as never } } : {},
      req.query.type ? { vehicle: { type: req.query.type as string } } : {},
      req.query.region ? { vehicle: { region: req.query.region as string } } : {},
      req.query.startDate ? { date: { gte: new Date(req.query.startDate as string) } } : {},
      req.query.endDate ? { date: { lte: new Date(req.query.endDate as string) } } : {}
    ]
  };
  const [data, total] = await Promise.all([
    prisma.fuelLog.findMany({ where, skip, take, orderBy: sortBy(req.query, ["createdAt", "date", "cost", "liters", "fuelEfficiency"]), include: { vehicle: true } }),
    prisma.fuelLog.count({ where })
  ]);
  res.json({ data, meta: { total, page, pageSize } });
}

export async function createFuelLog(req: Request, res: Response) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: req.body.vehicleId } });
  if (!vehicle) throw notFound("Vehicle");
  const data = await prisma.fuelLog.create({
    data: {
      ...req.body,
      date: new Date(req.body.date),
      fuelEfficiency: Number((req.body.distance / req.body.liters).toFixed(2))
    },
    include: { vehicle: true }
  });
  res.status(201).json(data);
}

export async function deleteFuelLog(req: Request, res: Response) {
  await prisma.fuelLog.delete({ where: { id: String(req.params.id) } });
  res.status(204).send();
}
