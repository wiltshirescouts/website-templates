import type { ReactNode } from "react";
import { useId } from "react";
import { cn } from "../lib/cn";

export interface ItemCardProps {
  title: ReactNode;
  /** Makes the title a link. Only the title is a link: there is no whole-card overlay, so actions stay clickable. */
  href?: string;
  headingLevel?: 2 | 3 | 4;
  /** A row of `StatusChip`s. */
  chips?: ReactNode;
  /** Lines of supporting detail (dates, owner, destination). */
  meta?: ReactNode;
  actions?: ReactNode;
  callout?: ReactNode;
  calloutTone?: "neutral" | "warning";
  children?: ReactNode;
  id?: string;
  className?: string;
}

/** A card for one item in a list: heading, chips, meta lines, body, optional callout and an actions row. */
export function ItemCard({
  title,
  href,
  headingLevel = 2,
  chips,
  meta,
  actions,
  callout,
  calloutTone = "neutral",
  children,
  id,
  className,
}: ItemCardProps) {
  const uid = useId();
  const headingId = `${uid}-title`;
  const H = `h${headingLevel}` as const;
  return (
    <div id={id} role="group" aria-labelledby={headingId} className={cn("card item-card", className)}>
      <H id={headingId} className="item-card__title">
        {href ? <a href={href}>{title}</a> : title}
      </H>
      {chips && <div className="item-card__chips">{chips}</div>}
      {meta && <div className="item-card__meta">{meta}</div>}
      {children && <div className="item-card__body">{children}</div>}
      {callout && (
        <div className={cn("item-card__callout", calloutTone === "warning" && "item-card__callout--warning")}>
          {callout}
        </div>
      )}
      {actions && <div className="item-card__actions">{actions}</div>}
    </div>
  );
}
