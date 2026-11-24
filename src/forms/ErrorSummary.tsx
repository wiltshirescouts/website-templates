import { CircleAlert } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "../lib/cn";

export interface ErrorSummaryItem {
  /** The id of the field to focus, without the `#`. */
  fieldId: string;
  message: string;
}

export interface ErrorSummaryProps {
  items: ErrorSummaryItem[];
  title?: string;
  /** Change this to move focus to the summary again, for example on each failed submit. */
  focusKey?: unknown;
  /** Set false to avoid stealing focus (for example in static examples). */
  autoFocus?: boolean;
  className?: string;
}

/** "There is a problem" with a link to each field. Focus moves here when it is shown. Renders nothing when empty. */
export function ErrorSummary({
  items,
  title = "There is a problem",
  focusKey,
  autoFocus = true,
  className,
}: ErrorSummaryProps) {
  const ref = useRef<HTMLDivElement>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: focusKey is the trigger
  useEffect(() => {
    if (autoFocus && items.length > 0) ref.current?.focus();
  }, [focusKey, autoFocus, items.length > 0]);
  if (items.length === 0) return null;
  return (
    <div
      ref={ref}
      className={cn("alert alert-error", className)}
      role="alert"
      aria-labelledby="error-summary-title"
      tabIndex={-1}
    >
      <CircleAlert className="icon icon-md" aria-hidden="true" focusable="false" />
      <div>
        <h2 id="error-summary-title">{title}</h2>
        <ul>
          {items.map((i) => (
            <li key={`${i.fieldId}-${i.message}`}>
              <a
                href={`#${i.fieldId}`}
                onClick={(e) => {
                  const el = document.getElementById(i.fieldId);
                  if (el) {
                    e.preventDefault();
                    // A fieldset (radio or checkbox cards, dates) is not focusable: go to its first control instead.
                    const target =
                      el instanceof HTMLFieldSetElement
                        ? (el.querySelector<HTMLElement>("input, select, textarea, button") ?? el)
                        : el;
                    target.focus();
                    el.scrollIntoView({ block: "center" });
                  }
                }}
              >
                {i.message}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
