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
} as const;

/** Always give the chip an icon or meaningful text: colour alone never carries the status. */
export function StatusChip({
  tone = "muted",
  icon: Icon,
  children,
}: {
  tone?: keyof typeof TONES;
  icon?: LucideIcon;
  children: ReactNode;
}) {
  return (
    <span className={cn("chip", TONES[tone])}>
      {Icon && <Icon className="icon icon-sm" aria-hidden="true" focusable="false" />}
      {children}
    </span>
  );
}
