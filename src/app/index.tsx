/*TODO: for final build, add
- location checks 
- remove unused images and modules
- update App name and maybe icons
- do automatic reconnect with aysnc storage
*/

/*TODO: Things to learn about after i am done
- how threads work in RN
- what is metro bundler
*/
import BLEScan from "@/components/ble-scan";
import { ConnectionStateContext } from "@/components/connection-state-provider";
import InputModeToggle from "@/components/input-mode-toggle";
import Keyboard from "@/components/keyboard";
import Touchpad from "@/components/touchpad";
import { Spacing } from "@/constants/theme";
import { requestBLEPermissions } from "@/utils/helper";
import { use, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

//TODO: check if the user is already connected to it
//TODO: try to disconnect on leaving
//TODO: add cancel search button

export default function Index() {
  const connectionState = use(ConnectionStateContext);
  const [inputMode, setInputMode] = useState<"touchpad" | "keyboard">(
    "touchpad",
  );

  useEffect(() => {
    requestBLEPermissions();
  }, []);

  if (connectionState === "idle") return <BLEScan />;

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.screenContent}>
          {inputMode === "keyboard" ? <Keyboard /> : <Touchpad />}

          <InputModeToggle
            inputMode={inputMode}
            onToggle={() =>
              setInputMode((currentMode) =>
                currentMode === "touchpad" ? "keyboard" : "touchpad",
              )
            }
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.twoHalf,
  },
  safeArea: {
    flex: 1,
  },
  screenContent: {
    flex: 1,
    position: "relative",
  },
});
