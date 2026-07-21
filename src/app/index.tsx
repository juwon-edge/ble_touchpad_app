import BLEScan from "@/components/ble-scan";
import {
  ConnectionStateContext,
  ConnectionStateDispatchContext,
} from "@/components/connection-state-provider";
import ConnectionStatusBar from "@/components/connection-status-bar";
import InputModeToggle from "@/components/input-mode-toggle";
import Keyboard from "@/components/keyboard";
import ThemedText from "@/components/theme-text";
import Touchpad from "@/components/touchpad";
import { Sizing, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { blemanager } from "@/utils/ble-touchpad-manager";
import { DEVICE_ID_STORAGE_KEY, requestBLEPermissions } from "@/utils/helper";
import { LastConnectedDeviceInfo } from "@/utils/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";
import { use, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { BleError } from "react-native-ble-plx";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

const ConnectingStateOverlay = ({ deviceName }: { deviceName: string }) => {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[
        {
          alignItems: "center",
          justifyContent: "center",
          gap: Spacing.two,
          flexDirection: "row",
          paddingBottom: Spacing.four,
        },
        styles.safeArea,
      ]}
    >
      <MaterialCommunityIcons
        name="bluetooth-connect"
        size={Sizing.xl}
        style={{ color: theme.lightAccent }}
      />
      <ThemedText
        style={{
          fontSize: Sizing.lg,
          fontWeight: "600",
        }}
      >
        {`Connecting to ${deviceName}...`}
      </ThemedText>
    </SafeAreaView>
  );
};

export default function Index() {
  const connectionState = use(ConnectionStateContext);
  const setConnectionState = use(ConnectionStateDispatchContext);

  const [inputMode, setInputMode] = useState<"touchpad" | "keyboard">(
    "touchpad",
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastConnectedDeviceName, setLastConnectedDeviceName] = useState("");

  //AsyncStorage.clear();
  useEffect(() => {
    requestBLEPermissions();
    AsyncStorage.getItem(
      DEVICE_ID_STORAGE_KEY,
      async (error, lastConnectedDeviceInfo) => {
        if (lastConnectedDeviceInfo) {
          const lastConnectedDevice = JSON.parse(
            lastConnectedDeviceInfo,
          ) as LastConnectedDeviceInfo;
          setLastConnectedDeviceName(lastConnectedDevice.name);

          setIsConnecting(true);
          (async () => {
            blemanager.onConnectionStateChange = (connectionState) =>
              setConnectionState?.(connectionState);

            try {
              await blemanager.connectToDevice(lastConnectedDevice.id);
            } catch (err) {
              if (err instanceof BleError)
                console.log(
                  `ble device connection failed because ${err.reason || err.cause}`,
                );

              await blemanager
                .cancelDeviceConnection(lastConnectedDevice.id)
                .catch((err) => {
                  if (err instanceof BleError) {
                    console.log(
                      `ble device connection cancel failed because ${err.reason || err.cause}`,
                    );
                  }
                });
            }

            setIsConnecting(false);
          })();
        }
        SplashScreen.hideAsync();
      },
    );
  }, [setConnectionState]);

  if (isConnecting)
    return <ConnectingStateOverlay deviceName={lastConnectedDeviceName} />;
  else if (
    (connectionState === "idle" || connectionState === "disconnected") &&
    !isConnecting
  )
    return <BLEScan />;

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.screenContent}>
          {inputMode === "keyboard" ? <Keyboard /> : <Touchpad />}

          <InputModeToggle
            inputMode={inputMode}
            onToggle={() =>
              setInputMode((currentMode) =>
                currentMode === "touchpad" ? "keyboard" : "touchpad",
              )
            }
          />
          <ConnectionStatusBar />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.twoHalf,
  },
  safeArea: {
    flex: 1,
  },
  screenContent: {
    flex: 1,
    position: "relative",
  },
});
