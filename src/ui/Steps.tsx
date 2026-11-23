import { Check } from "lucide-react";

/** The progress card used by multi-step forms. */
export function Steps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <nav className="steps" aria-label="Progress">
      <div className="steps__head">
        <strong>{steps[current - 1]}</strong>
        <span>
          Step {current} of {steps.length}
        </span>
      </div>
      <ol>
        {steps.map((label, i) => {
          const n = i + 1;
          const state = n < current ? "done" : n === current ? "current" : "";
          return (
            <li key={label} className={state} aria-current={n === current ? "step" : undefined}>
              <span className="dot">
                {state === "done" ? <Check className="icon icon-sm" aria-hidden="true" focusable="false" /> : n}
              </span>
              {label}
              {state === "done" && <span className="sr-only"> (complete)</span>}
              {state === "current" && <span className="sr-only"> (current step)</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
