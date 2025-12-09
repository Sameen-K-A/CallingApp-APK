import { CallDetailsSheet } from "@/components/user/call-history/CallDetailsSheet";
import { CallHistoryCard } from "@/components/user/call-history/CallHistoryCard";
import { EmptyCallHistoryState } from "@/components/user/call-history/EmptyCallHistoryState";
import { TelecallerListSkeleton } from "@/components/user/skeleton/TelecallerCardSkeleton";
import { DUMMY_CALL_HISTORY } from "@/constants/dummyData";
import { ICallHistoryItem } from "@/types/user";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, Text, View } from "react-native";

const ITEMS_PER_PAGE = 10;

export default function CallHistory() {
  const [calls, setCalls] = useState<ICallHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const [selectedCall, setSelectedCall] = useState<ICallHistoryItem | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const fetchCallHistory = useCallback(
    async (pageNumber: number, isRefresh = false) => {
      try {
        await new Promise((r) => setTimeout(r, 800));
        const start = (pageNumber - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const newData = DUMMY_CALL_HISTORY.slice(start, end);

        setCalls((prev) =>
          isRefresh || pageNumber === 1 ? newData : [...prev, ...newData]
        );
        setPage(pageNumber + 1);
        setHasMore(end < DUMMY_CALL_HISTORY.length);
      } catch (error) {
        console.error("Failed to fetch:", error);
      }
    },
    []
  );

  useEffect(() => {
    setIsLoading(true);
    fetchCallHistory(1).finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    await fetchCallHistory(page);
    setIsLoadingMore(false);
  }, [page, isLoadingMore, hasMore, fetchCallHistory]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setPage(1);
    setHasMore(true);
    await fetchCallHistory(1, true);
    setIsRefreshing(false);
  }, [fetchCallHistory]);

  const openSheet = (call: ICallHistoryItem) => {
    setSelectedCall(call);
    setSheetVisible(true);
  };

  const closeSheet = () => {
    setSheetVisible(false);
    setTimeout(() => setSelectedCall(null), 300);
  };

  const renderItem = useCallback(
    ({ item }: { item: ICallHistoryItem }) => (
      <View className="px-4">
        <CallHistoryCard call={item} onPress={openSheet} />
      </View>
    ),
    []
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <View className="flex-1 bg-muted/50 pt-4">
          <TelecallerListSkeleton count={8} />
        </View>
      </View>
    );
  }

  if (calls.length === 0) {
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
            <EmptyCallHistoryState />
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 bg-muted/50">
        <FlatList
          data={calls}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#8B5CF6"
              colors={["#8B5CF6"]}
            />
          }
          ListFooterComponent={
            <>
              {isLoadingMore && (
                <View className="py-3 items-center">
                  <ActivityIndicator size="small" color="#8B5CF6" />
                  <Text className="text-xs text-textMuted mt-2">
                    Loading more...
                  </Text>
                </View>
              )}
              {!hasMore && calls.length > 0 && (
                <View className="py-3 items-center">
                  <View className="flex-row items-center px-4 py-2 bg-muted rounded-full">
                    <Ionicons name="checkmark-circle" size={16} color="#6B7280" />
                    <Text className="text-sm text-textMuted ml-2">
                      That&apos;s all your call history
                    </Text>
                  </View>
                </View>
              )}
            </>
          }
        />

        <CallDetailsSheet
          visible={sheetVisible}
          call={selectedCall}
          onClose={closeSheet}
        />
      </View>
    </View>
  );
}