import { PermissionsAndroid, Platform } from "react-native";

export const requestBLEPermissions = async () => {
  const new_android_permissions = [
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
  ];
  const old_android_permission = [
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  ];

  if (Platform.OS !== "android") return true;
  if (Platform.Version >= 31) {
    const result = await PermissionsAndroid.requestMultiple(
      new_android_permissions,
    );

    return new_android_permissions.every(
      (permission) => result[permission] === PermissionsAndroid.RESULTS.GRANTED,
    );
  }

  const result = await PermissionsAndroid.requestMultiple(
    old_android_permission,
  );

  return old_android_permission.every(
    (permission) => result[permission] === PermissionsAndroid.RESULTS.GRANTED,
  );
};

export const charToHidMap = {
  A: 0x04,
  B: 0x05,
  C: 0x06,
  D: 0x07,
  E: 0x08,
  F: 0x09,
  G: 0x0a,
  H: 0x0b,
  I: 0x0c,
  J: 0x0d,
  K: 0x0e,
  L: 0x0f,
  M: 0x10,
  N: 0x11,
  O: 0x12,
  P: 0x13,
  Q: 0x14,
  R: 0x15,
  S: 0x16,
  T: 0x17,
  U: 0x18,
  V: 0x19,
  W: 0x1a,
  X: 0x1b,
  Y: 0x1c,
  Z: 0x1d,
  "1": 0x1e,
  "2": 0x1f,
  "3": 0x20,
  "4": 0x21,
  "5": 0x22,
  "6": 0x23,
  "7": 0x24,
  "8": 0x25,
  "9": 0x26,
  "0": 0x27,
  ENTER: 0x28,
  ESCAPE: 0x29,
  BACKSPACE: 0x2a,
  TAB: 0x2b,
  SPACE: 0x2c,
  MINUS: 0x2d,
  EQUAL: 0x2e,
  BRACKET_LEFT: 0x2f,
  BRACKET_RIGHT: 0x30,
  BACKSLASH: 0x31,
  EUROPE_1: 0x32,
  SEMICOLON: 0x33,
  APOSTROPHE: 0x34,
  GRAVE: 0x35,
  COMMA: 0x36,
  PERIOD: 0x37,
  SLASH: 0x38,
  CAPS_LOCK: 0x39,
  F1: 0x3a,
  F2: 0x3b,
  F3: 0x3c,
  F4: 0x3d,
  F5: 0x3e,
  F6: 0x3f,
  F7: 0x40,
  F8: 0x41,
  F9: 0x42,
  F10: 0x43,
  F11: 0x44,
  F12: 0x45,
  PRINT_SCREEN: 0x46,
  SCROLL_LOCK: 0x47,
  PAUSE: 0x48,
  INSERT: 0x49,
  HOME: 0x4a,
  PAGE_UP: 0x4b,
  DELETE: 0x4c,
  END: 0x4d,
  PAGE_DOWN: 0x4e,
  ARROW_RIGHT: 0x4f,
  ARROW_LEFT: 0x50,
  ARROW_DOWN: 0x51,
  ARROW_UP: 0x52,
  NUM_LOCK: 0x53,
  KEYPAD_DIVIDE: 0x54,
  KEYPAD_MULTIPLY: 0x55,
  KEYPAD_SUBTRACT: 0x56,
  KEYPAD_ADD: 0x57,
  KEYPAD_ENTER: 0x58,
  KEYPAD_1: 0x59,
  KEYPAD_2: 0x5a,
  KEYPAD_3: 0x5b,
  KEYPAD_4: 0x5c,
  KEYPAD_5: 0x5d,
  KEYPAD_6: 0x5e,
  KEYPAD_7: 0x5f,
  KEYPAD_8: 0x60,
  KEYPAD_9: 0x61,
  KEYPAD_0: 0x62,
  KEYPAD_DECIMAL: 0x63,
  EUROPE_2: 0x64,
  APPLICATION: 0x65,
  POWER: 0x66,
  KEYPAD_EQUAL: 0x67,
  F13: 0x68,
  F14: 0x69,
  F15: 0x6a,
  F16: 0x6b,
  F17: 0x6c,
  F18: 0x6d,
  F19: 0x6e,
  F20: 0x6f,
  F21: 0x70,
  F22: 0x71,
  F23: 0x72,
  F24: 0x73,
  EXECUTE: 0x74,
  HELP: 0x75,
  MENU: 0x76,
  SELECT: 0x77,
  STOP: 0x78,
  AGAIN: 0x79,
  UNDO: 0x7a,
  CUT: 0x7b,
  COPY: 0x7c,
  PASTE: 0x7d,
  FIND: 0x7e,
  MUTE: 0x7f,
  VOLUME_UP: 0x80,
  VOLUME_DOWN: 0x81,
  LOCKING_CAPS_LOCK: 0x82,
  LOCKING_NUM_LOCK: 0x83,
  LOCKING_SCROLL_LOCK: 0x84,
  KEYPAD_COMMA: 0x85,
  KEYPAD_EQUAL_SIGN: 0x86,
  KANJI1: 0x87,
  KANJI2: 0x88,
  KANJI3: 0x89,
  KANJI4: 0x8a,
  KANJI5: 0x8b,
  KANJI6: 0x8c,
  KANJI7: 0x8d,
  KANJI8: 0x8e,
  KANJI9: 0x8f,
  LANG1: 0x90,
  LANG2: 0x91,
  LANG3: 0x92,
  LANG4: 0x93,
  LANG5: 0x94,
  LANG6: 0x95,
  LANG7: 0x96,
  LANG8: 0x97,
  LANG9: 0x98,
  ALTERNATE_ERASE: 0x99,
  SYSREQ_ATTENTION: 0x9a,
  CANCEL: 0x9b,
  CLEAR: 0x9c,
  PRIOR: 0x9d,
  RETURN: 0x9e,
  SEPARATOR: 0x9f,
  OUT: 0xa0,
  OPER: 0xa1,
  CLEAR_AGAIN: 0xa2,
  CRSEL_PROPS: 0xa3,
  EXSEL: 0xa4,
  KEYPAD_00: 0xb0,
  KEYPAD_000: 0xb1,
  THOUSANDS_SEPARATOR: 0xb2,
  DECIMAL_SEPARATOR: 0xb3,
  CURRENCY_UNIT: 0xb4,
  CURRENCY_SUBUNIT: 0xb5,
  KEYPAD_LEFT_PARENTHESIS: 0xb6,
  KEYPAD_RIGHT_PARENTHESIS: 0xb7,
  KEYPAD_LEFT_BRACE: 0xb8,
  KEYPAD_RIGHT_BRACE: 0xb9,
  KEYPAD_TAB: 0xba,
  KEYPAD_BACKSPACE: 0xbb,
  KEYPAD_A: 0xbc,
  KEYPAD_B: 0xbd,
  KEYPAD_C: 0xbe,
  KEYPAD_D: 0xbf,
  KEYPAD_E: 0xc0,
  KEYPAD_F: 0xc1,
  KEYPAD_XOR: 0xc2,
  KEYPAD_CARET: 0xc3,
  KEYPAD_PERCENT: 0xc4,
  KEYPAD_LESS_THAN: 0xc5,
  KEYPAD_GREATER_THAN: 0xc6,
  KEYPAD_AMPERSAND: 0xc7,
  KEYPAD_DOUBLE_AMPERSAND: 0xc8,
  KEYPAD_VERTICAL_BAR: 0xc9,
  KEYPAD_DOUBLE_VERTICAL_BAR: 0xca,
  KEYPAD_COLON: 0xcb,
  KEYPAD_HASH: 0xcc,
  KEYPAD_SPACE: 0xcd,
  KEYPAD_AT: 0xce,
  KEYPAD_EXCLAMATION: 0xcf,
  KEYPAD_MEMORY_STORE: 0xd0,
  KEYPAD_MEMORY_RECALL: 0xd1,
  KEYPAD_MEMORY_CLEAR: 0xd2,
  KEYPAD_MEMORY_ADD: 0xd3,
  KEYPAD_MEMORY_SUBTRACT: 0xd4,
  KEYPAD_MEMORY_MULTIPLY: 0xd5,
  KEYPAD_MEMORY_DIVIDE: 0xd6,
  KEYPAD_PLUS_MINUS: 0xd7,
  KEYPAD_CLEAR: 0xd8,
  KEYPAD_CLEAR_ENTRY: 0xd9,
  KEYPAD_BINARY: 0xda,
  KEYPAD_OCTAL: 0xdb,
  KEYPAD_DECIMAL_2: 0xdc,
  KEYPAD_HEXADECIMAL: 0xdd,
  CONTROL_LEFT: 0xe0,
  SHIFT_LEFT: 0xe1,
  ALT_LEFT: 0xe2,
  GUI_LEFT: 0xe3,
  CONTROL_RIGHT: 0xe4,
  SHIFT_RIGHT: 0xe5,
  ALT_RIGHT: 0xe6,
  GUI_RIGHT: 0xe7,
} as const;

export const sum = (arr: number[], initialValue = 0) =>
  arr.reduce((total, value) => total + value, initialValue);

const getMaxChunk = (dx: number, dy: number) => {
  "worklet";
  const distance = Math.max(Math.abs(dx), Math.abs(dy));

  if (distance <= 6) return 1;
  else if (distance <= 20) return 3;
  else return 6;
};
export const splitMovement = (dx: number, dy: number, maxStep = 4) => {
  "worklet";
  const chunks = [];
  const maxChunk = getMaxChunk(dx, dy);
  const steps = Math.min(
    Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / maxChunk),
    maxStep,
  );

  for (let i = 1; i <= steps; i++) {
    const nextX = Math.round((dx * i) / steps);
    const nextY = Math.round((dy * i) / steps);

    const prevX = Math.round((dx * (i - 1)) / steps);
    const prevY = Math.round((dy * (i - 1)) / steps);

    chunks.push([nextX - prevX, nextY - prevY]);
  }

  return chunks;
};
