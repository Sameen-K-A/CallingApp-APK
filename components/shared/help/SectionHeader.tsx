import React from "react";
import { Text } from "react-native";

interface SectionHeaderProps {
  title: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => (
  <Text
    allowFontScaling={false}
    className="text-sm font-semibold text-textMuted uppercase tracking-wide mb-3 px-1"
  >
    {title}
  </Text>
);