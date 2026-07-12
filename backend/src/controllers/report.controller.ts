import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { toCsv, toPdfBuffer } from "../utils/export.js";

async function sendReport(req: Request, res: Response, title: string, rows: Record<string, unknown>[]) {
  if (req.query.format === "csv") {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${title}.csv"`);
    return res.send(toCsv(rows));
  }
  if (req.query.format === "pdf") {
    const pdf = await toPdfBuffer(title, rows);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${title}.pdf"`);
    return res.send(pdf);
  }
  return res.json({ title, rows });
}

export async function fuelEfficiency(req: Request, res: Response) {
  const logs = await prisma.fuelLog.groupBy({ by: ["vehicleId"], _avg: { fuelEfficiency: true }, _sum: { liters: true, cost: true, distance: true } });
  const vehicles = await prisma.vehicle.findMany({ where: { id: { in: logs.map((l) => l.vehicleId) } } });
  const rows = logs.map((log) => {
    const vehicle = vehicles.find((v) => v.id === log.vehicleId);
    return { vehicle: vehicle?.registrationNumber, averageKmPerLiter: log._avg.fuelEfficiency?.toFixed(2), liters: log._sum.liters, cost: log._sum.cost, distance: log._sum.distance };
  });
  return sendReport(req, res, "fuel-efficiency", rows);
}

export async function operationalCost(req: Request, res: Response) {
  const expenses = await prisma.expense.groupBy({ by: ["expenseType"], _sum: { amount: true } });
  const rows = expenses.map((item) => ({ expenseType: item.expenseType, total: item._sum.amount ?? 0 }));
  return sendReport(req, res, "operational-cost", rows);
}

export async function fleetUtilization(req: Request, res: Response) {
  const vehicles = await prisma.vehicle.findMany({ include: { trips: true } });
  const rows = vehicles.map((vehicle) => ({
    vehicle: vehicle.registrationNumber,
    status: vehicle.status,
    trips: vehicle.trips.length,
    completedTrips: vehicle.trips.filter((trip) => trip.status === "COMPLETED").length,
    distance: vehicle.trips.reduce((sum, trip) => sum + (trip.actualDistance ?? 0), 0)
  }));
  return sendReport(req, res, "fleet-utilization", rows);
}

export async function driverPerformance(req: Request, res: Response) {
  const drivers = await prisma.driver.findMany({ include: { trips: true } });
  const rows = drivers.map((driver) => ({
    driver: driver.name,
    licenseNumber: driver.licenseNumber,
    safetyScore: driver.safetyScore,
    completedTrips: driver.trips.filter((trip) => trip.status === "COMPLETED").length,
    activeTrips: driver.trips.filter((trip) => trip.status === "DISPATCHED").length
  }));
  return sendReport(req, res, "driver-performance", rows);
}

export async function maintenanceCost(req: Request, res: Response) {
  const logs = await prisma.maintenanceLog.findMany({ include: { vehicle: true } });
  const rows = logs.map((log) => ({ vehicle: log.vehicle.registrationNumber, type: log.maintenanceType, status: log.status, cost: log.cost, date: log.date.toISOString().slice(0, 10) }));
  return sendReport(req, res, "maintenance-cost", rows);
}

export async function vehicleRoi(req: Request, res: Response) {
  const vehicles = await prisma.vehicle.findMany({ include: { expenses: true, maintenanceLogs: true, trips: true } });
  const rows = vehicles.map((vehicle) => {
    const cost = vehicle.acquisitionCost + vehicle.expenses.reduce((sum, expense) => sum + expense.amount, 0) + vehicle.maintenanceLogs.reduce((sum, log) => sum + log.cost, 0);
    const completedDistance = vehicle.trips.reduce((sum, trip) => sum + (trip.actualDistance ?? 0), 0);
    const estimatedRevenue = completedDistance * 2.75;
    return { vehicle: vehicle.registrationNumber, acquisitionCost: vehicle.acquisitionCost, totalCost: Number(cost.toFixed(2)), estimatedRevenue: Number(estimatedRevenue.toFixed(2)), roiPercent: Number((((estimatedRevenue - cost) / Math.max(cost, 1)) * 100).toFixed(2)) };
  });
  return sendReport(req, res, "vehicle-roi", rows);
}
