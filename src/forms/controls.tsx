import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export function Input({ className, size: _s, width, ...p }: InputHTMLAttributes<HTMLInputElement> & { width?: "sm" | "md" }) {
  return <input className={cn("input", width === "sm" && "input-sm", width === "md" && "input-md", className)} {...p} />;
}

export function Select({ className, ...p }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("select", className)} {...p} />;
}

export function Textarea({ className, mono, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement> & { mono?: boolean }) {
  return <textarea className={cn("textarea", mono && "mono", className)} {...p} />;
}
