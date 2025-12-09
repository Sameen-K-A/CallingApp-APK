import * as React from "react";
import { Pressable, Text, View } from "react-native";

// Helper to merge refs
function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  };
}

// Helper to merge props
function mergeProps(parentProps: any, childProps: any) {
  const merged = { ...parentProps };

  for (const key in childProps) {
    const parentValue = parentProps[key];
    const childValue = childProps[key];

    if (key === "style") {
      merged[key] = [parentValue, childValue].filter(Boolean);
    } else if (key === "className") {
      merged[key] = [parentValue, childValue].filter(Boolean).join(" ");
    } else if (typeof parentValue === "function" && typeof childValue === "function") {
      merged[key] = (...args: any[]) => {
        parentValue(...args);
        childValue(...args);
      };
    } else if (childValue !== undefined) {
      merged[key] = childValue;
    }
  }

  return merged;
}

interface SlotProps {
  children?: React.ReactNode;
  [key: string]: any;
}

export const Slot = React.forwardRef<View, SlotProps>(
  ({ children, ...props }, ref) => {
    if (React.isValidElement(children)) {
      const childRef = (children as any).ref;

      return React.cloneElement(children, {
        ...mergeProps(props, children.props),
        ref: ref ? mergeRefs(ref, childRef) : childRef,
      } as any);
    }

    if (React.Children.count(children) > 1) {
      React.Children.only(null); // This will throw an error
    }

    return null;
  }
);

Slot.displayName = "Slot";

// Slottable component for nested slot patterns
export const Slottable = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// PressableSlot for button-like components
export const PressableSlot = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  React.ComponentPropsWithoutRef<typeof Pressable>
>(({ children, ...props }, ref) => {
  if (React.isValidElement(children)) {
    const childRef = (children as any).ref;

    return React.cloneElement(children, {
      ...mergeProps(props, children.props),
      ref: ref ? mergeRefs(ref, childRef) : childRef,
    } as any);
  }

  return null;
});

PressableSlot.displayName = "PressableSlot";

// TextSlot for text components
export const TextSlot = React.forwardRef<
  React.ComponentRef<typeof Text>,
  React.ComponentPropsWithoutRef<typeof Text>
>(({ children, ...props }, ref) => {
  if (React.isValidElement(children)) {
    const childRef = (children as any).ref;

    return React.cloneElement(children, {
      ...mergeProps(props, children.props),
      ref: ref ? mergeRefs(ref, childRef) : childRef,
    } as any);
  }

  return <Text ref={ref} {...props}>{children}</Text>;
});

TextSlot.displayName = "TextSlot";