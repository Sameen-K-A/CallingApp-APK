import { TransactionListSkeleton } from "@/components/user/skeleton/TransactionCardSkeleton";
import { EmptyTransactionState } from "@/components/user/transaction-history/EmptyTransactionState";
import { TransactionCard } from "@/components/user/transaction-history/TransactionCard";
import { TransactionDetailsSheet } from "@/components/user/transaction-history/TransactionDetailsSheet";
import { DUMMY_TRANSACTIONS } from "@/constants/dummyData";
import { useAuth } from "@/context/AuthContext";
import { ITransaction } from "@/types/user";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, Text, View } from "react-native";

const ITEMS_PER_PAGE = 10;

export default function TransactionHistory() {
  const { user } = useAuth();

  if (!user) {
    router.replace("/(auth)/login");
    return null;
  }

  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const [selectedTransaction, setSelectedTransaction] = useState<ITransaction | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const fetchTransactions = useCallback(async (pageNumber: number, isRefresh = false) => {
    try {
      await new Promise((r) => setTimeout(r, 800));
      const start = (pageNumber - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const newData = DUMMY_TRANSACTIONS.slice(start, end);

      setTransactions((prev) =>
        isRefresh || pageNumber === 1 ? newData : [...prev, ...newData]
      );
      setPage(pageNumber + 1);
      setHasMore(end < DUMMY_TRANSACTIONS.length);
    } catch (error) {
      console.error("Failed to fetch:", error);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchTransactions(1).finally(() => setIsLoading(false));
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    await fetchTransactions(page);
    setIsLoadingMore(false);
  }, [page, isLoadingMore, hasMore, fetchTransactions]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setPage(1);
    setHasMore(true);
    await fetchTransactions(1, true);
    setIsRefreshing(false);
  }, [fetchTransactions]);

  const openSheet = (transaction: ITransaction) => {
    setSelectedTransaction(transaction);
    setSheetVisible(true);
  };

  const closeSheet = () => {
    setSheetVisible(false);
    setTimeout(() => setSelectedTransaction(null), 300);
  };

  const renderItem = useCallback(
    ({ item }: { item: ITransaction }) => (
      <View className="px-4">
        <TransactionCard transaction={item} onPress={openSheet} />
      </View>
    ),
    []
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <View className="flex-1 bg-muted/50">
          <TransactionListSkeleton count={8} />
        </View>
      </View>
    );
  }

  if (transactions.length === 0) {
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
            <EmptyTransactionState />
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 bg-muted/50">
        <FlatList
          data={transactions}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListHeaderComponent={<View className="h-4" />}
          ListFooterComponent={
            <>
              {isLoadingMore && (
                <View className="py-3 items-center">
                  <ActivityIndicator size="small" color="#8B5CF6" />
                  <Text
                    allowFontScaling={false}
                    className="text-xs text-textMuted mt-2"
                  >
                    Loading more...
                  </Text>
                </View>
              )}
              {!hasMore && transactions.length > 0 && (
                <View className="py-3 items-center">
                  <View className="flex-row items-center px-4 py-2 bg-muted rounded-full">
                    <Ionicons name="checkmark-circle" size={16} color="#6B7280" />
                    <Text
                      allowFontScaling={false}
                      className="text-sm text-textMuted ml-2"
                    >
                      You've seen all transactions
                    </Text>
                  </View>
                </View>
              )}
              <View className="h-4" />
            </>
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
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

        <TransactionDetailsSheet
          visible={sheetVisible}
          transaction={selectedTransaction}
          onClose={closeSheet}
        />
      </View>
    </View>
  );
}