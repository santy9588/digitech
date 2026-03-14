import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className:
      "bg-warning/15 text-warning border-warning/30 hover:bg-warning/20",
  },
  processing: {
    label: "Processing",
    className: "bg-accent/15 text-accent border-accent/30 hover:bg-accent/20",
  },
  succeeded: {
    label: "Succeeded",
    className:
      "bg-success/15 text-success border-success/30 hover:bg-success/20",
  },
  completed: {
    label: "Completed",
    className:
      "bg-success/15 text-success border-success/30 hover:bg-success/20",
  },
  failed: {
    label: "Failed",
    className:
      "bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/20",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground border-border hover:bg-muted",
  },
  refunded: {
    label: "Refunded",
    className: "bg-muted text-muted-foreground border-border hover:bg-muted",
  },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase();
  const config = STATUS_CONFIG[normalized] ?? {
    label: status,
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium font-mono tracking-wide px-2 py-0.5 border",
        config.className,
        className,
      )}
    >
      {config.label}
    </Badge>
  );
}
