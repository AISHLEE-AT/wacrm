import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../shared/models/daily_news_item.dart';
import '../../../shared/services/daily_news_fetch_service.dart';
import '../../../shared/services/daily_news_supabase_service.dart';

/// Admin's Daily News Control Panel
/// - Fetch from RSS + data.gov.in
/// - Preview by category
/// - Publish to Supabase for all users
class AdminDailyNewsTab extends StatefulWidget {
  const AdminDailyNewsTab({super.key});

  @override
  State<AdminDailyNewsTab> createState() => _AdminDailyNewsTabState();
}

class _AdminDailyNewsTabState extends State<AdminDailyNewsTab> {
  List<DailyNewsItem> _fetchedItems = [];
  List<DailyNewsItem> _publishedItems = [];
  bool _isFetching = false;
  bool _isPublishing = false;
  bool _isLoadingPublished = false;
  String _statusLog = '';
  String _selectedModule = 'all';
  String? _lastLoadedAt;

  final List<Map<String, dynamic>> _moduleFilters = [
    {'key': 'all',     'label': 'All',     'color': const Color(0xFF94a3b8)},
    {'key': 'agro',    'label': '🌾 AgrO',  'color': const Color(0xFF10b981)},
    {'key': 'teacho',  'label': '📚 TeachO','color': const Color(0xFF6366f1)},
    {'key': 'dealo',   'label': '🛒 DealO', 'color': const Color(0xFFf59e0b)},
    {'key': 'jobo',    'label': '💼 JobO',  'color': const Color(0xFF3b82f6)},
    {'key': 'driveo',  'label': '🚗 DriveO','color': const Color(0xFFef4444)},
    {'key': 'testo',   'label': '🏥 TestO', 'color': const Color(0xFFec4899)},
    {'key': 'general', 'label': '📰 General','color': const Color(0xFF64748b)},
  ];

  @override
  void initState() {
    super.initState();
    _loadPublished();
  }

  Future<void> _loadPublished() async {
    setState(() => _isLoadingPublished = true);
    final items = await DailyNewsSupabaseService.fetchAllTodayNews();
    setState(() {
      _publishedItems = items;
      _isLoadingPublished = false;
    });
  }

  Future<void> _fetchNews() async {
    setState(() {
      _isFetching = true;
      _statusLog = '';
      _fetchedItems = [];
    });

    final items = await DailyNewsFetchService.fetchAll(
      onStatus: (msg) {
        if (mounted) {
          setState(() => _statusLog = '$_statusLog\n$msg');
        }
      },
    );

    final now = TimeOfDay.now();
    setState(() {
      _fetchedItems = items;
      _isFetching = false;
      _lastLoadedAt =
          '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
      _statusLog =
          '$_statusLog\n\n✅ Total: ${items.length} items fetched. Tap "Publish" to push to users.';
    });
  }

  Future<void> _publishNews() async {
    if (_fetchedItems.isEmpty) return;
    setState(() => _isPublishing = true);

    // Clear today's existing and insert fresh
    await DailyNewsSupabaseService.deleteTodayNews();
    final success =
        await DailyNewsSupabaseService.saveNewsItems(_fetchedItems);

    if (mounted) {
      setState(() => _isPublishing = false);
      if (success) {
        _loadPublished();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFF10b981),
            content: Row(children: [
              const Icon(LucideIcons.checkCircle, color: Colors.white),
              const SizedBox(width: 8),
              Text('${_fetchedItems.length} news items published to all users!'),
            ]),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: Color(0xFFef4444),
            content: Text('❌ Publish failed. Check Supabase connection.'),
          ),
        );
      }
    }
  }

  Future<void> _clearTodayNews() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Clear Today\'s News?',
            style: TextStyle(color: Colors.white)),
        content: const Text(
            'This will remove all today\'s news from Supabase. Users will see empty feeds until you re-publish.',
            style: TextStyle(color: Color(0xFF94a3b8))),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel',
                  style: TextStyle(color: Color(0xFF94a3b8)))),
          TextButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Clear',
                  style: TextStyle(color: Color(0xFFef4444)))),
        ],
      ),
    );

    if (confirm == true) {
      await DailyNewsSupabaseService.deleteTodayNews();
      setState(() {
        _publishedItems = [];
        _fetchedItems = [];
        _statusLog = '';
        _lastLoadedAt = null;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: Color(0xFF334155),
            content: Text('🗑️ Today\'s news cleared from Supabase.'),
          ),
        );
      }
    }
  }

  List<DailyNewsItem> get _displayItems {
    final source = _fetchedItems.isNotEmpty ? _fetchedItems : _publishedItems;
    if (_selectedModule == 'all') return source;
    return source.where((e) => e.module == _selectedModule).toList();
  }

  Map<String, int> _countByModule(List<DailyNewsItem> items) {
    final Map<String, int> counts = {};
    for (final item in items) {
      counts[item.module] = (counts[item.module] ?? 0) + 1;
    }
    return counts;
  }

  @override
  Widget build(BuildContext context) {
    final source = _fetchedItems.isNotEmpty ? _fetchedItems : _publishedItems;
    final counts = _countByModule(source);
    final today = DateTime.now();
    final dateStr =
        '${today.day} ${_monthName(today.month)} ${today.year}';

    return Column(
      children: [
        // ── Header ──
        _buildHeader(dateStr, source.length),

        // ── Action Buttons ──
        _buildActionButtons(),

        // ── Status Log ──
        if (_statusLog.isNotEmpty) _buildStatusLog(),

        // ── Stats Row ──
        if (source.isNotEmpty) _buildStatsRow(counts),

        // ── Module Filter Chips ──
        if (source.isNotEmpty) _buildFilterChips(counts),

        // ── News List ──
        Expanded(child: _buildNewsList()),
      ],
    );
  }

  Widget _buildHeader(String dateStr, int total) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1E3A5F), Color(0xFF0a0f1e)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border:
            Border.all(color: const Color(0xFF3b82f6).withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF3b82f6).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(LucideIcons.newspaper,
                color: Color(0xFF3b82f6), size: 24),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Daily News Manager',
                    style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 15)),
                Text(
                  dateStr +
                      (_lastLoadedAt != null
                          ? ' • Loaded at $_lastLoadedAt'
                          : ' • Not loaded yet'),
                  style: const TextStyle(
                      color: Color(0xFF64748b), fontSize: 12),
                ),
              ],
            ),
          ),
          if (total > 0)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF3b82f6).withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                '$total items',
                style: const TextStyle(
                    color: Color(0xFF3b82f6),
                    fontWeight: FontWeight.bold,
                    fontSize: 12),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildActionButtons() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          // Fetch Button
          Expanded(
            flex: 3,
            child: ElevatedButton.icon(
              onPressed: _isFetching ? null : _fetchNews,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF3b82f6),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              icon: _isFetching
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white))
                  : const Icon(LucideIcons.refreshCw,
                      color: Colors.white, size: 16),
              label: Text(
                _isFetching ? 'Loading...' : '🔄 Load Today\'s News',
                style: const TextStyle(
                    color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          const SizedBox(width: 8),
          // Publish Button
          Expanded(
            flex: 2,
            child: ElevatedButton.icon(
              onPressed: (_fetchedItems.isEmpty || _isPublishing)
                  ? null
                  : _publishNews,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF10b981),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              icon: _isPublishing
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white))
                  : const Icon(LucideIcons.send, color: Colors.white, size: 16),
              label: Text(
                _isPublishing ? 'Publishing...' : '✅ Publish',
                style: const TextStyle(
                    color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          const SizedBox(width: 8),
          // Clear Button
          IconButton(
            onPressed: _clearTodayNews,
            style: IconButton.styleFrom(
              backgroundColor: const Color(0xFF334155),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
              padding: const EdgeInsets.all(14),
            ),
            icon: const Icon(LucideIcons.trash2,
                color: Color(0xFFef4444), size: 18),
            tooltip: 'Clear today\'s news',
          ),
        ],
      ),
    );
  }

  Widget _buildStatusLog() {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF0d1526),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Text(
        _statusLog.trim(),
        style: const TextStyle(
            color: Color(0xFF94a3b8), fontSize: 12, fontFamily: 'monospace'),
      ),
    );
  }

  Widget _buildStatsRow(Map<String, int> counts) {
    final govtCount = (_fetchedItems.isNotEmpty ? _fetchedItems : _publishedItems)
        .where((e) => e.dataType != 'rss')
        .length;
    final rssCount = (_fetchedItems.isNotEmpty ? _fetchedItems : _publishedItems)
        .where((e) => e.dataType == 'rss')
        .length;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: Row(
        children: [
          _statChip('🏛️ Govt API', govtCount, const Color(0xFF6366f1)),
          const SizedBox(width: 8),
          _statChip('📡 RSS News', rssCount, const Color(0xFF10b981)),
          const SizedBox(width: 8),
          _statChip('📦 Modules', counts.keys.length, const Color(0xFFf59e0b)),
        ],
      ),
    );
  }

  Widget _statChip(String label, int count, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Column(
          children: [
            Text('$count',
                style: TextStyle(
                    color: color,
                    fontSize: 18,
                    fontWeight: FontWeight.bold)),
            Text(label,
                style: const TextStyle(
                    color: Color(0xFF64748b), fontSize: 10)),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChips(Map<String, int> counts) {
    return SizedBox(
      height: 44,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        itemCount: _moduleFilters.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, i) {
          final f = _moduleFilters[i];
          final key = f['key'] as String;
          final label = f['label'] as String;
          final color = f['color'] as Color;
          final isSelected = _selectedModule == key;
          final count = key == 'all'
              ? (_fetchedItems.isNotEmpty
                  ? _fetchedItems.length
                  : _publishedItems.length)
              : (counts[key] ?? 0);

          return ChoiceChip(
            label: Text('$label ${count > 0 ? "($count)" : ""}'),
            selected: isSelected,
            onSelected: (_) => setState(() => _selectedModule = key),
            selectedColor: color.withValues(alpha: 0.25),
            backgroundColor: const Color(0xFF1E293B),
            labelStyle: TextStyle(
              color: isSelected ? color : const Color(0xFF94a3b8),
              fontWeight:
                  isSelected ? FontWeight.bold : FontWeight.normal,
              fontSize: 12,
            ),
            side: BorderSide(
                color: isSelected
                    ? color.withValues(alpha: 0.6)
                    : Colors.transparent),
          );
        },
      ),
    );
  }

  Widget _buildNewsList() {
    final items = _displayItems;

    if (_isLoadingPublished) {
      return const Center(
          child: CircularProgressIndicator(color: Color(0xFF3b82f6)));
    }

    if (items.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(LucideIcons.newspaper,
                size: 64, color: Color(0xFF334155)),
            const SizedBox(height: 16),
            Text(
              _publishedItems.isEmpty
                  ? 'No news loaded yet.\nTap "Load Today\'s News" to fetch.'
                  : 'No items in this category.',
              textAlign: TextAlign.center,
              style: const TextStyle(color: Color(0xFF64748b), fontSize: 14),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        final moduleColor = Color(ModuleInfo.getColor(item.module));
        final isGovt = item.dataType != 'rss';

        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isGovt
                  ? moduleColor.withValues(alpha: 0.4)
                  : Colors.transparent,
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Module badge
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: moduleColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Center(
                  child: Text(
                    _moduleEmoji(item.module),
                    style: const TextStyle(fontSize: 18),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: moduleColor.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            ModuleInfo.getLabel(item.module),
                            style: TextStyle(
                                color: moduleColor,
                                fontSize: 10,
                                fontWeight: FontWeight.bold),
                          ),
                        ),
                        const SizedBox(width: 6),
                        if (isGovt)
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF6366f1)
                                  .withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text(
                              '🏛️ Govt',
                              style: TextStyle(
                                  color: Color(0xFF6366f1),
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      item.title,
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.w600),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      item.sourceName,
                      style: const TextStyle(
                          color: Color(0xFF64748b), fontSize: 11),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  String _moduleEmoji(String module) {
    const emojis = {
      'agro': '🌾',
      'teacho': '📚',
      'dealo': '🛒',
      'jobo': '💼',
      'driveo': '🚗',
      'testo': '🏥',
      'general': '📰',
    };
    return emojis[module] ?? '📰';
  }

  String _monthName(int m) {
    const months = [
      '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[m];
  }
}
