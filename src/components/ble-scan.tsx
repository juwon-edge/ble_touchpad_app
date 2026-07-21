import BLEDeviceCard from "@/components/ble-device-card";
import { Sizing, Spacing } from "@/constants/theme";
import useBLEScan from "@/hooks/use-ble-scan";
import { BLEState } from "@/utils/types";
import { use, useState } from "react";
import { FlatList, Platform, StyleSheet, View } from "react-native";
import { BleErrorCode } from "react-native-ble-plx";
import { SafeAreaView } from "react-native-safe-area-context";
import AppSettingsLink from "./app-settings-links";
import { BLEStateContext } from "./ble-state-provider";
import BTSearchBtn from "./bluetooth-search-btn";
import ThemedText from "./theme-text";

const isAndroid = Platform.OS === "android";

const getStateText = (bleState: BLEState) => {
  console.log(bleState);
  if (bleState === BLEState.Unauthorized) {
    return (
      <>
        You didn&apos;t give permission to use bluetooth{" "}
        <AppSettingsLink>Allow permission</AppSettingsLink>
      </>
    );
  } else if (bleState === BLEState.Unsupported) {
    return "Your device doesn't support BLE";
  } else if (bleState === BLEState.PoweredOn)
    return "Tap the button to search for nearby touchpads";
  else if (bleState === BLEState.PoweredOff) {
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
  }
  return null;
};

const getScanErrorText = (scanErrorCode: BleErrorCode | null) => {
  if (scanErrorCode === BleErrorCode.LocationServicesDisabled) {
    return (
      <>
        Your location is disabled{" "}
        {isAndroid && (
          <AppSettingsLink page="android.settings.LOCATION_SOURCE_SETTINGS">
            turn it on
          </AppSettingsLink>
        )}
      </>
    );
  }
  return null;
};

const BLEScan = () => {
  const {
    devices: scannedDevices,
    isScanning,
    scanForDevices,
    stopDeviceScan,
    scanErrorCode,
  } = useBLEScan();
  const [isInitialScan, setIsInitialScan] = useState(true);
  const bleState = use(BLEStateContext);

  let scanStatusText = "";
  if (!isInitialScan && isScanning)
    scanStatusText = "Searching for nearby touchpads...";
  else if (!isInitialScan && scannedDevices.length === 0)
    scanStatusText = "No touchpad found";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ThemedText style={styles.header}>Connect to Touchpad</ThemedText>
        <View style={styles.statusText}>
          <ThemedText
            style={
              (bleState !== BLEState.PoweredOn || !!scanErrorCode) && {
                color: "red",
              }
            }
          >
            {getScanErrorText(scanErrorCode) ||
              scanStatusText ||
              getStateText(bleState) ||
              "Unable to start scanning"}
          </ThemedText>
        </View>

        <BTSearchBtn
          disabled={bleState !== BLEState.PoweredOn}
          onCancelSearch={() => {
            stopDeviceScan();
          }}
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
        style={{ flex: 1 }}
      />
    </SafeAreaView>
  );
};

export default BLEScan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  header: {
    fontSize: Sizing.xl,
    fontWeight: 700,
    paddingVertical: Spacing.two,
  },
  headerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.three,
    marginLeft: Spacing.two,
  },
  statusText: {
    fontSize: Sizing.md,
    opacity: 0.8,
    gap: Spacing.two,
  },
  listContainer: {
    gap: Spacing.four,
    paddingVertical: Spacing.twoHalf,
    marginTop: Spacing.two,
    alignItems: "center",
  },
});
