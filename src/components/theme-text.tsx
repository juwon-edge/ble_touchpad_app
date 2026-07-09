import { useTheme } from "@/hooks/use-theme";
import { Text, TextProps } from "react-native";

const ThemedText = (props: TextProps) => {
  const theme = useTheme();
  return <Text {...props} style={[{ color: theme.text }, props.style]} />;
};

export default ThemedText;
