import { BalanceCard } from "@/components/user/recharge/BalanceCard";
import { ConfirmationModal } from "@/components/user/recharge/ConfirmationModal";
import { EmptyPlansState } from "@/components/user/recharge/EmptyPlansState";
import { PlanCard } from "@/components/user/recharge/PlanCard";
import { SuccessModal } from "@/components/user/recharge/SuccessModal";
import { PlanListSkeleton } from "@/components/user/skeleton/PlanCardSkeleton";
import { API_CONFIG } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import useErrorHandler from "@/hooks/useErrorHandler";
import apiClient from "@/services/api.service";
import { IPlan } from "@/types/user";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, ScrollView, Text, View } from "react-native";

export default function Recharge() {
  const { user } = useAuth();
  const { handleError } = useErrorHandler();
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<IPlan | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [balance, setBalance] = useState(user?.wallet?.balance || 0);

  const fetchPlans = useCallback(async () => {
    try {
      const { data } = await apiClient.get<{ success: boolean; data: IPlan[] }>(API_CONFIG.ENDPOINTS.GET_PLANS);
      setPlans(data.data);
    } catch (error) {
      handleError(error, "Failed to collect recharge plans.");
    }
  }, [handleError]);

  useEffect(() => {
    setIsLoading(true);
    fetchPlans().finally(() => setIsLoading(false));
  }, [fetchPlans]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchPlans();
    setIsRefreshing(false);
  }, [fetchPlans]);

  const renderItem = useCallback(
    ({ item, index }: { item: IPlan; index: number }) => (
      <View className={`w-1/2 p-1.5 ${index % 2 === 0 ? "pl-4 pr-1.5" : "pr-4 pl-1.5"}`}>
        <PlanCard plan={item} onPress={openConfirmation} />
      </View>
    ),
    []
  );

  if (!user) {
    router.replace("/(auth)/login");
    return null;
  };

  const openConfirmation = (plan: IPlan) => {
    setSelectedPlan(plan);
    setShowConfirmation(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPlan) return;

    setIsProcessing(true);

    try {
      console.log("TODO: Implement Razorpay payment for plan:", selectedPlan);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setBalance((prev) => prev + selectedPlan.coins);
      setShowConfirmation(false);

      setTimeout(() => {
        setShowSuccess(true);
      }, 350);

    } catch (error) {
      handleError(error, "Payment failed")
    } finally {
      setIsProcessing(false);
    }
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
  };

  const closeSuccess = () => {
    setShowSuccess(false);
    setTimeout(() => setSelectedPlan(null), 300);
  };

  const renderHeader = () => (
    <View className="pb-4">
      <BalanceCard balance={balance} />
    </View>
  );

  const renderFooter = () => {
    if (plans.length === 0) return null;

    return (
      <View className="py-4 items-center">
        <View className="flex-row items-center px-4 py-2 bg-muted rounded-full">
          <Ionicons name="checkmark-circle" size={16} color="#6B7280" />
          <Text
            allowFontScaling={false}
            className="text-sm text-textMuted ml-2"
          >
            You&apos;ve seen all plans
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <View className="flex-1 bg-muted/50">
          <BalanceCard balance={balance} />
          <View className="mt-4">
            <PlanListSkeleton count={6} />
          </View>
        </View>
      </View>
    );
  }

  if (plans.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <View className="flex-1 bg-muted/50">
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor="#8B5CF6"
                colors={["#8B5CF6"]}
              />
            }
          >
            <BalanceCard balance={balance} />
            <EmptyPlansState />
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 bg-muted/50">
        <FlatList
          data={plans}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          numColumns={2}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#8B5CF6"
              colors={["#8B5CF6"]}
            />
          }
        />

        <ConfirmationModal
          visible={showConfirmation}
          plan={selectedPlan}
          onClose={closeConfirmation}
          onConfirm={handleConfirmPayment}
          isProcessing={isProcessing}
        />

        <SuccessModal
          visible={showSuccess}
          plan={selectedPlan}
          newBalance={balance}
          onClose={closeSuccess}
        />
      </View>
    </View>
  );
}