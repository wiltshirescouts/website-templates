import { type ReactNode, useId } from "react";
import { cn } from "../lib/cn";
import { FieldError, RequiredMark } from "./Field";

export interface ChoiceOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

interface BaseProps {
  legend: ReactNode;
  name: string;
  options: ChoiceOption[];
  id?: string;
  required?: boolean;
  hint?: ReactNode;
  /** Message without the "Error:" prefix. */
  error?: ReactNode;
  className?: string;
}

function Group({
  legend,
  id,
  required,
  hint,
  error,
  className,
  radiogroup,
  children,
}: Pick<BaseProps, "legend" | "id" | "required" | "hint" | "error" | "className"> & {
  radiogroup?: boolean;
  children: ReactNode;
}) {
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
      <legend className="label">
        {legend} {required && <RequiredMark />}
      </legend>
      {hint && (
        <p className="hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && <FieldError id={errId}>{error}</FieldError>}
      <div className="choice-list" role={radiogroup ? "radiogroup" : undefined}>
        {children}
      </div>
    </fieldset>
  );
}

export interface RadioCardsProps extends BaseProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

/**
 * One choice from several, as cards. Native radio inputs: the selected card has a heavier border, bold text and the
 * filled radio dot, so selection never relies on colour alone. The first radio gets `id="<id>-0"` for summary links.
 */
export function RadioCards({
  options,
  name,
  value,
  defaultValue,
  onChange,
  error,
  required,
  ...rest
}: RadioCardsProps) {
  const auto = useId();
  const base = rest.id ?? auto;
  return (
    <Group {...rest} id={base} error={error} required={required} radiogroup>
      {options.map((o, i) => (
        <label className="choice" key={o.value}>
          <input
            type="radio"
            id={`${base}-${i}`}
            name={name}
            value={o.value}
            disabled={o.disabled}
            required={required || undefined}
            aria-invalid={error ? true : undefined}
            {...(value !== undefined
              ? { checked: value === o.value, onChange: () => onChange?.(o.value) }
              : { defaultChecked: defaultValue === o.value, onChange: () => onChange?.(o.value) })}
          />
          {o.label}
        </label>
      ))}
    </Group>
  );
}

export interface CheckboxCardsProps extends BaseProps {
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
}

/** Several choices, as cards with native checkboxes. Selected cards are bold with a heavier border and a tick. */
export function CheckboxCards({
  options,
  name,
  value,
  defaultValue,
  onChange,
  error,
  required: _r,
  ...rest
}: CheckboxCardsProps) {
  const auto = useId();
  const base = rest.id ?? auto;
  const toggle = (current: string[], v: string, on: boolean) =>
    on ? [...current, v] : current.filter((x) => x !== v);
  return (
    <Group {...rest} id={base} error={error} required={_r}>
      {options.map((o, i) => (
        <label className="choice" key={o.value}>
          <input
            type="checkbox"
            id={`${base}-${i}`}
            name={name}
            value={o.value}
            disabled={o.disabled}
            aria-invalid={error ? true : undefined}
            {...(value !== undefined
              ? {
                  checked: value.includes(o.value),
                  onChange: (e) => onChange?.(toggle(value, o.value, e.target.checked)),
                }
              : { defaultChecked: defaultValue?.includes(o.value) })}
          />
          {o.label}
        </label>
      ))}
    </Group>
  );
}

/** A single full-width checkbox card, for consent. The label may contain links. */
export function ConsentCheckbox({
  id,
  name,
  required,
  error,
  children,
  ...rest
}: {
  id?: string;
  name?: string;
  required?: boolean;
  error?: ReactNode;
  children: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  const auto = useId();
  const base = id ?? auto;
  const errId = error ? `${base}-err` : undefined;
  const { checked, defaultChecked, onChange } = rest;
  return (
    <div className={cn("field", error && "has-error")}>
      {error && <FieldError id={errId}>{error}</FieldError>}
      <div className="choice-list">
        <label className="choice consent">
          <input
            type="checkbox"
            id={base}
            name={name}
            required={required || undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={errId}
            {...(checked !== undefined ? { checked } : { defaultChecked })}
            onChange={(e) => onChange?.(e.target.checked)}
          />
          <span>
            {children} {required && <RequiredMark />}
          </span>
        </label>
      </div>
    </div>
  );
}
