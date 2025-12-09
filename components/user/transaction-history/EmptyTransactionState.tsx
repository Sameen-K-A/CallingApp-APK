import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

export const EmptyTransactionState: React.FC = () => {
  return (
    <View className="flex-1 items-center justify-center px-8 py-20">
      <View className="w-24 h-24 rounded-full bg-muted items-center justify-center mb-6">
        <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
      </View>

      <Text
        allowFontScaling={false}
        className="text-xl font-bold text-text mb-2 text-center"
      >
        No Transactions Yet
      </Text>

      <Text
        allowFontScaling={false}
        className="text-sm text-textMuted text-center leading-5"
      >
        Your payment history will appear here once you make your first recharge.
      </Text>
    </View>
  );
};