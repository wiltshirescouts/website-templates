import { type ChangeEvent, type ReactNode, useId } from "react";
import { cn } from "../lib/cn";
import { FieldError, RequiredMark } from "./Field";

export interface DateValue {
  day: string;
  month: string;
  year: string;
}

type Part = "day" | "month" | "year";

export interface DateFieldProps {
  /** The legend, for example "Date of birth". */
  legend: ReactNode;
  /** Base id; the inputs get `<id>-day`, `<id>-month` and `<id>-year`. */
  id?: string;
  /** Used for the `name` attributes: `<name>-day` and so on. */
  name?: string;
  required?: boolean;
  hint?: ReactNode;
  /** Message without the "Error:" prefix. */
  error?: ReactNode;
  /** Which inputs get the error border. Defaults to all three. */
  errorParts?: Part[];
  value?: DateValue;
  defaultValue?: Partial<DateValue>;
  onChange?: (value: DateValue) => void;
  className?: string;
}

const EMPTY: DateValue = { day: "", month: "", year: "" };

/** Day, month and year in one fieldset. Pass `id` (the fieldset's id, which an error summary can link to; the inputs get `<id>-day` etc.). */
export function DateField({
  legend,
  id,
  name,
  required,
  hint,
  error,
  errorParts = ["day", "month", "year"],
  value,
  defaultValue,
  onChange,
  className,
}: DateFieldProps) {
  const auto = useId();
  const base = id ?? auto;
  const hintId = hint ? `${base}-hint` : undefined;
  const errId = error ? `${base}-err` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(" ") || undefined;
  const controlled = value !== undefined;

  const input = (part: Part, label: string, wide?: boolean) => {
    const bad = Boolean(error) && errorParts.includes(part);
    const props = controlled
      ? {
          value: value[part],
          onChange: (e: ChangeEvent<HTMLInputElement>) => onChange?.({ ...value, [part]: e.target.value }),
        }
      : { defaultValue: defaultValue?.[part] ?? "" };
    return (
      <div className={cn("field", bad && "has-error")}>
        <label htmlFor={`${base}-${part}`}>{label}</label>
        <input
          className={cn("input", wide ? "input-md" : "input-sm")}
          style={wide ? { maxWidth: "8rem" } : undefined}
          id={`${base}-${part}`}
          name={name ? `${name}-${part}` : undefined}
          inputMode="numeric"
          autoComplete={
            name === "dob"
              ? `bday-${part === "day" ? "day" : part === "month" ? "month" : "year"}`
              : undefined
          }
          aria-invalid={bad ? true : undefined}
          aria-describedby={describedBy}
          {...props}
        />
      </div>
    );
  };

  return (
    <fieldset
      id={base}
      className={cn("field", error && "has-error", className)}
      aria-describedby={describedBy}
    >
      <legend className="label">
        {legend} {required && <RequiredMark />}
      </legend>
      {hint && (
        <p className="hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && <FieldError id={errId}>{error}</FieldError>}
      <div className="date-row">
        {input("day", "Day")}
        {input("month", "Month")}
        {input("year", "Year", true)}
      </div>
    </fieldset>
  );
}

export { EMPTY as emptyDate };
