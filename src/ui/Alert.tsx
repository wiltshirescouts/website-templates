import { AlertTriangle, CheckCircle2, CircleAlert, Info, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

const KINDS = {
  info: { Icon: Info, cls: "alert-info" },
  error: { Icon: CircleAlert, cls: "alert-error" },
  warning: { Icon: AlertTriangle, cls: "alert-warning" },
  success: { Icon: CheckCircle2, cls: "alert-success" },
  neutral: { Icon: Info, cls: "alert-neutral" },
} as const;

export interface AlertProps {
  kind: keyof typeof KINDS;
  title?: ReactNode;
  children?: ReactNode;
  /** `alert` interrupts screen readers; use only for errors that appear after an action. Default is `note`. */
  role?: "note" | "alert" | "status";
  headingLevel?: 2 | 3 | 4;
  /** Replaces the kind's icon. The kind still sets the colour, so pick an icon that fits the message. */
  icon?: LucideIcon;
  id?: string;
  className?: string;
}

/** Status is carried by the icon and the heading as well as colour. */
export function Alert({
  kind,
  title,
  children,
  role = "note",
  headingLevel = 3,
  icon,
  id,
  className,
}: AlertProps) {
  const { Icon: KindIcon, cls } = KINDS[kind];
  const Icon = icon ?? KindIcon;
  const H = `h${headingLevel}` as "h2" | "h3" | "h4";
  return (
    <div className={cn("alert", cls, className)} role={role} id={id}>
      <Icon className="icon icon-md" aria-hidden="true" focusable="false" />
      <div>
        {title && <H>{title}</H>}
        {children}
      </div>
    </div>
  );
}
