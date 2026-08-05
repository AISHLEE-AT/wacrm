import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/daily_news_item.dart';
import '../services/daily_news_supabase_service.dart';

/// Reusable widget that displays today's curated news for any SuprO module.
/// Usage:
///   ModuleNewsSection(module: 'agro')
///   ModuleNewsSection(module: 'teacho')
class ModuleNewsSection extends StatefulWidget {
  final String module;
  final String emptyMessage;

  const ModuleNewsSection({
    super.key,
    required this.module,
    this.emptyMessage = 'No news loaded for today yet.\nAdmin loads news every morning at 6 AM.',
  });

  @override
  State<ModuleNewsSection> createState() => _ModuleNewsSectionState();
}

class _ModuleNewsSectionState extends State<ModuleNewsSection> {
  List<DailyNewsItem> _items = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final items =
        await DailyNewsSupabaseService.fetchNewsForModule(widget.module);
    if (mounted) {
      setState(() {
        _items = items;
        _isLoading = false;
      });
    }
  }

  Color get _moduleColor =>
      Color(ModuleInfo.getColor(widget.module));

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Center(
        child: CircularProgressIndicator(color: _moduleColor),
      );
    }

    if (_items.isEmpty) {
      return _buildEmpty();
    }

    return RefreshIndicator(
      color: _moduleColor,
      onRefresh: _load,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _items.length,
        itemBuilder: (context, index) => _buildNewsCard(_items[index]),
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(LucideIcons.newspaper,
              size: 64, color: _moduleColor.withValues(alpha: 0.4)),
          const SizedBox(height: 16),
          Text(
            widget.emptyMessage,
            textAlign: TextAlign.center,
            style: const TextStyle(
                color: Color(0xFF64748b), fontSize: 14, height: 1.6),
          ),
          const SizedBox(height: 24),
          TextButton.icon(
            onPressed: _load,
            icon: Icon(LucideIcons.refreshCw, color: _moduleColor, size: 16),
            label: Text('Refresh',
                style: TextStyle(color: _moduleColor)),
          ),
        ],
      ),
    );
  }

  Widget _buildNewsCard(DailyNewsItem item) {
    final isGovt = item.dataType != 'rss';
    return InkWell(
      onTap: () {
        if (item.link.isNotEmpty) {
          launchUrl(Uri.parse(item.link),
              mode: LaunchMode.externalApplication);
        }
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isGovt
                ? _moduleColor.withValues(alpha: 0.4)
                : Colors.transparent,
            width: isGovt ? 1.5 : 0,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image (RSS items only)
            if (item.imageUrl != null && item.dataType == 'rss')
              ClipRRect(
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(16)),
                child: Image.network(
                  item.imageUrl!,
                  height: 160,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (_, e, st) => _imagePlaceholder(),
                ),
              )
            else if (isGovt)
              _govtBanner(item),

            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      // Source chip
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: _moduleColor.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              isGovt ? LucideIcons.landmark : LucideIcons.rss,
                              size: 10,
                              color: _moduleColor,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              isGovt ? '🏛️ Govt Data' : item.sourceName,
                              style: TextStyle(
                                  color: _moduleColor,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                      const Spacer(),
                      if (item.publishedDate.isNotEmpty)
                        Text(
                          _formatDate(item.publishedDate),
                          style: const TextStyle(
                              color: Color(0xFF64748b), fontSize: 10),
                        ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    item.title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      height: 1.4,
                    ),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (item.description.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text(
                      item.description,
                      style: const TextStyle(
                          color: Color(0xFF94a3b8), fontSize: 13, height: 1.5),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _imagePlaceholder() {
    return Container(
      height: 120,
      decoration: const BoxDecoration(
          color: Color(0xFF334155),
          borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
      child: const Center(
          child: Icon(LucideIcons.newspaper, color: Colors.white24, size: 40)),
    );
  }

  Widget _govtBanner(DailyNewsItem item) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: _moduleColor.withValues(alpha: 0.1),
        borderRadius:
            const BorderRadius.vertical(top: Radius.circular(16)),
      ),
      child: Row(
        children: [
          Icon(LucideIcons.landmark, color: _moduleColor, size: 18),
          const SizedBox(width: 8),
          Text(
            '🏛️ data.gov.in — Government of India',
            style: TextStyle(
                color: _moduleColor,
                fontSize: 11,
                fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  String _formatDate(String raw) {
    if (raw.length >= 10 && raw.contains('-')) {
      return raw.substring(0, 10);
    }
    return raw.length > 16 ? raw.substring(0, 16) : raw;
  }
}
