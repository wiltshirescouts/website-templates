import type { LucideIcon } from "lucide-react";
import { ChevronDown, Settings } from "lucide-react";
import { Fragment, type ReactNode } from "react";

export interface SubNavSection {
  heading?: string;
  items: { label: string; href: string; icon?: LucideIcon; current?: boolean }[];
}

function Lists({ sections }: { sections: SubNavSection[] }) {
  return (
    <>
      {sections.map((s) => (
        <Fragment key={s.heading ?? "main"}>
          {s.heading && <h2>{s.heading}</h2>}
          <ul>
            {s.items.map(({ label, href, icon: Icon, current }) => (
              <li key={label}>
                <a href={href} aria-current={current ? "page" : undefined}>
                  {Icon && <Icon className="icon icon-md" aria-hidden="true" focusable="false" />}
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </Fragment>
      ))}
    </>
  );
}

/** Left section navigation on desktop; a disclosure ("Configuration · Emails") below 1024px. */
export function SubNav({ sections, label = "Section" }: { sections: SubNavSection[]; label?: string }) {
  const current = sections.flatMap((s) => s.items).find((i) => i.current);
  return (
    <>
      <details className="subnav subnav-m">
        <summary>
          <Settings className="icon icon-md" aria-hidden="true" focusable="false" />
          <span className="grow">{current ? `${label} · ${current.label}` : label}</span>
          <ChevronDown className="icon icon-md chev" aria-hidden="true" focusable="false" />
        </summary>
        <nav className="panel-body" aria-label={`${label} (menu)`}>
          <Lists sections={sections} />
        </nav>
      </details>
      <nav className="subnav subnav-d" aria-label={label}>
        <Lists sections={sections} />
      </nav>
    </>
  );
}

export function AdminShell({ nav, children }: { nav: ReactNode; children: ReactNode }) {
  return (
    <div className="admin-layout">
      {nav}
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}
