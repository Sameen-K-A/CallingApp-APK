import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, View } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export function AuroraBackground() {
  return (
    <View
      className="absolute top-0 left-0 right-0"
      style={{ height: SCREEN_HEIGHT * 0.55 }}
    >
      {/* Circle 1 - Purple */}
      <View
        className="absolute rounded-full opacity-60"
        style={{
          width: 300,
          height: 300,
          top: -50,
          left: -80,
        }}
      >
        <LinearGradient
          colors={["#A78BFA", "#8B5CF6", "#7C3AED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            borderRadius: 150,
          }}
        />
      </View>

      {/* Circle 2 - Pink */}
      <View
        className="absolute rounded-full opacity-50"
        style={{
          width: 250,
          height: 250,
          top: 20,
          right: -60,
        }}
      >
        <LinearGradient
          colors={["#F0ABFC", "#E879F9", "#D946EF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            borderRadius: 125,
          }}
        />
      </View>

      {/* Circle 3 - Blue */}
      <View
        className="absolute rounded-full opacity-40"
        style={{
          width: 200,
          height: 200,
          top: 100,
          left: 50,
        }}
      >
        <LinearGradient
          colors={["#93C5FD", "#818CF8", "#A78BFA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            borderRadius: 100,
          }}
        />
      </View>

      {/* Circle 4 - Lavender */}
      <View
        className="absolute rounded-full opacity-30"
        style={{
          width: 350,
          height: 350,
          top: -20,
          left: "25%",
        }}
      >
        <LinearGradient
          colors={["#C4B5FD", "#DDD6FE", "#EDE9FE"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            flex: 1,
            borderRadius: 175,
          }}
        />
      </View>

      {/* Single heavy blur over everything */}
      <BlurView
        intensity={200}
        tint="light"
        style={{
          position: "absolute",
          top: -50,
          left: -50,
          right: -50,
          bottom: -50,
        }}
      />
    </View>
  );
}