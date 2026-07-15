import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

interface InputModeToggleProps {
  inputMode: "touchpad" | "keyboard";
  onToggle: () => void;
}

const InputModeToggle = ({ inputMode, onToggle }: InputModeToggleProps) => {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onToggle}
      style={({ pressed }) => [
        styles.modeToggle,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.textSecondary,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Ionicons
        name={inputMode === "touchpad" ? "keypad-outline" : "move-outline"}
        size={20}
        color={theme.text}
      />
    </Pressable>
  );
};

export default InputModeToggle;

const styles = StyleSheet.create({
  modeToggle: {
    position: "absolute",
    left: Spacing.twoHalf,
    bottom: Spacing.twoHalf,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
});
