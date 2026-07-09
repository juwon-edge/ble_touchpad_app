import { Sizing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Linking, Platform, StyleSheet, Text } from "react-native";

type Props = {
  page: string;
  children: React.ReactNode;
};
const isAndroid = Platform.OS === "android";

const AppSettingsLink = (props: Props) => {
  const theme = useTheme();
  return (
    <Text
      onPress={() => {
        if (isAndroid) Linking.sendIntent(props.page);
        else Linking.openSettings();
      }}
      style={[{ color: theme.accent }, styles.linkText]}
    >
      {props.children}
    </Text>
  );
};

export default AppSettingsLink;

const styles = StyleSheet.create({
  linkText: { textDecorationLine: "underline", fontSize: Sizing.md },
});
