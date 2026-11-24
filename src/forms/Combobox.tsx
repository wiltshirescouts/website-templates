import { ChevronDown } from "lucide-react";
import { type KeyboardEvent, type ReactNode, useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "../lib/cn";
import { Field } from "./Field";

export interface ComboboxOption {
  value: string;
  label: string;
  synonyms?: string[];
}

export interface ComboboxProps {
  id?: string;
  label: ReactNode;
  hint?: ReactNode;
  /** Message without the "Error:" prefix. */
  error?: ReactNode;
  required?: boolean;
  options: ComboboxOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  /** Always appended as the last option, whatever the filter. */
  notListed?: { value: string; label: string };
  placeholder?: string;
  /** Default "No matches". */
  emptyText?: string;
  /** Renders a hidden input with the selected value. */
  name?: string;
  inputWidth?: "lg" | "xl" | "full";
  className?: string;
}

function rank(o: ComboboxOption, q: string): number {
  const terms = [o.label, ...(o.synonyms ?? [])].map((t) => t.toLowerCase());
  if (terms.some((t) => t.startsWith(q))) return 0;
  if (terms.some((t) => t.includes(q))) return 1;
  return -1;
}

/** An editable ARIA 1.2 combobox with a listbox popup: type to filter, with synonyms and a "not listed" escape hatch. */
export function Combobox({
  id,
  label,
  hint,
  error,
  required,
  options,
  value,
  onChange,
  notListed,
  placeholder,
  emptyText = "No matches",
  name,
  inputWidth = "lg",
  className,
}: ComboboxProps) {
  const auto = useId();
  const base = id ?? auto;
  const listId = `${base}-listbox`;
  const all = useMemo(
    () => (notListed ? [...options, { value: notListed.value, label: notListed.label }] : options),
    [options, notListed],
  );
  const selectedLabel = (value !== null ? all.find((o) => o.value === value)?.label : undefined) ?? "";

  const [text, setText] = useState(selectedLabel);
  const [open, setOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [active, setActive] = useState(-1);
  const [announce, setAnnounce] = useState("");
  const listRef = useRef<HTMLUListElement>(null);

  // Keep the text in step with the value when the parent changes it.
  useEffect(() => {
    setText(selectedLabel);
    setDirty(false);
  }, [selectedLabel]);

  const matches = useMemo(() => {
    const q = text.trim().toLowerCase();
    if (!dirty || !q) return options;
    return options
      .map((o, i) => ({ o, r: rank(o, q), i }))
      .filter((x) => x.r >= 0)
      .sort((a, b) => a.r - b.r || a.i - b.i)
      .map((x) => x.o);
  }, [options, text, dirty]);
  const shown = useMemo(
    () => (notListed ? [...matches, { value: notListed.value, label: notListed.label }] : matches),
    [matches, notListed],
  );

  // Announce the result count once typing settles.
  useEffect(() => {
    if (!open || !dirty) {
      setAnnounce("");
      return;
    }
    const t = setTimeout(() => {
      const n = matches.length;
      setAnnounce(n === 0 ? emptyText : `${n} ${n === 1 ? "result" : "results"} available`);
    }, 300);
    return () => clearTimeout(t);
  }, [open, dirty, matches.length, emptyText]);

  useEffect(() => {
    if (open && active >= 0) {
      document.getElementById(`${base}-opt-${active}`)?.scrollIntoView?.({ block: "nearest" });
    }
  }, [open, active, base]);

  const select = (o: { value: string; label: string }) => {
    setText(o.label);
    setDirty(false);
    setOpen(false);
    setActive(-1);
    if (o.value !== value) onChange(o.value);
  };

  const restore = () => {
    setText(selectedLabel);
    setDirty(false);
  };

  const openList = () => {
    if (open) return;
    setOpen(true);
    setActive(value !== null ? all.findIndex((o) => o.value === value) : -1);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const last = shown.length - 1;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) {
          openList();
          return;
        }
        setActive((a) => (a >= last ? 0 : a + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) {
          openList();
          return;
        }
        setActive((a) => (a <= 0 ? last : a - 1));
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setActive(0);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setActive(last);
        }
        break;
      case "Enter":
        if (open && active >= 0 && shown[active]) {
          e.preventDefault();
          select(shown[active]);
        }
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
          setActive(-1);
          restore();
        }
        break;
    }
  };

  const onBlur = () => {
    setOpen(false);
    setActive(-1);
    if (dirty) {
      const exact = text.trim() !== "" ? all.find((o) => o.label === text.trim()) : undefined;
      if (exact) select(exact);
      else restore();
    }
  };

  return (
    <Field label={label} hint={hint} error={error} required={required} id={base} className={className}>
      {(control) => (
        <div className={cn("combobox", inputWidth !== "full" && `combobox-${inputWidth}`)}>
          <input
            {...control}
            type="text"
            className="input combobox__input"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={open && active >= 0 ? `${base}-opt-${active}` : undefined}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder={placeholder}
            value={text}
            onFocus={openList}
            onClick={openList}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            onChange={(e) => {
              const v = e.target.value;
              setText(v);
              setDirty(true);
              setOpen(true);
              setActive(v.trim() ? 0 : -1);
              if (v === "" && value !== null) onChange(null);
            }}
          />
          <ChevronDown className="icon icon-sm combobox__chevron" aria-hidden="true" focusable="false" />
          <ul
            className="combobox__list"
            role="listbox"
            id={listId}
            ref={listRef}
            hidden={!open}
            aria-label={typeof label === "string" ? label : undefined}
            onMouseDown={(e) => e.preventDefault()}
          >
            {matches.length === 0 && (
              <li className="combobox__empty" role="presentation">
                {emptyText}
              </li>
            )}
            {shown.map((o, i) => (
              <li
                key={o.value}
                id={`${base}-opt-${i}`}
                role="option"
                aria-selected={o.value === value}
                className="combobox__option"
                data-active={i === active || undefined}
                data-not-listed={notListed && o.value === notListed.value ? "" : undefined}
                onMouseMove={() => i !== active && setActive(i)}
                onClick={() => select(o)}
              >
                {o.label}
              </li>
            ))}
          </ul>
          {name && <input type="hidden" name={name} value={value ?? ""} />}
          <p className="sr-only" role="status" aria-live="polite">
            {announce}
          </p>
        </div>
      )}
    </Field>
  );
}
