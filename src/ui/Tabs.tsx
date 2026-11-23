import { Tabs as T } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

export const Tabs = T.Root;
export function TabsList({ className, ...p }: ComponentProps<typeof T.List>) {
  return <T.List className={cn("tabs-list", className)} {...p} />;
}
export function Tab({ className, ...p }: ComponentProps<typeof T.Trigger>) {
  return <T.Trigger className={cn("tab", className)} {...p} />;
}
export function TabPanel({ className, ...p }: ComponentProps<typeof T.Content>) {
  return <T.Content className={cn("tab-panel", className)} {...p} />;
}
