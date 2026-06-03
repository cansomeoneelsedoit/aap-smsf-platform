import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-brand-sm text-sm font-semibold transition-all outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-brand-orange text-white hover:bg-brand-orange-2",
        outline: "border-[1.5px] border-brand-border-2 bg-white text-brand-text hover:border-brand-orange hover:text-brand-orange",
        back: "border-[1.5px] border-brand-border-2 bg-white text-brand-text-2 hover:border-brand-text-2 hover:text-brand-dark",
        green: "bg-brand-green text-white hover:bg-[#15803d]",
        purple: "bg-brand-purple text-white hover:bg-[#6d28d9]",
        ghost: "bg-transparent text-brand-text-2 hover:bg-brand-surface",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-3.5 text-[13px]",
        xs: "h-7 px-2.5 text-xs",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
