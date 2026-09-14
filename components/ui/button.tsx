import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva("inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50", {
  variants: {
    variant: {
      default: "bg-accent text-accent-foreground hover:bg-accent/90",
      secondary: "border border-border bg-surface text-foreground hover:bg-muted",
      outline: "border border-border bg-background text-foreground hover:bg-muted",
      ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
      danger: "bg-danger text-white hover:bg-danger/90",
      destructive: "bg-danger text-white hover:bg-danger/90"
    },
    size: {
      sm: "min-h-8 px-2 text-xs",
      md: "min-h-9 px-3",
      lg: "min-h-10 px-4",
      icon: "size-9 min-h-9 px-0"
    }
  },
  defaultVariants: { variant: "default", size: "md" }
});

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
});
Button.displayName = "Button";
