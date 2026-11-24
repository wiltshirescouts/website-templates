import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

/**
 * A plain inline checkbox (native input, 24px, with a 44px hit area). Give it an `id` and a `<label htmlFor>`.
 * For consent use `ConsentCheckbox`; for choosing between options use `CheckboxCards`.
 */
export function Checkbox({ className, ...p }: Omit<ComponentProps<"input">, "type">) {
  return <input type="checkbox" className={cn("checkbox", className)} {...p} />;
}
