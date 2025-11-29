import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border border-primary/50 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),inset_0_-1px_2px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),inset_0_-1px_2px_rgba(0,0,0,0.15),0_6px_12px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.1)] hover:from-primary/95 hover:to-primary/75 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.1)] active:translate-y-[1px] transition-all",
        destructive:
          "bg-gradient-to-br from-destructive to-destructive/80 text-white border border-destructive/50 shadow-[inset_0_1px_2px_rgba(255,255,255,0.15),inset_0_-1px_2px_rgba(0,0,0,0.1),0_3px_6px_rgba(0,0,0,0.12)] hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),inset_0_-1px_2px_rgba(0,0,0,0.15),0_4px_8px_rgba(0,0,0,0.15)] hover:from-destructive/95 hover:to-destructive/75 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.1)] active:translate-y-[1px] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:from-destructive/60 dark:to-destructive/50 transition-all",
        outline:
          "border bg-gradient-to-br from-background to-background/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.08)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_3px_6px_rgba(0,0,0,0.1)] hover:bg-accent hover:text-accent-foreground active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] active:translate-y-[0.5px] dark:bg-gradient-to-br dark:from-input/30 dark:to-input/20 dark:border-input dark:hover:from-input/50 dark:hover:to-input/40 transition-all",
        secondary:
          "bg-gradient-to-br from-secondary to-secondary/90 text-secondary-foreground border border-secondary/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.08)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_3px_6px_rgba(0,0,0,0.1)] hover:from-secondary/95 hover:to-secondary/75 active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] active:translate-y-[0.5px] transition-all",
        ghost:
          "shadow-[inset_0_0_0_rgba(0,0,0,0)] hover:bg-gradient-to-br hover:from-accent hover:to-accent/95 hover:text-accent-foreground hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_1px_2px_rgba(0,0,0,0.05)] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] active:translate-y-[0.5px] dark:hover:from-accent/50 dark:hover:to-accent/40 transition-all",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
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
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
