import {
  useSageApi,
  useAnalytics,
  useHandoffs,
  type DashboardMetrics,
  type HandoffItem,
} from "@motosan/sage-ui";
import {
  Users,
  TrendingUp,
  Wallet,
  AlertCircle,
  Clock,
  User,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTWD(value: number): string {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes} 分鐘前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小時前`;
  const days = Math.floor(hours / 24);
  return `${days} 天前`;
}

// ---------------------------------------------------------------------------
// Skeleton placeholder
// ---------------------------------------------------------------------------

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}

// ---------------------------------------------------------------------------
// StatGrid
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
}

function StatCard({ label, value, icon, accent }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <div className={`rounded-md p-2 ${accent}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

function StatGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="status" aria-label="Loading statistics">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface StatGridProps {
  metrics: DashboardMetrics;
}

function StatGrid({ metrics }: StatGridProps) {
  const cards: StatCardProps[] = [
    {
      label: "活躍客戶",
      value: String(metrics.active_clients),
      icon: <Users className="size-4 text-blue-600" />,
      accent: "bg-blue-50 text-blue-600",
    },
    {
      label: "本月成交率",
      value: formatPercent(metrics.conversion_rate),
      icon: <TrendingUp className="size-4 text-emerald-600" />,
      accent: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "待收款",
      value: formatTWD(metrics.pending_payments),
      icon: <Wallet className="size-4 text-amber-600" />,
      accent: "bg-amber-50 text-amber-600",
    },
    {
      label: "需跟進",
      value: String(metrics.stale_clients),
      icon: <AlertCircle className="size-4 text-rose-600" />,
      accent: "bg-rose-50 text-rose-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pipeline Distribution
// ---------------------------------------------------------------------------

const STAGE_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-indigo-500",
];

interface PipelineDistributionProps {
  distribution: Record<string, number>;
}

function PipelineDistribution({ distribution }: PipelineDistributionProps) {
  const entries = Object.entries(distribution);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  if (entries.length === 0 || total === 0) {
    return (
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-base">Pipeline Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No pipeline data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="text-base">Pipeline Distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stacked bar */}
        <div
          className="flex h-4 w-full overflow-hidden rounded-full"
          role="img"
          aria-label="Pipeline stage distribution chart"
        >
          {entries.map(([stage, count], idx) => {
            const pct = (count / total) * 100;
            if (pct === 0) return null;
            return (
              <div
                key={stage}
                className={`${STAGE_COLORS[idx % STAGE_COLORS.length]} transition-all`}
                style={{ width: `${pct}%` }}
                title={`${stage}: ${count} (${pct.toFixed(1)}%)`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <ul className="space-y-2">
          {entries.map(([stage, count], idx) => {
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <li key={stage} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span
                    className={`inline-block size-3 rounded-sm ${STAGE_COLORS[idx % STAGE_COLORS.length]}`}
                    aria-hidden="true"
                  />
                  <span>{stage}</span>
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {count} ({pct.toFixed(1)}%)
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function PipelineDistributionSkeleton() {
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="text-base">Pipeline Distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4" role="status" aria-label="Loading pipeline data">
        <Skeleton className="h-4 w-full rounded-full" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Pending Handoffs
// ---------------------------------------------------------------------------

interface PendingHandoffsProps {
  handoffs: HandoffItem[];
}

function PendingHandoffs({ handoffs }: PendingHandoffsProps) {
  const pending = handoffs.filter((h) => h.status === "pending");

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="text-base">
          Pending Handoffs
          {pending.length > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
              {pending.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No clients awaiting human reply.
          </p>
        ) : (
          <ul className="space-y-3" role="list" aria-label="Clients awaiting human reply">
            {pending.map((handoff) => (
              <li
                key={handoff.id}
                className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <User className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight">
                    {handoff.client_name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                    {handoff.reason}
                  </p>
                  {handoff.last_message && (
                    <p className="mt-1 text-xs text-muted-foreground/80 line-clamp-1 italic">
                      &ldquo;{handoff.last_message}&rdquo;
                    </p>
                  )}
                </div>
                <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {timeAgo(handoff.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function PendingHandoffsSkeleton() {
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="text-base">Pending Handoffs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3" role="status" aria-label="Loading handoffs">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Dashboard Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const api = useSageApi();
  const { metrics, isLoading: metricsLoading } = useAnalytics(api);
  const { handoffs, isLoading: handoffsLoading } = useHandoffs(api);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your consulting pipeline.
        </p>
      </div>

      {/* KPI Stat Cards */}
      <section aria-label="Key performance indicators">
        {metricsLoading || !metrics ? (
          <StatGridSkeleton />
        ) : (
          <StatGrid metrics={metrics} />
        )}
      </section>

      {/* Bottom row: Pipeline + Handoffs */}
      <section
        className="grid gap-6 lg:grid-cols-2"
        aria-label="Pipeline and handoffs"
      >
        {metricsLoading || !metrics ? (
          <PipelineDistributionSkeleton />
        ) : (
          <PipelineDistribution distribution={metrics.pipeline_distribution} />
        )}

        {handoffsLoading ? (
          <PendingHandoffsSkeleton />
        ) : (
          <PendingHandoffs handoffs={handoffs} />
        )}
      </section>
    </div>
  );
}
