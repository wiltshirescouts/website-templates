import type { LucideIcon } from "lucide-react";
import { Bell } from "lucide-react";
import { Children, type ReactNode, useId } from "react";
import { cn } from "../lib/cn";
import { ButtonLink } from "../ui/Button";
import { StatusChip } from "../ui/StatusChip";

export interface TripChip {
  tone?: "success" | "warning" | "muted" | "outline" | "purple";
  icon?: LucideIcon;
  label: string;
}

export interface TripMeta {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
}

export interface TripCardProps {
  title: string;
  href: string;
  /** Image slot, usually an `<img className="art" alt="">` or an inline SVG with `className="art"`. Decorative: give it an empty alt. */
  image?: ReactNode;
  /** One chip per sign-up status. The icon and the words carry the status, not the colour. */
  chips?: TripChip[];
  meta?: TripMeta[];
  className?: string;
}

/**
 * A trip in the library. The whole card is clickable through the heading link's `::after`, so there is
 * one link, one tab stop and one clear name for assistive technology. Render inside a `LibraryGrid`.
 */
export function TripCard({ title, href, image, chips = [], meta = [], className }: TripCardProps) {
  return (
    <article className={cn("card trip-card", className)}>
      {image}
      <div className="card__body">
        <h2>
          <a href={href}>{title}</a>
        </h2>
        {chips.length > 0 && (
          <div className="chips">
            {chips.map((c) => (
              <StatusChip key={c.label} tone={c.tone} icon={c.icon}>
                {c.label}
              </StatusChip>
            ))}
          </div>
        )}
        {meta.length > 0 && (
          <dl className="meta">
            {meta.map(({ icon: Icon, label, value }) => (
              <div key={label}>
                <Icon className="icon icon-md" aria-hidden="true" focusable="false" />
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </article>
  );
}

/** Responsive grid of `TripCard`s. Each child becomes one list item. */
export function LibraryGrid({ children, label = "Trips" }: { children: ReactNode; label?: string }) {
  return (
    <ul className="lib-grid" aria-label={label}>
      {Children.toArray(children).map((child, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static children
        <li key={i}>{child}</li>
      ))}
    </ul>
  );
}

export interface NoticeBarProps {
  heading: string;
  actionLabel: string;
  actionHref: string;
  icon?: LucideIcon;
}

/** A one-line notice with a call to action, such as joining a mailing list. */
export function NoticeBar({ heading, actionLabel, actionHref, icon: Icon = Bell }: NoticeBarProps) {
  const id = useId();
  return (
    <section className="notice-bar" aria-labelledby={id}>
      <h2 id={id}>
        <Icon className="icon icon-md" aria-hidden="true" focusable="false" />
        {heading}
      </h2>
      <ButtonLink variant="outline" href={actionHref}>
        <Icon className="icon icon-md" aria-hidden="true" focusable="false" />
        {actionLabel}
      </ButtonLink>
    </section>
  );
}
