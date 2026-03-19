import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ListClientsParams, SageApiClient } from "../lib/api.js";
import type { Client, CreateClientInput } from "../types/index.js";

export function useClients(api: SageApiClient, filters?: ListClientsParams) {
  const queryClient = useQueryClient();

  const clientsQuery = useQuery<Client[]>({
    queryKey: ["clients", filters],
    queryFn: () => api.listClients(filters),
  });

  const createClientMutation = useMutation({
    mutationFn: (input: CreateClientInput) => api.createClient(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) =>
      api.updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const moveStageMutation = useMutation({
    mutationFn: ({ id, stageId }: { id: string; stageId: string }) =>
      api.moveStage(id, stageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  return {
    clients: clientsQuery.data ?? [],
    isLoading: clientsQuery.isLoading,
    createClient: createClientMutation.mutateAsync,
    updateClient: updateClientMutation.mutateAsync,
    moveStage: moveStageMutation.mutateAsync,
  };
}
