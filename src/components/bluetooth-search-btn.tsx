import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet, View } from "react-native";
import AnimatedRipple from "./animated-ripple";

type Props = {
  onStartSearch: () => void;
  onCancelSearch: () => void;
  isSearching: boolean;
  disabled: boolean;
};

const ICON_SIZE = 48;
const PADDING = Spacing.twoHalf;
const MAX_RIPPLE_SCALE = 3.5;

const BTSearchBtn = (props: Props) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, props.disabled && { opacity: 0.4 }]}>
      <AnimatedRipple
        active={props.isSearching}
        size={ICON_SIZE + PADDING}
        maxScale={MAX_RIPPLE_SCALE}
      />
      <AnimatedRipple
        delayms={750}
        active={props.isSearching}
        size={ICON_SIZE + PADDING}
        maxScale={MAX_RIPPLE_SCALE}
      />
      <AnimatedRipple
        delayms={1500}
        active={props.isSearching}
        size={ICON_SIZE + PADDING}
        maxScale={MAX_RIPPLE_SCALE}
      />
      {props.isSearching && (
        <Pressable
          style={{
            padding: Spacing.half,
            backgroundColor: "red",
            position: "absolute",
            top: 56,
            right: 64,
            zIndex: 10,
            borderRadius: 999,
          }}
          onPress={props.onCancelSearch}
        >
          <MaterialCommunityIcons
            name="plus"
            size={24}
            style={{ color: "white", transform: [{ rotateZ: "45deg" }] }}
          />
        </Pressable>
      )}
      <Pressable
        style={[{ backgroundColor: theme.accent }, styles.bluetoothBtn]}
        onPress={() => {
          if (!props.isSearching) props.onStartSearch();
        }}
        disabled={props.disabled}
      >
        <MaterialCommunityIcons
          name="bluetooth"
          size={ICON_SIZE}
          style={styles.bluetoothIcon}
        />
      </Pressable>
    </View>
  );
};

export default BTSearchBtn;

const styles = StyleSheet.create({
  bluetoothIcon: { color: "white" },
  bluetoothBtn: { padding: PADDING, borderRadius: 72 },
  container: {
    width: (PADDING + ICON_SIZE) * MAX_RIPPLE_SCALE,
    height: (PADDING + ICON_SIZE) * MAX_RIPPLE_SCALE,
    alignItems: "center",
    justifyContent: "center",
    top: -Spacing.three,
  },
});
