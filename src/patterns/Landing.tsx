import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

/**
 * A tinted band that opens a page inside the content area: a small labelled pill, a large title, a lead paragraph and
 * a button or two. Use `HeroHeader` instead when the band should replace the site header.
 */
export function Hero({
  eyebrow,
  eyebrowIcon: EyebrowIcon,
  title,
  children,
  actions,
  decoration: Decoration,
  className,
}: {
  eyebrow?: string;
  eyebrowIcon?: LucideIcon;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  /** A large faint icon in the corner. Decorative. */
  decoration?: LucideIcon;
  className?: string;
}) {
  return (
    <section className={cn("hero-band", className)} aria-labelledby="hero-band-title">
      {Decoration && <Decoration className="hero-band__art" aria-hidden="true" focusable="false" />}
      <div className="hero-band__body">
        {eyebrow && (
          <p className="hero-band__eyebrow">
            {EyebrowIcon && <EyebrowIcon className="icon icon-sm" aria-hidden="true" focusable="false" />}
            {eyebrow}
          </p>
        )}
        <h1 id="hero-band-title">{title}</h1>
        {children && <div className="hero-band__lead">{children}</div>}
        {actions && <div className="hero-band__actions">{actions}</div>}
      </div>
    </section>
  );
}

/** A numbered list of `StepCard`s, three across on wide screens. */
export function StepGrid({ children, className, ...p }: React.OlHTMLAttributes<HTMLOListElement>) {
  return (
    <ol className={cn("step-grid", className)} {...p}>
      {children}
    </ol>
  );
}

export function StepCard({
  n,
  icon: Icon,
  title,
  children,
}: {
  n: number;
  icon?: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <li className="card step-card">
      <div className="step-card__top">
        <span className="step-card__n" aria-hidden="true">
          {n}
        </span>
        {Icon && <Icon className="icon icon-lg step-card__icon" aria-hidden="true" focusable="false" />}
      </div>
      <h3>
        <span className="sr-only">Step {n}:</span> {title}
      </h3>
      <p>{children}</p>
    </li>
  );
}
