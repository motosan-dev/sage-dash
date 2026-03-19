// ── Types ──
export type {
  Client,
  CreateClientInput,
  CreateQuoteInput,
  DashboardMetrics,
  DocItem,
  FieldDef,
  HandoffItem,
  Message,
  PaymentItem,
  Quote,
  QuoteItem,
  QuoteStatus,
  Stage,
  TimelineEvent,
  UpdateQuoteInput,
} from "./types/index.js";

// ── API client ──
export { SageApiClient } from "./lib/api.js";
export type { ListClientsParams } from "./lib/api.js";

// ── Context ──
export { SageApiProvider, useSageApi } from "./context/sage-api-provider.js";
export type { SageApiProviderProps } from "./context/sage-api-provider.js";

// ── Hooks ──
export { useConfig } from "./hooks/use-config.js";
export { useClients } from "./hooks/use-clients.js";
export { useAnalytics } from "./hooks/use-analytics.js";
export { useClient } from "./hooks/use-client.js";
export { useHandoffs } from "./hooks/use-handoffs.js";
export { useClientMutations } from "./hooks/use-client-mutations.js";
export { useQuotes } from "./hooks/use-quotes.js";
export { useQuote } from "./hooks/use-quote.js";

// ── Utilities ──
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
