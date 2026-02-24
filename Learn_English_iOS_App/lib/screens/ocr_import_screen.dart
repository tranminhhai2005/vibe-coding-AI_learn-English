import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';

import '../database/app_database.dart';
import '../services/ocr_import_service.dart';

class OcrImportScreen extends StatefulWidget {
  const OcrImportScreen({super.key});

  @override
  State<OcrImportScreen> createState() => _OcrImportScreenState();
}

class _OcrImportScreenState extends State<OcrImportScreen> {
  final _service = const OcrImportService();
  List<ImportCandidate> _candidates = [];
  Set<String> _existingWords = {};
  bool _busy = false;
  double _progress = 0;
  String? _fileName;
  String? _error;
  int _savedCount = 0;
  int _resetVersion = 0;

  Future<void> _chooseFile() async {
    try {
      final files = await FilePicker.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'txt', 'csv'],
      );
      if (files.isEmpty) return;
      final file = files.single;
      int? firstPage;
      int? lastPage;
      if (file.extension?.toLowerCase() == 'pdf') {
        final pageCount = await _service.pdfPageCount(file);
        if (pageCount > 1) {
          final range = await _choosePageRange(pageCount);
          if (range == null) return;
          firstPage = range.$1;
          lastPage = range.$2;
        }
      }
      setState(() {
        _busy = true;
        _progress = 0;
        _error = null;
        _fileName = file.name;
      });
      final candidates = await _service.extract(
        file,
        firstPage: firstPage,
        lastPage: lastPage,
        onProgress: (value) {
          if (mounted) setState(() => _progress = value);
        },
      );
      final stored = await AppDatabase.instance.getWords();
      if (mounted) {
        setState(() {
          _candidates = candidates;
          _existingWords = stored
              .map((word) => word.word.trim().toLowerCase())
              .toSet();
          _busy = false;
        });
        if (candidates.isEmpty) {
          _message('Không nhận diện được từ phù hợp trong tệp này.');
        } else {
          _message(
            'Đã trích xuất ${candidates.length} mục. Vui lòng kiểm tra trước khi lưu.',
          );
        }
      }
    } catch (error) {
      if (mounted) {
        setState(() {
          _busy = false;
          _error = '$error';
        });
      }
    }
  }

  Future<(int, int)?> _choosePageRange(int total) async {
    final first = TextEditingController(text: '1');
    final last = TextEditingController(text: '$total');
    final result = await showDialog<(int, int)>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('PDF có $total trang'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Nhập khoảng trang cần xử lý (để mặc định để chọn tất cả).',
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: first,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Từ trang'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: last,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Đến trang'),
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () {
              final start = int.tryParse(first.text);
              final end = int.tryParse(last.text);
              if (start == null ||
                  end == null ||
                  start < 1 ||
                  end < start ||
                  end > total) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Nhập khoảng trang từ 1 đến $total.')),
                );
                return;
              }
              Navigator.pop(context, (start, end));
            },
            child: const Text('Tiếp tục'),
          ),
        ],
      ),
    );
    first.dispose();
    last.dispose();
    return result;
  }

  Future<void> _saveSelected() async {
    final selected = _candidates.where((item) => item.selected).toList();
    final invalid = selected.where(
      (item) => item.word.trim().isEmpty || item.meaning.trim().isEmpty,
    );
    if (invalid.isNotEmpty) {
      _message('Mỗi từ được lưu cần có từ tiếng Anh và nghĩa tiếng Việt.');
      return;
    }
    final duplicates = selected.where(
      (item) => _existingWords.contains(item.word.trim().toLowerCase()),
    );
    if (duplicates.isNotEmpty) {
      _message('Bỏ chọn hoặc sửa các mục đã có trong kho trước khi lưu.');
      return;
    }
    if (selected.isEmpty) {
      _message('Chọn ít nhất một từ để lưu.');
      return;
    }
    final selectedWords = <String>{};
    final duplicatedSelection = selected.any(
      (item) => !selectedWords.add(item.word.trim().toLowerCase()),
    );
    if (duplicatedSelection) {
      _message('Có từ trùng tên trong các dòng đã chọn. Hãy sửa hoặc bỏ chọn.');
      return;
    }
    setState(() => _busy = true);
    try {
      final inserted = await AppDatabase.instance.insertWordsSkippingDuplicates(
        selected.map((item) => item.toWord()),
      );
      if (mounted) {
        setState(() {
          _savedCount = inserted;
          _busy = false;
          _candidates = [];
        });
        _message('Đã lưu $inserted từ vựng.');
      }
    } catch (error) {
      if (mounted) {
        setState(() {
          _busy = false;
          _error = 'Không lưu được các từ đã chọn: $error';
        });
      }
    }
  }

  void _undoEdits() {
    setState(() {
      for (final candidate in _candidates) {
        candidate
          ..word = candidate.originalWord
          ..meaning = candidate.sourceMeaning
          ..ipa = candidate.sourceIpa
          ..partOfSpeech = candidate.sourcePartOfSpeech
          ..example = candidate.sourceExample
          ..exampleTranslation = candidate.sourceExampleTranslation
          ..deck = candidate.sourceDeck
          ..alternateMeanings = candidate.sourceAlternateMeanings;
      }
      _resetVersion++;
    });
    _message('Đã hoàn tác các chỉnh sửa, giữ nguyên nội dung OCR ban đầu.');
  }

  void _message(String message) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Trích xuất từ vựng')),
    body: _busy
        ? Center(
            child: Padding(
              padding: const EdgeInsets.all(28),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const CircularProgressIndicator(),
                  const SizedBox(height: 14),
                  Text(
                    _fileName == null
                        ? 'Đang xử lý tệp...'
                        : 'Đang xử lý $_fileName',
                  ),
                  if (_fileName?.toLowerCase().endsWith('.pdf') ?? false) ...[
                    const SizedBox(height: 12),
                    LinearProgressIndicator(value: _progress),
                    const SizedBox(height: 6),
                    Text('${(_progress * 100).round()}%'),
                  ],
                ],
              ),
            ),
          )
        : _candidates.isEmpty
        ? _emptyState(context)
        : _reviewList(context),
  );

  Widget _emptyState(BuildContext context) => Center(
    child: SingleChildScrollView(
      padding: const EdgeInsets.all(28),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.document_scanner_outlined,
            size: 58,
            color: Theme.of(context).colorScheme.primary,
          ),
          const SizedBox(height: 16),
          Text(
            'Nhập từ ảnh hoặc tài liệu',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          const Text(
            'Chọn JPG, PNG, WebP, PDF, TXT hoặc CSV. OCR xử lý trên thiết bị; kết quả có thể sai và cần được bạn kiểm tra.',
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 18),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: Text(
                _error!,
                style: TextStyle(color: Theme.of(context).colorScheme.error),
                textAlign: TextAlign.center,
              ),
            ),
          FilledButton.icon(
            onPressed: _chooseFile,
            icon: const Icon(Icons.folder_open_rounded),
            label: const Text('Chọn tệp'),
          ),
          if (_savedCount > 0) ...[
            const SizedBox(height: 12),
            Text('Lần nhập gần nhất: đã lưu $_savedCount từ.'),
          ],
        ],
      ),
    ),
  );

  Widget _reviewList(BuildContext context) => Column(
    children: [
      Padding(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Kiểm tra kết quả OCR — $_fileName',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 5),
            const Text(
              'Không có nghĩa, phiên âm hay ví dụ nào được tự bịa. Hãy bổ sung nghĩa trước khi lưu.',
            ),
            Row(
              children: [
                TextButton.icon(
                  onPressed: _undoEdits,
                  icon: const Icon(Icons.undo_rounded),
                  label: const Text('Hoàn tác chỉnh sửa'),
                ),
                const Spacer(),
                TextButton(
                  onPressed: _chooseFile,
                  child: const Text('Chọn tệp khác'),
                ),
              ],
            ),
          ],
        ),
      ),
      Expanded(
        child: ListView.builder(
          padding: const EdgeInsets.fromLTRB(14, 0, 14, 16),
          itemCount: _candidates.length,
          itemBuilder: (context, index) => _CandidateTile(
            key: ValueKey('$_resetVersion:$index'),
            candidate: _candidates[index],
            alreadyExists: _existingWords.contains(
              _candidates[index].word.trim().toLowerCase(),
            ),
            onChanged: () => setState(() {}),
          ),
        ),
      ),
      SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: _saveSelected,
              icon: const Icon(Icons.save_rounded),
              label: Text(
                'Lưu ${_candidates.where((item) => item.selected).length} từ đã chọn',
              ),
            ),
          ),
        ),
      ),
    ],
  );
}

class _CandidateTile extends StatefulWidget {
  const _CandidateTile({
    super.key,
    required this.candidate,
    required this.alreadyExists,
    required this.onChanged,
  });
  final ImportCandidate candidate;
  final bool alreadyExists;
  final VoidCallback onChanged;

  @override
  State<_CandidateTile> createState() => _CandidateTileState();
}

class _CandidateTileState extends State<_CandidateTile> {
  late final TextEditingController _wordController;

  @override
  void initState() {
    super.initState();
    _wordController = TextEditingController(text: widget.candidate.word);
  }

  @override
  void didUpdateWidget(covariant _CandidateTile oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (_wordController.text != widget.candidate.word) {
      _wordController.value = TextEditingValue(
        text: widget.candidate.word,
        selection: TextSelection.collapsed(
          offset: widget.candidate.word.length,
        ),
      );
    }
  }

  @override
  void dispose() {
    _wordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Card(
    child: Padding(
      padding: const EdgeInsets.fromLTRB(8, 5, 12, 12),
      child: Column(
        children: [
          Row(
            children: [
              Checkbox(
                value: widget.candidate.selected,
                onChanged: (value) {
                  widget.candidate.selected = value ?? false;
                  widget.onChanged();
                },
              ),
              Expanded(
                child: Text(
                  widget.candidate.originalWord == widget.candidate.word
                      ? 'Nhận diện: ${widget.candidate.originalWord}'
                      : '${widget.candidate.originalWord}  →  ${widget.candidate.word}',
                  style: Theme.of(context).textTheme.labelMedium,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (widget.alreadyExists)
                const Chip(
                  avatar: Icon(Icons.content_copy, size: 15),
                  label: Text('Đã có'),
                ),
              IconButton(
                tooltip: 'Bỏ qua mục này',
                onPressed: () {
                  widget.candidate.selected = false;
                  widget.onChanged();
                },
                icon: const Icon(Icons.close_rounded),
              ),
            ],
          ),
          TextFormField(
            controller: _wordController,
            onChanged: (value) {
              widget.candidate.word = value;
              widget.onChanged();
            },
            decoration: const InputDecoration(
              labelText: 'Từ tiếng Anh',
              isDense: true,
            ),
          ),
          if (widget.candidate.suggestions.isNotEmpty)
            Wrap(
              spacing: 5,
              children: [
                const Padding(
                  padding: EdgeInsets.only(top: 10),
                  child: Text('Có thể là:'),
                ),
                ...widget.candidate.suggestions.map(
                  (suggestion) => ActionChip(
                    label: Text(suggestion),
                    onPressed: () {
                      widget.candidate.word = suggestion;
                      widget.onChanged();
                    },
                  ),
                ),
                TextButton(
                  onPressed: () {
                    widget.candidate.word = widget.candidate.originalWord;
                    widget.onChanged();
                  },
                  child: const Text('Giữ nguyên từ gốc'),
                ),
              ],
            ),
          const SizedBox(height: 8),
          TextFormField(
            initialValue: widget.candidate.meaning,
            onChanged: (value) => widget.candidate.meaning = value,
            decoration: const InputDecoration(
              labelText: 'Nghĩa tiếng Việt',
              isDense: true,
            ),
          ),
          const SizedBox(height: 8),
          ExpansionTile(
            tilePadding: EdgeInsets.zero,
            title: const Text('Phiên âm, loại từ và ví dụ (tùy chọn)'),
            children: [
              TextFormField(
                initialValue: widget.candidate.ipa,
                onChanged: (value) => widget.candidate.ipa = value,
                decoration: const InputDecoration(labelText: 'IPA'),
              ),
              const SizedBox(height: 8),
              TextFormField(
                initialValue: widget.candidate.partOfSpeech,
                onChanged: (value) => widget.candidate.partOfSpeech = value,
                decoration: const InputDecoration(labelText: 'Loại từ'),
              ),
              const SizedBox(height: 8),
              TextFormField(
                initialValue: widget.candidate.example,
                onChanged: (value) => widget.candidate.example = value,
                decoration: const InputDecoration(labelText: 'Ví dụ tiếng Anh'),
              ),
              const SizedBox(height: 8),
              TextFormField(
                initialValue: widget.candidate.exampleTranslation,
                onChanged: (value) =>
                    widget.candidate.exampleTranslation = value,
                decoration: const InputDecoration(labelText: 'Dịch ví dụ'),
              ),
              const SizedBox(height: 8),
              TextFormField(
                initialValue: widget.candidate.deck,
                onChanged: (value) => widget.candidate.deck = value,
                decoration: const InputDecoration(labelText: 'Bộ từ / chủ đề'),
              ),
              const SizedBox(height: 8),
              TextFormField(
                initialValue: widget.candidate.alternateMeanings.join('; '),
                onChanged: (value) => widget.candidate.alternateMeanings = value
                    .split(';')
                    .map((item) => item.trim())
                    .where((item) => item.isNotEmpty)
                    .toList(),
                decoration: const InputDecoration(
                  labelText: 'Nghĩa tương đương (phân cách bằng dấu chấm phẩy)',
                ),
              ),
            ],
          ),
        ],
      ),
    ),
  );
}
