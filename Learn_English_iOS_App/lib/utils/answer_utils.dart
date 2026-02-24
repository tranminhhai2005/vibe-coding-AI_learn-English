String normalizeAnswer(String value) {
  return value
      .toLowerCase()
      .trim()
      .replaceAll(RegExp(r'''[.,!?;:"'()\[\]{}]'''), ' ')
      .replaceAll(RegExp(r'\s+'), ' ')
      .trim();
}

bool answerMatches(String input, Iterable<String> acceptedAnswers) {
  final normalized = normalizeAnswer(input);
  if (normalized.isEmpty) return false;
  return acceptedAnswers.any((answer) => normalizeAnswer(answer) == normalized);
}

int editDistance(String a, String b) {
  final left = a.toLowerCase();
  final right = b.toLowerCase();
  var previous = List<int>.generate(right.length + 1, (i) => i);
  for (var i = 1; i <= left.length; i++) {
    final current = List<int>.filled(right.length + 1, 0)..[0] = i;
    for (var j = 1; j <= right.length; j++) {
      final cost = left[i - 1] == right[j - 1] ? 0 : 1;
      current[j] = [
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost,
      ].reduce((x, y) => x < y ? x : y);
    }
    previous = current;
  }
  return previous.last;
}
