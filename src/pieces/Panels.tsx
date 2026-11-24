import { CircleCheck } from "lucide-react";
import type { ReactNode } from "react";
import { useId } from "react";
import { cn } from "../lib/cn";

export interface ConfirmationPanelProps {
  title: string;
  reference?: string;
  children?: ReactNode;
  headingLevel?: 1 | 2;
}

/** The "done" panel after a submission: tick, title, reference, then what happens next. */
export function ConfirmationPanel({ title, reference, children, headingLevel = 1 }: ConfirmationPanelProps) {
  const uid = useId();
  const H = `h${headingLevel}` as const;
  return (
    <section className="confirmation" aria-labelledby={`${uid}-title`}>
      <CircleCheck className="confirmation__icon" aria-hidden="true" focusable="false" />
      <H id={`${uid}-title`} className="confirmation__title">
        {title}
      </H>
      {reference && (
        <p className="confirmation__ref">
          <span className="confirmation__ref-label">Your reference</span>
          <strong className="confirmation__ref-code">{reference}</strong>
        </p>
      )}
      {children && <div className="confirmation__body">{children}</div>}
    </section>
  );
}

export interface CalloutProps {
  tone?: "purple" | "neutral";
  title?: ReactNode;
  children: ReactNode;
}

/** An inset panel for declarations and notes that belong with the text around them. */
export function Callout({ tone = "purple", title, children }: CalloutProps) {
  return (
    <div className={cn("callout", tone === "neutral" ? "callout--neutral" : "callout--purple")}>
      {title && <p className="callout__title">{title}</p>}
      <div className="callout__body">{children}</div>
    </div>
  );
}
