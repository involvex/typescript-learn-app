import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Lang } from "../lib/types";
import type { QuizItem } from "../lib/types";
import { qx, qxList } from "../lib/types";
import { useTheme } from "../lib/theme";
import { useLang } from "../lib/i18n";
import { useProgress } from "../lib/progress";

export function QuizCard({
  quiz,
  lang,
  lessonId,
  qi,
  retry,
  onAnswer,
}: {
  quiz: QuizItem;
  lang: Lang;
  lessonId: string;
  qi: number;
  /** when true, a wrong answer can be retried instead of locking */
  retry?: boolean;
  onAnswer?: (correct: boolean) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const { colors } = useTheme();
  const { t } = useLang();
  const { recordAnswer } = useProgress();
  const q = qx(quiz, lang, "q");
  const options = qxList(quiz, lang);
  const explain = qx(quiz, lang, "explain");

  const locked = picked !== null && (!retry || picked === quiz.answer);

  const pick = (i: number) => {
    if (locked) return;
    setPicked(i);
    const correct = i === quiz.answer;
    recordAnswer(lessonId, qi, correct);
    onAnswer?.(correct);
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
      {retry && picked !== null && picked !== quiz.answer ? (
        <Pressable
          onPress={() => setPicked(null)}
          style={[styles.retry, { backgroundColor: colors.chip }]}
        >
          <Text style={[styles.retryTxt, { color: colors.text }]}>
            {t("retry")}
          </Text>
        </Pressable>
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
  retry: {
    marginTop: 10,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  retryTxt: { fontWeight: "700" },
});
