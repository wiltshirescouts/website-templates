import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

// React 19 passes `ref` as an ordinary prop, so each control forwards it to the native element.

export function Input({
  className,
  size: _s,
  width,
  ...p
}: Omit<ComponentProps<"input">, "width"> & { width?: "sm" | "md" | "lg" | "xl" }) {
  return <input className={cn("input", width && `input-${width}`, className)} {...p} />;
}

export function Select({ className, ...p }: ComponentProps<"select">) {
  return <select className={cn("select", className)} {...p} />;
}

export function Textarea({ className, mono, ...p }: ComponentProps<"textarea"> & { mono?: boolean }) {
  return <textarea className={cn("textarea", mono && "mono", className)} {...p} />;
}
