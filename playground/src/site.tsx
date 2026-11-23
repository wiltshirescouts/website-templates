import { type AccountConfig, Main, type NavItem, PageShell, SiteFooter, SiteHeader } from "@wiltshirescouts/theme";
import { Home, Mail, PlaneTakeoff, PoundSterling } from "lucide-react";
import type { ReactNode } from "react";

export const publicNav = (current: string): NavItem[] =>
  [
    { label: "Home", href: "#", icon: Home },
    { label: "Trips", href: "#", icon: PlaneTakeoff },
    { label: "Costs", href: "#", icon: PoundSterling },
    { label: "Contact", href: "#", icon: Mail },
  ].map((n) => ({ ...n, current: n.label === current }));

export const signedOut: AccountConfig = { variant: "signed-out", signInHref: "#" };
export const signedIn: AccountConfig = {
  variant: "signed-in",
  name: "Alex Example",
  email: "alex@example.org",
  role: "Registrar",
  profileHref: "#",
  onSignOut: () => {},
};
export const colourOnly: AccountConfig = { variant: "colour-only" };

/** Standard page: header, main container, footer. */
export function Site({
  title,
  nav,
  account,
  children,
  mainClassName,
}: {
  title: string;
  nav?: NavItem[];
  account: AccountConfig;
  children: ReactNode;
  mainClassName?: string;
}) {
  return (
    <PageShell>
      <SiteHeader title={title} nav={nav} account={account} />
      <Main className={mainClassName}>{children}</Main>
      <SiteFooter madeBy={<>Made by <a href="#">Wiltshire Scouts Digital</a></>} version="v1.0.0" />
    </PageShell>
  );
}
