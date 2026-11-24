import { MessageSquare } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { StatusChip } from "../ui/StatusChip";

export interface CommentCardProps {
  /** For example "Changes requested". */
  label: ReactNode;
  author: string;
  /** Already formatted. */
  at: string;
  /** For example "Part A, version 2". */
  context?: string;
  tone?: "neutral" | "warning";
  /** The comment text. Line breaks are kept. */
  children: ReactNode;
}

/** One comment from a reviewer: what it is, who and when, then the text. */
export function CommentCard({ label, author, at, context, tone = "neutral", children }: CommentCardProps) {
  return (
    <article className={cn("comment-card", tone === "warning" && "comment-card--warning")}>
      <p className="comment-card__label">
        <MessageSquare className="icon icon-md" aria-hidden="true" focusable="false" />
        {label}
      </p>
      <p className="comment-card__meta">
        {author}, {at}
        {context && <> · {context}</>}
      </p>
      <div className="comment-card__body">{children}</div>
    </article>
  );
}

export interface HistoryItem {
  label: ReactNode;
  href?: string;
  current?: boolean;
  meta?: ReactNode;
  chips?: ReactNode;
}

export interface HistoryListProps {
  items: HistoryItem[];
  ariaLabel: string;
}

/** A list of versions or events. The current one is marked with text and `aria-current`, not colour alone. */
export function HistoryList({ items, ariaLabel }: HistoryListProps) {
  return (
    <ul className="history-list" aria-label={ariaLabel}>
      {items.map((item, i) => (
        <li
          // biome-ignore lint/suspicious/noArrayIndexKey: labels are ReactNodes
          key={i}
          className={cn("history-list__item", item.current && "is-current")}
          aria-current={item.current ? "true" : undefined}
        >
          <span className="history-list__label">
            {item.href ? <a href={item.href}>{item.label}</a> : item.label}
          </span>
          {(item.current || item.chips) && (
            <span className="history-list__chips">
              {item.current && <StatusChip tone="purple">Current</StatusChip>}
              {item.chips}
            </span>
          )}
          {item.meta && <span className="history-list__meta">{item.meta}</span>}
        </li>
      ))}
    </ul>
  );
}
