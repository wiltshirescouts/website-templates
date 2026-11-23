import { ChevronRight } from "lucide-react";
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
  id = "page-title",
}: {
  title: string;
  intro?: ReactNode;
  actions?: ReactNode;
  id?: string;
}) {
  return (
    <div className="page-header">
      <div className="page-header__text">
        <h1 id={id}>{title}</h1>
        {intro && <p>{intro}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </div>
  );
}
