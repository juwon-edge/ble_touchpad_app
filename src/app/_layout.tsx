import BLEStateProvider from "@/components/ble-state-provider";
import ConnectionStateProvider from "@/components/connection-state-provider";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { useColorScheme } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <BLEStateProvider>
        <ConnectionStateProvider>
          <Stack
            screenOptions={{
              animation: "slide_from_right",
              headerShown: false,
            }}
          />
        </ConnectionStateProvider>
      </BLEStateProvider>
    </ThemeProvider>
  );
}
