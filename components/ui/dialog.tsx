"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/45 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  size = "default",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  size?: "default" | "wide" | "sm";
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("[data-party-search-dropdown]")) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("[data-party-search-dropdown]")) {
            e.preventDefault();
          }
        }}
        onFocusOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("[data-party-search-dropdown]")) {
            e.preventDefault();
          }
        }}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 flex max-h-[85vh] w-full translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(0,0,0,0.2)] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          size === "wide" && "max-w-[700px]",
          size === "sm" && "max-w-[400px]",
          size === "default" && "max-w-[540px]",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-between border-b border-brand-border px-6 py-5",
        className
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-base font-bold text-brand-dark", className)}
      {...props}
    />
  );
}

function DialogBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex-1 overflow-y-auto px-6 py-5", className)} {...props} />
  );
}

function DialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex shrink-0 justify-end gap-2 border-t border-brand-border px-6 py-4",
        className
      )}
      {...props}
    />
  );
}

function DialogCloseButton() {
  return (
    <DialogClose className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-brand-surface-2 text-brand-text-2 transition-colors hover:bg-brand-border">
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </DialogClose>
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogClose,
  DialogCloseButton,
};
