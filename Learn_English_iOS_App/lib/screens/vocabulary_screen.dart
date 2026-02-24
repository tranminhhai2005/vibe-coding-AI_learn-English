import 'package:flutter/material.dart';

import '../database/app_database.dart';
import '../models/vocabulary_word.dart';
import '../services/speech_service.dart';
import '../widgets/word_editor_dialog.dart';

class VocabularyScreen extends StatefulWidget {
  const VocabularyScreen({super.key});

  @override
  State<VocabularyScreen> createState() => _VocabularyScreenState();
}

class _VocabularyScreenState extends State<VocabularyScreen> {
  final _searchController = TextEditingController();
  String? _deck;
  late Future<List<VocabularyWord>> _words;
  List<String> _decks = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _load() {
    _words = AppDatabase.instance.getWords(
      search: _searchController.text,
      deck: _deck,
    );
    _loadDecks();
  }

  Future<void> _loadDecks() async {
    try {
      final decks = await AppDatabase.instance.getDecks();
      if (mounted) setState(() => _decks = decks);
    } catch (error) {
      if (mounted) _message('Không tải được danh sách bộ từ: $error');
    }
  }

  Future<void> _edit([VocabularyWord? word]) async {
    final result = await showWordEditor(context, initial: word);
    if (result == null) return;
    try {
      if (word == null) {
        await AppDatabase.instance.addWord(result);
      } else {
        await AppDatabase.instance.updateWord(result);
      }
      if (mounted) {
        setState(_load);
        _message('Đã lưu từ vựng.');
      }
    } on DuplicateWordException catch (error) {
      if (mounted) _message(error.toString());
    } catch (error) {
      if (mounted) _message('Không lưu được từ: $error');
    }
  }

  Future<void> _delete(VocabularyWord word) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xóa từ vựng?'),
        content: Text('Bạn có chắc muốn xóa "${word.word}" không?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Xóa'),
          ),
        ],
      ),
    );
    if (confirmed != true || word.id == null) return;
    try {
      await AppDatabase.instance.deleteWord(word.id!);
      if (mounted) setState(_load);
    } catch (error) {
      if (mounted) _message('Không xóa được từ: $error');
    }
  }

  void _message(String value) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(value)));
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('Kho từ vựng'),
      actions: [
        IconButton(
          tooltip: 'Sắp xếp A–Z',
          onPressed: () => setState(_load),
          icon: const Icon(Icons.sort_by_alpha_rounded),
        ),
      ],
    ),
    floatingActionButton: FloatingActionButton.extended(
      onPressed: _edit,
      icon: const Icon(Icons.add_rounded),
      label: const Text('Thêm từ'),
    ),
    body: Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _searchController,
                  onChanged: (_) => setState(_load),
                  decoration: const InputDecoration(
                    prefixIcon: Icon(Icons.search_rounded),
                    hintText: 'Tìm từ hoặc nghĩa',
                  ),
                ),
              ),
              if (_decks.isNotEmpty) ...[
                const SizedBox(width: 8),
                DropdownButton<String?>(
                  value: _decks.contains(_deck) ? _deck : null,
                  hint: const Text('Bộ từ'),
                  items: [
                    const DropdownMenuItem<String?>(
                      value: null,
                      child: Text('Tất cả'),
                    ),
                    ..._decks.map(
                      (deck) => DropdownMenuItem<String?>(
                        value: deck,
                        child: Text(deck, overflow: TextOverflow.ellipsis),
                      ),
                    ),
                  ],
                  onChanged: (value) => setState(() {
                    _deck = value;
                    _load();
                  }),
                ),
              ],
            ],
          ),
        ),
        Expanded(
          child: FutureBuilder<List<VocabularyWord>>(
            future: _words,
            builder: (context, snapshot) {
              if (snapshot.hasError) {
                return Center(
                  child: Text('Không tải được dữ liệu: ${snapshot.error}'),
                );
              }
              if (!snapshot.hasData) {
                return const Center(child: CircularProgressIndicator());
              }
              final words = snapshot.data!;
              if (words.isEmpty) {
                return const _VocabularyEmpty();
              }
              return ListView.separated(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 96),
                itemCount: words.length,
                separatorBuilder: (_, _) => const SizedBox(height: 8),
                itemBuilder: (context, index) => _WordTile(
                  word: words[index],
                  onEdit: () => _edit(words[index]),
                  onDelete: () => _delete(words[index]),
                  onSpeak: () async {
                    try {
                      await SpeechService.instance.speak(words[index].word);
                    } catch (error) {
                      if (context.mounted) {
                        _message('Không phát được âm thanh: $error');
                      }
                    }
                  },
                ),
              );
            },
          ),
        ),
      ],
    ),
  );
}

class _WordTile extends StatelessWidget {
  const _WordTile({
    required this.word,
    required this.onEdit,
    required this.onDelete,
    required this.onSpeak,
  });

  final VocabularyWord word;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  final VoidCallback onSpeak;

  @override
  Widget build(BuildContext context) => Card(
    child: ExpansionTile(
      leading: CircleAvatar(
        backgroundColor: Theme.of(context).colorScheme.primaryContainer,
        child: Text(word.mastery.toString()),
      ),
      title: Text(
        word.word,
        style: const TextStyle(fontWeight: FontWeight.bold),
      ),
      subtitle: Text(
        word.meaning,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
      childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      children: [
        if (word.ipa.isNotEmpty || word.partOfSpeech.isNotEmpty)
          Align(
            alignment: Alignment.centerLeft,
            child: Text('${word.ipa}  ${word.partOfSpeech}'),
          ),
        if (word.example.isNotEmpty)
          Align(
            alignment: Alignment.centerLeft,
            child: Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text('${word.example}\n${word.exampleTranslation}'),
            ),
          ),
        if (word.isSample)
          const Align(
            alignment: Alignment.centerLeft,
            child: Chip(
              avatar: Icon(Icons.auto_awesome_outlined, size: 16),
              label: Text('Dữ liệu mẫu'),
            ),
          ),
        Align(
          alignment: Alignment.centerLeft,
          child: Chip(label: Text(word.deck)),
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            IconButton(
              tooltip: 'Nghe',
              onPressed: onSpeak,
              icon: const Icon(Icons.volume_up_outlined),
            ),
            IconButton(
              tooltip: 'Sửa',
              onPressed: onEdit,
              icon: const Icon(Icons.edit_outlined),
            ),
            IconButton(
              tooltip: 'Xóa',
              onPressed: onDelete,
              icon: const Icon(Icons.delete_outline),
            ),
          ],
        ),
      ],
    ),
  );
}

class _VocabularyEmpty extends StatelessWidget {
  const _VocabularyEmpty();

  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.auto_stories_outlined,
            size: 54,
            color: Theme.of(context).colorScheme.primary,
          ),
          const SizedBox(height: 16),
          Text(
            'Bắt đầu xây dựng kho từ của bạn',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          const Text(
            'Thêm từ bằng nút bên dưới hoặc trích xuất từ ảnh, PDF, TXT và CSV.',
            textAlign: TextAlign.center,
          ),
        ],
      ),
    ),
  );
}
