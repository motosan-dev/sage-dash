import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SageApiClient } from "../lib/api.js";
import type { Quote, UpdateQuoteInput } from "../types/index.js";

export function useQuote(api: SageApiClient, id: string) {
  const queryClient = useQueryClient();

  const quoteQuery = useQuery<Quote>({
    queryKey: ["quotes", id],
    queryFn: () => api.getQuote(id),
    enabled: !!id && id !== "new",
  });

  const updateQuoteMutation = useMutation({
    mutationFn: (input: UpdateQuoteInput) => api.updateQuote(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes", id] });
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });

  const sendToLineMutation = useMutation({
    mutationFn: () => api.sendQuoteToLine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes", id] });
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });

  return {
    quote: quoteQuery.data ?? null,
    isLoading: quoteQuery.isLoading,
    updateQuote: updateQuoteMutation.mutateAsync,
    isUpdating: updateQuoteMutation.isPending,
    sendToLine: sendToLineMutation.mutateAsync,
    isSending: sendToLineMutation.isPending,
  };
}
