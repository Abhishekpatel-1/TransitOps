import { NavLink, Outlet, useNavigate } from "react-router-dom";
import type React from "react";
import { BusFront, CarFront, ChartNoAxesCombined, ClipboardList, Fuel, LayoutDashboard, LogOut, Menu, Moon, Search, ShieldCheck, UserRoundCheck, WalletCards, Wrench } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/primitives";
import { api } from "@/lib/api";
import { useAuth } from "@/auth/AuthProvider";
import { cn, titleCase } from "@/lib/utils";
import type { Role } from "@/types";

type NavItem = { to: string; label: string; icon: React.ElementType; roles: Role[] };

const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["FLEET_MANAGER", "DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"] },
  { to: "/vehicles", label: "Vehicles", icon: CarFront, roles: ["FLEET_MANAGER", "FINANCIAL_ANALYST"] },
  { to: "/drivers", label: "Drivers", icon: UserRoundCheck, roles: ["FLEET_MANAGER", "SAFETY_OFFICER"] },
  { to: "/trips", label: "Trips", icon: ClipboardList, roles: ["FLEET_MANAGER", "DRIVER"] },
  { to: "/maintenance", label: "Maintenance", icon: Wrench, roles: ["FLEET_MANAGER"] },
  { to: "/fuel", label: "Fuel Logs", icon: Fuel, roles: ["FLEET_MANAGER", "FINANCIAL_ANALYST"] },
  { to: "/expenses", label: "Expenses", icon: WalletCards, roles: ["FLEET_MANAGER", "FINANCIAL_ANALYST"] },
  { to: "/reports", label: "Reports", icon: ChartNoAxesCombined, roles: ["FLEET_MANAGER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"] }
];

function Sidebar({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const { user } = useAuth();
  const allowed = navItems.filter((item) => user && item.roles.includes(user.role));
  return (
    <aside className={cn("flex h-full flex-col border-r bg-card", mobile ? "w-72" : "hidden w-64 lg:flex")}>
      <div className="flex h-16 items-center gap-2 border-b px-5">
        <BusFront className="h-6 w-6 text-primary" />
        <div>
          <p className="font-semibold">TransitOps</p>
          <p className="text-xs text-muted-foreground">Smart fleet operations</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {allowed.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} onClick={onNavigate} className={({ isActive }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground", isActive && "bg-muted text-foreground")}>
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="border-t p-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-accent" />
          <span>{user ? titleCase(user.role) : ""}</span>
        </div>
      </div>
    </aside>
  );
}

export function AppLayout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const search = useQuery({
    queryKey: ["search", q],
    queryFn: () => api<{ vehicles: { id: string; registrationNumber: string }[]; drivers: { id: string; name: string }[]; trips: { id: string; source: string; destination: string }[] }>(`/search?q=${encodeURIComponent(q)}`),
    enabled: q.length > 1
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {mobileOpen && <div className="fixed inset-0 z-40 flex bg-background/75 backdrop-blur-sm lg:hidden"><Sidebar mobile onNavigate={() => setMobileOpen(false)} /><button className="flex-1" onClick={() => setMobileOpen(false)} /></div>}
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur">
          <Button aria-label="Open navigation" variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="h-4 w-4" /></Button>
          <div className="relative max-w-lg flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(event) => setQ(event.target.value)} className="pl-9" placeholder="Search vehicles, drivers, trips" />
            {q.length > 1 && search.data && (
              <div className="absolute mt-2 w-full rounded-lg border bg-popover p-2 shadow-xl">
                {[...search.data.vehicles.map((v) => ({ label: v.registrationNumber, path: "/vehicles" })), ...search.data.drivers.map((d) => ({ label: d.name, path: "/drivers" })), ...search.data.trips.map((t) => ({ label: `${t.source} → ${t.destination}`, path: "/trips" }))].map((item) => (
                  <button key={item.label} className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted" onClick={() => { setQ(""); navigate(item.path); }}>{item.label}</button>
                ))}
              </div>
            )}
          </div>
          <Button aria-label="Toggle dark mode" variant="outline" size="icon" onClick={() => document.documentElement.classList.toggle("dark")}><Moon className="h-4 w-4" /></Button>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button aria-label="Sign out" variant="ghost" size="icon" onClick={logout}><LogOut className="h-4 w-4" /></Button>
        </header>
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
