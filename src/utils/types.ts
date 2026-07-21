import { Device as BLEDevice } from "react-native-ble-plx";

export { State as BLEState } from "react-native-ble-plx";
export { BLEDevice };
export type ConnectedDeviceType = BLEDevice | null;

export interface LastConnectedDeviceInfo {
  name: string;
  id: string;
}

export type BLEConnectionState =
  | "connected"
  | "disconnected"
  | "reconnecting"
  | "idle";

export enum TouchpadButton {
  NONE = 0,
  LEFT = 1,
  RIGHT = 2,
}

export enum GESTURE_LOCK{ NONE, SCROLL, PINCH};


export enum KeyboardModifiers {
  NONE = 0,
  LEFT_CTRL = 0x01,
  LEFT_SHIFT = 0x02,
  LEFT_ALT = 0x04,
  LEFT_GUI = 0x08,
  RIGHT_CTRL = 0x010,
  RIGHT_SHIFT = 0x020,
  RIGHT_ALT = 0x040,
  RIGHT_GUI = 0x080,
}

export interface TouchpadReport {
  buttons: TouchpadButton;
  dx: number;
  dy: number;
  scrollX: number;
  scrollY: number;
}
