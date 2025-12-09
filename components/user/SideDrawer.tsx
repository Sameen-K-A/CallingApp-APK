import { LogoutModal } from "@/components/shared/LogoutModal";
import { USER_MENU_ITEMS } from "@/constants/navigation";
import { useAuth } from "@/context/AuthContext";
import { getInitials } from "@/utils/formatter";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Modal, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "../shared/avatars";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SideDrawerProps {
  visible: boolean;
  onClose: () => void;
};

export const SideDrawer: React.FC<SideDrawerProps> = ({ visible, onClose }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(-SCREEN_WIDTH);
      setIsModalVisible(true);

      setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }).start();
      }, 10);
    } else {
      Animated.timing(slideAnim, {
        toValue: -SCREEN_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setIsModalVisible(false);
      });
    }
  }, [visible]);

  const handleNavigation = (route: string) => {
    onClose();
    router.push(route as any);
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
  };

  const isActiveRoute = (route: string): boolean => {
    const routePath = route.split("/").pop();
    return pathname.includes(routePath || "");
  };

  if (!isModalVisible) return null;

  return (
    <Modal
      transparent
      visible={isModalVisible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
    >

      <Animated.View
        className="flex-1 bg-background"
        style={{
          width: SCREEN_WIDTH,
          transform: [{ translateX: slideAnim }],
          paddingTop: insets.top,
        }}
      >
        <View className="border-b border-border">
          <TouchableOpacity
            className="flex-row items-center px-4 py-4 gap-2"
            onPress={onClose}
            activeOpacity={0.6}
          >
            <Ionicons name="chevron-back" size={24} color="#1E1B4B" />
            <Text
              allowFontScaling={false}
              className="text-xl font-semibold text-text"
            >
              Back
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center px-4 py-4 mt-1">
          <View className="w-16 h-16 rounded-full bg-muted border border-primary items-center overflow-hidden justify-center mr-4">
            {user?.profile && user.profile.startsWith("avatar-") ? (
              <Avatar avatarId={user?.profile} size={60} />
            ) : (
              <Text
                className="text-2xl font-semibold text-primary"
                allowFontScaling={false}
              >
                {getInitials(user?.name)}
              </Text>
            )}
          </View>

          <View className="flex-1">
            <Text
              allowFontScaling={false}
              className="text-lg max-w-xs line-clamp-1 font-semibold text-text mb-1"
            >
              {user?.name || "User"}
            </Text>
            <Text allowFontScaling={false} className="text-sm text-textMuted">
              {user?.phone || ""}
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="flex-1 mt-3 px-4">
          {USER_MENU_ITEMS.map((item) => {
            const isActive = isActiveRoute(item.route);
            return (
              <TouchableOpacity
                key={item.id}
                className={`flex-row items-center justify-between px-5 py-4 rounded-xl ${isActive ? "bg-accent" : ""}`}
                activeOpacity={0.6}
                onPress={() => handleNavigation(item.route)}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-6 items-center mr-5">
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={isActive ? "#8B5CF6" : "#6B7280"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      allowFontScaling={false}
                      className={`text-base mb-0.5 ${isActive ? "text-primary font-semibold" : "text-text"
                        }`}
                    >
                      {item.label}
                    </Text>
                    <Text
                      allowFontScaling={false}
                      className="text-[13px] text-textMuted mt-0.5"
                    >
                      {item.description}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="px-4 py-2">
          <TouchableOpacity
            className="flex-row items-center p-5"
            activeOpacity={0.6}
            onPress={() => setShowLogoutModal(true)}
          >
            <View className="w-6 items-center mr-5">
              <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            </View>
            <Text allowFontScaling={false} className="text-base text-error">
              Log out
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </Modal >
  );
};