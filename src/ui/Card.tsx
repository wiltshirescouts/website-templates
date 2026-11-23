import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

export function Card({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card", className)} {...p} />;
}
export function CardBody({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card__body", className)} {...p} />;
}
export function Eyebrow({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("eyebrow", className)} {...p} />;
}
