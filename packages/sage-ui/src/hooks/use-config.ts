import { useQuery } from "@tanstack/react-query";
import type { SageApiClient } from "../lib/api.js";
import type { FieldDef, Stage } from "../types/index.js";

export function useConfig(api: SageApiClient) {
  const stagesQuery = useQuery<Stage[]>({
    queryKey: ["config", "pipeline"],
    queryFn: () => api.getPipeline(),
  });

  const fieldsQuery = useQuery<FieldDef[]>({
    queryKey: ["config", "fields"],
    queryFn: () => api.getFields(),
  });

  return {
    stages: stagesQuery.data ?? [],
    clientFields: fieldsQuery.data ?? [],
    isLoading: stagesQuery.isLoading || fieldsQuery.isLoading,
    error: stagesQuery.error || fieldsQuery.error,
    refetch: () => {
      stagesQuery.refetch();
      fieldsQuery.refetch();
    },
  };
}
