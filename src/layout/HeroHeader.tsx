import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { type AccountConfig, AccountMenu } from "./AccountMenu";
import { BrandLogo } from "./BrandLogo";

export interface HeroHeaderProps {
  title: string;
  intro?: ReactNode;
  icon?: LucideIcon;
  account: AccountConfig;
  homeHref?: string;
  mainId?: string;
}

/** Tall purple band with the large logo, icon tile, title and intro, then the ribbon. Pair with `HeroMain`. */
export function HeroHeader({ title, intro, icon: Icon, account, homeHref = "/", mainId = "main" }: HeroHeaderProps) {
  return (
    <header className="chrome hero-header">
      <a className="skip-link" href={`#${mainId}`}>
        Skip to content
      </a>
      <div className="hero-wrap">
        <div className="hero-top">
          <a className="brand" href={homeHref} aria-label="Scouts Wiltshire, home">
            <BrandLogo on="purple" width={260} height={92} />
          </a>
          <AccountMenu account={account} />
        </div>
        <div className="hero-title">
          {Icon && (
            <span className="hero-icon" aria-hidden="true">
              <Icon className="icon" focusable="false" />
            </span>
          )}
          <div>
            <h1>{title}</h1>
            {intro && <p>{intro}</p>}
          </div>
        </div>
      </div>
      <div className="ribbon" aria-hidden="true" />
    </header>
  );
}

/** The content card area that overlaps the hero band. Gets the main landmark. */
export function HeroMain({ children, id = "main" }: { children: ReactNode; id?: string }) {
  return (
    <main id={id} tabIndex={-1} className="hero-main">
      {children}
    </main>
  );
}
