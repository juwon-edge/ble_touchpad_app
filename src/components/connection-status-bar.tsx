import { Sizing, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { use } from "react";
import { StyleSheet, View } from "react-native";
import AnimatedRipple from "./animated-ripple";
import { ConnectionStateContext } from "./connection-state-provider";
import ThemedText from "./theme-text";

const ICON_SIZE = Sizing.xl;
const MAX_RIPPLE_SCALE = 1.5;

const ConnectionStatusBar = () => {
  const connectionState = use(ConnectionStateContext);
  const theme = useTheme();

  return (
    connectionState !== "connected" && (
      <View
        style={[
          styles.container,
          {
            borderColor: theme.textSecondary,
            backgroundColor: theme.background,
          },
        ]}
      >
        <View style={styles.rippleContainer}>
          <AnimatedRipple
            active={connectionState === "reconnecting"}
            size={ICON_SIZE - 2}
            maxScale={MAX_RIPPLE_SCALE}
            style={{ borderColor: styles.reconnectingStatus.color, zIndex: 30 }}
            options={{ expansionDuration: 1250 }}
          />
          <MaterialCommunityIcons
            style={[
              connectionState === "reconnecting" && styles.reconnectingStatus,
            ]}
            name="circle"
            size={ICON_SIZE}
          />
        </View>

        <ThemedText style={styles.statusText}>
          {connectionState === "reconnecting"
            ? "Reconnecting..."
            : connectionState}
        </ThemedText>
      </View>
    )
  );
};

export default ConnectionStatusBar;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderWidth: 1,
    gap: Spacing.one,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  disconnectedStatus: { color: "red" },
  reconnectingStatus: { color: "yellow" },
  statusText: {
    fontWeight: 500,
    fontSize: Sizing.md,
  },
  rippleContainer: {
    width: ICON_SIZE * MAX_RIPPLE_SCALE,
    height: ICON_SIZE * MAX_RIPPLE_SCALE,
    alignItems: "center",
    justifyContent: "center",
  },
});
