import 'package:intl/intl.dart';
import 'package:path/path.dart' as p;
import 'package:sqflite/sqflite.dart';

import '../models/study_stats.dart';
import '../models/vocabulary_word.dart';

class DuplicateWordException implements Exception {
  const DuplicateWordException(this.word);
  final String word;

  @override
  String toString() => 'Từ "$word" đã có trong kho từ vựng.';
}

class AppDatabase {
  AppDatabase({DatabaseFactory? factory, this._path})
    : _factory = factory ?? databaseFactory;

  static final instance = AppDatabase();
  static const _databaseName = 'learn_english.db';
  final DatabaseFactory _factory;
  final String? _path;
  Database? _opened;

  Future<Database> get database async {
    if (_opened != null) return _opened!;
    final dbPath = _path ?? p.join(await getDatabasesPath(), _databaseName);
    _opened = await _factory.openDatabase(
      dbPath,
      options: OpenDatabaseOptions(
        version: 1,
        onConfigure: (db) => db.execute('PRAGMA foreign_keys = ON'),
        onCreate: (db, version) async {
          await db.execute('''
            CREATE TABLE words (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              word TEXT NOT NULL,
              meaning TEXT NOT NULL,
              ipa TEXT NOT NULL DEFAULT '',
              part_of_speech TEXT NOT NULL DEFAULT '',
              example TEXT NOT NULL DEFAULT '',
              example_translation TEXT NOT NULL DEFAULT '',
              image_path TEXT NOT NULL DEFAULT '',
              deck TEXT NOT NULL DEFAULT 'Mặc định',
              alternate_meanings TEXT NOT NULL DEFAULT '[]',
              mastery INTEGER NOT NULL DEFAULT 0,
              correct_count INTEGER NOT NULL DEFAULT 0,
              incorrect_count INTEGER NOT NULL DEFAULT 0,
              last_reviewed TEXT,
              due_at TEXT,
              is_sample INTEGER NOT NULL DEFAULT 0
            )
          ''');
          await db.execute(
            'CREATE UNIQUE INDEX words_unique_word ON words(lower(trim(word)))',
          );
          await db.execute('''
            CREATE TABLE study_events (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              word_id INTEGER,
              correct INTEGER NOT NULL,
              mode TEXT NOT NULL,
              created_at TEXT NOT NULL,
              FOREIGN KEY(word_id) REFERENCES words(id) ON DELETE SET NULL
            )
          ''');
          await db.execute(
            'CREATE INDEX study_events_created_at ON study_events(created_at)',
          );
        },
      ),
    );
    return _opened!;
  }

  Future<List<VocabularyWord>> getWords({
    String search = '',
    String? deck,
    bool dueOnly = false,
  }) async {
    final db = await database;
    final clauses = <String>[];
    final args = <Object?>[];
    if (search.trim().isNotEmpty) {
      clauses.add('(word LIKE ? OR meaning LIKE ?)');
      args
        ..add('%${search.trim()}%')
        ..add('%${search.trim()}%');
    }
    if (deck != null && deck.isNotEmpty) {
      clauses.add('deck = ?');
      args.add(deck);
    }
    if (dueOnly) {
      clauses.add('(due_at IS NULL OR due_at <= ?)');
      args.add(DateTime.now().toIso8601String());
    }
    final rows = await db.query(
      'words',
      where: clauses.isEmpty ? null : clauses.join(' AND '),
      whereArgs: args.isEmpty ? null : args,
      orderBy: 'word COLLATE NOCASE ASC',
    );
    return rows.map(VocabularyWord.fromMap).toList();
  }

  Future<List<String>> getDecks() async {
    final db = await database;
    final rows = await db.rawQuery(
      'SELECT DISTINCT deck FROM words ORDER BY deck COLLATE NOCASE',
    );
    return rows.map((row) => row['deck']! as String).toList();
  }

  Future<int> addWord(VocabularyWord word) async {
    final db = await database;
    final duplicate = await db.rawQuery(
      'SELECT id FROM words WHERE lower(trim(word)) = lower(trim(?)) LIMIT 1',
      [word.word],
    );
    if (duplicate.isNotEmpty) throw DuplicateWordException(word.word);
    return db.insert('words', word.toMap(includeId: false));
  }

  Future<void> updateWord(VocabularyWord word) async {
    if (word.id == null) throw ArgumentError('Không thể sửa từ chưa được lưu.');
    final db = await database;
    final duplicate = await db.rawQuery(
      'SELECT id FROM words WHERE lower(trim(word)) = lower(trim(?)) AND id != ? LIMIT 1',
      [word.word, word.id],
    );
    if (duplicate.isNotEmpty) throw DuplicateWordException(word.word);
    await db.update(
      'words',
      word.toMap(includeId: false),
      where: 'id = ?',
      whereArgs: [word.id],
    );
  }

  Future<void> deleteWord(int id) async {
    final db = await database;
    await db.delete('words', where: 'id = ?', whereArgs: [id]);
  }

  Future<void> deleteWords(Iterable<int> ids) async {
    if (ids.isEmpty) return;
    final db = await database;
    await db.transaction((txn) async {
      final batch = txn.batch();
      for (final id in ids) {
        batch.delete('words', where: 'id = ?', whereArgs: [id]);
      }
      await batch.commit(noResult: true);
    });
  }

  Future<void> recordAnswer({
    required VocabularyWord word,
    required bool correct,
    required String mode,
  }) async {
    final db = await database;
    final now = DateTime.now();
    await db.transaction((txn) async {
      if (word.id != null) {
        final rows = await txn.query(
          'words',
          columns: ['mastery', 'correct_count', 'incorrect_count'],
          where: 'id = ?',
          whereArgs: [word.id],
          limit: 1,
        );
        if (rows.isEmpty) {
          throw StateError('Không tìm thấy từ vựng ${word.id} để ghi kết quả.');
        }
        final current = rows.single;
        final level = (correct ? (current['mastery'] as int) + 1 : 0)
            .clamp(0, 5)
            .toInt();
        const intervalDays = [0, 1, 3, 7, 14, 30];
        final dueAt = correct
            ? now.add(Duration(days: intervalDays[level]))
            : now;
        await txn.update(
          'words',
          {
            'mastery': level,
            'correct_count':
                (current['correct_count'] as int) + (correct ? 1 : 0),
            'incorrect_count':
                (current['incorrect_count'] as int) + (correct ? 0 : 1),
            'last_reviewed': now.toIso8601String(),
            'due_at': dueAt.toIso8601String(),
          },
          where: 'id = ?',
          whereArgs: [word.id],
        );
      }
      await txn.insert('study_events', {
        'word_id': word.id,
        'correct': correct ? 1 : 0,
        'mode': mode,
        'created_at': now.toIso8601String(),
      });
    });
  }

  Future<StudyStats> getStats() async {
    final db = await database;
    final words =
        Sqflite.firstIntValue(
          await db.rawQuery('SELECT COUNT(*) FROM words'),
        ) ??
        0;
    final mastered =
        Sqflite.firstIntValue(
          await db.rawQuery('SELECT COUNT(*) FROM words WHERE mastery >= 4'),
        ) ??
        0;
    final due =
        Sqflite.firstIntValue(
          await db.rawQuery(
            'SELECT COUNT(*) FROM words WHERE due_at IS NULL OR due_at <= ?',
            [DateTime.now().toIso8601String()],
          ),
        ) ??
        0;
    final today = DateFormat('yyyy-MM-dd').format(DateTime.now());
    final learnedToday =
        Sqflite.firstIntValue(
          await db.rawQuery(
            "SELECT COUNT(DISTINCT word_id) FROM study_events WHERE substr(created_at,1,10) = ?",
            [today],
          ),
        ) ??
        0;
    final totals = await db.rawQuery(
      "SELECT COUNT(*) AS total, COALESCE(SUM(correct),0) AS correct FROM study_events WHERE mode != 'flashcard'",
    );
    final totalQuestions = totals.first['total']! as int;
    final correctAnswers = totals.first['correct']! as int;
    final days = await db.rawQuery(
      'SELECT DISTINCT substr(created_at,1,10) AS day FROM study_events ORDER BY day DESC',
    );
    final activityDates = days.map((row) => row['day']! as String).toSet();
    var streak = 0;
    var cursor = DateTime.now();
    if (!activityDates.contains(DateFormat('yyyy-MM-dd').format(cursor))) {
      cursor = cursor.subtract(const Duration(days: 1));
    }
    while (activityDates.contains(DateFormat('yyyy-MM-dd').format(cursor))) {
      streak++;
      cursor = cursor.subtract(const Duration(days: 1));
    }
    final dailyActivity = <int>[];
    for (var offset = 6; offset >= 0; offset--) {
      final date = DateTime.now().subtract(Duration(days: offset));
      final day = DateFormat('yyyy-MM-dd').format(date);
      final count =
          Sqflite.firstIntValue(
            await db.rawQuery(
              'SELECT COUNT(*) FROM study_events WHERE substr(created_at,1,10) = ?',
              [day],
            ),
          ) ??
          0;
      dailyActivity.add(count);
    }
    return StudyStats(
      totalWords: words,
      masteredWords: mastered,
      dueWords: due,
      learnedToday: learnedToday,
      questionCount: totalQuestions,
      correctCount: correctAnswers,
      streakDays: streak,
      dailyActivity: dailyActivity,
    );
  }

  Future<List<VocabularyWord>> getWordsToReview({int limit = 8}) async {
    final db = await database;
    final rows = await db.query(
      'words',
      where: 'due_at IS NULL OR due_at <= ?',
      whereArgs: [DateTime.now().toIso8601String()],
      orderBy: 'mastery ASC, incorrect_count DESC, word COLLATE NOCASE',
      limit: limit,
    );
    return rows.map(VocabularyWord.fromMap).toList();
  }

  Future<int> insertWordsSkippingDuplicates(
    Iterable<VocabularyWord> words,
  ) async {
    final db = await database;
    return db.transaction((txn) async {
      var inserted = 0;
      for (final word in words) {
        final found = await txn.rawQuery(
          'SELECT id FROM words WHERE lower(trim(word)) = lower(trim(?)) LIMIT 1',
          [word.word],
        );
        if (found.isEmpty) {
          await txn.insert('words', word.toMap(includeId: false));
          inserted++;
        }
      }
      return inserted;
    });
  }

  Future<void> restoreBackup(Map<String, Object?> backup) async {
    final rawWords = backup['words'];
    if (backup['format'] != 'learn-english-backup-v1' || rawWords is! List) {
      throw const FormatException('Tệp sao lưu không đúng định dạng.');
    }
    final parsed = rawWords.map((raw) {
      if (raw is! Map) {
        throw const FormatException('Bản ghi từ vựng không hợp lệ.');
      }
      final word = VocabularyWord.fromMap(Map<String, Object?>.from(raw));
      if (word.word.trim().isEmpty || word.meaning.trim().isEmpty) {
        throw const FormatException(
          'Mỗi bản ghi sao lưu cần có từ tiếng Anh và nghĩa tiếng Việt.',
        );
      }
      return word;
    }).toList();
    final rawEvents = backup['events'];
    if (rawEvents != null && rawEvents is! List) {
      throw const FormatException(
        'Lịch sử học trong tệp sao lưu không hợp lệ.',
      );
    }
    if (rawEvents is List) {
      for (final raw in rawEvents) {
        if (raw is! Map ||
            (raw['correct'] != 0 && raw['correct'] != 1) ||
            raw['mode'] is! String ||
            raw['created_at'] is! String ||
            DateTime.tryParse(raw['created_at'] as String) == null ||
            (raw['word_id'] != null && raw['word_id'] is! int)) {
          throw const FormatException(
            'Một bản ghi lịch sử học trong tệp sao lưu không hợp lệ.',
          );
        }
      }
    }
    final db = await database;
    await db.transaction((txn) async {
      final restoredIds = <int, int>{};
      for (final word in parsed) {
        final existing = await txn.rawQuery(
          'SELECT id FROM words WHERE lower(trim(word)) = lower(trim(?)) LIMIT 1',
          [word.word],
        );
        final id = existing.isEmpty
            ? await txn.insert('words', word.toMap(includeId: false))
            : existing.first['id']! as int;
        if (word.id != null) restoredIds[word.id!] = id;
      }
      if (rawEvents is List) {
        for (final raw in rawEvents) {
          final event = raw as Map;
          final oldWordId = event['word_id'];
          final mappedWordId = oldWordId is int ? restoredIds[oldWordId] : null;
          final correct = event['correct'] as int;
          final mode = event['mode'] as String;
          final createdAt = event['created_at'] as String;
          final duplicate = await txn.rawQuery(
            'SELECT id FROM study_events WHERE word_id IS ? AND correct = ? AND mode = ? AND created_at = ? LIMIT 1',
            [mappedWordId, correct, mode, createdAt],
          );
          if (duplicate.isNotEmpty) continue;
          await txn.insert('study_events', {
            'word_id': mappedWordId,
            'correct': correct,
            'mode': mode,
            'created_at': createdAt,
          });
        }
      }
    });
  }

  Future<Map<String, Object?>> exportBackup() async {
    final db = await database;
    return {
      'format': 'learn-english-backup-v1',
      'exported_at': DateTime.now().toIso8601String(),
      'words': await db.query('words', orderBy: 'id'),
      'events': await db.query(
        'study_events',
        columns: ['word_id', 'correct', 'mode', 'created_at'],
        orderBy: 'id',
      ),
    };
  }

  Future<void> clearAll() async {
    final db = await database;
    await db.transaction((txn) async {
      await txn.delete('study_events');
      await txn.delete('words');
    });
  }

  Future<void> close() async {
    await _opened?.close();
    _opened = null;
  }
}
