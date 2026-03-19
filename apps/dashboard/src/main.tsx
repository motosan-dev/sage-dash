import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { SageApiClient, SageApiProvider } from "@motosan/sage-ui";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

const apiClient = new SageApiClient(
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1",
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SageApiProvider client={apiClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SageApiProvider>
    </QueryClientProvider>
  </StrictMode>,
);
