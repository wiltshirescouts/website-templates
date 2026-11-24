import { ChevronDown, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export interface DisclosureProps {
  summary: ReactNode;
  children: ReactNode;
  /** `destructive` colours the summary and adds a warning triangle. */
  tone?: "default" | "destructive";
  bordered?: boolean;
  defaultOpen?: boolean;
  /** Controlled open state. Pair with `onToggle`. */
  open?: boolean;
  onToggle?: (open: boolean) => void;
  id?: string;
  className?: string;
}

/** Native `details`/`summary` with a chevron that turns when open. */
export function Disclosure({
  summary,
  children,
  tone = "default",
  bordered,
  defaultOpen,
  open,
  onToggle,
  id,
  className,
}: DisclosureProps) {
  return (
    <details
      id={id}
      className={cn(
        "disclosure",
        tone === "destructive" && "disclosure--destructive",
        bordered && "disclosure--bordered",
        className,
      )}
      open={open ?? defaultOpen}
      onToggle={(e) => onToggle?.(e.currentTarget.open)}
    >
      <summary>
        {tone === "destructive" && (
          <TriangleAlert className="icon icon-md" aria-hidden="true" focusable="false" />
        )}
        <span className="disclosure__label">{summary}</span>
        <ChevronDown className="icon icon-md disclosure__chevron" aria-hidden="true" focusable="false" />
      </summary>
      <div className="disclosure__body">{children}</div>
    </details>
  );
}
