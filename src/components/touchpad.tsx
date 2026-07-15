import { Sizing, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { blemanager } from "@/utils/ble_touchpad_manager";
import { splitMovement } from "@/utils/helper";
import { TouchpadButton, TouchpadReport } from "@/utils/types";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useAnimatedReaction, useSharedValue } from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";

/** TODO:
 * Fix scrolling
 */

const SENSITIVITY = 1.8;

const sendTap = (
  activeButton: TouchpadButton,
  clickType: TouchpadButton,
  clickCount = 1,
) => {
  blemanager.sendTouchpadClickReport(activeButton, clickType, clickCount);
};

const sendReport = (touchpad_reports: TouchpadReport[]) => {
  blemanager.sendTouchpadReports(touchpad_reports);
};

interface TouchPadBtnProps {
  onTouchStart: () => void;
  onTouchEnd: () => void;
}
const TouchPadBtn = ({ onTouchStart, onTouchEnd }: TouchPadBtnProps) => {
  const theme = useTheme();
  const pan = Gesture.Manual()
    .onTouchesDown(() => runOnJS(onTouchStart)())
    .onTouchesUp(() => runOnJS(onTouchEnd)());

  return (
    <GestureDetector gesture={pan}>
      <View style={[{ backgroundColor: theme.text }, styles.touchpad]} />
    </GestureDetector>
  );
};

const Touchpad = () => {
  const theme = useTheme();
  const activeButton = useSharedValue<TouchpadButton>(TouchpadButton.NONE);
  const mouseDx = useSharedValue(0);
  const mouseDy = useSharedValue(0);
  const lastUpdate = useSharedValue(0);
  const remDx = useSharedValue(0);
  const remDy = useSharedValue(0);

  useAnimatedReaction(
    () => lastUpdate.value,
    (updateCount) => {
      if (updateCount % 3 !== 0) return;
      const startTime = performance.now();

      const mouseDxValue = mouseDx.value + remDx.value;
      const mouseDyValue = mouseDy.value + remDy.value;
      mouseDx.value = 0;
      mouseDy.value = 0;

      const dx =
        Math.abs(mouseDxValue) > 0 && Math.abs(mouseDxValue) < 1
          ? Math.round(mouseDxValue)
          : Math.trunc(mouseDxValue);
      const dy =
        Math.abs(mouseDyValue) > 0 && Math.abs(mouseDyValue) < 1
          ? Math.round(mouseDyValue)
          : Math.trunc(mouseDyValue);

      const splittedCoord = splitMovement(dx, dy, 3);
      const touchpad_reports: TouchpadReport[] = [];
      for (const [coordDx, coordDy] of splittedCoord) {
        touchpad_reports.push({
          buttons: activeButton.value,
          dx: coordDx,
          dy: coordDy,
          scrollX: 0,
          scrollY: 0,
        });
      }

      remDx.value = mouseDxValue - dx;
      remDy.value = mouseDyValue - dy;

      runOnJS(sendReport)(touchpad_reports);
      console.log(
        `Listener callback took ${performance.now() - startTime} milliseconds`,
      );
    },
  );

  const cursorMove = Gesture.Pan()
    .maxPointers(1)
    .onChange((event) => {
      // eslint-disable-next-line react-hooks/immutability
      mouseDx.value += event.changeY * SENSITIVITY;
      // eslint-disable-next-line react-hooks/immutability
      mouseDy.value += event.changeX * -SENSITIVITY;
      // eslint-disable-next-line react-hooks/immutability
      lastUpdate.value++;
    });

  const scroll = Gesture.Pan()
    .minPointers(2)
    .maxPointers(2)
    .onStart((event) => {});

  const singleTap = Gesture.Tap().onStart(() => {
    runOnJS(sendTap)(activeButton.value, TouchpadButton.LEFT);
    console.log("Single tap activated");
  });

  const twoFingerSingleTap = Gesture.Tap()
    .minPointers(2)
    .onStart(() => {
      runOnJS(sendTap)(activeButton.value, TouchpadButton.RIGHT);
      console.log("two finger tap activated");
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      runOnJS(sendTap)(activeButton.value, TouchpadButton.LEFT, 2);
      console.log("Double tap activated");
    });

  const tripleTap = Gesture.Tap()
    .numberOfTaps(3)
    .onStart(() => {
      runOnJS(sendTap)(activeButton.value, TouchpadButton.LEFT, 3);
      console.log("Triple tap activated");
    });

  const quadTap = Gesture.Tap()
    .numberOfTaps(4)
    .onStart(() => {
      runOnJS(sendTap)(activeButton.value, TouchpadButton.LEFT, 4);
      console.log("Quadtruple tap activated");
    });

  const tap = Gesture.Exclusive(
    quadTap,
    tripleTap,
    doubleTap,
    twoFingerSingleTap,
    singleTap,
  );

  const gestures = Gesture.Race(cursorMove, scroll, tap);

  return (
    <View style={styles.conatainer}>
      <GestureDetector gesture={gestures}>
        <View style={[{ backgroundColor: theme.text }, styles.touchpad]} />
      </GestureDetector>
      <View style={styles.buttonContainer}>
        <TouchPadBtn
          onTouchStart={() => {
            activeButton.set((prev) => prev | TouchpadButton.LEFT);
            sendTap(activeButton.value, 0);
            console.log("Left click enter");
          }}
          onTouchEnd={() => {
            activeButton.set((prev) => prev & ~TouchpadButton.LEFT);
            sendTap(activeButton.value, 0);
            console.log("Left click leave");
          }}
        />
        <TouchPadBtn
          onTouchStart={() => {
            activeButton.set((prev) => prev | TouchpadButton.RIGHT);
            sendTap(activeButton.value, 0);
            console.log("Right click enter");
          }}
          onTouchEnd={() => {
            activeButton.set((prev) => prev & ~TouchpadButton.RIGHT);
            sendTap(activeButton.value, 0);
            console.log("Right click leave");
          }}
        />
      </View>
    </View>
  );
};

export default Touchpad;

const styles = StyleSheet.create({
  conatainer: {
    flex: 1,
    flexDirection: "row",
    gap: Spacing.twoHalf,
  },
  buttonContainer: { gap: Spacing.twoHalf, width: "17%" },
  touchpad: {
    flex: 1,
    borderRadius: Sizing.sm,
    opacity: 0.6,
  },
});
