import { useTheme } from "@/hooks/use-theme";
import { useEffect } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  AnimatedStyle,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface Options {
  expansionDuration: number;
}

interface Props {
  delayms?: number;
  active: boolean;
  size: number;
  maxScale: number;
  style?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
  options?: Options;
}

const AnimatedRipple = ({
  delayms = 0,
  active,
  size,
  maxScale,
  style,
  options,
}: Props) => {
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
        withTiming(maxScale, {
          duration: options?.expansionDuration || 2000,
        }),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(
      delayms,
      withRepeat(
        withTiming(0, {
          duration: options?.expansionDuration || 2000,
        }),
        -1,
        false,
      ),
    );
  }, [active, delayms, maxScale, opacity, options?.expansionDuration, scale]);

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
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: theme.accent,
        },
        style,
        animatedStyle,
      ]}
    />
  );
};

export default AnimatedRipple;
