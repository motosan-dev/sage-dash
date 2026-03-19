// ── Types ──
export type {
  Client,
  CreateClientInput,
  DashboardMetrics,
  DocItem,
  FieldDef,
  HandoffItem,
  Message,
  PaymentItem,
  QuoteItem,
  Stage,
  TimelineEvent,
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

// ── Utilities ──
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
