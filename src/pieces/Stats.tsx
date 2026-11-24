import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useId } from "react";
import { cn } from "../lib/cn";

export interface StatCardProps {
  icon?: LucideIcon;
  /** Also the heading. */
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  headingLevel?: 2 | 3 | 4;
}

/** A single figure with a label (the card's heading) and optional hint. */
export function StatCard({ icon: Icon, label, value, hint, headingLevel = 3 }: StatCardProps) {
  const H = `h${headingLevel}` as const;
  return (
    <div className="card stat-card">
      <H className="stat-card__label">
        {Icon && <Icon className="icon icon-md" aria-hidden="true" focusable="false" />}
        {label}
      </H>
      <p className="stat-card__value">{value}</p>
      {hint && <p className="stat-card__hint">{hint}</p>}
    </div>
  );
}

export interface BarListProps {
  rows: { label: string; value: number }[];
  /** Value that fills the track. Default: the largest value. */
  max?: number;
  format?: (n: number) => string;
  /** Default true: put a table with the same figures beside the bars so assistive technology reads that instead. */
  ariaHidden?: boolean;
}

/** Horizontal bars, label | track | value. */
export function BarList({ rows, max, format = (n) => String(n), ariaHidden = true }: BarListProps) {
  const top = max ?? Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="bar-list" aria-hidden={ariaHidden ? "true" : undefined}>
      {rows.map((r) => (
        <div className="bar-list__row" key={r.label}>
          <span className="bar-list__label">{r.label}</span>
          <span className="bar-list__track">
            {r.value > 0 && (
              <span
                className="bar-list__bar"
                style={{ width: `${Math.min(100, Math.max(2, (r.value / top) * 100))}%` }}
              />
            )}
          </span>
          <span className="bar-list__value">{format(r.value)}</span>
        </div>
      ))}
    </div>
  );
}

export interface MeterProps {
  label: string;
  value: number;
  max: number;
  /** Shown beside the bar, for example "3 of 5 complete". */
  text?: ReactNode;
}

/** A labelled native `progress` bar. */
export function Meter({ label, value, max, text }: MeterProps) {
  const id = useId();
  return (
    <div className={cn("meter")}>
      <label htmlFor={id} className="meter__label">
        {label}
      </label>
      <div className="meter__row">
        <progress id={id} className="meter__bar" value={value} max={max} />
        {text && <span className="meter__text">{text}</span>}
      </div>
    </div>
  );
}
