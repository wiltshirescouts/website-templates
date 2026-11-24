import { X } from "lucide-react";
import { Dialog as RadixDialog } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/cn";

/**
 * A modal dialog. Focus is trapped while it is open, Escape closes it and focus returns to the trigger.
 * Always give it a `DialogTitle`; add a `DialogDescription` or pass `aria-describedby={undefined}` to `DialogContent`.
 */
export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

export function DialogContent({
  className,
  children,
  wide,
  ...p
}: ComponentProps<typeof RadixDialog.Content> & { wide?: boolean; children: ReactNode }) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="dialog-overlay" />
      <RadixDialog.Content className={cn("dialog", wide && "dialog-wide", className)} {...p}>
        {children}
        <RadixDialog.Close className="dialog__close" aria-label="Close">
          <X className="icon icon-md" aria-hidden="true" focusable="false" />
        </RadixDialog.Close>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

export function DialogTitle({ className, ...p }: ComponentProps<typeof RadixDialog.Title>) {
  return <RadixDialog.Title className={cn("dialog__title", className)} {...p} />;
}

export function DialogDescription({ className, ...p }: ComponentProps<typeof RadixDialog.Description>) {
  return <RadixDialog.Description className={cn("dialog__description", className)} {...p} />;
}

export function DialogFooter({ className, ...p }: ComponentProps<"div">) {
  return <div className={cn("dialog__footer", className)} {...p} />;
}
