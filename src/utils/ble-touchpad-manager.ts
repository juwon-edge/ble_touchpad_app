import { fromByteArray } from "base64-js";
import { Platform } from "react-native";
import {
  BleError,
  BleManager,
  ConnectionPriority,
  Subscription,
} from "react-native-ble-plx";
import { withRetry } from "./helper";
import {
  BLEConnectionState,
  BLEDevice,
  BLEState,
  TouchpadButton,
  TouchpadReport,
} from "./types";

interface TouchpadService {
  serviceId: string;
  characteristics: {
    mouseId: string;
    keyboardId: string;
  };
}

const CONNECTION_TIMEOUT_MS = 5000;

class BLETouchpadManager {
  private readonly blemanager: BleManager;
  private connectedTouchpad: BLEDevice | null;
  private touchpadService: TouchpadService;
  private readonly writeBuffer: { characteristicsId: string; report: string }[];
  private readonly connectionInterval: number;
  private disconnectionSubscription?: Subscription;
  connectionState: BLEConnectionState = "idle";
  onConnectionStateChange?: (connectionState: BLEConnectionState) => void;
  private intentionalDisconnect: boolean;

  constructor(touchpadService: TouchpadService) {
    this.blemanager = new BleManager();
    this.connectedTouchpad = null;
    this.touchpadService = touchpadService;
    this.writeBuffer = [];
    this.connectionInterval = 25;
    this.intentionalDisconnect = false;
    //this.pollWriteBuffer();
  }

  private updateConnectionState(newState: BLEConnectionState) {
    this.connectionState = newState;
    this.onConnectionStateChange?.(newState);
  }

  pollWriteBuffer() {
    setInterval(async () => {
      const latestReport = this.writeBuffer.shift();
      if (!(latestReport && this.connectedTouchpad)) return;

      console.log(`${JSON.stringify(latestReport)} pulled from buffer`);

      await this.connectedTouchpad.writeCharacteristicWithoutResponseForService(
        this.touchpadService.serviceId,
        latestReport.characteristicsId,
        latestReport.report,
      );
    }, this.connectionInterval);
  }

  async setUpDeviceConnection(connectedDevice: BLEDevice) {
    connectedDevice =
      await connectedDevice.discoverAllServicesAndCharacteristics();
    connectedDevice = await connectedDevice.requestConnectionPriority(
      ConnectionPriority.High,
    );
    setTimeout(async () => {
      await connectedDevice.requestConnectionPriority(ConnectionPriority.High);
    }, 3000);
    if (Platform.OS === "android")
      connectedDevice = await connectedDevice.requestMTU(100);
    this.connectedTouchpad = connectedDevice;
    this.intentionalDisconnect = false;
    this.disconnectionSubscription = this.connectedTouchpad.onDisconnected(
      async (error) => {
        await this.onConnectedDeviceDisconnect(error);
      },
    );
    this.updateConnectionState("connected");
    return connectedDevice;
  }

  async connectToDevice(deviceId: string) {
    let connectedDevice = await this.blemanager.connectToDevice(deviceId, {
      timeout: CONNECTION_TIMEOUT_MS,
    });
    connectedDevice = await this.setUpDeviceConnection(connectedDevice);

    return connectedDevice;
  }

  async scanForTouchpads(
    callback: (error: BleError | null, device: BLEDevice | null) => void,
  ) {
    await this.blemanager.startDeviceScan(
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

  async onConnectedDeviceDisconnect(error: BleError | null) {
    if (
      this.connectionState === "disconnected" ||
      this.connectionState === "reconnecting"
    )
      return;

    this.disconnectionSubscription?.remove();
    if (this.intentionalDisconnect) return;

    this.updateConnectionState("reconnecting");

    try {
      await withRetry({
        func: async () => {
          const id = this.connectedTouchpad?.id;
          if (!id) return;
          await this.connectToDevice(id);
        },
      });
    } catch {
      this.updateConnectionState("disconnected");
    }
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
    this.writeBuffer.push({
      characteristicsId: characteristicsId,
      report: encodedReport,
    });
  }

  async cancelDeviceConnection(deviceId: string) {
    const device = await this.blemanager.cancelDeviceConnection(deviceId);
    this.intentionalDisconnect = true;
    this.updateConnectionState("disconnected");
    this.connectedTouchpad = null;

    return device;
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
    buffered?: boolean,
  ) {
    const report = new Uint8Array([0, activeButton, clickedButton, clickCount]);
    await this.writeToCharacteristics(
      this.touchpadService.characteristics.mouseId,
      report,
      buffered,
    );
  }

  async sendKeyboardReport(
    modifier: number,
    keycodes: number[],
    buffered?: boolean,
  ) {
    if (!this.connectedTouchpad) return;
    const report = new Uint8Array([modifier, ...keycodes]);
    await this.writeToCharacteristics(
      this.touchpadService.characteristics.keyboardId,
      report,
      buffered,
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
