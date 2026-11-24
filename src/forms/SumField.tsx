import { type ReactNode, useId } from "react";
import { Input } from "./controls";
import { Field, FieldGroup } from "./Field";

export interface SumFieldProps {
  legend: ReactNode;
  fields: { key: string; label: string }[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  /** Default "Total". */
  totalLabel?: string;
  hint?: ReactNode;
  /** Message without the "Error:" prefix. */
  error?: ReactNode;
  /** The fieldset's id. */
  id?: string;
  /** Inputs get `${idPrefix ?? id ?? "sum"}-${key}`. */
  idPrefix?: string;
  className?: string;
}

/** Sum of the values that are whole non-negative numbers; blank or invalid entries count as 0. */
export function sumValues(values: Record<string, string>, keys: string[]): number {
  let total = 0;
  for (const k of keys) {
    const v = (values[k] ?? "").trim();
    if (/^\d+$/.test(v)) total += Number.parseInt(v, 10);
  }
  return total;
}

/** Several numeric boxes (for example young people by age group) with a live, announced total. */
export function SumField({
  legend,
  fields,
  values,
  onChange,
  totalLabel = "Total",
  hint,
  error,
  id,
  idPrefix,
  className,
}: SumFieldProps) {
  const auto = useId();
  const prefix = idPrefix ?? id ?? "sum";
  const outId = `${id ?? auto}-total`;
  const total = sumValues(
    values,
    fields.map((f) => f.key),
  );
  return (
    <FieldGroup legend={legend} id={id} hint={hint} error={error} className={className}>
      {({ describedBy, invalid }) => (
        <>
          <div className="sum-grid">
            {fields.map((f) => (
              <Field key={f.key} label={f.label} id={`${prefix}-${f.key}`}>
                {(control) => (
                  <Input
                    {...control}
                    inputMode="numeric"
                    autoComplete="off"
                    aria-invalid={invalid}
                    aria-describedby={describedBy}
                    value={values[f.key] ?? ""}
                    onChange={(e) => onChange(f.key, e.target.value)}
                  />
                )}
              </Field>
            ))}
          </div>
          <div className="sum-total">
            <label htmlFor={outId}>{totalLabel}</label>
            <output id={outId} htmlFor={fields.map((f) => `${prefix}-${f.key}`).join(" ")} aria-live="polite">
              {total}
            </output>
          </div>
        </>
      )}
    </FieldGroup>
  );
}
