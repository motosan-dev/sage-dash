import { useQuery } from "@tanstack/react-query";
import type { SageApiClient } from "../lib/api.js";
import type {
  Client,
  DocItem,
  Message,
  PaymentItem,
  TimelineEvent,
} from "../types/index.js";

export function useClient(api: SageApiClient, id: string) {
  const clientQuery = useQuery<Client>({
    queryKey: ["clients", id],
    queryFn: () => api.getClient(id),
    enabled: !!id,
  });

  const timelineQuery = useQuery<TimelineEvent[]>({
    queryKey: ["clients", id, "timeline"],
    queryFn: () => api.listTimeline(id),
    enabled: !!id,
  });

  const docsQuery = useQuery<DocItem[]>({
    queryKey: ["clients", id, "docs"],
    queryFn: () => api.listDocs(id),
    enabled: !!id,
  });

  const paymentsQuery = useQuery<PaymentItem[]>({
    queryKey: ["clients", id, "payments"],
    queryFn: () => api.listPayments(id),
    enabled: !!id,
  });

  const messagesQuery = useQuery<Message[]>({
    queryKey: ["clients", id, "messages"],
    queryFn: () => api.listMessages(id),
    enabled: !!id,
  });

  return {
    client: clientQuery.data ?? null,
    timeline: timelineQuery.data ?? [],
    docs: docsQuery.data ?? [],
    payments: paymentsQuery.data ?? [],
    messages: messagesQuery.data ?? [],
    isLoading:
      clientQuery.isLoading ||
      timelineQuery.isLoading ||
      docsQuery.isLoading ||
      paymentsQuery.isLoading ||
      messagesQuery.isLoading,
  };
}
