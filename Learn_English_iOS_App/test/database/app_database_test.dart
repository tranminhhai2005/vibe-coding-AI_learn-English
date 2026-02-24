import 'package:flutter_test/flutter_test.dart';
import 'package:learn_english_ios_app/database/app_database.dart';
import 'package:learn_english_ios_app/models/vocabulary_word.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';

void main() {
  late AppDatabase database;

  setUpAll(sqfliteFfiInit);

  setUp(() {
    database = AppDatabase(
      factory: databaseFactoryFfi,
      path: inMemoryDatabasePath,
    );
  });

  tearDown(() => database.close());

  test('adds, reads, edits, and deletes a word', () async {
    final id = await database.addWord(
      const VocabularyWord(word: 'apple', meaning: 'quả táo'),
    );
    expect((await database.getWords()).single.word, 'apple');

    await database.updateWord(
      const VocabularyWord(id: 1, word: 'apple', meaning: 'trái táo'),
    );
    expect((await database.getWords()).single.meaning, 'trái táo');

    await database.deleteWord(id);
    expect(await database.getWords(), isEmpty);
  });

  test('rejects duplicate words without regard to case', () async {
    await database.addWord(
      const VocabularyWord(word: 'apple', meaning: 'quả táo'),
    );
    await expectLater(
      database.addWord(
        const VocabularyWord(word: ' Apple ', meaning: 'trái táo'),
      ),
      throwsA(isA<DuplicateWordException>()),
    );
  });

  test(
    'persists answer history and advances spaced-repetition state',
    () async {
      final id = await database.addWord(
        const VocabularyWord(word: 'book', meaning: 'quyển sách'),
      );
      final word = (await database.getWords()).single;
      await database.recordAnswer(word: word, correct: false, mode: 'test');
      await database.recordAnswer(word: word, correct: true, mode: 'test');

      final updated = (await database.getWords()).single;
      final stats = await database.getStats();
      expect(updated.id, id);
      expect(updated.correctCount, 1);
      expect(updated.incorrectCount, 1);
      expect(updated.mastery, 1);
      expect(updated.dueAt, isNotNull);
      expect(stats.questionCount, 2);
      expect(stats.correctCount, 1);
    },
  );

  test('restores a backup and skips existing vocabulary', () async {
    await database.addWord(
      const VocabularyWord(word: 'apple', meaning: 'quả táo'),
    );
    final backup = {
      'format': 'learn-english-backup-v1',
      'words': [
        const VocabularyWord(
          id: 10,
          word: 'apple',
          meaning: 'không ghi đè',
        ).toMap(),
        const VocabularyWord(id: 11, word: 'bread', meaning: 'bánh mì').toMap(),
      ],
      'events': [
        {
          'word_id': 11,
          'correct': 1,
          'mode': 'backup',
          'created_at': DateTime.now().toIso8601String(),
        },
      ],
    };
    await database.restoreBackup(backup);
    await database.restoreBackup(backup);

    final words = await database.getWords();
    expect(words, hasLength(2));
    expect(words.firstWhere((word) => word.word == 'apple').meaning, 'quả táo');
    expect((await database.getStats()).questionCount, 1);
  });
}
