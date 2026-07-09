import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { use } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ConnectionStateContext } from "./connection-state-provider";

const StatusBar = () => {
  const connectionState = use(ConnectionStateContext);
  const theme = useTheme();

  return (
    connectionState !== "connected" && (
      <View style={[styles.container, { borderColor: theme.textSecondary }]}>
        <MaterialCommunityIcons
          style={[
            connectionState === "disconnected" && styles.disconnectedStatus,
            connectionState === "reconnecting" && styles.reconnectingStatus,
          ]}
          name="dots-circle"
          size={18}
        />
        <Text>{connectionState}</Text>
      </View>
    )
  );
};

export default StatusBar;

const styles = StyleSheet.create({
  container: {
    padding: Spacing.one,
    borderWidth: 1,
    borderRadius: 999,
    flexDirection: "row",
    gap: Spacing.two,
    fontWeight: 600,
  },
  disconnectedStatus: { color: "red" },
  reconnectingStatus: { color: "yellow" },
});
