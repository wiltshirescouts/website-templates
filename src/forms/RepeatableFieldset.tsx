import type { LucideIcon } from "lucide-react";
import { Plus, Trash2 } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "../ui/Button";
import { FieldGroup } from "./Field";

export interface RepeatableFieldsetProps<T> {
  legend: ReactNode;
  items: T[];
  getKey: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => ReactNode;
  onAdd: () => void;
  onRemove: (index: number) => void;
  addLabel: string;
  /** For example `(i) => `Destination ${i + 1}``. */
  itemLabel: (index: number) => string;
  /** Default `Remove ${itemLabel(i).toLowerCase()}`. */
  removeLabel?: (index: number) => string;
  /** Rows at or below this count have no Remove button. Default 1. */
  min?: number;
  /** Shown beside each row's legend. */
  icon?: LucideIcon;
  hint?: ReactNode;
  /** Message without the "Error:" prefix. */
  error?: ReactNode;
  id?: string;
  announceAdded?: (index: number, total: number) => string;
  announceRemoved?: (index: number, total: number) => string;
}

type Pending = { kind: "add" } | { kind: "remove"; index: number };

const FOCUSABLE =
  'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

/** A group of repeated row fieldsets with Add and Remove, focus management and announcements. */
export function RepeatableFieldset<T>({
  legend,
  items,
  getKey,
  renderItem,
  onAdd,
  onRemove,
  addLabel,
  itemLabel,
  removeLabel,
  min = 1,
  icon: Icon,
  hint,
  error,
  id,
  announceAdded,
  announceRemoved,
}: RepeatableFieldsetProps<T>) {
  const rowsRef = useRef<HTMLDivElement>(null);
  const addRef = useRef<HTMLDivElement>(null);
  const pending = useRef<Pending | null>(null);
  const [message, setMessage] = useState("");

  // Runs after every render; acts only when an Add or Remove has just happened.
  useEffect(() => {
    const p = pending.current;
    if (!p) return;
    pending.current = null;
    const rows = rowsRef.current?.querySelectorAll<HTMLElement>(":scope > .repeat-row") ?? [];
    const focusRow = (i: number) => {
      const row = rows[i];
      const target = row?.querySelector<HTMLElement>(FOCUSABLE);
      if (target) {
        target.focus();
        return true;
      }
      return false;
    };
    const total = items.length;
    if (p.kind === "add") {
      const index = total - 1;
      if (!focusRow(index)) addRef.current?.querySelector<HTMLElement>("button")?.focus();
      setMessage(
        announceAdded ? announceAdded(index, total) : `${itemLabel(index)} added. ${total} in total.`,
      );
    } else {
      const index = p.index;
      if (!(focusRow(index) || focusRow(index - 1)))
        addRef.current?.querySelector<HTMLElement>("button")?.focus();
      setMessage(
        announceRemoved ? announceRemoved(index, total) : `${itemLabel(index)} removed. ${total} left.`,
      );
    }
  });

  return (
    <FieldGroup legend={legend} id={id} hint={hint} error={error} className="repeatable">
      <div className="repeat-list" ref={rowsRef}>
        {items.map((item, i) => (
          <fieldset className="repeat-row" key={getKey(item, i)}>
            <legend className="repeat-row__legend">
              {Icon && <Icon className="icon icon-sm" aria-hidden="true" focusable="false" />}
              {itemLabel(i)}
            </legend>
            {renderItem(item, i)}
            {items.length > min && (
              <div className="repeat-row__actions">
                <Button
                  type="button"
                  variant="destructiveOutline"
                  size="sm"
                  onClick={() => {
                    pending.current = { kind: "remove", index: i };
                    onRemove(i);
                  }}
                >
                  <Trash2 className="icon icon-sm" aria-hidden="true" focusable="false" />
                  {removeLabel ? removeLabel(i) : `Remove ${itemLabel(i).toLowerCase()}`}
                </Button>
              </div>
            )}
          </fieldset>
        ))}
      </div>
      <div ref={addRef}>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            pending.current = { kind: "add" };
            onAdd();
          }}
        >
          <Plus className="icon icon-sm" aria-hidden="true" focusable="false" />
          {addLabel}
        </Button>
      </div>
      <p className="sr-only" aria-live="polite" role="status">
        {message}
      </p>
    </FieldGroup>
  );
}
