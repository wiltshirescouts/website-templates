import type { ReactNode } from "react";
import { cn } from "../lib/cn";

/** Full-height page frame so the footer sits at the bottom. */
export function PageShell({ children }: { children: ReactNode }) {
  return <div className="shell">{children}</div>;
}

/** The main landmark for standard (non-hero) pages. */
export function Main({
  children,
  id = "main",
  narrow,
  className,
}: {
  children: ReactNode;
  id?: string;
  narrow?: boolean;
  className?: string;
}) {
  return (
    <main id={id} tabIndex={-1} className={cn("page-container", narrow && "page-container-narrow", className)}>
      {children}
    </main>
  );
}
