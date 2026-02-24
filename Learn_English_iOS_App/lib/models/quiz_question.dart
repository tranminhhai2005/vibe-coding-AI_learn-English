class QuizQuestion {
  const QuizQuestion({
    required this.wordId,
    required this.prompt,
    required this.answer,
    required this.choices,
    required this.kind,
    this.speakText,
  });

  final int wordId;
  final String prompt;
  final String answer;
  final List<String> choices;
  final QuizKind kind;
  final String? speakText;
}

enum QuizKind { englishToVietnamese, vietnameseToEnglish, listening, fillBlank }
