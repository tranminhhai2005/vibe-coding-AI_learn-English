class StudyStats {
  const StudyStats({
    required this.totalWords,
    required this.masteredWords,
    required this.dueWords,
    required this.learnedToday,
    required this.questionCount,
    required this.correctCount,
    required this.streakDays,
    required this.dailyActivity,
  });

  final int totalWords;
  final int masteredWords;
  final int dueWords;
  final int learnedToday;
  final int questionCount;
  final int correctCount;
  final int streakDays;
  final List<int> dailyActivity;

  double get accuracy => questionCount == 0 ? 0 : correctCount / questionCount;
}
