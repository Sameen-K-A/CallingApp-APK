import { Drawer } from "@/components/ui/drawer";
import { ITransaction } from "@/types/user";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import React from "react";
import { Text, View } from "react-native";

interface TransactionDetailsSheetProps {
  visible: boolean;
  transaction: ITransaction | null;
  onClose: () => void;
}

export const TransactionDetailsSheet: React.FC<TransactionDetailsSheetProps> = ({
  visible,
  transaction,
  onClose,
}) => {
  if (!transaction) return null;

  const isSuccess = transaction.status === "SUCCESS";
  const isPending = transaction.status === "PENDING";
  const isFailed = transaction.status === "FAILED";

  const getStatusColor = () => {
    if (isSuccess) return "bg-success";
    if (isPending) return "bg-warning";
    return "bg-destructive";
  };

  const getStatusBgColor = () => {
    if (isSuccess) return "bg-success/10";
    if (isPending) return "bg-warning/10";
    return "bg-destructive/10";
  };

  const getStatusTextColor = () => {
    if (isSuccess) return "text-success";
    if (isPending) return "text-warning";
    return "text-destructive";
  };

  const formatDateTime = (date: string) => format(new Date(date), "MMM d, yyyy 'at' h:mm a");

  return (
    <Drawer visible={visible} onClose={onClose}>
      <Drawer.Content>
        <Drawer.Header>
          <View className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${getStatusBgColor()}`}>
            <FontAwesome6
              name="indian-rupee-sign"
              size={32}
              color={isSuccess ? "#22C55E" : isPending ? "#F59E0B" : "#EF4444"}
            />
          </View>

          <Text
            allowFontScaling={false}
            className="text-3xl font-bold text-text mb-2"
          >
            ₹{transaction.amount}
          </Text>

          <View className={`flex-row items-center px-3 py-1.5 rounded-full ${getStatusBgColor()}`}>
            <View className={`w-2 h-2 rounded-full mr-1.5 ${getStatusColor()}`} />
            <Text
              allowFontScaling={false}
              className={`text-sm font-semibold ${getStatusTextColor()}`}
            >
              {isSuccess ? "Successful" : isPending ? "Pending" : "Failed"}
            </Text>
          </View>
        </Drawer.Header>

        <View className="bg-muted/50 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center justify-between py-3 border-b border-border/50">
            <Text allowFontScaling={false} className="text-sm text-textMuted">
              Coins
            </Text>
            <View className="flex-row items-center">
              <FontAwesome6 name="coins" size={14} color="#F59E0B" />
              <Text
                allowFontScaling={false}
                className="text-sm font-semibold text-amber-600 ml-1.5"
              >
                {isSuccess ? "+" : ""}{transaction.coins?.toLocaleString("en-IN")}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between py-3 border-b border-border/50">
            <Text allowFontScaling={false} className="text-sm text-textMuted">
              Date & Time
            </Text>
            <Text
              allowFontScaling={false}
              className="text-sm font-medium text-text"
            >
              {formatDateTime(transaction.createdAt)}
            </Text>
          </View>

          <View className="flex-row items-center justify-between py-3 border-b border-border/50">
            <Text allowFontScaling={false} className="text-sm text-textMuted">
              Payment Method
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="card-outline" size={16} color="#8B5CF6" />
              <Text
                allowFontScaling={false}
                className="text-sm font-medium text-text ml-1.5"
              >
                Razorpay
              </Text>
            </View>
          </View>

          {transaction.gatewayPaymentId && (
            <View className="flex-row items-center justify-between py-3">
              <Text allowFontScaling={false} className="text-sm text-textMuted">
                Transaction ID
              </Text>
              <Text
                allowFontScaling={false}
                className="text-sm font-medium text-text"
              >
                {transaction.gatewayPaymentId.slice(-12).toUpperCase()}
              </Text>
            </View>
          )}

          {!transaction.gatewayPaymentId && transaction.gatewayOrderId && (
            <View className="flex-row items-center justify-between py-3">
              <Text allowFontScaling={false} className="text-sm text-textMuted">
                Order ID
              </Text>
              <Text
                allowFontScaling={false}
                className="text-sm font-medium text-text"
              >
                {transaction.gatewayOrderId.slice(-12).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {isPending && (
          <View className="bg-warning/10 rounded-xl px-4 py-3 flex-row items-center">
            <Ionicons name="time" size={18} color="#F59E0B" />
            <Text
              allowFontScaling={false}
              className="text-sm text-warning font-medium ml-2 flex-1"
            >
              Payment is being processed. This may take a few minutes.
            </Text>
          </View>
        )}

        {isFailed && (
          <View className="bg-destructive/10 rounded-xl px-4 py-3 flex-row items-center">
            <Ionicons name="alert-circle" size={18} color="#EF4444" />
            <Text
              allowFontScaling={false}
              className="text-sm text-destructive font-medium ml-2 flex-1"
            >
              Payment failed. Amount will be refunded within 5-7 business days if debited.
            </Text>
          </View>
        )}
      </Drawer.Content>
    </Drawer>
  );
};