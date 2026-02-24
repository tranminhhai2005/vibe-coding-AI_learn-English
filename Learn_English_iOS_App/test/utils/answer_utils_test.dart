import 'package:flutter_test/flutter_test.dart';
import 'package:learn_english_ios_app/utils/answer_utils.dart';
import 'package:learn_english_ios_app/utils/offline_spelling.dart';

void main() {
  test('normalizes case, punctuation, and whitespace for answers', () {
    expect(answerMatches('  QUẢ táo! ', ['quả táo']), isTrue);
    expect(answerMatches('  APPLE. ', ['apple']), isTrue);
    expect(answerMatches('quả nho', ['quả táo']), isFalse);
  });

  test('returns suggestions without applying them automatically', () {
    final suggestion = suggestSpelling('famly');
    expect(suggestion, contains('family'));
    expect(suggestSpelling('family'), isEmpty);
  });
}
