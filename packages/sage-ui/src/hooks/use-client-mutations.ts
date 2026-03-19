import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SageApiClient } from "../lib/api.js";
import type { Client, DocItem, PaymentItem } from "../types/index.js";

export function useClientMutations(api: SageApiClient, clientId: string) {
  const queryClient = useQueryClient();

  const updateClientMutation = useMutation({
    mutationFn: (data: Partial<Client>) => api.updateClient(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", clientId] });
    },
  });

  const moveStageMutation = useMutation({
    mutationFn: (stageId: string) => api.moveStage(clientId, stageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", clientId] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const updateDocMutation = useMutation({
    mutationFn: ({
      docName,
      update,
    }: {
      docName: string;
      update: Partial<DocItem>;
    }) => api.updateDoc(clientId, docName, update),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["clients", clientId, "docs"],
      });
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: (input: Omit<PaymentItem, "status"> & { status?: string }) =>
      api.createPayment(clientId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["clients", clientId, "payments"],
      });
    },
  });

  const sendReplyMutation = useMutation({
    mutationFn: (text: string) => api.sendReply(clientId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["clients", clientId, "messages"],
      });
    },
  });

  const handoffToHumanMutation = useMutation({
    mutationFn: () => api.handoffToHuman(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["handoffs"] });
    },
  });

  const handoffToAiMutation = useMutation({
    mutationFn: () => api.handoffToAi(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["handoffs"] });
    },
  });

  return {
    updateClient: updateClientMutation.mutateAsync,
    isUpdatingClient: updateClientMutation.isPending,
    moveStage: moveStageMutation.mutateAsync,
    updateDoc: updateDocMutation.mutateAsync,
    createPayment: createPaymentMutation.mutateAsync,
    isCreatingPayment: createPaymentMutation.isPending,
    sendReply: sendReplyMutation.mutateAsync,
    isSendingReply: sendReplyMutation.isPending,
    handoffToHuman: handoffToHumanMutation.mutateAsync,
    handoffToAi: handoffToAiMutation.mutateAsync,
  };
}
