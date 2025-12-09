import { ITransaction } from "@/types/user";
import { FontAwesome6 } from "@expo/vector-icons";
import { format } from "date-fns";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface TransactionCardProps {
  transaction: ITransaction;
  onPress: (transaction: ITransaction) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onPress }) => {
  const isSuccess = transaction.status === "SUCCESS";
  const isPending = transaction.status === "PENDING";

  const getStatusBg = () => {
    if (isSuccess) return "bg-success/10";
    if (isPending) return "bg-warning/10";
    return "bg-destructive/10";
  };

  const getStatusText = () => {
    if (isSuccess) return "text-success";
    if (isPending) return "text-warning";
    return "text-destructive";
  };

  const formatDate = (date: string) => format(new Date(date), "dd MMM, hh:mm a");

  return (
    <TouchableOpacity
      className="bg-card rounded-2xl p-4 mb-2 border border-border/50"
      activeOpacity={0.7}
      onPress={() => onPress(transaction)}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-xl bg-amber-100 items-center justify-center">
            <FontAwesome6 name="coins" size={16} color="#D97706" />
          </View>
          <View className="ml-3">
            <Text
              allowFontScaling={false}
              className="text-sm font-semibold text-text"
            >
              Recharge
            </Text>
            <Text
              allowFontScaling={false}
              className="text-xs text-textMuted"
            >
              {formatDate(transaction.createdAt)}
            </Text>
          </View>
        </View>

        <View className={`px-2.5 py-1 rounded-full ${getStatusBg()}`}>
          <Text
            allowFontScaling={false}
            className={`text-xs font-semibold ${getStatusText()}`}
          >
            {transaction.status}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between pt-3 border-t border-border/50">
        <Text
          allowFontScaling={false}
          className="text-sm font-semibold text-amber-600"
        >
          +{transaction.coins?.toLocaleString("en-IN")} coins
        </Text>

        <Text
          allowFontScaling={false}
          className="text-lg font-bold text-text"
        >
          ₹{transaction.amount}
        </Text>
      </View>
    </TouchableOpacity>
  );
};