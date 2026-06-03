import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
  {
    variants: {
      variant: {
        orange: "bg-brand-orange-light text-brand-orange",
        green: "bg-brand-green-light text-brand-green",
        amber: "bg-brand-amber-light text-brand-amber",
        red: "bg-brand-red-light text-brand-red",
        blue: "bg-brand-blue-light text-brand-blue",
        gray: "bg-brand-surface-2 text-brand-text-2",
        purple: "bg-brand-purple-light text-brand-purple",
      },
    },
    defaultVariants: {
      variant: "gray",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
