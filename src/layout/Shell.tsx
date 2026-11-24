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
  width,
  className,
}: {
  children: ReactNode;
  id?: string;
  /** Same as `width="narrow"`. */
  narrow?: boolean;
  /** `narrow` is 48rem, `medium` 64rem, `default` 72rem. */
  width?: "narrow" | "medium" | "default";
  className?: string;
}) {
  const w = width ?? (narrow ? "narrow" : "default");
  return (
    <main
      id={id}
      tabIndex={-1}
      className={cn(
        "page-container",
        w === "narrow" && "page-container-narrow",
        w === "medium" && "page-container-medium",
        className,
      )}
    >
      {children}
    </main>
  );
}
