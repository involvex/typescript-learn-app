import { ScrollView, StyleSheet, Text } from "react-native";

export function CodeBlock({ code }: { code: string }) {
  return (
    <ScrollView
      horizontal
      style={styles.box}
      showsHorizontalScrollIndicator={false}
    >
      <Text style={styles.code}>{code}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: "#0d1117",
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    maxHeight: 220,
  },
  code: {
    color: "#e6edf3",
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 19,
  },
});
