import { useId } from "react";

export interface OnThisPageProps {
  items: { label: string; href: string }[];
  ariaLabel?: string;
}

/** A card of anchor links to the sections of a long page. */
export function OnThisPage({ items, ariaLabel = "On this page" }: OnThisPageProps) {
  const id = useId();
  return (
    <nav className="card on-this-page" aria-labelledby={id}>
      <p id={id} className="on-this-page__title">
        {ariaLabel}
      </p>
      <ul>
        {items.map((it) => (
          <li key={it.href}>
            <a href={it.href}>{it.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
