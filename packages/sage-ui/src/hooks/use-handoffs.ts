import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SageApiClient } from "../lib/api.js";
import type { HandoffItem } from "../types/index.js";

export function useHandoffs(api: SageApiClient) {
  const queryClient = useQueryClient();

  const handoffsQuery = useQuery<HandoffItem[]>({
    queryKey: ["handoffs"],
    queryFn: () => api.listHandoffs(),
  });

  const handoffToHumanMutation = useMutation({
    mutationFn: (clientId: string) => api.handoffToHuman(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["handoffs"] });
    },
  });

  const handoffToAiMutation = useMutation({
    mutationFn: (clientId: string) => api.handoffToAi(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["handoffs"] });
    },
  });

  return {
    handoffs: handoffsQuery.data ?? [],
    isLoading: handoffsQuery.isLoading,
    handoffToHuman: handoffToHumanMutation.mutateAsync,
    handoffToAi: handoffToAiMutation.mutateAsync,
  };
}
