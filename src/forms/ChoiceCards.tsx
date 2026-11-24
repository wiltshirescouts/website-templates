import { Fragment, type ReactNode, useId, useState } from "react";
import { cn } from "../lib/cn";
import { FieldError, RequiredMark } from "./Field";

export interface ChoiceOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  /** Smaller muted text under the label, inside the card. */
  hint?: ReactNode;
  /**
   * Content revealed under this option only while it is selected. It stays in the DOM (with `hidden`) when not
   * selected so form state survives. Any option with `conditional` forces the stacked layout.
   */
  conditional?: ReactNode;
}

export type ChoiceLayout = "inline" | "stack" | "grid-2" | "grid-3";

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
  /** "inline" (default) wraps cards in a row; "stack" is one per row; "grid-2"/"grid-3" are columns from 640px up. */
  layout?: ChoiceLayout;
}

function Group({
  legend,
  id,
  required,
  hint,
  error,
  className,
  radiogroup,
  layout = "inline",
  children,
}: Pick<BaseProps, "legend" | "id" | "required" | "hint" | "error" | "className" | "layout"> & {
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
      <div
        className={cn("choice-list", layout !== "inline" && `choice-list--${layout}`)}
        role={radiogroup ? "radiogroup" : undefined}
      >
        {children}
      </div>
    </fieldset>
  );
}

function effectiveLayout(layout: ChoiceLayout | undefined, options: ChoiceOption[]): ChoiceLayout {
  return options.some((o) => o.conditional) ? "stack" : (layout ?? "inline");
}

function CardText({ label, hint }: { label: ReactNode; hint?: ReactNode }) {
  if (!hint) return <>{label}</>;
  return (
    <span className="choice__text">
      <span className="choice__label">{label}</span>
      <span className="choice__hint">{hint}</span>
    </span>
  );
}

function Conditional({ id, show, children }: { id: string; show: boolean; children: ReactNode }) {
  return (
    <div className="choice-conditional" id={id} hidden={!show}>
      {children}
    </div>
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
  layout,
  ...rest
}: RadioCardsProps) {
  const auto = useId();
  const base = rest.id ?? auto;
  const [inner, setInner] = useState(defaultValue);
  const current = value !== undefined ? value : inner;
  return (
    <Group
      {...rest}
      id={base}
      error={error}
      required={required}
      radiogroup
      layout={effectiveLayout(layout, options)}
    >
      {options.map((o, i) => {
        const selected = current === o.value;
        const condId = `${base}-${i}-conditional`;
        return (
          <Fragment key={o.value}>
            <label className="choice">
              <input
                type="radio"
                id={`${base}-${i}`}
                name={name}
                value={o.value}
                disabled={o.disabled}
                required={required || undefined}
                aria-invalid={error ? true : undefined}
                aria-controls={o.conditional ? condId : undefined}
                checked={selected}
                onChange={() => {
                  setInner(o.value);
                  onChange?.(o.value);
                }}
              />
              <CardText label={o.label} hint={o.hint} />
            </label>
            {o.conditional && (
              <Conditional id={condId} show={selected}>
                {o.conditional}
              </Conditional>
            )}
          </Fragment>
        );
      })}
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
  layout,
  ...rest
}: CheckboxCardsProps) {
  const auto = useId();
  const base = rest.id ?? auto;
  const [inner, setInner] = useState<string[]>(defaultValue ?? []);
  const current = value !== undefined ? value : inner;
  const toggle = (v: string, on: boolean) =>
    on ? [...current.filter((x) => x !== v), v] : current.filter((x) => x !== v);
  return (
    <Group {...rest} id={base} error={error} required={_r} layout={effectiveLayout(layout, options)}>
      {options.map((o, i) => {
        const selected = current.includes(o.value);
        const condId = `${base}-${i}-conditional`;
        return (
          <Fragment key={o.value}>
            <label className="choice">
              <input
                type="checkbox"
                id={`${base}-${i}`}
                name={name}
                value={o.value}
                disabled={o.disabled}
                aria-invalid={error ? true : undefined}
                aria-controls={o.conditional ? condId : undefined}
                checked={selected}
                onChange={(e) => {
                  const next = toggle(o.value, e.target.checked);
                  setInner(next);
                  onChange?.(next);
                }}
              />
              <CardText label={o.label} hint={o.hint} />
            </label>
            {o.conditional && (
              <Conditional id={condId} show={selected}>
                {o.conditional}
              </Conditional>
            )}
          </Fragment>
        );
      })}
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
