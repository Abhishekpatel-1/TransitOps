import { useMemo, useState } from "react";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Play, XCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { money, shortDate, titleCase } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DataTable, type Column, StatusBadge } from "@/components/DataTable";
import { EntityForm, type Field } from "@/components/EntityForm";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { Driver, Paginated, Trip, Vehicle } from "@/types";

type ModuleKind = "vehicles" | "drivers" | "trips" | "maintenance" | "fuel" | "expenses";
type Row = Record<string, unknown> & { id: string };

const endpoints: Record<ModuleKind, string> = {
  vehicles: "/vehicles",
  drivers: "/drivers",
  trips: "/trips",
  maintenance: "/maintenance",
  fuel: "/fuel-logs",
  expenses: "/expenses"
};

const statusOptions = (values: string[]) => values.map((value) => ({ label: titleCase(value), value }));

const schemas = {
  vehicles: z.object({
    registrationNumber: z.string().min(2),
    vehicleName: z.string().min(2),
    model: z.string().min(1),
    type: z.string().min(1),
    region: z.string().min(1),
    maximumCapacity: z.coerce.number().positive(),
    odometer: z.coerce.number().nonnegative(),
    acquisitionCost: z.coerce.number().nonnegative(),
    status: z.enum(["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"]),
    maintenanceDueAtKm: z.coerce.number().nonnegative().optional()
  }),
  drivers: z.object({
    name: z.string().min(2),
    licenseNumber: z.string().min(3),
    licenseCategory: z.string().min(1),
    licenseExpiry: z.string().min(10),
    contactNumber: z.string().min(7),
    safetyScore: z.coerce.number().min(0).max(100),
    region: z.string().min(1),
    status: z.enum(["AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"])
  }),
  trips: z.object({
    source: z.string().min(2),
    destination: z.string().min(2),
    vehicleId: z.string().min(1),
    driverId: z.string().min(1),
    cargoWeight: z.coerce.number().positive(),
    plannedDistance: z.coerce.number().positive(),
    actualDistance: z.coerce.number().nonnegative().optional(),
    fuelUsed: z.coerce.number().nonnegative().optional(),
    status: z.enum(["DRAFT", "DISPATCHED", "COMPLETED", "CANCELLED"])
  }),
  maintenance: z.object({
    vehicleId: z.string().min(1),
    maintenanceType: z.string().min(2),
    description: z.string().min(2),
    cost: z.coerce.number().nonnegative(),
    date: z.string().min(10),
    status: z.enum(["SCHEDULED", "IN_PROGRESS", "CLOSED"])
  }),
  fuel: z.object({
    vehicleId: z.string().min(1),
    liters: z.coerce.number().positive(),
    cost: z.coerce.number().nonnegative(),
    distance: z.coerce.number().positive(),
    date: z.string().min(10)
  }),
  expenses: z.object({
    expenseType: z.enum(["FUEL", "TOLL", "REPAIR", "INSURANCE", "OTHER"]),
    vehicleId: z.string().optional(),
    amount: z.coerce.number().nonnegative(),
    description: z.string().min(2),
    date: z.string().min(10)
  })
};

export function ModulePage({ kind }: { kind: ModuleKind }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [editing, setEditing] = useState<Row | null>(null);
  const [confirm, setConfirm] = useState<Row | null>(null);
  const endpoint = endpoints[kind];
  const query = useQuery({ queryKey: [kind, search, sortBy, sortOrder], queryFn: () => api<Paginated<Row>>(`${endpoint}?search=${encodeURIComponent(search)}&sortBy=${sortBy}&sortOrder=${sortOrder}`) });
  const vehicles = useQuery({ queryKey: ["vehicle-options"], queryFn: () => api<Paginated<Vehicle>>("/vehicles?pageSize=100"), enabled: ["trips", "maintenance", "fuel", "expenses"].includes(kind) });
  const drivers = useQuery({ queryKey: ["driver-options"], queryFn: () => api<Paginated<Driver>>("/drivers?pageSize=100"), enabled: kind === "trips" });

  const fields = useMemo(() => getFields(kind, vehicles.data?.data ?? [], drivers.data?.data ?? []), [kind, vehicles.data, drivers.data]);
  const columns = useMemo(() => getColumns(kind), [kind]);

  const save = useMutation({
    mutationFn: (values: Record<string, unknown>) => api(editing ? `${endpoint}/${editing.id}` : endpoint, { method: editing ? "PUT" : "POST", body: JSON.stringify(clean(values)) }),
    onSuccess: async () => {
      toast.success("Saved");
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: [kind] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });

  const remove = useMutation({
    mutationFn: (row: Row) => api(`${endpoint}/${row.id}`, { method: "DELETE" }),
    onSuccess: async () => {
      toast.success("Deleted");
      setConfirm(null);
      await queryClient.invalidateQueries({ queryKey: [kind] });
    }
  });

  const action = useMutation({
    mutationFn: ({ row, suffix, body }: { row: Row; suffix: string; body?: Record<string, unknown> }) => api(`${endpoint}/${row.id}/${suffix}`, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
    onSuccess: async () => {
      toast.success("Status updated");
      await queryClient.invalidateQueries({ queryKey: [kind] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });

  const createDefaults = defaultValues(kind, vehicles.data?.data?.[0]?.id, drivers.data?.data?.[0]?.id);
  const canEdit = kind !== "fuel";

  return (
    <>
      <DataTable
        title={pageTitle(kind)}
        description={pageDescription(kind)}
        columns={columns}
        rows={query.data?.data ?? []}
        loading={query.isLoading}
        search={search}
        onSearch={setSearch}
        onCreate={() => setEditing(createDefaults)}
        onEdit={canEdit ? (row) => setEditing(formatForForm(kind, row)) : undefined}
        onDelete={(row) => setConfirm(row)}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={(key) => { setSortBy(key); setSortOrder((current) => current === "asc" ? "desc" : "asc"); }}
        actions={(row) => actionButtons(kind, row, action.mutate)}
      />
      {editing && <EntityForm title={`${editing.id ? "Edit" : "New"} ${pageTitle(kind).slice(0, -1)}`} schema={schemas[kind]} fields={fields} defaultValues={editing} onClose={() => setEditing(null)} onSubmit={async (values) => { await save.mutateAsync(values); }} />}
      <ConfirmDialog open={Boolean(confirm)} title="Delete record" body="This action cannot be undone." onCancel={() => setConfirm(null)} onConfirm={() => confirm && remove.mutate(confirm)} />
    </>
  );
}

function clean(values: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(values).filter(([_, value]) => value !== "" && value !== undefined && value !== null));
}

function optionsFromVehicles(vehicles: Vehicle[]) {
  return vehicles.map((vehicle) => ({ label: `${vehicle.registrationNumber} · ${vehicle.vehicleName}`, value: vehicle.id }));
}

function optionsFromDrivers(drivers: Driver[]) {
  return drivers.map((driver) => ({ label: `${driver.name} · ${driver.licenseNumber}`, value: driver.id }));
}

function getFields(kind: ModuleKind, vehicles: Vehicle[], drivers: Driver[]): Field[] {
  const vehicleOptions = optionsFromVehicles(vehicles);
  const driverOptions = optionsFromDrivers(drivers);
  const configs: Record<ModuleKind, Field[]> = {
    vehicles: [
      { name: "registrationNumber", label: "Registration Number" }, { name: "vehicleName", label: "Vehicle Name" }, { name: "model", label: "Model" }, { name: "type", label: "Type" }, { name: "region", label: "Region" },
      { name: "maximumCapacity", label: "Maximum Capacity", type: "number" }, { name: "odometer", label: "Odometer", type: "number" }, { name: "acquisitionCost", label: "Acquisition Cost", type: "number" },
      { name: "maintenanceDueAtKm", label: "Maintenance Due Km", type: "number" }, { name: "status", label: "Status", type: "select", options: statusOptions(["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"]) }
    ],
    drivers: [
      { name: "name", label: "Name" }, { name: "licenseNumber", label: "License Number" }, { name: "licenseCategory", label: "License Category" }, { name: "licenseExpiry", label: "License Expiry", type: "date" }, { name: "contactNumber", label: "Contact Number" },
      { name: "safetyScore", label: "Safety Score", type: "number" }, { name: "region", label: "Region" }, { name: "status", label: "Status", type: "select", options: statusOptions(["AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"]) }
    ],
    trips: [
      { name: "source", label: "Source" }, { name: "destination", label: "Destination" }, { name: "vehicleId", label: "Vehicle", type: "select", options: vehicleOptions }, { name: "driverId", label: "Driver", type: "select", options: driverOptions },
      { name: "cargoWeight", label: "Cargo Weight", type: "number" }, { name: "plannedDistance", label: "Planned Distance", type: "number" }, { name: "actualDistance", label: "Actual Distance", type: "number" }, { name: "fuelUsed", label: "Fuel Used", type: "number" },
      { name: "status", label: "Status", type: "select", options: statusOptions(["DRAFT", "DISPATCHED", "COMPLETED", "CANCELLED"]) }
    ],
    maintenance: [
      { name: "vehicleId", label: "Vehicle", type: "select", options: vehicleOptions }, { name: "maintenanceType", label: "Maintenance Type" }, { name: "cost", label: "Cost", type: "number" }, { name: "date", label: "Date", type: "date" },
      { name: "status", label: "Status", type: "select", options: statusOptions(["SCHEDULED", "IN_PROGRESS", "CLOSED"]) }, { name: "description", label: "Description", type: "textarea" }
    ],
    fuel: [
      { name: "vehicleId", label: "Vehicle", type: "select", options: vehicleOptions }, { name: "liters", label: "Liters", type: "number" }, { name: "cost", label: "Cost", type: "number" }, { name: "distance", label: "Distance", type: "number" }, { name: "date", label: "Date", type: "date" }
    ],
    expenses: [
      { name: "expenseType", label: "Expense Type", type: "select", options: statusOptions(["FUEL", "TOLL", "REPAIR", "INSURANCE", "OTHER"]) }, { name: "vehicleId", label: "Vehicle", type: "select", options: [{ label: "Unassigned", value: "" }, ...vehicleOptions] }, { name: "amount", label: "Amount", type: "number" }, { name: "date", label: "Date", type: "date" }, { name: "description", label: "Description", type: "textarea" }
    ]
  };
  return configs[kind];
}

function getColumns(kind: ModuleKind): Column<Row>[] {
  const status = { key: "status", label: "Status", render: (row: Row) => <StatusBadge status={String(row.status)} />, sortable: true };
  const configs: Record<ModuleKind, Column<Row>[]> = {
    vehicles: [{ key: "registrationNumber", label: "Reg No", sortable: true }, { key: "vehicleName", label: "Name", sortable: true }, { key: "type", label: "Type" }, { key: "region", label: "Region" }, { key: "maximumCapacity", label: "Capacity" }, { key: "odometer", label: "Odometer", sortable: true }, status],
    drivers: [{ key: "name", label: "Name", sortable: true }, { key: "licenseNumber", label: "License" }, { key: "licenseCategory", label: "Category" }, { key: "licenseExpiry", label: "Expiry", render: (row) => shortDate(String(row.licenseExpiry)), sortable: true }, { key: "safetyScore", label: "Safety", sortable: true }, status],
    trips: [{ key: "source", label: "Source", sortable: true }, { key: "destination", label: "Destination" }, { key: "vehicle", label: "Vehicle", render: (row) => String((row.vehicle as Vehicle | undefined)?.registrationNumber ?? row.vehicleId) }, { key: "driver", label: "Driver", render: (row) => String((row.driver as Driver | undefined)?.name ?? row.driverId) }, { key: "cargoWeight", label: "Cargo" }, status],
    maintenance: [{ key: "vehicle", label: "Vehicle", render: (row) => String((row.vehicle as Vehicle | undefined)?.registrationNumber ?? row.vehicleId) }, { key: "maintenanceType", label: "Type" }, { key: "cost", label: "Cost", render: (row) => money(Number(row.cost)) }, { key: "date", label: "Date", render: (row) => shortDate(String(row.date)) }, status],
    fuel: [{ key: "vehicle", label: "Vehicle", render: (row) => String((row.vehicle as Vehicle | undefined)?.registrationNumber ?? row.vehicleId) }, { key: "liters", label: "Liters", sortable: true }, { key: "cost", label: "Cost", render: (row) => money(Number(row.cost)), sortable: true }, { key: "distance", label: "Distance" }, { key: "fuelEfficiency", label: "Km/L", sortable: true }, { key: "date", label: "Date", render: (row) => shortDate(String(row.date)) }],
    expenses: [{ key: "expenseType", label: "Type", render: (row) => <StatusBadge status={String(row.expenseType)} /> }, { key: "vehicle", label: "Vehicle", render: (row) => String((row.vehicle as Vehicle | undefined)?.registrationNumber ?? "-") }, { key: "amount", label: "Amount", render: (row) => money(Number(row.amount)), sortable: true }, { key: "description", label: "Description" }, { key: "date", label: "Date", render: (row) => shortDate(String(row.date)) }]
  };
  return configs[kind];
}

function actionButtons(kind: ModuleKind, row: Row, mutate: (args: { row: Row; suffix: string; body?: Record<string, unknown> }) => void) {
  if (kind === "trips") {
    const trip = row as unknown as Trip;
    return (
      <>
        {trip.status === "DRAFT" && <Button aria-label="Dispatch trip" variant="ghost" size="icon" onClick={() => mutate({ row, suffix: "dispatch" })}><Play className="h-4 w-4" /></Button>}
        {trip.status === "DISPATCHED" && <Button aria-label="Complete trip" variant="ghost" size="icon" onClick={() => mutate({ row, suffix: "complete", body: { actualDistance: trip.plannedDistance, fuelUsed: trip.fuelUsed ?? 1 } })}><CheckCircle2 className="h-4 w-4" /></Button>}
        {["DRAFT", "DISPATCHED"].includes(trip.status) && <Button aria-label="Cancel trip" variant="ghost" size="icon" onClick={() => mutate({ row, suffix: "cancel" })}><XCircle className="h-4 w-4" /></Button>}
      </>
    );
  }
  if (kind === "maintenance") {
    return (
      <>
        {row.status === "SCHEDULED" && <Button aria-label="Start maintenance" variant="ghost" size="icon" onClick={() => mutate({ row, suffix: "start" })}><Play className="h-4 w-4" /></Button>}
        {row.status === "IN_PROGRESS" && <Button aria-label="Close maintenance" variant="ghost" size="icon" onClick={() => mutate({ row, suffix: "close" })}><CheckCircle2 className="h-4 w-4" /></Button>}
      </>
    );
  }
  return null;
}

function pageTitle(kind: ModuleKind) {
  return ({ vehicles: "Vehicles", drivers: "Drivers", trips: "Trips", maintenance: "Maintenance Logs", fuel: "Fuel Logs", expenses: "Expenses" } as const)[kind];
}

function pageDescription(kind: ModuleKind) {
  return ({ vehicles: "Manage registration, capacity, odometer and lifecycle state.", drivers: "Track licenses, safety scores and availability.", trips: "Create, dispatch, complete and cancel operational trips.", maintenance: "Schedule and close shop work while protecting trip assignment.", fuel: "Capture fuel spend and calculated efficiency.", expenses: "Manage operational costs by category and vehicle." } as const)[kind];
}

function defaultValues(kind: ModuleKind, vehicleId = "", driverId = ""): Row {
  const today = new Date().toISOString().slice(0, 10);
  const values: Record<ModuleKind, Row> = {
    vehicles: { id: "", registrationNumber: "", vehicleName: "", model: "", type: "Truck", region: "North", maximumCapacity: 1000, odometer: 0, acquisitionCost: 0, status: "AVAILABLE", maintenanceDueAtKm: 10000 },
    drivers: { id: "", name: "", licenseNumber: "", licenseCategory: "HGV", licenseExpiry: today, contactNumber: "", safetyScore: 90, region: "North", status: "AVAILABLE" },
    trips: { id: "", source: "", destination: "", vehicleId, driverId, cargoWeight: 100, plannedDistance: 10, actualDistance: undefined, fuelUsed: undefined, status: "DRAFT" },
    maintenance: { id: "", vehicleId, maintenanceType: "", description: "", cost: 0, date: today, status: "SCHEDULED" },
    fuel: { id: "", vehicleId, liters: 1, cost: 0, distance: 1, date: today },
    expenses: { id: "", expenseType: "OTHER", vehicleId, amount: 0, description: "", date: today }
  };
  return values[kind];
}

function formatForForm(kind: ModuleKind, row: Row): Row {
  const next = { ...row };
  if (kind === "drivers" && typeof next.licenseExpiry === "string") next.licenseExpiry = next.licenseExpiry.slice(0, 10);
  if (["maintenance", "fuel", "expenses"].includes(kind) && typeof next.date === "string") next.date = next.date.slice(0, 10);
  return next;
}
