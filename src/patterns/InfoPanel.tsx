import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { ButtonLink } from "../ui/Button";

export interface InfoPanelProps {
  /** Image for the left column (top banner on narrow screens). Decorative. */
  art: ReactNode;
  /** Small pill over the image, for example "Placeholder photo" in a prototype. */
  artNote?: string;
  backHref?: string;
  backLabel?: string;
  title: string;
  /** Intro paragraphs. */
  intro?: ReactNode;
  children?: ReactNode;
}

/**
 * Full-bleed split layout: image left, content right. Renders the `main` landmark, so use it in place of `Main`
 * between `SiteHeader` and `SiteFooter`.
 */
export function InfoPanel({
  art,
  artNote,
  backHref,
  backLabel = "All trips",
  title,
  intro,
  children,
}: InfoPanelProps) {
  return (
    <main id="main" tabIndex={-1} className="info-split">
      <div className="info-art">
        {art}
        {artNote && <span className="art-note">{artNote}</span>}
      </div>
      <div className="info-panel">
        {backHref && (
          <ButtonLink variant="outline" href={backHref}>
            <ArrowLeft className="icon icon-md" aria-hidden="true" focusable="false" />
            {backLabel}
          </ButtonLink>
        )}
        <h1>{title}</h1>
        {intro && <div className="intro">{intro}</div>}
        {children}
      </div>
    </main>
  );
}

export interface Fact {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
}

/** Key facts as a definition list, with an optional contact block on the right. */
export function FactsCard({
  facts,
  contact,
  label = "Key facts",
  layout = "list",
}: {
  facts: Fact[];
  contact?: ReactNode;
  label?: string;
  /** `grid` lays the facts out in columns (2 from 640px, 4 from 1024px) instead of one per line. */
  layout?: "list" | "grid";
}) {
  return (
    <section className={cn("card facts", layout === "grid" && "facts--grid")} aria-label={label}>
      <dl>
        {facts.map(({ icon: Icon, label: l, value }) => (
          <div key={l}>
            <dt>
              <Icon className="icon icon-md" aria-hidden="true" focusable="false" />
              {l}
            </dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {contact && <div className="contact">{contact}</div>}
    </section>
  );
}

/** Heading and grid for the sign-up cards. */
export function SignupGrid({ heading = "Sign up", children }: { heading?: string; children: ReactNode }) {
  return (
    <>
      <h2 style={{ fontSize: "1.375rem", marginBottom: ".75rem" }}>{heading}</h2>
      <div className="signup-grid">{children}</div>
    </>
  );
}

export interface SignupCardProps {
  title: string;
  id: string;
  description?: ReactNode;
  /** Eligibility bullets. */
  eligibility?: ReactNode[];
  /** Emphasised status line, for example "Sign-ups are not open yet." */
  status?: string;
  /** The call to action, pushed to the bottom of the card. Give it `className="push"` and `size="lg"`. */
  action: ReactNode;
  className?: string;
}

export function SignupCard({
  title,
  id,
  description,
  eligibility,
  status,
  action,
  className,
}: SignupCardProps) {
  return (
    <section className={cn("card signup-card", className)} aria-labelledby={id}>
      <div className="card__body">
        <h3 id={id} style={{ fontSize: "1.125rem" }}>
          {title}
        </h3>
        {description && (
          <p className="hint" style={{ color: "var(--foreground)" }}>
            {description}
          </p>
        )}
        {eligibility && eligibility.length > 0 && (
          <ul>
            {eligibility.map((e, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static list
              <li key={i}>{e}</li>
            ))}
          </ul>
        )}
        {status && <p style={{ fontWeight: 900, margin: 0 }}>{status}</p>}
        {action}
      </div>
    </section>
  );
}
