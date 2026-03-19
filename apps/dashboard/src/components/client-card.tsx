import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Client, HandoffItem } from "@motosan/sage-ui";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function isStale(client: Client, staleDays?: number): boolean {
  if (!staleDays) return false;
  const diff = Date.now() - new Date(client.created_at).getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  return days >= staleDays;
}

// ---------------------------------------------------------------------------
// ClientCard
// ---------------------------------------------------------------------------

export interface ClientCardProps {
  client: Client;
  staleDays?: number;
  handoff?: HandoffItem;
}

export function ClientCard({ client, staleDays, handoff }: ClientCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: client.id, data: { client } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const stale = isStale(client, staleDays);
  const isHumanMode =
    handoff && (handoff.status === "pending" || handoff.status === "accepted");

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="listitem"
      aria-label={`Client ${client.name}`}
      className={cn(
        "cursor-grab rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isDragging && "opacity-50 shadow-lg",
        stale && "border-orange-400 border-2",
      )}
    >
      {/* Header: name + indicators */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-tight truncate">
          {client.name}
        </p>
        <div className="flex shrink-0 items-center gap-1">
          {isHumanMode && (
            <span
              className="inline-block text-xs"
              title="Human mode active"
              aria-label="Human mode active"
            >
              {"🔴"}
            </span>
          )}
        </div>
      </div>

      {/* Badges row */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {client.source && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {client.source}
          </Badge>
        )}
      </div>

      {/* Footer: relative time */}
      <p className="mt-2 text-[11px] text-muted-foreground">
        {timeAgo(client.created_at)}
      </p>
    </div>
  );
}
