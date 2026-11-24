import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { Field } from "./Field";

export interface NativeDateFieldProps {
  label: ReactNode;
  /** ISO "YYYY-MM-DD", or "" when empty. */
  value?: string;
  defaultValue?: string;
  onChange?: (iso: string) => void;
  min?: string;
  max?: string;
  required?: boolean;
  hint?: ReactNode;
  /** Message without the "Error:" prefix. */
  error?: ReactNode;
  id?: string;
  className?: string;
  name?: string;
  width?: "sm" | "md" | "lg" | "xl";
}

/** The compact alternative to the three-box `DateField`: one native date input, ISO strings in and out. */
export function NativeDateField({
  label,
  value,
  defaultValue,
  onChange,
  min,
  max,
  required,
  hint,
  error,
  id,
  className,
  name,
  width,
}: NativeDateFieldProps) {
  const state = value !== undefined ? { value } : { defaultValue: defaultValue ?? "" };
  return (
    <Field label={label} required={required} hint={hint} error={error} id={id} className={className}>
      {(control) => (
        <input
          type="date"
          className={cn("input", width ? `input-${width}` : "input-date")}
          name={name}
          min={min}
          max={max}
          {...control}
          {...state}
          onChange={(e) => onChange?.(e.target.value)}
        />
      )}
    </Field>
  );
}
