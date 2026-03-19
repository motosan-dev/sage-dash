import { Routes, Route } from "react-router-dom";
import { RootLayout } from "@/layouts/root-layout";
import DashboardPage from "@/pages/dashboard";
import PipelinePage from "@/pages/pipeline";
import ClientsPage from "@/pages/clients";
import QuotesPage from "@/pages/quotes";
import SettingsPage from "@/pages/settings";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="pipeline" element={<PipelinePage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="quotes" element={<QuotesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
