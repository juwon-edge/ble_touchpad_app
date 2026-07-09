import BLEDeviceCard from "@/components/ble-device-card";
import { Sizing, Spacing } from "@/constants/theme";
import useBLEScan from "@/hooks/use-ble-scan";
import { BLEState } from "@/utils/types";
import { use, useState } from "react";
import { FlatList, Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppSettingsLink from "./app-settings-links";
import { BLEStateContext } from "./ble-state-provider";
import BTSearchBtn from "./bluetooth-search-btn";
import ThemedText from "./theme-text";

const isAndroid = Platform.OS === "android";

const getStateText = (bleState: BLEState) => {
  if (bleState === BLEState.PoweredOff) {
    return (
      <>
        Your bluetooth is turned off{" "}
        {isAndroid && (
          <AppSettingsLink page="android.settings.BLUETOOTH_SETTINGS">
            turn it on
          </AppSettingsLink>
        )}
      </>
    );
  } else if (bleState === BLEState.Unauthorized) {
    return (
      <>
        You didn&apos;t give permission to use bluetooth{" "}
        <AppSettingsLink page="android.settings.APPLICATION_DETAILS_SETTINGS">
          Allow permission
        </AppSettingsLink>
      </>
    );
  } else if (bleState === BLEState.Unsupported) {
    return "Your device doesn't support BLE";
  }

  return "Unable to start scanning";
};

const BLEScan = () => {
  const { devices: scannedDevices, isScanning, scanForDevices } = useBLEScan();
  const [isInitialScan, setIsInitialScan] = useState(true);
  const bleState = use(BLEStateContext);

  let scanStatusText = "Tap the button to search for nearby touchpads";
  if (isInitialScan) scanStatusText = scanStatusText;
  else if (isScanning) scanStatusText = "Searching for nearby touchpads...";
  else if (scannedDevices.length === 0) scanStatusText = "No touchpad found";

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <ThemedText style={styles.header}>Connect to Touchpad</ThemedText>
        <View style={[{ gap: Spacing.two }, styles.statusText]}>
          {bleState === BLEState.PoweredOn ? (
            <ThemedText>{scanStatusText}</ThemedText>
          ) : (
            <ThemedText style={{ color: "red" }}>
              {getStateText(bleState)}
            </ThemedText>
          )}
        </View>

        <BTSearchBtn
          disabled={bleState !== BLEState.PoweredOn}
          onStartSearch={() => {
            scanForDevices();
            if (isInitialScan) setIsInitialScan(false);
          }}
          isSearching={isScanning}
        />
      </View>
      <FlatList
        data={scannedDevices}
        keyExtractor={(device) => device.id}
        renderItem={({ item }) => <BLEDeviceCard device={item} />}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

export default BLEScan;

const styles = StyleSheet.create({
  header: {
    fontSize: Sizing.xl,
    fontWeight: 700,
    paddingVertical: Spacing.two,
    marginTop: Spacing.seven,
  },
  headerContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.four,
  },
  statusText: {
    fontSize: Sizing.md,
    opacity: 0.8,
  },
  listContainer: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.twoHalf,
  },
});
