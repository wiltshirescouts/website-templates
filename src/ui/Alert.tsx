import { AlertTriangle, CheckCircle2, CircleAlert, Info } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

const KINDS = {
  info: { Icon: Info, cls: "alert-info" },
  error: { Icon: CircleAlert, cls: "alert-error" },
  warning: { Icon: AlertTriangle, cls: "alert-warning" },
  success: { Icon: CheckCircle2, cls: "alert-success" },
} as const;

export interface AlertProps {
  kind: keyof typeof KINDS;
  title?: string;
  children?: ReactNode;
  /** `alert` interrupts screen readers; use only for errors that appear after an action. Default is `note`. */
  role?: "note" | "alert" | "status";
  headingLevel?: 2 | 3;
  id?: string;
  className?: string;
}

/** Status is carried by the icon and the heading as well as colour. */
export function Alert({ kind, title, children, role = "note", headingLevel = 3, id, className }: AlertProps) {
  const { Icon, cls } = KINDS[kind];
  const H = `h${headingLevel}` as "h2" | "h3";
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
