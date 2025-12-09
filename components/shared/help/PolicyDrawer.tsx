import { Drawer } from "@/components/ui/drawer";
import { POLICY_CONTENT } from "@/constants/help";
import React from "react";
import { Text } from "react-native";

type PolicyType = "privacy" | "payment" | "terms";

interface PolicyDrawerProps {
  visible: boolean;
  type: PolicyType | null;
  onClose: () => void;
}

export const PolicyDrawer: React.FC<PolicyDrawerProps> = ({ visible, type, onClose }) => {
  if (!type) return null;

  const policy = POLICY_CONTENT[type];

  return (
    <Drawer visible={visible} onClose={onClose}>
      <Drawer.Content className="h-full">
        <Text
          allowFontScaling={false}
          className="text-xl font-bold text-text mb-4"
        >
          {policy.title}
        </Text>

        <Text
          allowFontScaling={false}
          className="text-base text-text leading-7"
        >
          {policy.content}
        </Text>
      </Drawer.Content>
    </Drawer>
  );
};