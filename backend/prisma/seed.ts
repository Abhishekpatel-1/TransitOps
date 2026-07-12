import { PrismaClient, DriverStatus, ExpenseType, MaintenanceStatus, RoleName, TripStatus, VehicleStatus } from "@prisma/client";
import { hashPassword } from "../src/lib/security.js";

const prisma = new PrismaClient();

async function main() {
  const roles = await Promise.all([
    prisma.role.upsert({ where: { name: RoleName.FLEET_MANAGER }, update: {}, create: { name: RoleName.FLEET_MANAGER, description: "Full platform access" } }),
    prisma.role.upsert({ where: { name: RoleName.DRIVER }, update: {}, create: { name: RoleName.DRIVER, description: "Assigned trip execution" } }),
    prisma.role.upsert({ where: { name: RoleName.SAFETY_OFFICER }, update: {}, create: { name: RoleName.SAFETY_OFFICER, description: "Driver safety and license compliance" } }),
    prisma.role.upsert({ where: { name: RoleName.FINANCIAL_ANALYST }, update: {}, create: { name: RoleName.FINANCIAL_ANALYST, description: "Finance, fuel, expenses and reports" } })
  ]);
  const roleByName = Object.fromEntries(roles.map((role) => [role.name, role]));
  const passwordHash = await hashPassword("TransitOps@123");

  const [driverA, driverB, driverC] = await Promise.all([
    prisma.driver.upsert({
      where: { licenseNumber: "DL-NORTH-1001" },
      update: {},
      create: { name: "Aarav Mehta", licenseNumber: "DL-NORTH-1001", licenseCategory: "HGV", licenseExpiry: new Date("2027-08-20"), contactNumber: "+91 98765 10001", safetyScore: 94, region: "North", status: DriverStatus.AVAILABLE }
    }),
    prisma.driver.upsert({
      where: { licenseNumber: "DL-WEST-2044" },
      update: {},
      create: { name: "Neha Sharma", licenseNumber: "DL-WEST-2044", licenseCategory: "HMV", licenseExpiry: new Date("2026-07-25"), contactNumber: "+91 98765 20440", safetyScore: 88, region: "West", status: DriverStatus.AVAILABLE }
    }),
    prisma.driver.upsert({
      where: { licenseNumber: "DL-SOUTH-7802" },
      update: {},
      create: { name: "Kabir Rao", licenseNumber: "DL-SOUTH-7802", licenseCategory: "LMV", licenseExpiry: new Date("2025-12-15"), contactNumber: "+91 98765 78020", safetyScore: 79, region: "South", status: DriverStatus.OFF_DUTY }
    })
  ]);

  await Promise.all([
    prisma.user.upsert({ where: { email: "manager@transitops.local" }, update: {}, create: { name: "Fleet Manager", email: "manager@transitops.local", passwordHash, roleId: roleByName.FLEET_MANAGER.id } }),
    prisma.user.upsert({ where: { email: "driver@transitops.local" }, update: {}, create: { name: "Aarav Driver", email: "driver@transitops.local", passwordHash, roleId: roleByName.DRIVER.id, driverId: driverA.id } }),
    prisma.user.upsert({ where: { email: "safety@transitops.local" }, update: {}, create: { name: "Safety Officer", email: "safety@transitops.local", passwordHash, roleId: roleByName.SAFETY_OFFICER.id } }),
    prisma.user.upsert({ where: { email: "finance@transitops.local" }, update: {}, create: { name: "Financial Analyst", email: "finance@transitops.local", passwordHash, roleId: roleByName.FINANCIAL_ANALYST.id } })
  ]);

  const [truck, van, tanker] = await Promise.all([
    prisma.vehicle.upsert({
      where: { registrationNumber: "TO-TRK-1001" },
      update: {},
      create: { registrationNumber: "TO-TRK-1001", vehicleName: "Atlas Freightliner", model: "Volvo FH", type: "Truck", region: "North", maximumCapacity: 18000, odometer: 64200, acquisitionCost: 96000, maintenanceDueAtKm: 65000, status: VehicleStatus.AVAILABLE }
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: "TO-VAN-2044" },
      update: {},
      create: { registrationNumber: "TO-VAN-2044", vehicleName: "Metro Sprinter", model: "Mercedes Sprinter", type: "Van", region: "West", maximumCapacity: 3200, odometer: 22100, acquisitionCost: 48000, maintenanceDueAtKm: 26000, status: VehicleStatus.AVAILABLE }
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: "TO-TNK-3310" },
      update: {},
      create: { registrationNumber: "TO-TNK-3310", vehicleName: "Liquid Hauler", model: "Tata Prima", type: "Tanker", region: "South", maximumCapacity: 12000, odometer: 81750, acquisitionCost: 73000, maintenanceDueAtKm: 82000, status: VehicleStatus.IN_SHOP }
    })
  ]);

  if ((await prisma.trip.count()) === 0) {
    await prisma.trip.createMany({
      data: [
        { source: "Delhi Hub", destination: "Jaipur Depot", vehicleId: truck.id, driverId: driverA.id, cargoWeight: 11500, plannedDistance: 280, actualDistance: 286, fuelUsed: 54, status: TripStatus.COMPLETED, dispatchedAt: new Date("2026-06-18"), completedAt: new Date("2026-06-19") },
        { source: "Mumbai Port", destination: "Pune DC", vehicleId: van.id, driverId: driverB.id, cargoWeight: 1800, plannedDistance: 150, status: TripStatus.DRAFT }
      ]
    });
  }

  if ((await prisma.maintenanceLog.count()) === 0) {
    await prisma.maintenanceLog.createMany({
      data: [
        { vehicleId: tanker.id, maintenanceType: "Preventive Inspection", description: "Pump seals and brake inspection", cost: 1450, date: new Date("2026-07-07"), status: MaintenanceStatus.IN_PROGRESS },
        { vehicleId: truck.id, maintenanceType: "Oil Service", description: "Routine oil and filter change", cost: 380, date: new Date("2026-06-03"), status: MaintenanceStatus.CLOSED }
      ]
    });
  }

  if ((await prisma.fuelLog.count()) === 0) {
    await prisma.fuelLog.createMany({
      data: [
        { vehicleId: truck.id, liters: 54, cost: 4860, distance: 286, fuelEfficiency: 5.3, date: new Date("2026-06-19") },
        { vehicleId: van.id, liters: 22, cost: 1980, distance: 150, fuelEfficiency: 6.82, date: new Date("2026-06-27") },
        { vehicleId: tanker.id, liters: 68, cost: 6120, distance: 245, fuelEfficiency: 3.6, date: new Date("2026-07-01") }
      ]
    });
  }

  if ((await prisma.expense.count()) === 0) {
    await prisma.expense.createMany({
      data: [
        { expenseType: ExpenseType.FUEL, vehicleId: truck.id, amount: 4860, description: "Delhi-Jaipur trip fuel", date: new Date("2026-06-19") },
        { expenseType: ExpenseType.TOLL, vehicleId: truck.id, amount: 760, description: "NH48 tolls", date: new Date("2026-06-19") },
        { expenseType: ExpenseType.REPAIR, vehicleId: tanker.id, amount: 1450, description: "Pump seal replacement", date: new Date("2026-07-07") },
        { expenseType: ExpenseType.INSURANCE, vehicleId: van.id, amount: 3200, description: "Annual fleet insurance premium", date: new Date("2026-06-10") }
      ]
    });
  }

  console.log("Seed complete. Login with manager@transitops.local / TransitOps@123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
