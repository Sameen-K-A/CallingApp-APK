import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Dashboard() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background">
      <Text className="text-primary font-nexaHeavy text-lg" allowFontScaling={false}>
        Telecaller Dashboard Content will add soon
      </Text>
    </SafeAreaView>
  );
}