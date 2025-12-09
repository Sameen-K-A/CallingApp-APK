import { FontAwesome6 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";

interface BalanceCardProps {
  balance: number;
};

export const BalanceCard: React.FC<BalanceCardProps> = ({ balance }) => {
  const formatBalance = (num: number): string => {
    return num.toLocaleString("en-IN");
  };

  return (
    <View className="mx-4 mt-4">
      <View className="overflow-hidden rounded-3xl">
        <LinearGradient
          colors={["#1F1F1F", "#0A0A0A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View className="p-5" style={{ aspectRatio: 1.85 }}>
            <View className="flex-1 justify-between">

              <View className="flex-row items-center justify-between">
                <View className="w-10 h-10 items-center justify-center rounded-full bg-white/10">
                  <FontAwesome6 name="coins" size={18} color="#FCD34D" />
                </View>

                <Text
                  allowFontScaling={false}
                  className="text-white/40 text-xs font-medium tracking-widest"
                >
                  WALLET
                </Text>
              </View>

              <View>
                <Text
                  allowFontScaling={false}
                  className="text-white/50 text-xs font-medium tracking-wider mb-1"
                >
                  AVAILABLE BALANCE
                </Text>
                <View className="flex-row items-baseline">
                  <Text
                    allowFontScaling={false}
                    className="text-white text-5xl font-bold font-nexaHeavy"
                  >
                    {formatBalance(balance)}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    className="text-white/50 text-sm font-medium ml-2"
                  >
                    coins
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <View className="w-7 h-7 rounded-full bg-white/20" />
                <View className="w-7 h-7 rounded-full bg-white/10 -ml-2" />
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};