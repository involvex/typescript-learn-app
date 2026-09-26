import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Lang } from "../lib/types";
import type { QuizItem } from "../lib/types";
import { qx, qxList } from "../lib/types";
import { useTheme } from "../lib/theme";

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
  const { colors } = useTheme();
  const q = qx(quiz, lang, "q");
  const options = qxList(quiz, lang);
  const explain = qx(quiz, lang, "explain");

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    onAnswer?.(i === quiz.answer);
  };

  return (
    <View style={[styles.box, { backgroundColor: colors.quizBox }]}>
      <Text style={[styles.q, { color: colors.text }]}>{q}</Text>
      {options.map((opt, i) => {
        const isAnswer = i === quiz.answer;
        const isPicked = i === picked;
        return (
          <Pressable
            key={opt}
            onPress={() => pick(i)}
            style={[
              styles.opt,
              { backgroundColor: colors.card, borderColor: colors.border },
              picked !== null &&
                isAnswer && {
                  borderColor: colors.success,
                  backgroundColor: colors.successBg,
                },
              isPicked &&
                !isAnswer && {
                  borderColor: colors.danger,
                  backgroundColor: colors.dangerBg,
                },
            ]}
          >
            <Text style={[styles.optText, { color: colors.text }]}>{opt}</Text>
          </Pressable>
        );
      })}
      {picked !== null ? (
        <Text style={[styles.explain, { color: colors.sub }]}>
          {picked === quiz.answer ? "✅ " : "❌ "}
          {explain}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 12, padding: 14, marginVertical: 8 },
  q: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  opt: {
    borderRadius: 10,
    padding: 14,
    marginVertical: 5,
    borderWidth: 1,
    minHeight: 52,
    justifyContent: "center",
  },
  optText: { fontSize: 15 },
  explain: { marginTop: 8, fontSize: 14 },
});
