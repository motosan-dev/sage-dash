import { useCallback, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useState } from "react";
import {
  useSageApi,
  useConfig,
  useClients,
  useHandoffs,
  type Client,
} from "@motosan/sage-ui";
import { toast } from "sonner";
import { PipelineColumn } from "@/components/pipeline-column";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { QueryError } from "@/components/query-error";
import { EmptyState } from "@/components/empty-state";

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}

function BoardSkeleton() {
  return (
    <div
      className="flex gap-4 overflow-x-auto pb-4"
      role="status"
      aria-label="Loading pipeline board"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="w-72 shrink-0">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-20 w-full rounded-lg" />
              ))}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Drag overlay card (non-interactive preview while dragging)
// ---------------------------------------------------------------------------

function DragOverlayCard({ client }: { client: Client }) {
  return (
    <div className="w-72 cursor-grabbing rounded-lg border bg-card p-3 shadow-xl ring-2 ring-primary/30">
      <p className="text-sm font-medium leading-tight truncate">
        {client.name}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PipelinePage
// ---------------------------------------------------------------------------

export default function PipelinePage() {
  const api = useSageApi();
  const {
    stages,
    isLoading: stagesLoading,
    error: stagesError,
    refetch: refetchStages,
  } = useConfig(api);
  const {
    clients,
    isLoading: clientsLoading,
    error: clientsError,
    refetch: refetchClients,
    moveStage,
  } = useClients(api);
  const {
    handoffs,
    isLoading: handoffsLoading,
    error: handoffsError,
    refetch: refetchHandoffs,
  } = useHandoffs(api);

  const [activeClient, setActiveClient] = useState<Client | null>(null);

  // Group clients by stage_id
  const clientsByStage = useMemo(() => {
    const map = new Map<string, Client[]>();
    for (const stage of stages) {
      map.set(stage.id, []);
    }
    for (const client of clients) {
      const bucket = map.get(client.stage_id);
      if (bucket) {
        bucket.push(client);
      }
    }
    return map;
  }, [stages, clients]);

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const clientId = event.active.id as string;
      const found = clients.find((c) => c.id === clientId) ?? null;
      setActiveClient(found);
    },
    [clients],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveClient(null);

      const { active, over } = event;
      if (!over) return;

      const clientId = active.id as string;
      const client = clients.find((c) => c.id === clientId);
      if (!client) return;

      // Determine target stage:
      // `over.id` is either a stage id (droppable) or another client id (sortable)
      let targetStageId: string | null = null;

      // Check if over.id matches a stage
      if (stages.some((s) => s.id === over.id)) {
        targetStageId = over.id as string;
      } else {
        // over.id is a client — find which stage that client belongs to
        const overClient = clients.find((c) => c.id === over.id);
        if (overClient) {
          targetStageId = overClient.stage_id;
        }
      }

      if (!targetStageId || targetStageId === client.stage_id) return;

      moveStage({ id: clientId, stageId: targetStageId }).catch((err) => {
        toast.error("移動客戶失敗", {
          description: err instanceof Error ? err.message : "請稍後再試",
        });
      });
    },
    [clients, stages, moveStage],
  );

  const isLoading = stagesLoading || clientsLoading || handoffsLoading;
  const error = stagesError || clientsError || handoffsError;

  const handleRetry = useCallback(() => {
    refetchStages();
    refetchClients();
    refetchHandoffs();
  }, [refetchStages, refetchClients, refetchHandoffs]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Drag clients between stages to update their progress.
        </p>
      </div>

      {isLoading ? (
        <BoardSkeleton />
      ) : error ? (
        <QueryError
          message="載入 Pipeline 資料時發生錯誤"
          onRetry={handleRetry}
        />
      ) : clients.length === 0 ? (
        <EmptyState message="還沒有客戶，點選 + 新增" />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div
            className="flex gap-4 overflow-x-auto pb-4"
            role="region"
            aria-label="Pipeline board"
          >
            {stages.map((stage, index) => (
              <PipelineColumn
                key={stage.id}
                stage={stage}
                index={index}
                clients={clientsByStage.get(stage.id) ?? []}
                handoffs={handoffs}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeClient ? (
              <DragOverlayCard client={activeClient} />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
