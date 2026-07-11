import { useCallback, useState } from "react";
import { KeyboardAvoidingView, StyleSheet, TextInput } from "react-native";

const Keyboard = () => {
  const [text, setText] = useState("");

  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
  }, []);

  return (
    <KeyboardAvoidingView style={styles.container}>
      <TextInput
        style={styles.keyboard}
        value={text}
        onChangeText={handleTextChange}
      />
    </KeyboardAvoidingView>
  );
};

export default Keyboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  keyboard: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
  },
});
