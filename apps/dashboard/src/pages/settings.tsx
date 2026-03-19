import { useSageApi, useConfig, type Stage, type FieldDef } from "@motosan/sage-ui";
import {
  Layers,
  FileText,
  Link,
  Info,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
// Pipeline Section
// ---------------------------------------------------------------------------

function PipelineSection({ stages }: { stages: Stage[] }) {
  if (stages.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No pipeline stages configured.
      </p>
    );
  }

  return (
    <ul className="space-y-2" role="list">
      {stages.map((stage) => (
        <li
          key={stage.id}
          className="flex items-center justify-between rounded-lg border px-4 py-3"
        >
          <span className="text-sm font-medium">{stage.name}</span>
          <span className="text-sm text-muted-foreground tabular-nums">
            {stage.stale_days != null
              ? `${stage.stale_days} day${stage.stale_days === 1 ? "" : "s"} until stale`
              : "No stale threshold"}
          </span>
        </li>
      ))}
    </ul>
  );
}

function PipelineSkeleton() {
  return (
    <div className="space-y-2" role="status" aria-label="Loading pipeline stages">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between rounded-lg border px-4 py-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-36" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Client Fields Section
// ---------------------------------------------------------------------------

function ClientFieldsSection({ fields }: { fields: FieldDef[] }) {
  if (fields.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No custom fields defined.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Label</TableHead>
          <TableHead>Required</TableHead>
          <TableHead>Group</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fields.map((field) => (
          <TableRow key={field.name}>
            <TableCell className="font-mono text-xs">{field.name}</TableCell>
            <TableCell>
              <Badge variant="secondary">{field.type}</Badge>
            </TableCell>
            <TableCell>{field.label}</TableCell>
            <TableCell>
              {field.required ? (
                <Badge variant="default">Required</Badge>
              ) : (
                <span className="text-muted-foreground">Optional</span>
              )}
            </TableCell>
            <TableCell>
              {field.group ? (
                <Badge variant="outline">{field.group}</Badge>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ClientFieldsSkeleton() {
  return (
    <div className="space-y-2" role="status" aria-label="Loading client fields">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Integration Section
// ---------------------------------------------------------------------------

function IntegrationSection() {
  const apiUrl =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border px-4 py-3">
        <div>
          <p className="text-sm font-medium">API Base URL</p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            {apiUrl}
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <CheckCircle className="size-3" />
          Configured
        </Badge>
      </div>

      <div className="flex items-center justify-between rounded-lg border px-4 py-3">
        <div>
          <p className="text-sm font-medium">Bot Role</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            LINE bot integration for automated client messaging
          </p>
        </div>
        <Badge variant="secondary">Read-only</Badge>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// About Section
// ---------------------------------------------------------------------------

const APP_VERSION = "v0.1.0";
const GITHUB_REPO = "https://github.com/motosan-dev/sage-dash";

function AboutSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border px-4 py-3">
        <div>
          <p className="text-sm font-medium">Version</p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            {APP_VERSION}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border px-4 py-3">
        <div>
          <p className="text-sm font-medium">Source Code</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            View the project on GitHub
          </p>
        </div>
        <a
          href={GITHUB_REPO}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
          aria-label="Open GitHub repository in a new tab"
        >
          GitHub
          <ExternalLink className="size-3" />
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Settings Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const api = useSageApi();
  const { stages, clientFields, isLoading } = useConfig(api);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Current configuration (read-only). Editable settings coming in a
          future release.
        </p>
      </div>

      {/* Pipeline */}
      <section aria-label="Pipeline configuration">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="size-4" />
              Pipeline
            </CardTitle>
            <CardDescription>
              Stages and stale thresholds from the pipeline configuration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <PipelineSkeleton />
            ) : (
              <PipelineSection stages={stages} />
            )}
          </CardContent>
        </Card>
      </section>

      {/* Client Fields */}
      <section aria-label="Client field definitions">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4" />
              Client Fields
            </CardTitle>
            <CardDescription>
              Custom field definitions for client records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ClientFieldsSkeleton />
            ) : (
              <ClientFieldsSection fields={clientFields} />
            )}
          </CardContent>
        </Card>
      </section>

      {/* Integration */}
      <section aria-label="Integration settings">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Link className="size-4" />
              Integration
            </CardTitle>
            <CardDescription>
              API connection and bot integration details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IntegrationSection />
          </CardContent>
        </Card>
      </section>

      {/* About */}
      <section aria-label="About this application">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="size-4" />
              About
            </CardTitle>
            <CardDescription>
              Application version and project links.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AboutSection />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
