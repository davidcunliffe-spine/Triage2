import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TriageClass } from "@workspace/api-client-react";

interface TriageBadgeProps {
  triageClass: TriageClass | null | undefined;
  className?: string;
  showDot?: boolean;
}

const triageStyles: Record<TriageClass, { bg: string, text: string, border: string, dot: string, label: string }> = {
  red: {
    bg: "bg-[hsl(var(--triage-red-bg))]",
    text: "text-[hsl(var(--triage-red))]",
    border: "border-[hsl(var(--triage-red))]/20",
    dot: "bg-[hsl(var(--triage-red))]",
    label: "Immediate",
  },
  orange: {
    bg: "bg-[hsl(var(--triage-orange-bg))]",
    text: "text-[hsl(var(--triage-orange))]",
    border: "border-[hsl(var(--triage-orange))]/20",
    dot: "bg-[hsl(var(--triage-orange))]",
    label: "Urgent",
  },
  yellow: {
    bg: "bg-[hsl(var(--triage-yellow-bg))]",
    text: "text-[hsl(var(--triage-yellow))]",
    border: "border-[hsl(var(--triage-yellow))]/20",
    dot: "bg-[hsl(var(--triage-yellow))]",
    label: "Semi-Urgent",
  },
  green: {
    bg: "bg-[hsl(var(--triage-green-bg))]",
    text: "text-[hsl(var(--triage-green))]",
    border: "border-[hsl(var(--triage-green))]/20",
    dot: "bg-[hsl(var(--triage-green))]",
    label: "Non-Urgent",
  },
  blue: {
    bg: "bg-[hsl(var(--triage-blue-bg))]",
    text: "text-[hsl(var(--triage-blue))]",
    border: "border-[hsl(var(--triage-blue))]/20",
    dot: "bg-[hsl(var(--triage-blue))]",
    label: "Routine",
  },
};

export function TriageBadge({ triageClass, className, showDot = true }: TriageBadgeProps) {
  const styles = triageClass ? triageStyles[triageClass] : undefined;
  
  if (!styles) {
    return <Badge variant="outline">{triageClass ?? "Unknown"}</Badge>;
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium border whitespace-nowrap",
        styles.bg,
        styles.text,
        styles.border,
        className
      )}
    >
      {showDot && (
        <span className={cn("mr-1.5 h-2 w-2 rounded-full", styles.dot)} />
      )}
      {styles.label}
    </Badge>
  );
}
