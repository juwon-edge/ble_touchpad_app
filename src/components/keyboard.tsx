import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { blemanager } from "@/utils/ble_touchpad_manager";
import { charToHidMap } from "@/utils/helper";
import { KeyboardModifiers } from "@/utils/types";
import { useCallback, useRef, useState } from "react";
import { KeyboardAvoidingView, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

type KeyDefinition = {
  label: string;
  width?: number;
  variant?: "special" | "wide" | "action";
  isModifier?: boolean;
  value: number;
  shiftLabel?: string;
};

const keyboardRows: KeyDefinition[][] = [
  [
    { label: "Esc", variant: "special", value: charToHidMap["ESCAPE"] },
    { label: "F1", variant: "special", value: charToHidMap["F1"] },
    { label: "F2", variant: "special", value: charToHidMap["F2"] },
    { label: "F3", variant: "special", value: charToHidMap["F3"] },
    { label: "F4", variant: "special", value: charToHidMap["F4"] },
    { label: "F5", variant: "special", value: charToHidMap["F5"] },
    { label: "F6", variant: "special", value: charToHidMap["F6"] },
    { label: "F7", variant: "special", value: charToHidMap["F7"] },
    { label: "F8", variant: "special", value: charToHidMap["F8"] },
    { label: "F9", variant: "special", value: charToHidMap["F9"] },
    { label: "F10", variant: "special", value: charToHidMap["F10"] },
    { label: "F11", variant: "special", value: charToHidMap["F11"] },
    { label: "F12", variant: "special", value: charToHidMap["F12"] },
  ],
  [
    { label: "`", value: charToHidMap["GRAVE"], shiftLabel: "~" },
    { label: "1", value: charToHidMap["1"], shiftLabel: "!" },
    { label: "2", value: charToHidMap["2"], shiftLabel: "@" },
    { label: "3", value: charToHidMap["3"], shiftLabel: "#" },
    { label: "4", value: charToHidMap["4"], shiftLabel: "$" },
    { label: "5", value: charToHidMap["5"], shiftLabel: "%" },
    { label: "6", value: charToHidMap["6"], shiftLabel: "^" },
    { label: "7", value: charToHidMap["7"], shiftLabel: "&" },
    { label: "8", value: charToHidMap["8"], shiftLabel: "*" },
    { label: "9", value: charToHidMap["9"], shiftLabel: "(" },
    { label: "0", value: charToHidMap["0"], shiftLabel: ")" },
    { label: "-", value: charToHidMap["MINUS"], shiftLabel: "_" },
    { label: "=", value: charToHidMap["EQUAL"], shiftLabel: "+" },
    {
      label: "Back",
      variant: "action",
      width: 1.4,
      value: charToHidMap["BACKSPACE"],
    },
  ],
  [
    {
      label: "Tab",
      variant: "special",
      width: 1.1,
      value: charToHidMap["TAB"],
    },
    { label: "Q", value: charToHidMap["Q"] },
    { label: "W", value: charToHidMap["W"] },
    { label: "E", value: charToHidMap["E"] },
    { label: "R", value: charToHidMap["R"] },
    { label: "T", value: charToHidMap["T"] },
    { label: "Y", value: charToHidMap["Y"] },
    { label: "U", value: charToHidMap["U"] },
    { label: "I", value: charToHidMap["I"] },
    { label: "O", value: charToHidMap["O"] },
    { label: "P", value: charToHidMap["P"] },
    {
      label: "[",
      value: charToHidMap["BRACKET_LEFT"],
      shiftLabel: "{",
    },
    { label: "]", value: charToHidMap["BRACKET_RIGHT"], shiftLabel: "}" },
    { label: "\\", value: charToHidMap["BACKSLASH"], shiftLabel: "|" },
  ],
  [
    {
      label: "Caps",
      variant: "special",
      width: 1.2,
      value: charToHidMap["CAPS_LOCK"],
    },
    { label: "A", value: charToHidMap["A"] },
    { label: "S", value: charToHidMap["S"] },
    { label: "D", value: charToHidMap["D"] },
    { label: "F", value: charToHidMap["F"] },
    { label: "G", value: charToHidMap["G"] },
    { label: "H", value: charToHidMap["H"] },
    { label: "J", value: charToHidMap["J"] },
    { label: "K", value: charToHidMap["K"] },
    { label: "L", value: charToHidMap["L"] },
    { label: ";", value: charToHidMap["SEMICOLON"], shiftLabel: ":" },
    { label: "'", value: charToHidMap["APOSTROPHE"], shiftLabel: '"' },
    {
      label: "Enter",
      variant: "action",
      width: 1.4,
      value: charToHidMap["ENTER"],
    },
  ],
  [
    {
      label: "Shift",
      isModifier: true,
      variant: "special",
      width: 1.5,
      value: KeyboardModifiers.LEFT_SHIFT,
    },
    { label: "Z", value: charToHidMap["Z"] },
    { label: "X", value: charToHidMap["X"] },
    { label: "C", value: charToHidMap["C"] },
    { label: "V", value: charToHidMap["V"] },
    { label: "B", value: charToHidMap["B"] },
    { label: "N", value: charToHidMap["N"] },
    { label: "M", value: charToHidMap["M"] },
    { label: ",", value: charToHidMap["COMMA"], shiftLabel: "<" },
    { label: ".", value: charToHidMap["PERIOD"], shiftLabel: ">" },
    { label: "/", value: charToHidMap["SLASH"], shiftLabel: "?" },
    {
      label: "Shift",
      isModifier: true,
      variant: "special",
      width: 1.5,
      value: KeyboardModifiers.RIGHT_SHIFT,
    },
  ],
  [
    {
      label: "Ctrl",
      isModifier: true,
      variant: "special",
      width: 1.1,
      value: KeyboardModifiers.LEFT_CTRL,
    },
    {
      label: "Win",
      isModifier: true,
      variant: "special",
      width: 1.05,
      value: KeyboardModifiers.LEFT_GUI,
    },
    {
      label: "Alt",
      isModifier: true,
      variant: "special",
      width: 1.05,
      value: KeyboardModifiers.LEFT_ALT,
    },
    {
      label: "Space",
      variant: "wide",
      width: 3.6,
      value: charToHidMap["SPACE"],
    },
    {
      label: "Alt",
      isModifier: true,
      variant: "special",
      width: 1.05,
      value: KeyboardModifiers.RIGHT_ALT,
    },
    { label: "◀", value: charToHidMap["ARROW_LEFT"] },
    { label: "▼", value: charToHidMap["ARROW_DOWN"] },
    { label: "▶", value: charToHidMap["ARROW_RIGHT"] },
  ],
];

const Keyboard = () => {
  const theme = useTheme();
  const [capsLock, setCapsLock] = useState(false);
  const activeModifiers = useRef<KeyboardModifiers>(KeyboardModifiers.NONE);
  const activeKeys = useRef<Set<number>>(new Set());

  const onKeyPressDown = useCallback((key: KeyDefinition) => {
    if (key.isModifier) {
      activeModifiers.current |= key.value;
    } else {
      if (activeKeys.current.size === 6) return; //TODO: find something to do when your set is full
      activeKeys.current.add(key.value);
      blemanager.sendKeyboardReport(activeModifiers.current, [
        ...activeKeys.current,
      ]);
    }
  }, []);

  const onKeyPressUp = useCallback((key: KeyDefinition) => {
    if (key.isModifier) {
      activeModifiers.current &= ~key.value;
    } else {
      activeKeys.current.delete(key.value);
      blemanager.sendKeyboardReport(activeModifiers.current, [
        ...activeKeys.current,
      ]);
    }
  }, []);

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.keyboardShell}>
        {/*eslint-disable-next-line react-hooks/refs*/}
        {keyboardRows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.keyRow}>
            {row.map((key, keyIndex) => {
              const isCapLockActive = key.label === "Caps" && capsLock;

              const gesture = Gesture.Manual()
                .onTouchesDown(() => {
                  if (key.label === "Caps") setCapsLock((current) => !current);
                  onKeyPressDown(key);
                })
                .onTouchesUp(() => {
                  onKeyPressUp(key);
                });

              return (
                <GestureDetector
                  gesture={gesture}
                  key={`${rowIndex}-${keyIndex}`}
                >
                  <View
                    style={[
                      styles.key,
                      key.variant === "special" && styles.specialKey,
                      key.variant === "wide" && styles.wideKey,
                      key.variant === "action" && styles.actionKey,
                      key.width ? { flex: key.width } : undefined,
                      //pressed && styles.pressedKey,
                      isCapLockActive && {
                        backgroundColor: theme.accent,
                        borderColor: theme.accent,
                      },
                    ]}
                  >
                    <Text style={[styles.keyLabel, { color: theme.text }]}>
                      {key.label}
                    </Text>
                  </View>
                </GestureDetector>
              );
            })}
          </View>
        ))}
      </View>
    </KeyboardAvoidingView>
  );
};

export default Keyboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    gap: Spacing.twoHalf,
  },
  output: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: Spacing.twoHalf,
    padding: Spacing.twoHalf,
    fontSize: 16,
  },
  keyboardShell: {
    borderRadius: Spacing.three,
    padding: Spacing.two,
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "#374151",
  },
  keyRow: {
    flexDirection: "row",
    gap: Spacing.oneHalf,
    marginBottom: Spacing.oneHalf,
  },
  key: {
    flex: 1,
    minHeight: 40,
    borderRadius: Spacing.two,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e5e7eb",
    borderWidth: 1,
    borderColor: "#9ca3af",
  },
  specialKey: {
    backgroundColor: "#d1d5db",
  },
  actionKey: {
    backgroundColor: "#f59e0b",
    borderColor: "#d97706",
  },
  wideKey: {
    backgroundColor: "#d1d5db",
    flex: 3.6,
  },
  pressedKey: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  keyLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
});
