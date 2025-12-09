import React from "react";
import { Platform, Text, TextInput, View, type TextInputProps } from "react-native";
import { cn } from "../lib/utils";

type InputVariant = "default" | "outline";
type InputSize = "default" | "sm" | "lg";

interface InputProps extends TextInputProps {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  error?: string;
  className?: string;
  containerClassName?: string;
}

const sizeStyles = {
  sm: { height: 40, fontSize: 14, paddingHorizontal: 12 },
  default: { height: 48, fontSize: 16, paddingHorizontal: 16 },
  lg: { height: 56, fontSize: 18, paddingHorizontal: 20 },
};

const Input: React.FC<InputProps> = ({
  variant = "default",
  size = "default",
  label,
  error,
  className,
  containerClassName,
  ...props
}) => {
  const currentSize = sizeStyles[size];

  return (
    <View className={cn("mb-4", containerClassName)}>
      {label && (
        <Text allowFontScaling={false} className="text-sm text-text mb-2 font-semibold">
          {label}
        </Text>
      )}

      <TextInput
        allowFontScaling={false}
        className={cn(
          "rounded-xl text-text text-xs",
          variant === "default" && "bg-white/10 border border-white/20",
          variant === "outline" && "bg-transparent border border-border",
          error && "border-error",
          props.editable === false && "opacity-50 bg-muted",
          className
        )}
        placeholderTextColor="#6B7280"
        style={[
          {
            height: currentSize.height,
            fontSize: currentSize.fontSize,
            paddingHorizontal: currentSize.paddingHorizontal,
            paddingVertical: 0,
            textAlignVertical: 'center',
            includeFontPadding: false,
            lineHeight: currentSize.fontSize + 4,
          },
          Platform.OS === 'ios' && {
            paddingTop: 0,
            paddingBottom: 0,
          },
        ]}
        {...props}
      />

      {error && (
        <Text className="text-xs font-bold text-error mt-2 px-1" allowFontScaling={false}>
          {error}
        </Text>
      )}
    </View>
  );
};

export { Input };

