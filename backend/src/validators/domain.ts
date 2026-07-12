import { z } from "zod";

const dateString = z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/));
const positive = z.coerce.number().positive();
const nonNegative = z.coerce.number().nonnegative();

export const loginSchema = z.object({
  body: z.object({ email: z.string().email(), password: z.string().min(8) })
});

export const refreshSchema = z.object({ body: z.object({ refreshToken: z.string().min(20) }) });

export const vehicleSchema = z.object({
  body: z.object({
    registrationNumber: z.string().min(2),
    vehicleName: z.string().min(2),
    model: z.string().min(1),
    type: z.string().min(1),
    region: z.string().default("North"),
    maximumCapacity: positive,
    odometer: nonNegative,
    acquisitionCost: nonNegative,
    status: z.enum(["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"]).default("AVAILABLE"),
    maintenanceDueAtKm: nonNegative.optional().nullable()
  })
});

export const driverSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    licenseNumber: z.string().min(3),
    licenseCategory: z.string().min(1),
    licenseExpiry: dateString,
    contactNumber: z.string().min(7),
    safetyScore: z.coerce.number().int().min(0).max(100).default(90),
    region: z.string().default("North"),
    status: z.enum(["AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"]).default("AVAILABLE")
  })
});

export const tripSchema = z.object({
  body: z.object({
    source: z.string().min(2),
    destination: z.string().min(2),
    vehicleId: z.string().min(1),
    driverId: z.string().min(1),
    cargoWeight: positive,
    plannedDistance: positive,
    actualDistance: nonNegative.optional().nullable(),
    fuelUsed: nonNegative.optional().nullable(),
    status: z.enum(["DRAFT", "DISPATCHED", "COMPLETED", "CANCELLED"]).default("DRAFT")
  })
});

export const completeTripSchema = z.object({
  body: z.object({
    actualDistance: positive,
    fuelUsed: positive
  })
});

export const maintenanceSchema = z.object({
  body: z.object({
    vehicleId: z.string().min(1),
    maintenanceType: z.string().min(2),
    description: z.string().min(2),
    cost: nonNegative,
    date: dateString,
    status: z.enum(["SCHEDULED", "IN_PROGRESS", "CLOSED"]).default("SCHEDULED")
  })
});

export const fuelSchema = z.object({
  body: z.object({
    vehicleId: z.string().min(1),
    liters: positive,
    cost: nonNegative,
    distance: positive,
    date: dateString
  })
});

export const expenseSchema = z.object({
  body: z.object({
    expenseType: z.enum(["FUEL", "TOLL", "REPAIR", "INSURANCE", "OTHER"]),
    vehicleId: z.string().optional().nullable(),
    amount: nonNegative,
    description: z.string().min(2),
    date: dateString
  })
});
