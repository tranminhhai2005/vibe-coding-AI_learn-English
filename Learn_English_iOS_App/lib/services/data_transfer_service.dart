import 'dart:convert';
import 'dart:io';

import 'package:csv/csv.dart';
import 'package:file_picker/file_picker.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

import '../database/app_database.dart';

class DataTransferService {
  const DataTransferService();

  Future<void> exportJson() async {
    final backup = await AppDatabase.instance.exportBackup();
    final file = await _write(
      'learn_english_backup.json',
      const JsonEncoder.withIndent('  ').convert(backup),
    );
    await _share(file, 'Sao lưu Learn English');
  }

  Future<void> exportCsv() async {
    final words = await AppDatabase.instance.getWords();
    final rows = <List<String>>[
      [
        'word',
        'meaning',
        'ipa',
        'part_of_speech',
        'example',
        'example_translation',
        'deck',
        'alternate_meanings',
      ],
      for (final word in words)
        [
          word.word,
          word.meaning,
          word.ipa,
          word.partOfSpeech,
          word.example,
          word.exampleTranslation,
          word.deck,
          word.alternateMeanings.join(';'),
        ],
    ];
    final file = await _write(
      'learn_english_words.csv',
      const CsvEncoder().convert(rows),
    );
    await _share(file, 'Từ vựng Learn English');
  }

  Future<void> restoreJson(PlatformFile selected) async {
    final path = selected.path;
    final content = path != null
        ? await File(path).readAsString()
        : utf8.decode(await selected.readAsBytes(), allowMalformed: true);
    final decoded = jsonDecode(content);
    if (decoded is! Map) {
      throw const FormatException('Tệp JSON không đúng định dạng.');
    }
    await AppDatabase.instance.restoreBackup(
      Map<String, Object?>.from(decoded),
    );
  }

  Future<File> _write(String name, String contents) async {
    final directory = await getTemporaryDirectory();
    final file = File('${directory.path}/$name');
    return file.writeAsString(contents, flush: true);
  }

  Future<void> _share(File file, String subject) async {
    await SharePlus.instance.share(
      ShareParams(files: [XFile(file.path)], subject: subject),
    );
  }
}
