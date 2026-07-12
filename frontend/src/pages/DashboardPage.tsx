import { useQuery } from "@tanstack/react-query";
import type React from "react";
import { Activity, AlertTriangle, CarFront, Clock3, Fuel, Route, UserRoundCheck, Wrench } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/lib/api";
import { Badge, Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/components/ui/primitives";
import { money, titleCase } from "@/lib/utils";

type Dashboard = {
  cards: Record<string, number>;
  charts: {
    monthlyFuelCost: { month: string; cost: number }[];
    maintenanceCost: { month: string; cost: number }[];
    vehicleUsage: { name: string; trips: number; distance: number }[];
    tripStatusDistribution: { status: string; value: number }[];
  };
  notifications: {
    expiredLicense: { id: string; name: string; licenseExpiry: string }[];
    upcomingLicenseExpiry: { id: string; name: string; licenseExpiry: string }[];
    vehicleMaintenanceDue: { id: string; registrationNumber: string; odometer: number; maintenanceDueAtKm: number }[];
    highFuelConsumption: { id: string; fuelEfficiency: number }[];
  };
};

const icons = [CarFront, CarFront, Wrench, Route, Clock3, UserRoundCheck, Activity];
const palette = ["#22c1c3", "#f5c542", "#43c787", "#e25555"];

export function DashboardPage() {
  const query = useQuery({ queryKey: ["dashboard"], queryFn: () => api<Dashboard>("/dashboard") });
  if (query.isLoading) return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>;
  const data = query.data!;
  const cardEntries = Object.entries(data.cards);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Operations Dashboard</h1>
        <p className="text-sm text-muted-foreground">Fleet status, trip execution, cost trends, and compliance alerts.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cardEntries.map(([key, value], index) => {
          const Icon = icons[index] ?? Activity;
          return (
            <Card key={key}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{titleCase(key)}</p>
                  <p className="mt-1 text-2xl font-semibold">{key.includes("Utilization") ? `${value}%` : value}</p>
                </div>
                <div className="rounded-md bg-primary/15 p-3 text-primary"><Icon className="h-5 w-5" /></div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Monthly Fuel Cost"><ResponsiveContainer width="100%" height={270}><BarChart data={data.charts.monthlyFuelCost}><CartesianGrid strokeDasharray="3 3" opacity={0.2} /><XAxis dataKey="month" /><YAxis /><Tooltip formatter={(v) => money(Number(v))} /><Bar dataKey="cost" fill="#22c1c3" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Maintenance Cost"><ResponsiveContainer width="100%" height={270}><BarChart data={data.charts.maintenanceCost}><CartesianGrid strokeDasharray="3 3" opacity={0.2} /><XAxis dataKey="month" /><YAxis /><Tooltip formatter={(v) => money(Number(v))} /><Bar dataKey="cost" fill="#f5c542" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Vehicle Usage"><ResponsiveContainer width="100%" height={270}><BarChart data={data.charts.vehicleUsage}><CartesianGrid strokeDasharray="3 3" opacity={0.2} /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="trips" fill="#43c787" radius={[4, 4, 0, 0]} /><Bar dataKey="distance" fill="#22c1c3" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Trip Status Distribution"><ResponsiveContainer width="100%" height={270}><PieChart><Pie data={data.charts.tripStatusDistribution} dataKey="value" nameKey="status" outerRadius={95} label>{data.charts.tripStatusDistribution.map((_, index) => <Cell key={index} fill={palette[index % palette.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></ChartCard>
      </div>
      <Card>
        <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <AlertList title="Expired License" tone="danger" count={data.notifications.expiredLicense.length} />
          <AlertList title="Upcoming Expiry" tone="warning" count={data.notifications.upcomingLicenseExpiry.length} />
          <AlertList title="Maintenance Due" tone="default" count={data.notifications.vehicleMaintenanceDue.length} />
          <AlertList title="High Fuel Use" tone="danger" count={data.notifications.highFuelConsumption.length} />
        </CardContent>
      </Card>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent>{children}</CardContent></Card>;
}

function AlertList({ title, count, tone }: { title: string; count: number; tone: "default" | "warning" | "danger" }) {
  return <div className="rounded-lg border p-4"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{title}</p><AlertTriangle className="h-4 w-4 text-secondary" /></div><div className="mt-3 flex items-center gap-2"><span className="text-2xl font-semibold">{count}</span><Badge tone={tone}>{count ? "Action needed" : "Clear"}</Badge></div></div>;
}
