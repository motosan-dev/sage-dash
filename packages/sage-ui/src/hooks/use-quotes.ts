import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SageApiClient } from "../lib/api.js";
import type { CreateQuoteInput, Quote } from "../types/index.js";

export function useQuotes(api: SageApiClient) {
  const queryClient = useQueryClient();

  const quotesQuery = useQuery<Quote[]>({
    queryKey: ["quotes"],
    queryFn: () => api.listQuotes(),
  });

  const createQuoteMutation = useMutation({
    mutationFn: (input: CreateQuoteInput) => api.createQuote(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });

  return {
    quotes: quotesQuery.data ?? [],
    isLoading: quotesQuery.isLoading,
    createQuote: createQuoteMutation.mutateAsync,
    isCreating: createQuoteMutation.isPending,
  };
}
