import type { QuoteStatus } from "@motosan/sage-ui";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Status badge config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  QuoteStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  sent: {
    label: "Sent",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  accepted: {
    label: "Accepted",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  expired: {
    label: "Expired",
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
