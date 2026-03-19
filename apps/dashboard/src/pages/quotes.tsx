import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  useSageApi,
  useQuotes,
  useClients,
  type Quote,
} from "@motosan/sage-ui";
import { QuoteStatusBadge } from "@/components/quote-status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

const twdFormatter = new Intl.NumberFormat("zh-TW", {
  style: "currency",
  currency: "TWD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Re-export QuoteStatusBadge for backward compatibility
export { QuoteStatusBadge } from "@/components/quote-status-badge";

// ---------------------------------------------------------------------------
// QuotesPage
// ---------------------------------------------------------------------------

export default function QuotesPage() {
  const api = useSageApi();
  const navigate = useNavigate();
  const { quotes, isLoading, createQuote, isCreating } = useQuotes(api);
  const { clients } = useClients(api);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  const handleCreateQuote = useCallback(async () => {
    if (!selectedClientId) return;
    try {
      const newQuote = await createQuote({ client_id: selectedClientId });
      setDialogOpen(false);
      setSelectedClientId("");
      navigate(`/quotes/${newQuote.id}`);
    } catch (error) {
      console.error(error);
    }
  }, [selectedClientId, createQuote, navigate]);

  const handleRowClick = useCallback(
    (quoteId: string) => {
      navigate(`/quotes/${quoteId}`);
    },
    [navigate],
  );

  const columns = useMemo<ColumnDef<Quote>[]>(
    () => [
      {
        accessorKey: "client_name",
        header: "Client",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.client_name}</span>
        ),
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            {twdFormatter.format(row.original.total)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <QuoteStatusBadge status={row.original.status} />
        ),
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.created_at)}
          </span>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: quotes,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quotes</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create and manage quotes for clients.
            </p>
          </div>
        </div>
        <div
          className="space-y-3"
          role="status"
          aria-label="Loading quotes table"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-md bg-muted"
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quotes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage quotes for clients.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>+ 新增報價</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New Quote</DialogTitle>
              <DialogDescription>
                Select a client to create a new quote.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label
                  htmlFor="new-quote-client"
                  className="text-sm font-medium"
                >
                  Client
                </label>
                <Select
                  value={selectedClientId}
                  onValueChange={setSelectedClientId}
                >
                  <SelectTrigger
                    id="new-quote-client"
                    aria-label="Select client for new quote"
                  >
                    <SelectValue placeholder="Select a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateQuote}
                  disabled={!selectedClientId || isCreating}
                >
                  {isCreating ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quotes table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(row.original.id)}
                  role="link"
                  tabIndex={0}
                  aria-label={`View quote for ${row.original.client_name}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleRowClick(row.original.id);
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No quotes found. Click &quot;+ 新增報價&quot; to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
