import { Drawer } from "@/components/ui/drawer";
import { IPlan } from "@/types/user";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ConfirmationModalProps {
  visible: boolean;
  plan: IPlan | null;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  plan,
  onClose,
  onConfirm,
  isProcessing,
}) => {
  if (!plan) return null;

  const hasDiscount = plan.discountPercentage > 0;
  const originalPrice = hasDiscount
    ? Math.round(plan.amount / (1 - plan.discountPercentage / 100))
    : plan.amount;

  const savings = originalPrice - plan.amount;

  return (
    <Drawer visible={visible} onClose={onClose}>
      <Drawer.Content className="pb-0">
        <Text
          allowFontScaling={false}
          className="text-lg font-bold text-text text-center mb-6"
        >
          Confirm Purchase
        </Text>

        <View className="bg-muted/50 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center">
            <View className="w-14 h-14 rounded-2xl bg-amber-100 items-center justify-center mr-4">
              <FontAwesome6 name="coins" size={24} color="#D97706" />
            </View>

            <View className="flex-1">
              <Text
                allowFontScaling={false}
                className="text-2xl font-bold text-text"
              >
                {plan.coins.toLocaleString("en-IN")} coins
              </Text>
              <View className="flex-row items-center mt-1">
                <Text
                  allowFontScaling={false}
                  className="text-lg font-semibold text-primary"
                >
                  ₹{plan.amount.toFixed(2)}
                </Text>
                {hasDiscount && (
                  <Text
                    allowFontScaling={false}
                    className="text-sm text-textMuted line-through ml-2"
                  >
                    ₹{originalPrice.toFixed(2)}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {hasDiscount && (
          <View className="bg-success/10 rounded-xl px-4 py-3 mb-4 flex-row items-center justify-center">
            <Ionicons name="pricetag" size={16} color="#10B981" />
            <Text
              allowFontScaling={false}
              className="text-success font-semibold ml-2"
            >
              You save ₹{savings}!
            </Text>
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onConfirm}
          disabled={isProcessing}
          className={`bg-primary rounded-2xl py-4 items-center flex-row justify-center ${isProcessing ? "opacity-70" : ""}`}
        >
          {isProcessing ? (
            <Text
              allowFontScaling={false}
              className="text-white font-semibold text-base"
            >
              Processing...
            </Text>
          ) : (
            <>
              <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
              <Text
                allowFontScaling={false}
                className="text-white font-semibold text-base ml-2"
              >
                Pay ₹{plan.amount}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View className="flex-row items-center justify-center my-4">
          <Ionicons name="lock-closed" size={12} color="#9CA3AF" />
          <Text
            allowFontScaling={false}
            className="text-xs text-textMuted ml-1"
          >
            Secured by Razorpay
          </Text>
        </View>
      </Drawer.Content>
    </Drawer>
  );
};