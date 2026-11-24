import { CircleAlert } from "lucide-react";
import { cloneElement, isValidElement, type ReactElement, type ReactNode, useId } from "react";
import { cn } from "../lib/cn";

/** What `Field` hands to a render-function child, to spread onto the control. */
export interface FieldControlProps {
  id: string;
  required?: true;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
}

export interface FieldProps {
  label: ReactNode;
  /** Shown as a red asterisk only. Optional fields carry no marker at all. */
  required?: boolean;
  hint?: ReactNode;
  /** Message without the "Error:" prefix; the prefix is added for screen readers. */
  error?: ReactNode;
  /**
   * One form control: Input, Select, Textarea or any element that accepts id and aria-* props. When the control is
   * wrapped (an input with an attached suffix, say), pass a function instead and spread its argument onto the control.
   */
  children: ReactElement<Record<string, unknown>> | ((control: FieldControlProps) => ReactNode);
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
  const control: FieldControlProps = {
    id: base,
    required: required ? true : undefined,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  };
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
      {typeof children === "function"
        ? children(control)
        : isValidElement(children) && cloneElement(children, { ...control })}
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

export interface FieldGroupProps {
  legend: ReactNode;
  /** The fieldset's id, so an error summary can link to it (it then focuses the first control inside). */
  id?: string;
  required?: boolean;
  hint?: ReactNode;
  /** Message without the "Error:" prefix. */
  error?: ReactNode;
  className?: string;
  /** "label" (default) is a bold label; "heading" is a card-style heading (1.125rem, weight 800). */
  legendSize?: "label" | "heading";
  /** Content, or a function that receives the ids to put on the controls' `aria-describedby`. */
  children: ReactNode | ((group: { describedBy?: string; invalid?: true }) => ReactNode);
}

/** Several related controls under one legend (a date range, a set of ticks): the fieldset counterpart of `Field`. */
export function FieldGroup({
  legend,
  id,
  required,
  hint,
  error,
  className,
  legendSize = "label",
  children,
}: FieldGroupProps) {
  const auto = useId();
  const base = id ?? auto;
  const hintId = hint ? `${base}-hint` : undefined;
  const errId = error ? `${base}-err` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(" ") || undefined;
  return (
    <fieldset
      className={cn("field", error && "has-error", className)}
      id={base}
      aria-describedby={describedBy}
    >
      <legend className={cn("label", legendSize === "heading" && "legend-heading")}>
        {legend} {required && <RequiredMark />}
      </legend>
      {hint && (
        <p className="hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && <FieldError id={errId}>{error}</FieldError>}
      {typeof children === "function"
        ? children({ describedBy, invalid: error ? true : undefined })
        : children}
    </fieldset>
  );
}
