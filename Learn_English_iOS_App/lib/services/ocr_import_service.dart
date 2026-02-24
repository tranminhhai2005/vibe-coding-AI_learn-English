import 'dart:convert';
import 'dart:io';

import 'package:csv/csv.dart';
import 'package:file_picker/file_picker.dart';
import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pdfx/pdfx.dart';

import '../models/vocabulary_word.dart';
import '../utils/offline_spelling.dart';

class ImportCandidate {
  ImportCandidate({
    required this.originalWord,
    required this.word,
    this.meaning = '',
    this.ipa = '',
    this.partOfSpeech = '',
    this.example = '',
    this.exampleTranslation = '',
    this.deck = 'Mặc định',
    this.alternateMeanings = const [],
    this.selected = true,
  }) : sourceMeaning = meaning,
       sourceIpa = ipa,
       sourcePartOfSpeech = partOfSpeech,
       sourceExample = example,
       sourceExampleTranslation = exampleTranslation,
       sourceDeck = deck,
       sourceAlternateMeanings = List.unmodifiable(alternateMeanings);

  final String originalWord;
  final String sourceMeaning;
  final String sourceIpa;
  final String sourcePartOfSpeech;
  final String sourceExample;
  final String sourceExampleTranslation;
  final String sourceDeck;
  final List<String> sourceAlternateMeanings;
  String word;
  String meaning;
  String ipa;
  String partOfSpeech;
  String example;
  String exampleTranslation;
  String deck;
  List<String> alternateMeanings;
  bool selected;

  List<String> get suggestions => suggestSpelling(word);

  VocabularyWord toWord() => VocabularyWord(
    word: word.trim(),
    meaning: meaning.trim(),
    ipa: ipa.trim(),
    partOfSpeech: partOfSpeech.trim(),
    example: example.trim(),
    exampleTranslation: exampleTranslation.trim(),
    deck: deck.trim().isEmpty ? 'Mặc định' : deck.trim(),
    alternateMeanings: alternateMeanings,
  );
}

class OcrImportService {
  const OcrImportService();

  List<ImportCandidate> parseRecognizedText(
    String text, {
    bool csvFile = false,
  }) => _parseText(text, csvFile: csvFile);

  Future<int> pdfPageCount(PlatformFile file) async {
    var path = file.path;
    var temporary = false;
    if (path == null) {
      final directory = await getTemporaryDirectory();
      path = '${directory.path}/learn_english_page_count.pdf';
      await File(path).writeAsBytes(await file.readAsBytes(), flush: true);
      temporary = true;
    }
    try {
      final document = await PdfDocument.openFile(path);
      try {
        return document.pagesCount;
      } finally {
        await document.close();
      }
    } finally {
      if (temporary) {
        final pdf = File(path);
        if (await pdf.exists()) await pdf.delete();
      }
    }
  }

  Future<List<ImportCandidate>> extract(
    PlatformFile file, {
    int? firstPage,
    int? lastPage,
    void Function(double progress)? onProgress,
  }) async {
    final extension = file.extension?.toLowerCase() ?? '';
    final path = file.path;
    if (extension == 'txt' || extension == 'csv') {
      final content = path != null
          ? await File(path).readAsString()
          : utf8.decode(await file.readAsBytes(), allowMalformed: true);
      return _parseText(content, csvFile: extension == 'csv');
    }
    if (extension == 'pdf') {
      final temp = await getTemporaryDirectory();
      final pdfPath = path ?? '${temp.path}/learn_english_import.pdf';
      final temporaryPdf = path == null;
      try {
        if (temporaryPdf) {
          await File(
            pdfPath,
          ).writeAsBytes(await file.readAsBytes(), flush: true);
        }
        return await _extractPdf(
          pdfPath,
          firstPage: firstPage,
          lastPage: lastPage,
          onProgress: onProgress,
        );
      } finally {
        if (temporaryPdf) {
          final pdf = File(pdfPath);
          if (await pdf.exists()) await pdf.delete();
        }
      }
    }
    if (!{'jpg', 'jpeg', 'png', 'webp'}.contains(extension)) {
      throw FormatException('Định dạng .$extension chưa được hỗ trợ.');
    }
    if (path != null) return _recognizeImage(path);
    final temp = await getTemporaryDirectory();
    final imagePath = '${temp.path}/learn_english_import.$extension';
    try {
      await File(imagePath).writeAsBytes(await file.readAsBytes(), flush: true);
      return await _recognizeImage(imagePath);
    } finally {
      final image = File(imagePath);
      if (await image.exists()) await image.delete();
    }
  }

  Future<List<ImportCandidate>> _extractPdf(
    String path, {
    int? firstPage,
    int? lastPage,
    void Function(double progress)? onProgress,
  }) async {
    final document = await PdfDocument.openFile(path);
    final start = (firstPage ?? 1).clamp(1, document.pagesCount).toInt();
    final end = (lastPage ?? document.pagesCount)
        .clamp(start, document.pagesCount)
        .toInt();
    final temp = await getTemporaryDirectory();
    final candidates = <ImportCandidate>[];
    try {
      for (var pageNumber = start; pageNumber <= end; pageNumber++) {
        final page = await document.getPage(pageNumber);
        try {
          final rendered = await page.render(
            width: (page.width * 1.5).roundToDouble(),
            height: (page.height * 1.5).roundToDouble(),
            format: PdfPageImageFormat.png,
          );
          if (rendered == null) {
            throw StateError('Không thể kết xuất trang PDF $pageNumber.');
          }
          final imageFile = File(
            '${temp.path}/learn_english_page_$pageNumber.png',
          );
          try {
            await imageFile.writeAsBytes(rendered.bytes, flush: true);
            candidates.addAll(await _recognizeImage(imageFile.path));
          } finally {
            if (await imageFile.exists()) await imageFile.delete();
          }
        } finally {
          await page.close();
        }
        onProgress?.call((pageNumber - start + 1) / (end - start + 1));
      }
    } finally {
      await document.close();
    }
    return _deduplicate(candidates);
  }

  Future<List<ImportCandidate>> _recognizeImage(String path) async {
    final recognizer = TextRecognizer(script: TextRecognitionScript.latin);
    try {
      final result = await recognizer.processImage(
        InputImage.fromFilePath(path),
      );
      return _parseText(result.text);
    } finally {
      await recognizer.close();
    }
  }

  List<ImportCandidate> _parseText(String text, {bool csvFile = false}) {
    if (csvFile) {
      final rows = const CsvDecoder().convert(text);
      if (rows.isEmpty) return const [];
      final headers = rows.first
          .map((value) => value.toString().trim().toLowerCase())
          .toList();
      final indexOf = <String, int>{};
      for (final field in [
        'word',
        'english',
        'meaning',
        'vietnamese',
        'ipa',
        'part_of_speech',
        'example',
        'example_translation',
        'deck',
        'set',
        'topic',
        'alternate_meanings',
      ]) {
        final index = headers.indexOf(field);
        if (index >= 0) indexOf[field] = index;
      }
      final wordIndex = indexOf['word'] ?? indexOf['english'];
      final meaningIndex = indexOf['meaning'] ?? indexOf['vietnamese'];
      if (wordIndex == null) {
        throw const FormatException('CSV cần có cột word hoặc english.');
      }
      String cell(List<dynamic> row, String key) {
        final index = indexOf[key];
        return index == null || index >= row.length
            ? ''
            : row[index].toString().trim();
      }

      return _deduplicate([
        for (final row in rows.skip(1))
          if (wordIndex < row.length &&
              row[wordIndex].toString().trim().isNotEmpty)
            ImportCandidate(
              originalWord: row[wordIndex].toString().trim(),
              word: row[wordIndex].toString().trim(),
              meaning: meaningIndex != null && meaningIndex < row.length
                  ? row[meaningIndex].toString().trim()
                  : '',
              ipa: cell(row, 'ipa'),
              partOfSpeech: cell(row, 'part_of_speech'),
              example: cell(row, 'example'),
              exampleTranslation: cell(row, 'example_translation'),
              deck: cell(row, 'deck').isNotEmpty
                  ? cell(row, 'deck')
                  : cell(row, 'set').isNotEmpty
                  ? cell(row, 'set')
                  : cell(row, 'topic').isNotEmpty
                  ? cell(row, 'topic')
                  : 'Mặc định',
              alternateMeanings: cell(row, 'alternate_meanings')
                  .split(';')
                  .map((value) => value.trim())
                  .where((value) => value.isNotEmpty)
                  .toList(),
            ),
      ]);
    }

    final lines = text
        .replaceAll('\r\n', '\n')
        .split('\n')
        .map((line) => line.replaceAll(RegExp(r'\s+'), ' ').trim())
        .where((line) => line.isNotEmpty)
        .toList();
    final candidates = <ImportCandidate>[];
    for (var index = 0; index < lines.length; index++) {
      final line = lines[index];
      final columns = line.split(RegExp(r'\t|\s+\|\s+'));
      if (columns.length >= 2 &&
          RegExp(
            r"^[A-Za-z][A-Za-z'-]*(?:[ ]+[A-Za-z][A-Za-z'-]*){0,2}$",
          ).hasMatch(columns.first.trim())) {
        candidates.add(
          ImportCandidate(
            originalWord: columns[0].trim(),
            word: columns[0].trim(),
            meaning: columns.length > 1 ? columns[1].trim() : '',
            ipa: columns.length > 2 ? columns[2].trim() : '',
            partOfSpeech: columns.length > 3 ? columns[3].trim() : '',
            example: columns.length > 4 ? columns[4].trim() : '',
            exampleTranslation: columns.length > 5 ? columns[5].trim() : '',
            deck: columns.length > 6 ? columns[6].trim() : 'Mặc định',
          ),
        );
        continue;
      }
      final match = RegExp(
        r"^[A-Za-z][A-Za-z'-]*(?:[ ]+[A-Za-z][A-Za-z'-]*){0,2}$",
      ).firstMatch(line);
      if (match == null || line.length > 40) continue;
      var meaning = '';
      if (index + 1 < lines.length &&
          RegExp(r'[À-ỹ]').hasMatch(lines[index + 1])) {
        meaning = lines[index + 1];
      }
      candidates.add(
        ImportCandidate(originalWord: line, word: line, meaning: meaning),
      );
    }
    return _deduplicate(candidates);
  }

  List<ImportCandidate> _deduplicate(List<ImportCandidate> input) {
    final seen = <String>{};
    return input.where((candidate) {
      final key = candidate.word.trim().toLowerCase();
      return key.isNotEmpty && seen.add(key);
    }).toList();
  }
}
