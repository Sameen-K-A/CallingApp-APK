import { Button, ButtonText } from "@/components/ui/button";
import { Drawer, useDrawerClose } from "@/components/ui/drawer";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

interface LogoutModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ visible, onClose, onConfirm }) => {
  return (
    <Drawer visible={visible} onClose={onClose}>
      <Drawer.Content>
        <Drawer.Header>
          <View className="w-16 h-16 rounded-full bg-error/10 items-center justify-center mb-4">
            <Ionicons name="log-out-outline" size={32} color="#EF4444" />
          </View>
          <Drawer.Title>Log Out</Drawer.Title>
          <Drawer.Description>
            Are you sure you want to log out of your account?
          </Drawer.Description>
        </Drawer.Header>

        <Drawer.Footer>
          <LogoutButtons onConfirm={onConfirm} />
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};

const LogoutButtons: React.FC<{ onConfirm: () => void }> = ({ onConfirm }) => {
  const close = useDrawerClose();

  return (
    <View className="flex-row gap-3">
      <Button className="flex-1 rounded-xl" variant="secondary" onPress={close}>
        <ButtonText allowFontScaling={false} variant="secondary">
          Cancel
        </ButtonText>
      </Button>
      <Button className="flex-1 rounded-xl" variant="destructive" onPress={onConfirm}>
        <ButtonText allowFontScaling={false} variant="destructive">
          Log Out
        </ButtonText>
      </Button>
    </View>
  );
};