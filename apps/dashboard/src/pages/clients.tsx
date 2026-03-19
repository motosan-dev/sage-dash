import { useCallback, useEffect, useMemo, useState } from "react";
import { useSageApi, useConfig, useClients } from "@motosan/sage-ui";
import type { ListClientsParams } from "@motosan/sage-ui";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientTable } from "@/components/client-table";
import { CreateClientDialog } from "@/components/create-client-dialog";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 20;

const SOURCES = ["LINE", "website", "referral", "walk-in", "social-media"];

// ---------------------------------------------------------------------------
// ClientsPage
// ---------------------------------------------------------------------------

export default function ClientsPage() {
  const api = useSageApi();
  const { stages, isLoading: configLoading } = useConfig(api);

  // Filter state
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [offset, setOffset] = useState(0);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setOffset(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset offset when filters change
  useEffect(() => {
    setOffset(0);
  }, [stageFilter, sourceFilter]);

  // Build query params
  const filters = useMemo<ListClientsParams>(
    () => ({
      search: debouncedSearch || undefined,
      stage: stageFilter || undefined,
      source: sourceFilter || undefined,
      limit: PAGE_SIZE,
      offset,
    }),
    [debouncedSearch, stageFilter, sourceFilter, offset],
  );

  const { clients, isLoading: clientsLoading, moveStage } = useClients(
    api,
    filters,
  );

  const handleStageChange = useCallback(
    (clientId: string, stageId: string) => {
      moveStage({ id: clientId, stageId });
    },
    [moveStage],
  );

  const handlePrev = useCallback(() => {
    setOffset((prev) => Math.max(0, prev - PAGE_SIZE));
  }, []);

  const handleNext = useCallback(() => {
    setOffset((prev) => prev + PAGE_SIZE);
  }, []);

  const isLoading = configLoading || clientsLoading;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your client directory.
          </p>
        </div>
        <CreateClientDialog />
      </div>

      {/* Search and filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-9 w-full sm:w-64"
          aria-label="Search clients by name"
        />

        <Select
          value={stageFilter || "all"}
          onValueChange={(v) => setStageFilter(v === "all" ? "" : v)}
        >
          <SelectTrigger className="h-9 w-[160px]" aria-label="Filter by stage">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {stages.map((stage) => (
              <SelectItem key={stage.id} value={stage.id}>
                {stage.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sourceFilter || "all"}
          onValueChange={(v) => setSourceFilter(v === "all" ? "" : v)}
        >
          <SelectTrigger className="h-9 w-[160px]" aria-label="Filter by source">
            <SelectValue placeholder="All sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            {SOURCES.map((src) => (
              <SelectItem key={src} value={src}>
                {src}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(stageFilter || sourceFilter || debouncedSearch) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchInput("");
              setDebouncedSearch("");
              setStageFilter("");
              setSourceFilter("");
              setOffset(0);
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <ClientTable
          clients={clients}
          stages={stages}
          onStageChange={handleStageChange}
        />
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {clients.length} client{clients.length !== 1 ? "s" : ""}
          {offset > 0 && ` (from ${offset + 1})`}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={offset === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={clients.length < PAGE_SIZE}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function TableSkeleton() {
  return (
    <div
      className="space-y-3"
      role="status"
      aria-label="Loading clients table"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-12 animate-pulse rounded-md bg-muted"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
