import 'package:flutter/material.dart';

import '../models/vocabulary_word.dart';

Future<VocabularyWord?> showWordEditor(
  BuildContext context, {
  VocabularyWord? initial,
}) => showDialog<VocabularyWord>(
  context: context,
  builder: (_) => _WordEditorDialog(initial: initial),
);

class _WordEditorDialog extends StatefulWidget {
  const _WordEditorDialog({this.initial});
  final VocabularyWord? initial;

  @override
  State<_WordEditorDialog> createState() => _WordEditorDialogState();
}

class _WordEditorDialogState extends State<_WordEditorDialog> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _word;
  late final TextEditingController _meaning;
  late final TextEditingController _ipa;
  late final TextEditingController _partOfSpeech;
  late final TextEditingController _example;
  late final TextEditingController _exampleTranslation;
  late final TextEditingController _deck;
  late final TextEditingController _alternates;

  @override
  void initState() {
    super.initState();
    final initial = widget.initial;
    _word = TextEditingController(text: initial?.word ?? '');
    _meaning = TextEditingController(text: initial?.meaning ?? '');
    _ipa = TextEditingController(text: initial?.ipa ?? '');
    _partOfSpeech = TextEditingController(text: initial?.partOfSpeech ?? '');
    _example = TextEditingController(text: initial?.example ?? '');
    _exampleTranslation = TextEditingController(
      text: initial?.exampleTranslation ?? '',
    );
    _deck = TextEditingController(text: initial?.deck ?? 'Mặc định');
    _alternates = TextEditingController(
      text: initial?.alternateMeanings.join(', ') ?? '',
    );
  }

  @override
  void dispose() {
    for (final controller in [
      _word,
      _meaning,
      _ipa,
      _partOfSpeech,
      _example,
      _exampleTranslation,
      _deck,
      _alternates,
    ]) {
      controller.dispose();
    }
    super.dispose();
  }

  String? _required(String? value) =>
      value == null || value.trim().isEmpty ? 'Vui lòng nhập thông tin.' : null;

  @override
  Widget build(BuildContext context) => AlertDialog(
    title: Text(widget.initial == null ? 'Thêm từ mới' : 'Sửa từ vựng'),
    content: SizedBox(
      width: 480,
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            children: [
              TextFormField(
                controller: _word,
                decoration: const InputDecoration(labelText: 'Từ tiếng Anh *'),
                validator: _required,
                textCapitalization: TextCapitalization.none,
              ),
              const SizedBox(height: 10),
              TextFormField(
                controller: _meaning,
                decoration: const InputDecoration(
                  labelText: 'Nghĩa tiếng Việt *',
                ),
                validator: _required,
              ),
              const SizedBox(height: 10),
              TextFormField(
                controller: _ipa,
                decoration: const InputDecoration(labelText: 'Phiên âm IPA'),
              ),
              const SizedBox(height: 10),
              TextFormField(
                controller: _partOfSpeech,
                decoration: const InputDecoration(labelText: 'Loại từ'),
              ),
              const SizedBox(height: 10),
              TextFormField(
                controller: _example,
                decoration: const InputDecoration(labelText: 'Ví dụ tiếng Anh'),
                maxLines: 2,
              ),
              const SizedBox(height: 10),
              TextFormField(
                controller: _exampleTranslation,
                decoration: const InputDecoration(
                  labelText: 'Dịch nghĩa ví dụ',
                ),
                maxLines: 2,
              ),
              const SizedBox(height: 10),
              TextFormField(
                controller: _alternates,
                decoration: const InputDecoration(
                  labelText: 'Nghĩa tương đương (phân cách bằng dấu phẩy)',
                ),
              ),
              const SizedBox(height: 10),
              TextFormField(
                controller: _deck,
                decoration: const InputDecoration(labelText: 'Bộ từ / chủ đề'),
              ),
            ],
          ),
        ),
      ),
    ),
    actions: [
      TextButton(
        onPressed: () => Navigator.pop(context),
        child: const Text('Hủy'),
      ),
      FilledButton(
        onPressed: () {
          if (!_formKey.currentState!.validate()) return;
          final initial = widget.initial;
          Navigator.pop(
            context,
            VocabularyWord(
              id: initial?.id,
              word: _word.text.trim(),
              meaning: _meaning.text.trim(),
              ipa: _ipa.text,
              partOfSpeech: _partOfSpeech.text,
              example: _example.text,
              exampleTranslation: _exampleTranslation.text,
              deck: _deck.text.trim().isEmpty ? 'Mặc định' : _deck.text,
              alternateMeanings: _alternates.text
                  .split(',')
                  .map((value) => value.trim())
                  .where((value) => value.isNotEmpty)
                  .toList(),
              mastery: initial?.mastery ?? 0,
              correctCount: initial?.correctCount ?? 0,
              incorrectCount: initial?.incorrectCount ?? 0,
              dueAt: initial?.dueAt,
              lastReviewed: initial?.lastReviewed,
              isSample: initial?.isSample ?? false,
            ),
          );
        },
        child: const Text('Lưu'),
      ),
    ],
  );
}
