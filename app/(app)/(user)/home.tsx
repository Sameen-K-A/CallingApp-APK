import { EmptyTelecallerState } from "@/components/user/home/EmptyTelecallerState";
import { TelecallerCard } from "@/components/user/home/TelecallerCard";
import { TelecallerProfileSheet } from "@/components/user/home/TelecallerProfileSheet";
import { TelecallerListSkeleton } from "@/components/user/skeleton/TelecallerCardSkeleton";
import { API_CONFIG } from "@/config/api";
import apiClient from "@/services/api.service";
import { TelecallerListItem } from "@/types/user";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, ScrollView, Text, View } from "react-native";

const ITEMS_PER_PAGE = 15;

type TelecallersResponse = {
  success: boolean;
  data: {
    telecallers: TelecallerListItem[];
    hasMore: boolean;
  };
};

export default function Home() {
  const [telecallers, setTelecallers] = useState<TelecallerListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [selectedTelecaller, setSelectedTelecaller] = useState<TelecallerListItem | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const fetchTelecallers = useCallback(async (pageNumber: number, isRefresh = false) => {
    try {
      const { data } = await apiClient.get<TelecallersResponse>(
        `${API_CONFIG.ENDPOINTS.GET_TELECALLERS}?page=${pageNumber}&limit=${ITEMS_PER_PAGE}`
      );

      if (isRefresh || pageNumber === 1) {
        setTelecallers(data.data.telecallers);
      } else {
        setTelecallers((prev) => [...prev, ...data.data.telecallers]);
      }

      setPage(pageNumber + 1);
      setHasMore(data.data.hasMore);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch telecallers";
      Alert.alert("Error", message);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchTelecallers(1).finally(() => setIsLoading(false));
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    await fetchTelecallers(page);
    setIsLoadingMore(false);
  }, [page, isLoadingMore, hasMore, fetchTelecallers]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setPage(1);
    setHasMore(true);
    await fetchTelecallers(1, true);
    setIsRefreshing(false);
  }, [fetchTelecallers]);

  const openSheet = (telecaller: TelecallerListItem) => {
    setSelectedTelecaller(telecaller);
    setSheetVisible(true);
  };

  const closeSheet = () => {
    setSheetVisible(false);
    setTimeout(() => setSelectedTelecaller(null), 300);
  };

  const handleToggleFavorite = async (telecaller: TelecallerListItem) => {
    const isFavorite = telecaller.isFavorite;

    setIsFavoriteLoading(true);

    try {
      if (isFavorite) {
        await apiClient.delete(`${API_CONFIG.ENDPOINTS.REMOVE_FAVORITE}/${telecaller._id}`);
      } else {
        await apiClient.post(`${API_CONFIG.ENDPOINTS.ADD_FAVORITE}/${telecaller._id}`);
      }

      // Update telecallers list on success
      setTelecallers((prev) => prev.map((item) => item._id === telecaller._id ? { ...item, isFavorite: !isFavorite } : item));
      // Update selected telecaller if sheet is open
      if (selectedTelecaller?._id === telecaller._id) {
        setSelectedTelecaller((prev) => prev ? { ...prev, isFavorite: !isFavorite } : null);
      };

    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update favorite";
      Alert.alert("Error", message);
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const renderHeader = () => (
    <View className="px-4 pt-4 pb-3">
      <View className="bg-card rounded-2xl p-4">
        <View className="flex-row items-center mb-3">
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-success mr-1" />
            <View className="w-3 h-3 rounded-full bg-warning" />
          </View>
          <View className="ml-3 bg-success/10 px-2 py-0.5 rounded-full">
            <Text
              allowFontScaling={false}
              className="text-xs font-medium text-success"
            >
              Online now
            </Text>
          </View>
        </View>
        <Text
          allowFontScaling={false}
          className="text-xl font-bold text-text mb-1"
        >
          Let's Get Talking
        </Text>
        <Text
          allowFontScaling={false}
          className="text-sm text-textMuted"
        >
          Real people, real conversations, real fun
        </Text>
      </View>
    </View>
  );

  const renderItem = useCallback(
    ({ item }: { item: TelecallerListItem }) => (
      <View className="px-4">
        <TelecallerCard telecaller={item} onPress={openSheet} />
      </View>
    ),
    []
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-muted">
        {renderHeader()}
        <TelecallerListSkeleton count={5} />
      </View>
    );
  }

  if (telecallers.length === 0) {
    return (
      <View className="flex-1 bg-muted">
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
          <EmptyTelecallerState />
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 bg-muted/50">
        <FlatList
          data={telecallers}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
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
              {!hasMore && telecallers.length > 0 && (
                <View className="py-3 items-center">
                  <View className="flex-row items-center px-4 py-2 bg-muted rounded-full">
                    <Ionicons name="checkmark-circle" size={16} color="#6B7280" />
                    <Text
                      allowFontScaling={false}
                      className="text-sm text-textMuted ml-2"
                    >
                      You've seen all telecallers
                    </Text>
                  </View>
                </View>
              )}
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

        <TelecallerProfileSheet
          visible={sheetVisible}
          telecaller={selectedTelecaller}
          onClose={closeSheet}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={selectedTelecaller?.isFavorite || false}
          isFavoriteLoading={isFavoriteLoading}
        />
      </View>
    </View>
  );
}