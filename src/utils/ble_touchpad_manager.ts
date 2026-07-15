import { fromByteArray } from "base64-js";
import {
  BleError,
  BleManager,
  ConnectionPriority,
  Device,
} from "react-native-ble-plx";
import { BLEDevice, BLEState, TouchpadButton, TouchpadReport } from "./types";

interface TouchpadService {
  serviceId: string;
  characteristics: {
    mouseId: string;
    keyboardId: string;
  };
}

class BLETouchpadManager {
  private readonly blemanager: BleManager;
  private connectedTouchpad: BLEDevice | null;
  private touchpadService: TouchpadService;
  private readonly writeBuffer: string[];

  constructor(touchpadService: TouchpadService) {
    this.blemanager = new BleManager();
    this.connectedTouchpad = null;
    this.touchpadService = touchpadService;
    this.writeBuffer = [];
  }

  async connectToDevice(device: Device) {
    let connectedDevice = await device.connect();
    connectedDevice = await device.discoverAllServicesAndCharacteristics();
    connectedDevice = await device.requestConnectionPriority(
      ConnectionPriority.High,
    );
    setTimeout(async () => {
      await device.requestConnectionPriority(ConnectionPriority.Balanced);
    }, 3000);
    connectedDevice = await connectedDevice.requestMTU(100);
    this.connectedTouchpad = connectedDevice;
    return connectedDevice;
  }

  scanForTouchpads(
    callback: (error: BleError | null, device: BLEDevice | null) => void,
  ) {
    this.blemanager.startDeviceScan(
      [this.touchpadService.serviceId],
      null,
      callback,
    );
  }

  stopScanning() {
    this.blemanager.stopDeviceScan();
  }

  onStateChange(
    callback: (newState: BLEState) => void,
    emitCurrentState?: boolean,
  ) {
    return this.blemanager.onStateChange(callback, emitCurrentState);
  }

  onConnectedDeviceDisconnect(callback: (error: BleError | null) => void) {
    if (!this.connectedTouchpad) return;
    this.connectedTouchpad.onDisconnected(callback);
    //TODO: implement reconnection logic
  }

  async disconnectFromDevice() {
    await this.connectedTouchpad?.cancelConnection();
    this.connectedTouchpad = null;
  }

  private async writeToCharacteristics(
    characteristicsId: string,
    report: Uint8Array,
    buffered?: boolean,
  ) {
    if (!this.connectedTouchpad) return;
    const encodedReport = fromByteArray(report);
    if (!buffered) {
      await this.connectedTouchpad.writeCharacteristicWithoutResponseForService(
        this.touchpadService.serviceId,
        characteristicsId,
        encodedReport,
      );
      return;
    }
    this.writeBuffer.push(encodedReport);
  }

  async sendTouchpadReports(touchpadReports: TouchpadReport[]) {
    const report = new Uint8Array([
      1,
      ...touchpadReports.flatMap((touchpadReport) => [
        touchpadReport.buttons,
        touchpadReport.dx,
        touchpadReport.dy,
        touchpadReport.scrollX,
        touchpadReport.scrollY,
      ]),
    ]);
    await this.writeToCharacteristics(
      this.touchpadService.characteristics.mouseId,
      report,
    );
  }

  async sendTouchpadClickReport(
    activeButton: TouchpadButton,
    clickedButton: TouchpadButton,
    clickCount = 1,
  ) {
    const report = new Uint8Array([0, activeButton, clickedButton, clickCount]);
    await this.writeToCharacteristics(
      this.touchpadService.characteristics.mouseId,
      report,
    );
  }

  async sendKeyboardReport(modifier: number, keycodes: number[]) {
    if (!this.connectedTouchpad) return;
    const report = new Uint8Array([modifier, ...keycodes]);
    await this.writeToCharacteristics(
      this.touchpadService.characteristics.keyboardId,
      report,
    );
  }
}

export const blemanager = new BLETouchpadManager({
  serviceId: "0132a6af-7467-4364-8ecc-90c48f7fdd7b",
  characteristics: {
    mouseId: "4a263dd7-140b-4ea3-af38-82c64cafd5f0",
    keyboardId: "d7fc920d-968d-49e8-85ac-3b57ef059211",
  },
});
