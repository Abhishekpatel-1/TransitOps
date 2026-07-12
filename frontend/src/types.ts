export type Role = "FLEET_MANAGER" | "DRIVER" | "SAFETY_OFFICER" | "FINANCIAL_ANALYST";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  driverId?: string | null;
};

export type Vehicle = {
  id: string;
  registrationNumber: string;
  vehicleName: string;
  model: string;
  type: string;
  region: string;
  maximumCapacity: number;
  odometer: number;
  acquisitionCost: number;
  status: "AVAILABLE" | "ON_TRIP" | "IN_SHOP" | "RETIRED";
  maintenanceDueAtKm?: number | null;
};

export type Driver = {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: string;
  contactNumber: string;
  safetyScore: number;
  region: string;
  status: "AVAILABLE" | "ON_TRIP" | "OFF_DUTY" | "SUSPENDED";
};

export type Trip = {
  id: string;
  source: string;
  destination: string;
  vehicleId: string;
  vehicle?: Vehicle;
  driverId: string;
  driver?: Driver;
  cargoWeight: number;
  plannedDistance: number;
  actualDistance?: number | null;
  fuelUsed?: number | null;
  status: "DRAFT" | "DISPATCHED" | "COMPLETED" | "CANCELLED";
};

export type Paginated<T> = {
  data: T[];
  meta: { total: number; page: number; pageSize: number };
};
