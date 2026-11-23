import { CircleAlert } from "lucide-react";
import { cloneElement, isValidElement, type ReactElement, type ReactNode, useId } from "react";
import { cn } from "../lib/cn";

export interface FieldProps {
  label: ReactNode;
  /** Shown as a red asterisk only. Optional fields carry no marker at all. */
  required?: boolean;
  hint?: ReactNode;
  /** Message without the "Error:" prefix; the prefix is added for screen readers. */
  error?: ReactNode;
  /** One form control: Input, Select, Textarea or any element that accepts id and aria-* props. */
  children: ReactElement<Record<string, unknown>>;
  className?: string;
  id?: string;
}

export function RequiredMark() {
  return (
    <span className="req" aria-hidden="true">
      *
    </span>
  );
}

/** Label, hint, control and error, wired together with ids. */
export function Field({ label, required, hint, error, children, className, id }: FieldProps) {
  const auto = useId();
  const base = id ?? auto;
  const hintId = hint ? `${base}-hint` : undefined;
  const errId = error ? `${base}-err` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("field", error && "has-error", className)}>
      <label className="label" htmlFor={base}>
        {label} {required && <RequiredMark />}
      </label>
      {hint && (
        <p className="hint" id={hintId}>
          {hint}
        </p>
      )}
      {isValidElement(children) &&
        cloneElement(children, {
          id: base,
          required: required || undefined,
          "aria-invalid": error ? true : undefined,
          "aria-describedby": describedBy,
        })}
      {error && <FieldError id={errId}>{error}</FieldError>}
    </div>
  );
}

export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p className="error-msg" id={id}>
      <CircleAlert className="icon icon-sm" aria-hidden="true" focusable="false" />
      <span>
        <span className="sr-only">Error: </span>
        {children}
      </span>
    </p>
  );
}
