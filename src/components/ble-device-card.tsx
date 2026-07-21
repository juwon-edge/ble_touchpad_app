import { Sizing, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { blemanager } from "@/utils/ble-touchpad-manager";
import { DEVICE_ID_STORAGE_KEY } from "@/utils/helper";
import { BLEDevice, LastConnectedDeviceInfo } from "@/utils/types";
import MaterialCommunityIcon from "@expo/vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { use, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ConnectionStateDispatchContext } from "./connection-state-provider";
import ThemedText from "./theme-text";

interface Props {
  device: BLEDevice;
}

const getSignalIconName = (rssi: number) => {
  if (rssi >= -60) return "wifi-strength-4";
  else if (rssi >= -70) return "wifi-strength-3";
  else if (rssi >= -80) return "wifi-strength-2";
  return "wifi-strength-1";
};

const BLEDeviceCard = ({ device }: Props) => {
  const theme = useTheme();
  const [isConnecting, setIsConnecting] = useState(false);
  const setConnectionState = use(ConnectionStateDispatchContext);

  return (
    <View style={styles.container}>
      <MaterialCommunityIcon
        name={
          device.rssi ? getSignalIconName(device.rssi) : "wifi-strength-off"
        }
        size={Sizing.lg}
        style={{ color: theme.text }}
      />
      <View style={styles.textContainer}>
        <ThemedText
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.mainText}
        >
          {device.localName}
        </ThemedText>
        <ThemedText style={styles.subText}>{device.id}</ThemedText>
      </View>

      <Pressable
        style={[
          { backgroundColor: theme.text },
          styles.connectButton,
          isConnecting && { opacity: 0.6 },
        ]}
        onPress={async () => {
          try {
            setIsConnecting(true);
            blemanager.onConnectionStateChange = (connectionState) => {
              setConnectionState?.(connectionState);
              console.log(connectionState);
            };
            const connectedDevice = await blemanager.connectToDevice(device.id);
            console.log(await connectedDevice.services());
            console.log(`MTU payload size: ${connectedDevice.mtu}`);

            await AsyncStorage.setItem(
              DEVICE_ID_STORAGE_KEY,
              JSON.stringify({
                name: connectedDevice.name,
                id: connectedDevice.id,
              } as LastConnectedDeviceInfo),
            );
          } catch (error) {
            console.error("Failed to connect to device:", error);
          } finally {
            setIsConnecting(false);
          }
        }}
      >
        {isConnecting ? (
          <ActivityIndicator
            size={Sizing.lg}
            style={{ outlineColor: theme.background }}
          />
        ) : (
          <MaterialCommunityIcon
            name="bluetooth-connect"
            size={Sizing.lg}
            style={{ color: theme.background }}
          />
        )}
        <Text style={{ color: theme.background, fontSize: Sizing.md }}>
          {isConnecting ? "Connecting..." : "Connect"}
        </Text>
      </Pressable>
    </View>
  );
};

export default BLEDeviceCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    borderCurve: "circular",
    padding: Spacing.two,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
    maxWidth: 320,
    width: "100%",
  },
  textContainer: {
    gap: Spacing.half,
  },
  mainText: {
    fontSize: Sizing.md,
    fontWeight: 500,
    maxWidth: 140,
  },
  subText: {
    fontSize: Sizing.sm,
    opacity: 0.6,
  },
  connectButton: {
    flexDirection: "row",
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.oneHalf,
    borderRadius: Spacing.two,
    marginLeft: Spacing.twoHalf,
  },
});
