import { cva, type VariantProps } from "class-variance-authority";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export const buttonVariants = cva("btn", {
  variants: {
    variant: {
      primary: "btn-primary",
      outline: "btn-outline",
      ghost: "btn-ghost",
      destructive: "btn-destructive",
      purpleOutline: "btn-purple-outline",
      onPurple: "btn-on-purple",
      outlineOnPurple: "btn-outline-on-purple",
    },
    size: { default: "", lg: "btn-lg", icon: "btn-icon" },
    blockOnMobile: { true: "btn-block-mobile", false: "" },
  },
  defaultVariants: { variant: "primary", size: "default", blockOnMobile: false },
});

export type ButtonStyleProps = VariantProps<typeof buttonVariants>;

export function Button({
  variant,
  size,
  blockOnMobile,
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & ButtonStyleProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size, blockOnMobile }), className)}
      {...props}
    />
  );
}

/** A link that looks like a button. */
export function ButtonLink({
  variant,
  size,
  blockOnMobile,
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & ButtonStyleProps) {
  // biome-ignore lint/a11y/useAnchorContent: content comes from children
  return <a className={cn(buttonVariants({ variant, size, blockOnMobile }), className)} {...props} />;
}
