import { useQuery } from "@tanstack/react-query";
import type { SageApiClient } from "../lib/api.js";
import type { DashboardMetrics } from "../types/index.js";

export function useAnalytics(api: SageApiClient) {
  const query = useQuery<DashboardMetrics>({
    queryKey: ["analytics"],
    queryFn: () => api.getAnalytics(),
  });

  return {
    metrics: query.data ?? null,
    isLoading: query.isLoading,
  };
}
