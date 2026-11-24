import { type ReactNode, useState } from "react";
import { cn } from "../lib/cn";
import { Checkbox } from "./Checkbox";
import { FieldGroup } from "./Field";

export interface CheckboxListOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface CheckboxListProps {
  legend: ReactNode;
  name?: string;
  options: CheckboxListOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  hint?: ReactNode;
  /** Message without the "Error:" prefix. */
  error?: ReactNode;
  required?: boolean;
  /** The fieldset's id (for error-summary links); checkboxes get `<id>-0`, `<id>-1` and so on. */
  id?: string;
  disabled?: boolean;
  className?: string;
}

/** Plain inline checkboxes in a fieldset, 44px rows, for admin screens. For choices in a form use `CheckboxCards`. */
export function CheckboxList({
  legend,
  name,
  options,
  value,
  defaultValue,
  onChange,
  hint,
  error,
  required,
  id,
  disabled,
  className,
}: CheckboxListProps) {
  const [inner, setInner] = useState<string[]>(defaultValue ?? []);
  const current = value !== undefined ? value : inner;
  return (
    <FieldGroup legend={legend} id={id} required={required} hint={hint} error={error} className={className}>
      {({ describedBy, invalid }) => (
        <ul className="check-list">
          {options.map((o, i) => {
            const inputId = `${id ? id : "check"}-${i}`;
            return (
              <li key={o.value}>
                <label className={cn("check-row", (disabled || o.disabled) && "is-disabled")}>
                  <Checkbox
                    id={id ? inputId : undefined}
                    name={name}
                    value={o.value}
                    disabled={disabled || o.disabled}
                    aria-invalid={invalid}
                    aria-describedby={describedBy}
                    checked={current.includes(o.value)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...current.filter((x) => x !== o.value), o.value]
                        : current.filter((x) => x !== o.value);
                      setInner(next);
                      onChange?.(next);
                    }}
                  />
                  <span>{o.label}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </FieldGroup>
  );
}
