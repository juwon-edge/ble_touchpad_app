import { blemanager } from "@/utils/ble_touchpad_manager";
import { BLEDevice } from "@/utils/types";
import { useCallback, useState } from "react";

const useBLEScan = (scan_duration = 30) => {
  const [devices, setDevices] = useState<BLEDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const scanForDevices = useCallback(() => {
    setDevices([]);
    setIsScanning(true);

    blemanager.scanForTouchpads((error, device) => {
      if (error) console.error(error);
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
      blemanager.stopScanning();
      setIsScanning(false);
    }, scan_duration * 1000);
  }, [scan_duration]);

  return { devices, isScanning, scanForDevices };
};

export default useBLEScan;
