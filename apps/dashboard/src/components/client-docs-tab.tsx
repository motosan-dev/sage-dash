import { useMemo } from "react";
import type { DocItem } from "@motosan/sage-ui";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DOC_STATUSES: DocItem["status"][] = [
  "pending",
  "uploaded",
  "verified",
  "rejected",
];

const STATUS_LABELS: Record<DocItem["status"], string> = {
  pending: "Pending",
  uploaded: "Uploaded",
  verified: "Verified",
  rejected: "Rejected",
};

const STATUS_COLORS: Record<DocItem["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  uploaded: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  verified: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

interface ClientDocsTabProps {
  docs: DocItem[];
  onUpdateDoc: (docName: string, status: DocItem["status"]) => Promise<void>;
}

export function ClientDocsTab({ docs, onUpdateDoc }: ClientDocsTabProps) {
  const { completed, total, percentage } = useMemo(() => {
    const t = docs.length;
    const c = docs.filter((d) => d.status === "verified").length;
    return {
      completed: c,
      total: t,
      percentage: t > 0 ? Math.round((c / t) * 100) : 0,
    };
  }, [docs]);

  return (
    <div className="space-y-6">
      {/* Progress summary */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Document Progress</span>
          <span className="text-muted-foreground">
            {completed}/{total} verified ({percentage}%)
          </span>
        </div>
        <Progress value={percentage} className="h-2" aria-label="Document verification progress" />
      </div>

      {/* Document checklist */}
      <div className="space-y-2">
        {docs.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No documents configured for this client.
          </p>
        )}
        {docs.map((doc) => (
          <div
            key={doc.name}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="flex items-center gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{doc.name}</span>
                  {doc.required && (
                    <Badge variant="outline" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>
                {doc.deadline && (
                  <p className="text-xs text-muted-foreground">
                    Deadline: {new Date(doc.deadline).toLocaleDateString("zh-TW")}
                  </p>
                )}
                {doc.note && (
                  <p className="text-xs text-muted-foreground">{doc.note}</p>
                )}
              </div>
            </div>

            <Select
              value={doc.status}
              onValueChange={(value) =>
                onUpdateDoc(doc.name, value as DocItem["status"])
              }
            >
              <SelectTrigger className="h-8 w-[130px]" aria-label={`Status for ${doc.name}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOC_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}>
                      {STATUS_LABELS[status]}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
}
