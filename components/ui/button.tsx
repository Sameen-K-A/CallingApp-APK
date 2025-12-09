import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Pressable, Text, type PressableProps, type TextProps } from "react-native";

import { PressableSlot, TextSlot } from "@/components/ui/slot";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "flex flex-row items-center justify-center gap-2 rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary active:opacity-90",
        destructive: "bg-destructive active:opacity-90",
        outline: "border border-border bg-background active:bg-accent",
        secondary: "bg-secondary active:opacity-80",
        ghost: "active:bg-accent",
        link: "",
      },
      size: {
        default: "h-12 px-4 py-2",
        sm: "h-10 rounded-md gap-1.5 px-3",
        lg: "h-14 rounded-md px-6",
        icon: "p-3",
        "icon-sm": "p-2",
        "icon-lg": "p-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const buttonTextVariants = cva(
  "text-sm font-medium text-center",
  {
    variants: {
      variant: {
        default: "text-primaryForeground",
        destructive: "text-destructiveForeground",
        outline: "text-text",
        secondary: "text-secondaryForeground",
        ghost: "text-text",
        link: "text-primary underline",
      },
      size: {
        default: "",
        sm: "text-sm",
        lg: "text-base",
        icon: "",
        "icon-sm": "",
        "icon-lg": "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type ButtonProps = PressableProps &
  VariantProps<typeof buttonVariants> & {
    className?: string;
    asChild?: boolean;
  };

const Button = React.forwardRef<React.ComponentRef<typeof Pressable>, ButtonProps>(
  ({ className, variant, size, asChild = false, disabled, ...props }, ref) => {
    const Comp = asChild ? PressableSlot : Pressable;

    return (
      <Comp
        ref={ref}
        disabled={disabled}
        className={cn(
          buttonVariants({ variant, size }),
          disabled && "opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

type ButtonTextProps = TextProps &
  VariantProps<typeof buttonTextVariants> & {
    className?: string;
    asChild?: boolean;
  };

const ButtonText = React.forwardRef<React.ComponentRef<typeof Text>, ButtonTextProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? TextSlot : Text;

    return (
      <Comp
        allowFontScaling={false}
        ref={ref}
        className={cn(buttonTextVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

ButtonText.displayName = "ButtonText";

export { Button, ButtonText, buttonTextVariants, buttonVariants };

