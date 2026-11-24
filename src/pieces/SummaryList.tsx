import { Pencil } from "lucide-react";
import type { ReactNode } from "react";
import { useId } from "react";
import { cn } from "../lib/cn";

export interface SummaryAction {
  /** Visible text. Default "Change". */
  label?: string;
  /** Screen-reader-only context so the link name is unique, for example "destinations". */
  hiddenText?: string;
  href?: string;
  onClick?: () => void;
}

export interface SummaryRow {
  key: ReactNode;
  value: ReactNode;
  action?: SummaryAction;
}

export interface SummaryListProps {
  rows: SummaryRow[];
  /** Shown, muted and italic, when a value is empty. Default "Not provided". */
  emptyText?: string;
  ariaLabel?: string;
  className?: string;
}

const isEmpty = (v: ReactNode) =>
  v === null || v === undefined || v === false || (typeof v === "string" && v.trim() === "");

/** The "Change" link or button, with a pencil icon. A button when `onClick` is given and there is no `href`. */
export function ChangeAction({ label = "Change", hiddenText, href, onClick }: SummaryAction) {
  const content = (
    <>
      <Pencil className="icon icon-sm" aria-hidden="true" focusable="false" />
      <span>
        {label}
        {hiddenText && (
          <>
            {" "}
            <span className="sr-only">{hiddenText}</span>
          </>
        )}
      </span>
    </>
  );
  if (href !== undefined || !onClick) {
    return (
      <a className="change-action" href={href ?? "#"} onClick={onClick}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" className="change-action" onClick={onClick}>
      {content}
    </button>
  );
}

/** A bordered definition list of key/value rows with optional per-row "Change" actions. */
export function SummaryList({ rows, emptyText = "Not provided", ariaLabel, className }: SummaryListProps) {
  return (
    <dl className={cn("summary-list", className)} aria-label={ariaLabel}>
      {rows.map((row, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: keys are ReactNodes, rows are static
        <div className="summary-list__row" key={i}>
          <dt>{row.key}</dt>
          <dd className={cn(isEmpty(row.value) && "summary-list__empty")}>
            {isEmpty(row.value) ? emptyText : row.value}
          </dd>
          {row.action && (
            <dd className="summary-list__action">
              <ChangeAction {...row.action} />
            </dd>
          )}
        </div>
      ))}
    </dl>
  );
}

export interface SummaryCardProps {
  title: ReactNode;
  action?: SummaryAction;
  headingLevel?: 2 | 3;
  /** Usually a `SummaryList`. */
  children: ReactNode;
  id?: string;
}

/** A card with a heading and a "Change" link in its header, around a `SummaryList`. */
export function SummaryCard({ title, action, headingLevel = 2, children, id }: SummaryCardProps) {
  const uid = useId();
  const headingId = `${uid}-title`;
  const H = `h${headingLevel}` as const;
  return (
    <section id={id} className="card summary-card" aria-labelledby={headingId}>
      <div className="summary-card__header">
        <H id={headingId} className="summary-card__title">
          {title}
        </H>
        {action && <ChangeAction {...action} />}
      </div>
      <div className="summary-card__body">{children}</div>
    </section>
  );
}
