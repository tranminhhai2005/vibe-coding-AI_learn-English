import 'dart:convert';

class VocabularyWord {
  const VocabularyWord({
    this.id,
    required this.word,
    required this.meaning,
    this.ipa = '',
    this.partOfSpeech = '',
    this.example = '',
    this.exampleTranslation = '',
    this.imagePath = '',
    this.deck = 'Mặc định',
    this.alternateMeanings = const [],
    this.mastery = 0,
    this.correctCount = 0,
    this.incorrectCount = 0,
    this.lastReviewed,
    this.dueAt,
    this.isSample = false,
  });

  final int? id;
  final String word;
  final String meaning;
  final String ipa;
  final String partOfSpeech;
  final String example;
  final String exampleTranslation;
  final String imagePath;
  final String deck;
  final List<String> alternateMeanings;
  final int mastery;
  final int correctCount;
  final int incorrectCount;
  final DateTime? lastReviewed;
  final DateTime? dueAt;
  final bool isSample;

  factory VocabularyWord.fromMap(Map<String, Object?> map) {
    return VocabularyWord(
      id: map['id'] as int?,
      word: map['word'] as String,
      meaning: map['meaning'] as String,
      ipa: map['ipa'] as String? ?? '',
      partOfSpeech: map['part_of_speech'] as String? ?? '',
      example: map['example'] as String? ?? '',
      exampleTranslation: map['example_translation'] as String? ?? '',
      imagePath: map['image_path'] as String? ?? '',
      deck: map['deck'] as String? ?? 'Mặc định',
      alternateMeanings: _decodeList(map['alternate_meanings'] as String?),
      mastery: map['mastery'] as int? ?? 0,
      correctCount: map['correct_count'] as int? ?? 0,
      incorrectCount: map['incorrect_count'] as int? ?? 0,
      lastReviewed: _parseDate(map['last_reviewed'] as String?),
      dueAt: _parseDate(map['due_at'] as String?),
      isSample: (map['is_sample'] as int? ?? 0) == 1,
    );
  }

  Map<String, Object?> toMap({bool includeId = true}) {
    final map = <String, Object?>{
      'word': word.trim(),
      'meaning': meaning.trim(),
      'ipa': ipa.trim(),
      'part_of_speech': partOfSpeech.trim(),
      'example': example.trim(),
      'example_translation': exampleTranslation.trim(),
      'image_path': imagePath,
      'deck': deck.trim().isEmpty ? 'Mặc định' : deck.trim(),
      'alternate_meanings': jsonEncode(alternateMeanings),
      'mastery': mastery,
      'correct_count': correctCount,
      'incorrect_count': incorrectCount,
      'last_reviewed': lastReviewed?.toIso8601String(),
      'due_at': dueAt?.toIso8601String(),
      'is_sample': isSample ? 1 : 0,
    };
    if (includeId && id != null) map['id'] = id;
    return map;
  }

  VocabularyWord copyWith({
    int? id,
    String? word,
    String? meaning,
    String? ipa,
    String? partOfSpeech,
    String? example,
    String? exampleTranslation,
    String? imagePath,
    String? deck,
    List<String>? alternateMeanings,
    int? mastery,
    int? correctCount,
    int? incorrectCount,
    DateTime? lastReviewed,
    DateTime? dueAt,
    bool? isSample,
  }) => VocabularyWord(
    id: id ?? this.id,
    word: word ?? this.word,
    meaning: meaning ?? this.meaning,
    ipa: ipa ?? this.ipa,
    partOfSpeech: partOfSpeech ?? this.partOfSpeech,
    example: example ?? this.example,
    exampleTranslation: exampleTranslation ?? this.exampleTranslation,
    imagePath: imagePath ?? this.imagePath,
    deck: deck ?? this.deck,
    alternateMeanings: alternateMeanings ?? this.alternateMeanings,
    mastery: mastery ?? this.mastery,
    correctCount: correctCount ?? this.correctCount,
    incorrectCount: incorrectCount ?? this.incorrectCount,
    lastReviewed: lastReviewed ?? this.lastReviewed,
    dueAt: dueAt ?? this.dueAt,
    isSample: isSample ?? this.isSample,
  );

  static DateTime? _parseDate(String? value) =>
      value == null ? null : DateTime.tryParse(value);

  static List<String> _decodeList(String? value) {
    if (value == null || value.isEmpty) return const [];
    try {
      return (jsonDecode(value) as List).whereType<String>().toList();
    } on FormatException {
      return const [];
    }
  }
}
