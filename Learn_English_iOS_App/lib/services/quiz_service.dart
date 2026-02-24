import '../models/quiz_question.dart';
import '../models/vocabulary_word.dart';

List<QuizQuestion> buildQuiz(
  List<VocabularyWord> words, {
  required QuizKind kind,
  int? limit,
}) {
  final eligible = words.where((word) {
    if (word.id == null) return false;
    if (word.meaning.trim().isEmpty) return false;
    if (kind == QuizKind.fillBlank &&
        (word.example.trim().isEmpty ||
            !RegExp(
              '\\b${RegExp.escape(word.word)}\\b',
              caseSensitive: false,
            ).hasMatch(word.example))) {
      return false;
    }
    return true;
  }).toList()..shuffle();

  final questions = <QuizQuestion>[];
  for (final word in eligible) {
    final correct =
        kind == QuizKind.englishToVietnamese || kind == QuizKind.listening
        ? word.meaning
        : word.word;
    final candidates =
        words
            .where(
              (candidate) =>
                  candidate.id != word.id &&
                  candidate.word.toLowerCase() != word.word.toLowerCase() &&
                  (word.partOfSpeech.isEmpty ||
                      candidate.partOfSpeech.isEmpty ||
                      candidate.partOfSpeech == word.partOfSpeech),
            )
            .map(
              (candidate) =>
                  kind == QuizKind.englishToVietnamese ||
                      kind == QuizKind.listening
                  ? candidate.meaning
                  : candidate.word,
            )
            .where(
              (choice) =>
                  choice.trim().isNotEmpty &&
                  choice.toLowerCase() != correct.toLowerCase(),
            )
            .fold(<String, String>{}, (unique, choice) {
              unique.putIfAbsent(choice.toLowerCase(), () => choice);
              return unique;
            })
            .values
            .toList()
          ..shuffle();
    final choices = <String>[correct, ...candidates.take(3)]..shuffle();
    if (choices.length < 2) continue;
    final prompt = switch (kind) {
      QuizKind.englishToVietnamese => word.word,
      QuizKind.vietnameseToEnglish => word.meaning,
      QuizKind.listening => 'Nghe từ rồi chọn đáp án',
      QuizKind.fillBlank => word.example.replaceFirst(
        RegExp('\\b${RegExp.escape(word.word)}\\b', caseSensitive: false),
        '_____',
      ),
    };
    questions.add(
      QuizQuestion(
        wordId: word.id!,
        prompt: prompt,
        answer: correct,
        choices: choices,
        kind: kind,
        speakText: kind == QuizKind.listening ? word.word : null,
      ),
    );
  }
  if (limit != null && questions.length > limit) {
    return questions.take(limit).toList();
  }
  return questions;
}
