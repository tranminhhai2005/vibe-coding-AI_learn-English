import 'package:flutter_test/flutter_test.dart';
import 'package:learn_english_ios_app/models/quiz_question.dart';
import 'package:learn_english_ios_app/models/vocabulary_word.dart';
import 'package:learn_english_ios_app/services/quiz_service.dart';

void main() {
  final words = [
    const VocabularyWord(
      id: 1,
      word: 'apple',
      meaning: 'quả táo',
      example: 'I eat an apple.',
    ),
    const VocabularyWord(
      id: 2,
      word: 'book',
      meaning: 'quyển sách',
      example: 'I read a book.',
    ),
    const VocabularyWord(
      id: 3,
      word: 'water',
      meaning: 'nước',
      example: 'Drink water every day.',
    ),
    const VocabularyWord(
      id: 4,
      word: 'bread',
      meaning: 'bánh mì',
      example: 'We buy fresh bread.',
    ),
  ];

  test('creates distinct multiple-choice options from the vocabulary bank', () {
    final questions = buildQuiz(words, kind: QuizKind.englishToVietnamese);
    expect(questions, hasLength(4));
    for (final question in questions) {
      expect(question.choices, hasLength(4));
      expect(question.choices.toSet(), hasLength(4));
      expect(question.choices, contains(question.answer));
    }
  });

  test(
    'only creates fill-in questions from stored examples containing the word',
    () {
      final questions = buildQuiz(words, kind: QuizKind.fillBlank);
      expect(questions, hasLength(4));
      expect(
        questions.every((question) => question.prompt.contains('_____')),
        isTrue,
      );
    },
  );

  test('skips questions when there are not enough distinct choices', () {
    final questions = buildQuiz([
      words.first,
      words.first.copyWith(id: 5, word: 'fruit'),
    ], kind: QuizKind.englishToVietnamese);
    expect(questions, isEmpty);
  });
}
