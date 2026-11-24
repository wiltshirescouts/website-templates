import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

/** A full-width strip under the header for a site-wide state, such as "Development mode". Put it between header and main. */
export function EnvironmentBanner({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("env-banner", className)} role="note">
      <div className="page-container">{children}</div>
    </div>
  );
}

/** Nothing here yet: icon, heading, a sentence and the next steps. */
export function EmptyState({
  icon: Icon,
  title,
  headingLevel = 2,
  children,
  actions,
  dashed,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  headingLevel?: 2 | 3;
  children?: ReactNode;
  actions?: ReactNode;
  dashed?: boolean;
  className?: string;
}) {
  const H = `h${headingLevel}` as "h2" | "h3";
  return (
    <div className={cn("empty-state", dashed && "empty-state--dashed", className)}>
      {Icon && (
        <span className="empty-state__icon">
          <Icon className="icon icon-lg" aria-hidden="true" focusable="false" />
        </span>
      )}
      <H>{title}</H>
      {children && <div className="empty-state__text">{children}</div>}
      {actions && <div className="empty-state__actions">{actions}</div>}
    </div>
  );
}
