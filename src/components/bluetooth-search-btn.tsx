import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type Props = {
  onStartSearch: () => void;
  isSearching: boolean;
  disabled: boolean;
};
interface AnimatedRippleProps {
  delayms?: number;
  active: boolean;
}
const ICON_SIZE = 48;
const PADDING = Spacing.twoHalf;
const MAX_RIPPLE_SCALE = 4;

const AnimatedRipple = ({ delayms = 0, active }: AnimatedRippleProps) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const theme = useTheme();
  useEffect(() => {
    if (!active) {
      cancelAnimation(scale);
      cancelAnimation(opacity);

      scale.value = withSpring(1, { duration: 400 });
      opacity.value = withSpring(1, { duration: 400 });
      return;
    }
    scale.value = withDelay(
      delayms,
      withRepeat(
        withTiming(MAX_RIPPLE_SCALE, {
          duration: 2000,
        }),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(
      delayms,
      withRepeat(
        withTiming(0, {
          duration: 2000,
        }),
        -1,
        false,
      ),
    );
  }, [active, delayms, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          zIndex: -10,
          width: PADDING + ICON_SIZE,
          height: PADDING + ICON_SIZE,
          borderRadius: (PADDING + ICON_SIZE) / 2,
          borderWidth: 2,
          borderColor: theme.accent,
        },
        animatedStyle,
      ]}
    />
  );
};

const BTSearchBtn = (props: Props) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, props.disabled && { opacity: 0.4 }]}>
      <AnimatedRipple active={props.isSearching} />
      <AnimatedRipple delayms={750} active={props.isSearching} />
      <AnimatedRipple delayms={1500} active={props.isSearching} />
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
