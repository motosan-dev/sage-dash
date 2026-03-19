import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Client, HandoffItem, Stage } from "@motosan/sage-ui";
import { ClientCard } from "@/components/client-card";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Column color palette — indexed by stage position
// ---------------------------------------------------------------------------

const COLUMN_COLORS = [
  { header: "bg-blue-500", headerText: "text-white", ring: "ring-blue-200" },
  { header: "bg-emerald-500", headerText: "text-white", ring: "ring-emerald-200" },
  { header: "bg-amber-500", headerText: "text-white", ring: "ring-amber-200" },
  { header: "bg-purple-500", headerText: "text-white", ring: "ring-purple-200" },
  { header: "bg-rose-500", headerText: "text-white", ring: "ring-rose-200" },
  { header: "bg-cyan-500", headerText: "text-white", ring: "ring-cyan-200" },
  { header: "bg-orange-500", headerText: "text-white", ring: "ring-orange-200" },
  { header: "bg-indigo-500", headerText: "text-white", ring: "ring-indigo-200" },
];

// ---------------------------------------------------------------------------
// PipelineColumn
// ---------------------------------------------------------------------------

export interface PipelineColumnProps {
  stage: Stage;
  index: number;
  clients: Client[];
  handoffs: HandoffItem[];
}

export function PipelineColumn({
  stage,
  index,
  clients,
  handoffs,
}: PipelineColumnProps) {
  const color = COLUMN_COLORS[index % COLUMN_COLORS.length];

  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const handoffMap = new Map(
    handoffs
      .filter((h) => h.status === "pending" || h.status === "accepted")
      .map((h) => [h.client_id, h]),
  );

  const clientIds = clients.map((c) => c.id);

  return (
    <div
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-lg border bg-muted/30",
        isOver && `ring-2 ${color.ring}`,
      )}
    >
      {/* Column header */}
      <div
        className={cn(
          "flex items-center justify-between rounded-t-lg px-3 py-2",
          color.header,
          color.headerText,
        )}
      >
        <h3 className="text-sm font-semibold">{stage.name}</h3>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
          {clients.length}
        </span>
      </div>

      {/* Droppable card list */}
      <div
        ref={setNodeRef}
        className="flex flex-1 flex-col gap-2 overflow-y-auto p-2"
        style={{ minHeight: 80 }}
        role="list"
        aria-label={`${stage.name} clients`}
      >
        <SortableContext
          items={clientIds}
          strategy={verticalListSortingStrategy}
        >
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              staleDays={stage.stale_days}
              handoff={handoffMap.get(client.id)}
            />
          ))}
        </SortableContext>

        {clients.length === 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground">
            No clients
          </p>
        )}
      </div>
    </div>
  );
}
