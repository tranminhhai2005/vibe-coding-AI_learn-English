import 'package:flutter_tts/flutter_tts.dart';

class SpeechService {
  SpeechService._();
  static final instance = SpeechService._();
  final FlutterTts _tts = FlutterTts();
  bool _initialized = false;
  String _locale = 'en-US';
  double _rate = 0.45;

  void configure({required String locale, required double rate}) {
    _locale = locale;
    _rate = rate;
  }

  Future<void> _initialize() async {
    if (_initialized) return;
    await _tts.setSpeechRate(0.45);
    await _tts.awaitSpeakCompletion(true);
    _initialized = true;
  }

  Future<List<String>> availableEnglishVoices() async {
    await _initialize();
    final voices = await _tts.getVoices;
    if (voices is! List) return const [];
    return voices
        .whereType<Map>()
        .where(
          (voice) => (voice['locale']?.toString() ?? '')
              .replaceAll('_', '-')
              .toLowerCase()
              .startsWith('en-'),
        )
        .map((voice) => '${voice['name']} (${voice['locale']})')
        .toList();
  }

  Future<void> speak(String text, {String? locale, double? rate}) async {
    if (text.trim().isEmpty) return;
    await _initialize();
    final selectedLocale = (locale ?? _locale).replaceAll('_', '-');
    final selectedRate = rate ?? _rate;
    final voices = await _tts.getVoices;
    final hasVoice =
        voices is List &&
        voices.whereType<Map>().any(
          (voice) =>
              (voice['locale']?.toString().replaceAll('_', '-').toLowerCase() ??
                  '') ==
              selectedLocale.toLowerCase(),
        );
    if (!hasVoice) {
      throw StateError('Thiết bị không có giọng đọc $selectedLocale.');
    }
    await _tts.setLanguage(selectedLocale);
    await _tts.setSpeechRate(selectedRate.clamp(0.25, 0.65).toDouble());
    await _tts.speak(text);
  }

  Future<void> stop() async {
    await _tts.stop();
  }
}
