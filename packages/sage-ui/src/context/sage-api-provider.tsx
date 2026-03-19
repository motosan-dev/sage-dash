import { createContext, useContext, type ReactNode } from "react";
import type { SageApiClient } from "../lib/api.js";

const SageApiContext = createContext<SageApiClient | null>(null);

export interface SageApiProviderProps {
  client: SageApiClient;
  children: ReactNode;
}

export function SageApiProvider({ client, children }: SageApiProviderProps) {
  return (
    <SageApiContext.Provider value={client}>{children}</SageApiContext.Provider>
  );
}

export function useSageApi(): SageApiClient {
  const client = useContext(SageApiContext);
  if (!client) {
    throw new Error("useSageApi must be used within a <SageApiProvider>");
  }
  return client;
}
