import { blemanager } from "@/utils/ble-touchpad-manager";
import { BLEDevice } from "@/utils/types";
import { useCallback, useState } from "react";
import { BleErrorCode } from "react-native-ble-plx";

const useBLEScan = (scan_duration = 30) => {
  const [devices, setDevices] = useState<BLEDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanErrorCode, setScanErrorCode] = useState<BleErrorCode | null>(null);

  const stopDeviceScan = useCallback(() => {
    blemanager.stopScanning();
    setIsScanning(false);
  }, []);

  const scanForDevices = useCallback(() => {
    setDevices([]);
    setIsScanning(true);
    setScanErrorCode(null);

    blemanager.scanForTouchpads((error, device) => {
      if (error) {
        setScanErrorCode(error.errorCode);
        if (error.errorCode === BleErrorCode.LocationServicesDisabled)
          stopDeviceScan();
      }
      if (device && device.localName) {
        setDevices((storedDevices) => {
          const storedDeviceIndex = storedDevices.findIndex(
            (storedDevice) => storedDevice.id === device.id,
          );
          if (storedDeviceIndex !== -1) {
            const devices = [...storedDevices];
            devices[storedDeviceIndex] = device;
            return devices;
          }

          return [...storedDevices, device];
        });
      }
    });

    setTimeout(() => {
      stopDeviceScan();
    }, scan_duration * 1000);
  }, [scan_duration, stopDeviceScan]);

  return {
    devices,
    isScanning,
    scanForDevices,
    stopDeviceScan,
    scanErrorCode,
  };
};

export default useBLEScan;
