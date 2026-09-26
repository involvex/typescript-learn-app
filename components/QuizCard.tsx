import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Lang } from "../lib/types";
import type { QuizItem } from "../lib/types";
import { qx, qxList } from "../lib/types";

export function QuizCard({
  quiz,
  lang,
  onAnswer,
}: {
  quiz: QuizItem;
  lang: Lang;
  onAnswer?: (correct: boolean) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const q = qx(quiz, lang, "q");
  const options = qxList(quiz, lang);
  const explain = qx(quiz, lang, "explain");

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    onAnswer?.(i === quiz.answer);
  };

  return (
    <View style={styles.box}>
      <Text style={styles.q}>{q}</Text>
      {options.map((opt, i) => {
        const isAnswer = i === quiz.answer;
        const isPicked = i === picked;
        return (
          <Pressable
            key={opt}
            onPress={() => pick(i)}
            style={[
              styles.opt,
              picked !== null && isAnswer && styles.optCorrect,
              isPicked && !isAnswer && styles.optWrong,
            ]}
          >
            <Text style={styles.optText}>{opt}</Text>
          </Pressable>
        );
      })}
      {picked !== null ? (
        <Text style={styles.explain}>
          {picked === quiz.answer ? "✅ " : "❌ "}
          {explain}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 14,
    marginVertical: 8,
  },
  q: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  opt: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    minHeight: 52,
    justifyContent: "center",
  },
  optCorrect: { borderColor: "#22c55e", backgroundColor: "#f0fdf4" },
  optWrong: { borderColor: "#ef4444", backgroundColor: "#fef2f2" },
  optText: { fontSize: 15 },
  explain: { marginTop: 8, fontSize: 14, color: "#334155" },
});
