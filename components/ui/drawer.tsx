import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Easing, Modal, PanResponder, Pressable, ScrollView, Text, View } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_HEIGHT = SCREEN_HEIGHT * 0.7;

// ============================================
// Context
// ============================================

interface DrawerContextType {
  close: () => void;
}

const DrawerContext = createContext<DrawerContextType | null>(null);

const useDrawerContext = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("Drawer components must be used within a Drawer");
  }
  return context;
};

// ============================================
// Drawer Root
// ============================================

interface DrawerProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const DrawerRoot: React.FC<DrawerProps> = ({ visible, onClose, children }) => {
  const translateY = useRef(new Animated.Value(MAX_HEIGHT)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const [showModal, setShowModal] = useState(false);

  const open = () => {
    translateY.stopAnimation();
    backdrop.stopAnimation();
    translateY.setValue(MAX_HEIGHT);
    backdrop.setValue(0);
    setShowModal(true);

    Animated.parallel([
      Animated.timing(backdrop, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const close = () => {
    translateY.stopAnimation();
    backdrop.stopAnimation();

    Animated.parallel([
      Animated.timing(backdrop, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: MAX_HEIGHT,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowModal(false);
      onClose();
    });
  };

  useEffect(() => {
    if (visible) {
      open();
    } else if (!visible && showModal) {
      close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dy) > 5;
      },
      onMoveShouldSetPanResponderCapture: (_, gesture) => {
        return gesture.dy > 10;
      },
      onPanResponderGrant: () => {
        translateY.stopAnimation();
        backdrop.stopAnimation();
      },
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
          backdrop.setValue(Math.max(0, 1 - gesture.dy / 300));
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 100 || gesture.vy > 0.5) {
          close();
        } else {
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: 0,
              duration: 200,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(backdrop, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  if (!showModal) return null;

  return (
    <DrawerContext.Provider value={{ close }}>
      <Modal
        transparent
        visible={showModal}
        animationType="none"
        onRequestClose={close}
        statusBarTranslucent
      >
        <Animated.View
          className="absolute inset-0 bg-black/50"
          style={{ opacity: backdrop }}
        >
          <Pressable className="flex-1" onPress={close} />
        </Animated.View>

        <Animated.View
          className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl"
          style={{
            maxHeight: MAX_HEIGHT,
            transform: [{ translateY }],
          }}
        >
          <Animated.View
            className="w-full items-center py-4"
            {...panResponder.panHandlers}
          >
            <View className="w-10 h-1.5 rounded-full bg-border" />
          </Animated.View>

          {children}
        </Animated.View>
      </Modal>
    </DrawerContext.Provider>
  );
};

// ============================================
// Drawer Content
// ============================================

interface DrawerContentProps {
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
}

const DrawerContent: React.FC<DrawerContentProps> = ({
  children,
  className = "",
  scrollable = true,
}) => {
  if (scrollable) {
    return (
      <ScrollView
        className={`px-6 ${className}`}
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View className={`px-6 pb-6 ${className}`}>
      {children}
    </View>
  );
};

// ============================================
// Drawer Header
// ============================================

interface DrawerHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const DrawerHeader: React.FC<DrawerHeaderProps> = ({ children, className = "" }) => {
  return (
    <View className={`items-center mb-6 ${className}`}>
      {children}
    </View>
  );
};

// ============================================
// Drawer Title
// ============================================

interface DrawerTitleProps {
  children: string;
  className?: string;
}

const DrawerTitle: React.FC<DrawerTitleProps> = ({ children, className = "" }) => {
  return (
    <Text
      allowFontScaling={false}
      className={`text-xl font-bold text-text text-center ${className}`}
    >
      {children}
    </Text>
  );
};

// ============================================
// Drawer Description
// ============================================

interface DrawerDescriptionProps {
  children: string;
  className?: string;
}

const DrawerDescription: React.FC<DrawerDescriptionProps> = ({ children, className = "" }) => {
  return (
    <Text
      allowFontScaling={false}
      className={`text-sm text-textMuted text-center ${className}`}
    >
      {children}
    </Text>
  );
};

// ============================================
// Drawer Footer
// ============================================

interface DrawerFooterProps {
  children: React.ReactNode;
  className?: string;
}

const DrawerFooter: React.FC<DrawerFooterProps> = ({ children, className = "" }) => {
  return (
    <View className={`mt-6 ${className}`}>
      {children}
    </View>
  );
};

// ============================================
// Drawer Close Hook
// ============================================

const useDrawerClose = () => {
  const { close } = useDrawerContext();
  return close;
};

// ============================================
// Exports
// ============================================

export const Drawer = Object.assign(DrawerRoot, {
  Content: DrawerContent,
  Header: DrawerHeader,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Footer: DrawerFooter,
});

export { useDrawerClose };

