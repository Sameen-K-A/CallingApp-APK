import { IPlan } from "@/types/user";
import { FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface PlanCardProps {
  plan: IPlan;
  onPress: (plan: IPlan) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, onPress }) => {
  const hasDiscount = plan.discountPercentage > 0;
  const originalPrice = hasDiscount
    ? Math.round(plan.amount / (1 - plan.discountPercentage / 100))
    : plan.amount;

  return (
    <TouchableOpacity
      className="bg-card rounded-3xl p-4 border border-muted overflow-hidden"
      activeOpacity={0.7}
      onPress={() => onPress(plan)}
    >
      {hasDiscount && (
        <View
          className="absolute -right-8 top-4 bg-green-100 px-8 py-1"
          style={{ transform: [{ rotate: "45deg" }] }}
        >
          <Text
            allowFontScaling={false}
            className="text-green-600 text-[10px] font-bold text-center"
          >
            {plan.discountPercentage}% OFF
          </Text>
        </View>
      )}

      <View className="items-center mt-2 mb-4">
        <View className="w-12 h-12 rounded-2xl bg-amber-100 items-center justify-center mb-2">
          <FontAwesome6 name="coins" size={20} color="#D97706" />
        </View>
        <Text
          allowFontScaling={false}
          className="text-text font-nexaHeavy text-2xl font-bold"
        >
          {plan.coins.toLocaleString("en-IN")}
        </Text>
        <Text
          allowFontScaling={false}
          className="text-textMuted text-xs"
        >
          coins
        </Text>
      </View>

      <View className="bg-primary/10 rounded-2xl py-3 items-center">
        <View className="flex-row items-center">
          <Text
            allowFontScaling={false}
            className="text-primary text-lg font-bold"
          >
            ₹{plan.amount}
          </Text>
          {hasDiscount && (
            <Text
              allowFontScaling={false}
              className="text-textMuted text-sm line-through ml-2"
            >
              ₹{originalPrice}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};