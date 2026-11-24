import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

const TONES = {
  success: "chip-success",
  warning: "chip-warning",
  danger: "chip-danger",
  info: "chip-info",
  muted: "chip-muted",
  outline: "chip-outline",
  purple: "chip-purple",
  solid: "chip-solid",
} as const;

/** Always give the chip an icon or meaningful text: colour alone never carries the status. */
export function StatusChip({
  tone = "muted",
  icon: Icon,
  className,
  wrap,
  children,
}: {
  tone?: keyof typeof TONES;
  icon?: LucideIcon;
  className?: string;
  /** Let long text wrap onto several lines instead of staying on one. */
  wrap?: boolean;
  children: ReactNode;
}) {
  return (
    <span className={cn("chip", TONES[tone], wrap && "chip--wrap", className)}>
      {Icon && <Icon className="icon icon-sm" aria-hidden="true" focusable="false" />}
      {children}
    </span>
  );
}
