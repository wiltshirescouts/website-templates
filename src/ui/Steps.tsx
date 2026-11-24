import { Check } from "lucide-react";
import type { CSSProperties } from "react";
import { cn } from "../lib/cn";

export interface StepsProps {
  steps: string[];
  /**
   * The current step, counting from 1. `steps.length + 1` means every step is complete. `0` means the person is not
   * in the process, and nothing is rendered.
   */
  current: number;
  /** Colour of completed steps. Default primary. */
  doneTone?: "primary" | "success";
  ariaLabel?: string;
}

/** The progress card used by multi-step forms and review stages. A status display, not navigation. */
export function Steps({ steps, current, doneTone = "primary", ariaLabel = "Progress" }: StepsProps) {
  if (current < 1) return null;
  const complete = current > steps.length;
  return (
    <div
      className={cn("steps", doneTone === "success" && "steps--success", complete && "steps--complete")}
      role="group"
      aria-label={ariaLabel}
      style={{ "--steps": steps.length } as CSSProperties}
    >
      <div className="steps__head">
        <strong>{complete ? "Complete" : steps[current - 1]}</strong>
        <span>{complete ? `All ${steps.length} done` : `Step ${current} of ${steps.length}`}</span>
      </div>
      <ol>
        {steps.map((label, i) => {
          const n = i + 1;
          const state = n < current ? "done" : n === current ? "current" : "";
          return (
            <li key={label} className={state} aria-current={n === current ? "step" : undefined}>
              <span className="dot">
                {state === "done" ? (
                  <Check className="icon icon-sm" aria-hidden="true" focusable="false" />
                ) : (
                  n
                )}
              </span>
              {label}
              {state === "done" && <span className="sr-only"> (complete)</span>}
              {state === "current" && <span className="sr-only"> (current step)</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
