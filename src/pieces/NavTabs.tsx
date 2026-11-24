import type { LucideIcon } from "lucide-react";
import { cn } from "../lib/cn";

export interface NavTabItem {
  label: string;
  href: string;
  current?: boolean;
  icon?: LucideIcon;
}

export interface NavTabsProps {
  items: NavTabItem[];
  ariaLabel: string;
  className?: string;
}

/** Page-level tabs that are real links (each tab is its own page). Not Radix tabs: no tabpanel, no roving focus. */
export function NavTabs({ items, ariaLabel, className }: NavTabsProps) {
  return (
    <nav aria-label={ariaLabel} className={cn("nav-tabs", className)}>
      <ul>
        {items.map(({ label, href, current, icon: Icon }) => (
          <li key={href + label}>
            <a href={href} aria-current={current ? "page" : undefined} className="nav-tab">
              {Icon && <Icon className="icon icon-md" aria-hidden="true" focusable="false" />}
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
