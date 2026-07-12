import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardPage } from "@/pages/DashboardPage";
import { LoginPage } from "@/pages/LoginPage";
import { ModulePage } from "@/pages/ModulePage";
import { ReportsPage } from "@/pages/ReportsPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route element={<ProtectedRoute roles={["FLEET_MANAGER", "FINANCIAL_ANALYST"]} />}><Route path="vehicles" element={<ModulePage kind="vehicles" />} /></Route>
          <Route element={<ProtectedRoute roles={["FLEET_MANAGER", "SAFETY_OFFICER"]} />}><Route path="drivers" element={<ModulePage kind="drivers" />} /></Route>
          <Route element={<ProtectedRoute roles={["FLEET_MANAGER", "DRIVER"]} />}><Route path="trips" element={<ModulePage kind="trips" />} /></Route>
          <Route element={<ProtectedRoute roles={["FLEET_MANAGER"]} />}><Route path="maintenance" element={<ModulePage kind="maintenance" />} /></Route>
          <Route element={<ProtectedRoute roles={["FLEET_MANAGER", "FINANCIAL_ANALYST"]} />}><Route path="fuel" element={<ModulePage kind="fuel" />} /></Route>
          <Route element={<ProtectedRoute roles={["FLEET_MANAGER", "FINANCIAL_ANALYST"]} />}><Route path="expenses" element={<ModulePage kind="expenses" />} /></Route>
          <Route element={<ProtectedRoute roles={["FLEET_MANAGER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"]} />}><Route path="reports" element={<ReportsPage />} /></Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
