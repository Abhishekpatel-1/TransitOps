import type { Request, Response } from "express";
import { addDays, format, startOfMonth, subMonths } from "date-fns";
import { DriverStatus, TripStatus, VehicleStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export async function getDashboard(req: Request, res: Response) {
  const [
    totalVehicles,
    activeVehicles,
    availableVehicles,
    maintenanceVehicles,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    fuelLogs,
    maintenanceLogs,
    trips,
    expenses,
    expiringDrivers,
    maintenanceDueVehicles
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: { not: VehicleStatus.RETIRED } } }),
    prisma.vehicle.count({ where: { status: VehicleStatus.AVAILABLE } }),
    prisma.vehicle.count({ where: { status: VehicleStatus.IN_SHOP } }),
    prisma.trip.count({ where: { status: TripStatus.DISPATCHED } }),
    prisma.trip.count({ where: { status: TripStatus.DRAFT } }),
    prisma.driver.count({ where: { status: DriverStatus.ON_TRIP } }),
    prisma.fuelLog.findMany({ where: { date: { gte: subMonths(new Date(), 11) } } }),
    prisma.maintenanceLog.findMany({ where: { date: { gte: subMonths(new Date(), 11) } } }),
    prisma.trip.findMany({ where: { createdAt: { gte: subMonths(new Date(), 11) } }, include: { vehicle: true } }),
    prisma.expense.findMany({ where: { date: { gte: subMonths(new Date(), 11) } } }),
    prisma.driver.findMany({ where: { licenseExpiry: { lte: addDays(new Date(), 30) } }, orderBy: { licenseExpiry: "asc" }, take: 8 }),
    prisma.vehicle.findMany({ where: { maintenanceDueAtKm: { not: null } }, take: 8 })
  ]);

  const monthKey = (date: Date) => format(date, "MMM yyyy");
  const monthlyFuelCost = Object.values(fuelLogs.reduce<Record<string, { month: string; cost: number }>>((acc, log) => {
    const month = monthKey(log.date);
    acc[month] = acc[month] ?? { month, cost: 0 };
    acc[month].cost += log.cost;
    return acc;
  }, {}));
  const maintenanceCost = Object.values(maintenanceLogs.reduce<Record<string, { month: string; cost: number }>>((acc, log) => {
    const month = monthKey(log.date);
    acc[month] = acc[month] ?? { month, cost: 0 };
    acc[month].cost += log.cost;
    return acc;
  }, {}));
  const vehicleUsage = Object.values(trips.reduce<Record<string, { name: string; trips: number; distance: number }>>((acc, trip) => {
    const name = trip.vehicle.registrationNumber;
    acc[name] = acc[name] ?? { name, trips: 0, distance: 0 };
    acc[name].trips += 1;
    acc[name].distance += trip.actualDistance ?? trip.plannedDistance;
    return acc;
  }, {}));
  const tripStatusDistribution = Object.values(trips.reduce<Record<string, { status: string; value: number }>>((acc, trip) => {
    acc[trip.status] = acc[trip.status] ?? { status: trip.status, value: 0 };
    acc[trip.status].value += 1;
    return acc;
  }, {}));
  const fleetUtilization = totalVehicles ? Math.round((activeVehicles - availableVehicles - maintenanceVehicles) / totalVehicles * 100) : 0;
  const highFuelConsumption = fuelLogs.filter((log) => log.fuelEfficiency < 4).slice(0, 8);

  res.json({
    cards: { activeVehicles, availableVehicles, vehiclesInMaintenance: maintenanceVehicles, activeTrips, pendingTrips, driversOnDuty, fleetUtilization },
    charts: { monthlyFuelCost, maintenanceCost, vehicleUsage, tripStatusDistribution },
    recentExpenses: expenses.slice(0, 8),
    notifications: {
      expiredLicense: expiringDrivers.filter((driver) => driver.licenseExpiry < new Date()),
      upcomingLicenseExpiry: expiringDrivers.filter((driver) => driver.licenseExpiry >= new Date()),
      vehicleMaintenanceDue: maintenanceDueVehicles.filter((vehicle) => vehicle.maintenanceDueAtKm !== null && vehicle.odometer >= Number(vehicle.maintenanceDueAtKm)),
      highFuelConsumption
    }
  });
}

export async function globalSearch(req: Request, res: Response) {
  const q = String(req.query.q ?? "").trim();
  if (!q) return res.json({ vehicles: [], drivers: [], trips: [] });
  const [vehicles, drivers, trips] = await Promise.all([
    prisma.vehicle.findMany({ where: { OR: [{ registrationNumber: { contains: q, mode: "insensitive" } }, { vehicleName: { contains: q, mode: "insensitive" } }] }, take: 8 }),
    prisma.driver.findMany({ where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { licenseNumber: { contains: q, mode: "insensitive" } }] }, take: 8 }),
    prisma.trip.findMany({ where: { OR: [{ source: { contains: q, mode: "insensitive" } }, { destination: { contains: q, mode: "insensitive" } }] }, include: { vehicle: true, driver: true }, take: 8 })
  ]);
  res.json({ vehicles, drivers, trips });
}
