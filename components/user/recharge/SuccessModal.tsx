import { Drawer, useDrawerClose } from "@/components/ui/drawer";
import { IPlan } from "@/types/user";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface SuccessModalProps {
  visible: boolean;
  plan: IPlan | null;
  newBalance: number;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ visible, plan, newBalance, onClose }) => {
  if (!plan) return null;

  return (
    <Drawer visible={visible} onClose={onClose}>
      <Drawer.Content>
        <View className="items-center">
          <View className="w-28 h-28 rounded-full bg-success/10 items-center justify-center mb-5">
            <View className="w-20 h-20 rounded-full bg-success items-center justify-center">
              <Ionicons name="checkmark" size={44} color="#FFFFFF" />
            </View>
          </View>

          <Text
            allowFontScaling={false}
            className="text-2xl font-bold text-text mb-1"
          >
            Payment Successful!
          </Text>
          <Text
            allowFontScaling={false}
            className="text-sm text-textMuted mb-8"
          >
            Your coins have been added to wallet
          </Text>

          <View className="w-full bg-amber-50 border border-amber-100 rounded-3xl p-5 mb-5">
            <View className="flex-row items-center">
              <View className="w-14 h-14 rounded-2xl bg-amber-100 items-center justify-center">
                <FontAwesome6 name="coins" size={26} color="#D97706" />
              </View>

              <View className="flex-1 ml-4">
                <Text
                  allowFontScaling={false}
                  className="text-xs text-amber-600 font-medium mb-1"
                >
                  COINS ADDED
                </Text>
                <Text
                  allowFontScaling={false}
                  className="text-3xl font-bold text-amber-700"
                >
                  +{plan.coins.toLocaleString("en-IN")}
                </Text>
              </View>
            </View>
          </View>

          <View className="w-full bg-muted/50 rounded-2xl px-5 py-4 flex-row items-center justify-between mb-8">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mr-3">
                <Ionicons name="wallet-outline" size={20} color="#8B5CF6" />
              </View>
              <Text
                allowFontScaling={false}
                className="text-sm text-textMuted font-medium"
              >
                New Balance
              </Text>
            </View>

            <View className="flex-row items-center">
              <FontAwesome6 name="coins" size={14} color="#D97706" />
              <Text
                allowFontScaling={false}
                className="text-xl font-bold text-text ml-2"
              >
                {newBalance.toLocaleString("en-IN")}
              </Text>
            </View>
          </View>

          <ContinueButton />
        </View>
      </Drawer.Content>
    </Drawer>
  );
};

const ContinueButton: React.FC = () => {
  const close = useDrawerClose();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={close}
      className="bg-primary rounded-2xl py-4 w-full items-center"
    >
      <Text
        allowFontScaling={false}
        className="text-white font-semibold text-base"
      >
        Continue
      </Text>
    </TouchableOpacity>
  );
};