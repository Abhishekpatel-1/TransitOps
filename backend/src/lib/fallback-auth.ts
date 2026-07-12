import type { User as PrismaUser } from "@prisma/client";

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  driverId?: string | null;
  isActive: boolean;
  passwordHash: string;
};

const DEMO_USERS: DemoUser[] = [
  {
    id: "demo-manager",
    name: "Fleet Manager",
    email: "manager@transitops.local",
    role: "FLEET_MANAGER",
    driverId: null,
    isActive: true,
    passwordHash: "$2a$12$4bA0wrgOj4ckR6B2lYew5eWkr8XjZEX0y0l8nQ0gFaBNXb76gOrf6"
  },
  {
    id: "demo-driver",
    name: "Aarav Driver",
    email: "driver@transitops.local",
    role: "DRIVER",
    driverId: "demo-driver-record",
    isActive: true,
    passwordHash: "$2a$12$4bA0wrgOj4ckR6B2lYew5eWkr8XjZEX0y0l8nQ0gFaBNXb76gOrf6"
  },
  {
    id: "demo-safety",
    name: "Safety Officer",
    email: "safety@transitops.local",
    role: "SAFETY_OFFICER",
    driverId: null,
    isActive: true,
    passwordHash: "$2a$12$4bA0wrgOj4ckR6B2lYew5eWkr8XjZEX0y0l8nQ0gFaBNXb76gOrf6"
  },
  {
    id: "demo-finance",
    name: "Financial Analyst",
    email: "finance@transitops.local",
    role: "FINANCIAL_ANALYST",
    driverId: null,
    isActive: true,
    passwordHash: "$2a$12$4bA0wrgOj4ckR6B2lYew5eWkr8XjZEX0y0l8nQ0gFaBNXb76gOrf6"
  }
];

const DEMO_PASSWORD = "TransitOps@123";

export async function getDemoUserWithPassword(email: string, password: string): Promise<DemoUser | null> {
  const user = DEMO_USERS.find((candidate) => candidate.email === email);
  if (!user || !user.isActive) return null;
  if (password !== DEMO_PASSWORD) return null;
  return user;
}
