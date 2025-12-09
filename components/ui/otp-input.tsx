import React, { useRef, useState } from "react";
import { TextInput, View } from "react-native";

type OTPInputProps = {
  length?: number;
  onChangeText?: (otp: string) => void;
};

const OTPInput: React.FC<OTPInputProps> = ({ length = 5, onChangeText }) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    if (isNaN(Number(text))) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    const otpString = newOtp.join("");
    onChangeText?.(otpString);

    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const getInputClassName = (index: number, digit: string) => {
    const baseClasses =
      "flex-1 h-16 rounded-xl text-center text-2xl font-bold text-text border";

    if (focusedIndex === index) {
      return `${baseClasses} border-2 border-primary bg-primary/5`;
    }

    if (digit) {
      return `${baseClasses} border-border/60 bg-white/5`;
    }

    return `${baseClasses} border-border bg-white/5`;
  };

  return (
    <View className="flex-row justify-between gap-3">
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          className={getInputClassName(index, digit)}
          keyboardType="number-pad"
          maxLength={1}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex(null)}
          selectTextOnFocus
          allowFontScaling={false}
        />
      ))}
    </View>
  );
};

export { OTPInput };
