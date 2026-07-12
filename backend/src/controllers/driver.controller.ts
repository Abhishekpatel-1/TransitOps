import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { notFound } from "../lib/errors.js";
import { contains, pagination, sortBy } from "../utils/query.js";

export async function listDrivers(req: Request, res: Response) {
  const { skip, take, page, pageSize } = pagination(req.query);
  const where = {
    AND: [
      req.query.search ? { OR: [{ name: contains(req.query.search) }, { licenseNumber: contains(req.query.search) }, { contactNumber: contains(req.query.search) }] } : {},
      req.query.status ? { status: req.query.status as never } : {},
      req.query.region ? { region: req.query.region as string } : {}
    ]
  };
  const [data, total] = await Promise.all([
    prisma.driver.findMany({ where, skip, take, orderBy: sortBy(req.query, ["createdAt", "name", "licenseExpiry", "safetyScore", "status"]) }),
    prisma.driver.count({ where })
  ]);
  res.json({ data, meta: { total, page, pageSize } });
}

export async function getDriver(req: Request, res: Response) {
  const data = await prisma.driver.findUnique({ where: { id: String(req.params.id) }, include: { trips: true } });
  if (!data) throw notFound("Driver");
  res.json(data);
}

export async function createDriver(req: Request, res: Response) {
  const data = await prisma.driver.create({ data: { ...req.body, licenseExpiry: new Date(req.body.licenseExpiry) } });
  res.status(201).json(data);
}

export async function updateDriver(req: Request, res: Response) {
  const data = await prisma.driver.update({ where: { id: String(req.params.id) }, data: { ...req.body, licenseExpiry: new Date(req.body.licenseExpiry) } });
  res.json(data);
}

export async function suspendDriver(req: Request, res: Response) {
  const data = await prisma.driver.update({ where: { id: String(req.params.id) }, data: { status: "SUSPENDED" } });
  res.json(data);
}

export async function deleteDriver(req: Request, res: Response) {
  await prisma.driver.delete({ where: { id: String(req.params.id) } });
  res.status(204).send();
}
