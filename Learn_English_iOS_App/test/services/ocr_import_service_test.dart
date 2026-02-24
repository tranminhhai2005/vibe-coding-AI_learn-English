import 'package:flutter_test/flutter_test.dart';
import 'package:learn_english_ios_app/services/ocr_import_service.dart';

void main() {
  const service = OcrImportService();

  test('parses text and pairs only explicit Vietnamese lines', () {
    final candidates = service.parseRecognizedText(
      'apple\nquả táo\nblue sky\nbầu trời xanh',
    );
    expect(candidates, hasLength(2));
    expect(candidates.first.word, 'apple');
    expect(candidates.first.meaning, 'quả táo');
    expect(candidates.last.word, 'blue sky');
    expect(candidates.last.meaning, 'bầu trời xanh');
  });

  test('parses structured CSV vocabulary without inventing fields', () {
    final candidates = service.parseRecognizedText(
      'word,meaning,ipa,part_of_speech,example,example_translation,deck,alternate_meanings\n'
      'apple,quả táo,/ˈæp.əl/,noun,I eat an apple,Tôi ăn một quả táo,Bắt đầu,trái táo; quả bom',
      csvFile: true,
    );
    expect(candidates, hasLength(1));
    expect(candidates.single.ipa, '/ˈæp.əl/');
    expect(candidates.single.exampleTranslation, 'Tôi ăn một quả táo');
    expect(candidates.single.deck, 'Bắt đầu');
    expect(candidates.single.alternateMeanings, ['trái táo', 'quả bom']);
  });

  test('removes duplicate words without regard to capitalization', () {
    final candidates = service.parseRecognizedText('apple\nApple\nbook');
    expect(candidates.map((candidate) => candidate.word), ['apple', 'book']);
  });
}
