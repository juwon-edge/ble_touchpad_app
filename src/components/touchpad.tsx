import { Sizing, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { blemanager } from "@/utils/ble-touchpad-manager";
import { splitMovement } from "@/utils/helper";
import { TouchpadButton, TouchpadReport } from "@/utils/types";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useAnimatedReaction, useSharedValue } from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";

/**
 * TODO:Fix scrolling
 * TODO:Make the mouse keyboard switch button more usable
 * TODO:Make keyboard input more reliable and less likely to fail
 */

const GESTURE_LOCK = { NONE: 0, SCROLL: 1, PINCH: 2 };
const DEAD_ZONE = 3; // px, ignore tiny jitter before locking
const PINCH_RATIO = 0.6; // distance change vs centroid change to call it a pinch

function useTwoFingerGesture({
  onScroll,
  onPinch,
}: {
  onScroll: (delta: number) => void;
  onPinch: (delta: number) => void;
}) {
  const prevDistance = useSharedValue(0);
  const prevCentroidY = useSharedValue(0);
  const lock = useSharedValue(GESTURE_LOCK.NONE);

  const gesture = Gesture.Pan()
    .minPointers(2)
    .maxPointers(2)
    .onTouchesMove((e) => {
      if (e.allTouches.length !== 2) return;
      const [t1, t2] = e.allTouches;

      const distance = Math.hypot(t1.x - t2.x, t1.y - t2.y);
      const centroidY = (t1.y + t2.y) / 2;

      if (prevDistance.value === 0) {
        // first frame of this gesture, just seed values
        prevDistance.value = distance;
        prevCentroidY.value = centroidY;
        return;
      }

      const distanceDelta = distance - prevDistance.value;
      const centroidDelta = centroidY - prevCentroidY.value;

      prevDistance.value = distance;
      prevCentroidY.value = centroidY;

      // not enough movement yet to classify — avoids jitter-triggered locks
      if (
        Math.abs(distanceDelta) < DEAD_ZONE &&
        Math.abs(centroidDelta) < DEAD_ZONE
      ) {
        return;
      }

      // lock the gesture type on first significant movement, keep it until fingers lift
      if (lock.value === GESTURE_LOCK.NONE) {
        lock.value =
          Math.abs(distanceDelta) > Math.abs(centroidDelta) * PINCH_RATIO
            ? GESTURE_LOCK.PINCH
            : GESTURE_LOCK.SCROLL;
      }

      if (lock.value === GESTURE_LOCK.SCROLL) {
        runOnJS(onScroll)(centroidDelta);
      } else {
        runOnJS(onPinch)(distanceDelta);
      }
    })
    .onTouchesUp((e) => {
      if (e.allTouches.length < 2) {
        // reset for next gesture
        prevDistance.value = 0;
        prevCentroidY.value = 0;
        lock.value = GESTURE_LOCK.NONE;
      }
    });

  return gesture;
}

const SENSITIVITY = 1.8;

const sendTap = (
  activeButton: TouchpadButton,
  clickType: TouchpadButton,
  clickCount = 1,
) => {
  blemanager.sendTouchpadClickReport(
    activeButton,
    clickType,
    clickCount,
    false,
  );
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
    .onTouchesDown(() => onTouchStart())
    .onTouchesUp(() => onTouchEnd());

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
    },
  );

  const cursorMove = Gesture.Pan()
    .maxPointers(1)
    .onChange((event) => {
      // eslint-disable-next-line react-hooks/immutability
      mouseDx.value += event.changeX * SENSITIVITY;
      // eslint-disable-next-line react-hooks/immutability
      mouseDy.value += event.changeY * SENSITIVITY;
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
      <View style={styles.buttonContainer}>
        <TouchPadBtn
          onTouchStart={() => {
            "worklet";
            activeButton.set(
              (activeButton) => activeButton | TouchpadButton.LEFT,
            );
            runOnJS(sendTap)(activeButton.value, TouchpadButton.LEFT, 1);
          }}
          onTouchEnd={() => {
            "worklet";
            activeButton.set(
              (activeButton) => activeButton & ~TouchpadButton.LEFT,
            );
            runOnJS(sendTap)(activeButton.value, 0, 1);
          }}
        />
        <TouchPadBtn
          onTouchStart={() => {
            "worklet";
            activeButton.set(
              (activeButton) => activeButton | TouchpadButton.RIGHT,
            );
            runOnJS(sendTap)(activeButton.value, TouchpadButton.RIGHT, 1);
          }}
          onTouchEnd={() => {
            "worklet";
            activeButton.set(
              (activeButton) => activeButton & ~TouchpadButton.RIGHT,
            );
            runOnJS(sendTap)(activeButton.value, 0, 1);
          }}
        />
      </View>
      <GestureDetector gesture={gestures}>
        <View style={[{ backgroundColor: theme.text }, styles.touchpad]} />
      </GestureDetector>
    </View>
  );
};

export default Touchpad;

const styles = StyleSheet.create({
  conatainer: {
    flex: 1,
    gap: Spacing.twoHalf,
  },
  buttonContainer: {
    gap: Spacing.twoHalf,
    height: "17%",
    flexDirection: "row",
  },
  touchpad: {
    flex: 1,
    borderRadius: Sizing.sm,
    opacity: 0.6,
  },
});
