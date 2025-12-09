import { EmptyFavoritesState } from "@/components/user/favorites/EmptyFavoritesState";
import { FavoriteTelecallerCard } from "@/components/user/favorites/FavoriteTelecallerCard";
import { TelecallerListSkeleton } from "@/components/user/skeleton/TelecallerCardSkeleton";
import { API_CONFIG } from "@/config/api";
import apiClient from "@/services/api.service";
import { TelecallerListItem } from "@/types/user";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Platform, RefreshControl, ScrollView, Text, UIManager, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
};

const ITEMS_PER_PAGE = 15;

type FavoritesResponse = {
  success: boolean;
  data: {
    favorites: TelecallerListItem[];
    hasMore: boolean;
  };
};

export default function Favorites() {
  const [favorites, setFavorites] = useState<TelecallerListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [openCardId, setOpenCardId] = useState<string | null>(null);

  const fetchFavorites = useCallback(async (pageNumber: number, isRefresh: boolean = false) => {
    try {
      const { data } = await apiClient.get<FavoritesResponse>(`${API_CONFIG.ENDPOINTS.GET_FAVORITES}?page=${pageNumber}&limit=${ITEMS_PER_PAGE}`);

      if (isRefresh || pageNumber === 1) {
        setFavorites(data.data.favorites);
      } else {
        setFavorites((prev) => [...prev, ...data.data.favorites]);
      }

      setPage(pageNumber + 1);
      setHasMore(data.data.hasMore);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch favorites";
      Alert.alert("Error", message);
    }
  }, []);

  // Initial load
  const handleInitialLoad = useCallback(async () => {
    setIsLoading(true);
    await fetchFavorites(1);
    setIsLoading(false);
  }, [fetchFavorites]);

  // Load more (infinite scroll)
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    await fetchFavorites(page);
    setIsLoadingMore(false);
  }, [page, isLoadingMore, hasMore, fetchFavorites]);

  // Pull to refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setOpenCardId(null);
    setPage(1);
    setHasMore(true);
    await fetchFavorites(1, true);
    setIsRefreshing(false);
  }, [fetchFavorites]);

  useEffect(() => {
    handleInitialLoad();
  }, [handleInitialLoad]);

  // Remove from favorites
  const handleRemoveFavorite = useCallback(async (telecaller: TelecallerListItem) => {
    setFavorites((prev) => prev.filter((item) => item._id !== telecaller._id));
    setOpenCardId(null);

    try {
      await apiClient.delete(`${API_CONFIG.ENDPOINTS.REMOVE_FAVORITE}/${telecaller._id}`);
    } catch (error) {
      setFavorites((prev) => [...prev, telecaller]);
      const message = error instanceof Error ? error.message : "Failed to remove from favorites";
      Alert.alert("Error", message);
    }
  }, []);

  // Card swipe handlers
  const handleCardOpen = useCallback((id: string) => {
    setOpenCardId(id);
  }, []);

  const handleCardClose = useCallback(() => {
    setOpenCardId(null);
  }, []);

  // Render loading more indicator
  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View className="py-3 items-center">
        <ActivityIndicator size="small" color="#8B5CF6" />
        <Text allowFontScaling={false} className="text-xs text-textMuted mt-2">
          Loading more...
        </Text>
      </View>
    );
  };

  // Render end of list indicator
  const renderEndOfList = () => {
    if (hasMore || favorites.length === 0) return null;

    return (
      <View className="py-3 items-center">
        <View className="flex-row items-center px-4 py-2 bg-muted rounded-full">
          <Ionicons name="heart" size={16} color="#EF4444" />
          <Text allowFontScaling={false} className="text-sm text-textMuted ml-2">
            That&apos;s all your favorites
          </Text>
        </View>
      </View>
    );
  };

  // Render item
  const renderItem = ({ item }: { item: TelecallerListItem }) => (
    <View className="px-4">
      <FavoriteTelecallerCard
        telecaller={item}
        onRemove={handleRemoveFavorite}
        isOpen={openCardId === item._id}
        onOpen={() => handleCardOpen(item._id)}
        onClose={handleCardClose}
      />
    </View>
  );

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <View className="flex-1 bg-muted/50 pt-4">
          <TelecallerListSkeleton count={10} />
        </View>
      </View>
    );
  }

  // Empty state
  if (favorites.length === 0) {
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
            <EmptyFavoritesState />
          </ScrollView>
        </View>
      </View>
    );
  }

  // Main list
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-background">
        <View className="flex-1 bg-muted/50">
          <FlatList
            data={favorites}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            ListFooterComponent={
              <>
                {renderFooter()}
                {renderEndOfList()}
              </>
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor="#8B5CF6"
                colors={["#8B5CF6"]}
              />
            }
            onScrollBeginDrag={() => setOpenCardId(null)}
          />
        </View>
      </View>
    </GestureHandlerRootView>
  );
}