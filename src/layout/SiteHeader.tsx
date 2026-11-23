import type { LucideIcon } from "lucide-react";
import { Menu, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { type AccountConfig, AccountMenu } from "./AccountMenu";
import { BrandLogo } from "./BrandLogo";

export const SITE_TITLE_MAX = 60;

// True when the literal has 61 or more characters (it counts one character at a time, up to 61).
type OverLimit<S extends string, Count extends unknown[] = []> = Count["length"] extends 61
  ? true
  : S extends `${string}${infer Rest}`
    ? OverLimit<Rest, [...Count, unknown]>
    : false;
/**
 * Compile-time check for literal titles: more than 60 characters is a type error.
 * Titles that are not literals (variables) pass the type check and are checked at runtime in development.
 */
export type SiteTitle<S extends string> = string extends S ? S : OverLimit<S> extends true ? never : S;

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  current?: boolean;
}

export interface SiteHeaderProps<T extends string = string> {
  /** The site's name, shown after the logo. 60 characters at most. */
  title: SiteTitle<T>;
  nav?: NavItem[];
  account: AccountConfig;
  homeHref?: string;
  /** Id of the main landmark the skip link jumps to. */
  mainId?: string;
}

export function SiteHeader<T extends string>({
  title,
  nav = [],
  account,
  homeHref = "/",
  mainId = "main",
}: SiteHeaderProps<T>) {
  if (import.meta.env?.DEV && title.length > SITE_TITLE_MAX) {
    throw new Error(`SiteHeader title is ${title.length} characters; the maximum is ${SITE_TITLE_MAX}.`);
  }
  return (
    <header className="site-header chrome">
      <a className="skip-link" href={`#${mainId}`}>
        Skip to content
      </a>
      <div className="page-container site-header__bar">
        <a className="brand" href={homeHref} aria-label="Scouts Wiltshire, home">
          <BrandLogo on="purple" width={176} height={62} />
        </a>
        <p className="site-title" style={{ margin: 0 }}>
          {title}
        </p>
        {nav.length > 0 && (
          <nav className="site-nav" aria-label="Main">
            {nav.map(({ label, href, icon: Icon, current }) => (
              <a key={label} href={href} aria-current={current ? "page" : undefined}>
                <Icon className="icon icon-sm" aria-hidden="true" focusable="false" />
                {label}
              </a>
            ))}
          </nav>
        )}
        <AccountMenu account={account} />
        {nav.length > 0 && (
          <Dialog.Root>
            <Dialog.Trigger className="menu-btn" aria-label="Open menu">
              <Menu className="icon icon-lg" aria-hidden="true" focusable="false" />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="sheet-overlay" />
              <Dialog.Content className="sheet" aria-describedby={undefined}>
                <div className="sheet__head chrome">
                  <BrandLogo on="purple" alt="Scouts Wiltshire" width={144} />
                  <Dialog.Close className="menu-btn" aria-label="Close menu">
                    <X className="icon icon-lg" aria-hidden="true" focusable="false" />
                  </Dialog.Close>
                </div>
                <Dialog.Title className="sheet__title">{title}</Dialog.Title>
                <nav aria-label="Main">
                  {nav.map(({ label, href, icon: Icon, current }) => (
                    <a key={label} href={href} aria-current={current ? "page" : undefined}>
                      <Icon className="icon icon-md" aria-hidden="true" focusable="false" />
                      <span>{label}</span>
                    </a>
                  ))}
                </nav>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}
      </div>
    </header>
  );
}
