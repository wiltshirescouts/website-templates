import { Switch as RadixSwitch } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

/**
 * An on/off switch for settings that apply straight away. Pair it with a visible label (`htmlFor` the `id`) that says
 * what it controls. The track shows a tick when on and a cross when off, so state is never colour alone.
 */
export function Switch({ className, ...p }: ComponentProps<typeof RadixSwitch.Root>) {
  return (
    <RadixSwitch.Root className={cn("switch", className)} {...p}>
      <RadixSwitch.Thumb className="switch__thumb" />
    </RadixSwitch.Root>
  );
}
