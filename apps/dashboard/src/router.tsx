import { Routes, Route } from "react-router-dom";
import { RootLayout } from "@/layouts/root-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import DashboardPage from "@/pages/dashboard";
import PipelinePage from "@/pages/pipeline";
import ClientsPage from "@/pages/clients";
import ClientDetailPage from "@/pages/client-detail";
import QuotesPage from "@/pages/quotes";
import QuoteDetailPage from "@/pages/quote-detail";
import SettingsPage from "@/pages/settings";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route
          index
          element={
            <ErrorBoundary>
              <DashboardPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="pipeline"
          element={
            <ErrorBoundary>
              <PipelinePage />
            </ErrorBoundary>
          }
        />
        <Route
          path="clients"
          element={
            <ErrorBoundary>
              <ClientsPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="clients/:id"
          element={
            <ErrorBoundary>
              <ClientDetailPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="quotes"
          element={
            <ErrorBoundary>
              <QuotesPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="quotes/:id"
          element={
            <ErrorBoundary>
              <QuoteDetailPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="settings"
          element={
            <ErrorBoundary>
              <SettingsPage />
            </ErrorBoundary>
          }
        />
      </Route>
    </Routes>
  );
}
