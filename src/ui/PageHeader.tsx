import { ArrowLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="breadcrumb">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={c.label} aria-current={last ? "page" : undefined}>
              {c.href && !last ? <a href={c.href}>{c.label}</a> : c.label}
              {!last && <ChevronRight className="icon icon-sm" aria-hidden="true" focusable="false" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function PageHeader({
  title,
  intro,
  actions,
  eyebrow,
  meta,
  id = "page-title",
}: {
  title: string;
  intro?: ReactNode;
  actions?: ReactNode;
  /** A small line above the title, for example a reference. */
  eyebrow?: ReactNode;
  /** Content under the intro, for example a status chip and buttons. */
  meta?: ReactNode;
  id?: string;
}) {
  return (
    <div className="page-header">
      <div className="page-header__text">
        {eyebrow && <p className="page-header__eyebrow">{eyebrow}</p>}
        <h1 id={id}>{title}</h1>
        {intro && <p>{intro}</p>}
        {meta && <div className="page-header__meta">{meta}</div>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </div>
  );
}

/** "Back to …" link with an arrow. */
export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="back-link" href={href}>
      <ArrowLeft className="icon icon-sm" aria-hidden="true" focusable="false" />
      {children}
    </a>
  );
}

/** A heading that starts a section of a page. Pick the level that follows the heading above it. */
export function SectionTitle({
  as: H = "h2",
  id,
  children,
  className,
}: {
  as?: "h2" | "h3";
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <H
      id={id}
      tabIndex={id ? -1 : undefined}
      className={["section-title", className].filter(Boolean).join(" ")}
    >
      {children}
    </H>
  );
}
