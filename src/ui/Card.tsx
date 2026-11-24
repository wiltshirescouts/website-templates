import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export function Card({
  className,
  tone,
  ...p
}: HTMLAttributes<HTMLDivElement> & {
  /** `accent` adds a purple bar along the top, `primary` a purple border all round. */
  tone?: "accent" | "primary";
}) {
  return (
    <div
      className={cn(
        "card",
        tone === "accent" && "card--accent",
        tone === "primary" && "card--primary",
        className,
      )}
      {...p}
    />
  );
}

/** Top of a card: title, description and anything that sits with them (chips). */
export function CardHeader({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card__header", className)} {...p} />;
}
export function CardTitle({
  as: H = "h2",
  icon,
  className,
  children,
  ...p
}: HTMLAttributes<HTMLHeadingElement> & { as?: "h2" | "h3" | "h4"; icon?: ReactNode }) {
  return (
    <H className={cn("card__title", className)} {...p}>
      {icon}
      {children}
    </H>
  );
}
export function CardDescription({ className, ...p }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("card__description", className)} {...p} />;
}
/** Bottom of a card: a rule, then actions in a row. */
export function CardFooter({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card__footer", className)} {...p} />;
}
export function CardBody({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card__body", className)} {...p} />;
}
export function Eyebrow({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("eyebrow", className)} {...p} />;
}
