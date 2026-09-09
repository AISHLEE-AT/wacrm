import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../../core/env.dart';
import '../../auth/providers/auth_provider.dart';

class InboxScreen extends ConsumerStatefulWidget {
  const InboxScreen({super.key});

  @override
  ConsumerState<InboxScreen> createState() => _InboxScreenState();
}

class _InboxScreenState extends ConsumerState<InboxScreen> {
  bool _useWebView = false;
  late final WebViewController _webViewController;
  bool _isWebViewLoading = true;

  // Native Inbox States
  bool _isLoading = true;
  String _searchQuery = '';
  String _activeFilter = 'all'; // all, unread, open, pending, closed
  List<Map<String, dynamic>> _conversations = [];
  Map<String, dynamic>? _selectedConversation;
  List<Map<String, dynamic>> _messages = [];
  bool _isLoadingMessages = false;
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  final List<String> _filters = ['all', 'unread', 'open', 'pending', 'closed'];

  @override
  void initState() {
    super.initState();
    _initWebView();
    _fetchConversations();
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _initWebView() {
    final user = ref.read(currentUserProvider);
    final phone = user?.phone ?? '';
    final token = ref.read(ociAuthStateProvider).token ?? '';
    final targetUrl = '${AppEnv.crmUrl}/inbox?embed=true&access_token=$token&phone=$phone';

    _webViewController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0A0F1E))
      ..setNavigationDelegate(
        NavigationDelegate(
          onNavigationRequest: (request) async {
            final url = request.url;
            if (url.startsWith('whatsapp://') ||
                url.startsWith('https://wa.me/') ||
                url.startsWith('https://api.whatsapp.com/') ||
                url.startsWith('tel:') ||
                url.startsWith('mailto:')) {
              final uri = Uri.parse(url);
              if (await canLaunchUrl(uri)) {
                await launchUrl(uri, mode: LaunchMode.externalApplication);
              }
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
          onPageFinished: (_) {
            if (mounted) {
              setState(() => _isWebViewLoading = false);
            }
          },
        ),
      )
      ..loadRequest(Uri.parse(targetUrl));
  }

  Future<void> _fetchConversations() async {
    setState(() => _isLoading = true);
    try {
      final res = await http.get(
        Uri.parse('${AppEnv.apiUrl}/api/conversations?embed=true'),
      ).timeout(const Duration(seconds: 8));

      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        List<dynamic> list = [];
        if (data is List) {
          list = data;
        } else if (data is Map && data['conversations'] is List) {
          list = data['conversations'];
        } else if (data is Map && data['data'] is List) {
          list = data['data'];
        }

        if (mounted) {
          setState(() {
            _conversations = list.map((item) => Map<String, dynamic>.from(item)).toList();
            _isLoading = false;
          });
        }
        return;
      }
    } catch (_) {}

    // Fallback: Initial data if backend API is temporarily offline
    if (mounted) {
      setState(() {
        if (_conversations.isEmpty) {
          _conversations = [
            {
              'id': 'conv_1',
              'contact': {
                'name': 'Raja Kumaran (Admin)',
                'phone': '916381029380',
                'category': 'Admin',
              },
              'last_message_text': 'SuprO 24h Daily Sync for +916381029380 🔔',
              'last_message_at': DateTime.now().subtract(const Duration(minutes: 15)).toIso8601String(),
              'unread_count': 0,
              'status': 'open',
            },
            {
              'id': 'conv_2',
              'contact': {
                'name': 'Selvam (Driver Partner)',
                'phone': '919842100001',
                'category': 'Driver',
              },
              'last_message_text': 'Ride request accepted for Madurai to Chennai route.',
              'last_message_at': DateTime.now().subtract(const Duration(hours: 2)).toIso8601String(),
              'unread_count': 1,
              'status': 'open',
            },
            {
              'id': 'conv_3',
              'contact': {
                'name': 'Kavitha (TutO Student)',
                'phone': '919876543210',
                'category': 'Student',
              },
              'last_message_text': 'Completed Day 14 NEET Biology test with 95% score!',
              'last_message_at': DateTime.now().subtract(const Duration(hours: 5)).toIso8601String(),
              'unread_count': 0,
              'status': 'pending',
            },
          ];
        }
        _isLoading = false;
      });
    }
  }

  Future<void> _selectConversation(Map<String, dynamic> conv) async {
    setState(() {
      _selectedConversation = conv;
      _isLoadingMessages = true;
    });

    final convId = conv['id'];
    try {
      final res = await http.get(
        Uri.parse('${AppEnv.apiUrl}/api/conversations/$convId/messages'),
      ).timeout(const Duration(seconds: 6));

      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        List<dynamic> list = [];
        if (data is List) {
          list = data;
        } else if (data is Map && data['messages'] is List) {
          list = data['messages'];
        }

        if (mounted) {
          setState(() {
            _messages = list.map((item) => Map<String, dynamic>.from(item)).toList();
            _isLoadingMessages = false;
          });
          _scrollToBottom();
        }
        return;
      }
    } catch (_) {}

    // Fallback message thread
    if (mounted) {
      setState(() {
        _messages = [
          {
            'id': 'msg_1',
            'sender': 'customer',
            'sender_type': 'customer',
            'content_text': conv['last_message_text'] ?? 'Hello SuprO team!',
            'content': conv['last_message_text'] ?? 'Hello SuprO team!',
            'created_at': conv['last_message_at'] ?? DateTime.now().toIso8601String(),
          },
          {
            'id': 'msg_2',
            'sender': 'agent',
            'sender_type': 'agent',
            'content_text': 'Welcome to SuprO! Your 24-hour customer service window is active.',
            'content': 'Welcome to SuprO! Your 24-hour customer service window is active.',
            'created_at': DateTime.now().toIso8601String(),
          },
        ];
        _isLoadingMessages = false;
      });
      _scrollToBottom();
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage({String? templateText}) async {
    final text = templateText ?? _messageController.text.trim();
    if (text.isEmpty || _selectedConversation == null) return;

    final newMsg = {
      'id': 'temp_${DateTime.now().millisecondsSinceEpoch}',
      'sender': 'agent',
      'sender_type': 'agent',
      'content_text': text,
      'content': text,
      'created_at': DateTime.now().toIso8601String(),
      'status': 'sent',
    };

    setState(() {
      _messages.add(newMsg);
      if (templateText == null) _messageController.clear();
    });
    _scrollToBottom();

    try {
      final phone = _selectedConversation?['contact']?['phone'] ?? '';
      final convId = _selectedConversation?['id'];
      await http.post(
        Uri.parse('${AppEnv.apiUrl}/api/whatsapp/send'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'conversation_id': convId,
          'conversationId': convId,
          'phone': phone,
          'content_text': text,
          'text': text,
          'message': text,
        }),
      ).timeout(const Duration(seconds: 8));
    } catch (_) {}
  }

  void _showTemplatePicker() {
    final templates = [
      {'title': '🔔 24h Session Sync', 'text': 'SuprO 24h Daily Sync Keep-Alive Ping ⚡'},
      {'title': '🚖 Ride Confirmation', 'text': 'Your RideO taxi booking is confirmed! Driver details arriving shortly.'},
      {'title': '🚜 RentO Equipment Booking', 'text': 'Your RentO farming machinery request is received and under processing.'},
      {'title': '🎓 TutO Daily Mission', 'text': 'Your TutO Daily Study Mission is live! Open the app to complete today’s 10 classes.'},
      {'title': '👋 General Greeting', 'text': 'Hello from SuprO Support! How can we assist you with local services today?'},
    ];

    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(LucideIcons.fileText, color: Color(0xFF10B981), size: 20),
                  SizedBox(width: 8),
                  Text(
                    'WhatsApp Quick Templates',
                    style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              ...templates.map((tpl) => ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(tpl['title']!, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                subtitle: Text(tpl['text']!, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                trailing: const Icon(LucideIcons.send, color: Color(0xFF10B981), size: 16),
                onTap: () {
                  Navigator.pop(context);
                  _sendMessage(templateText: tpl['text']);
                },
              )),
            ],
          ),
        );
      },
    );
  }

  void _showContactDetails() {
    if (_selectedConversation == null) return;
    final contact = _selectedConversation!['contact'] ?? {};
    final name = contact['name'] ?? 'Unknown User';
    final phone = contact['phone'] ?? '';
    final category = contact['category'] ?? 'Traveller';

    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(LucideIcons.user, color: Color(0xFF10B981), size: 26),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(name, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 2),
                        Text('+91 $phone', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                    ),
                    child: Text(category, style: const TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold, fontSize: 11)),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10B981),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      onPressed: () async {
                        final url = Uri.parse('https://wa.me/$phone');
                        if (await canLaunchUrl(url)) {
                          await launchUrl(url, mode: LaunchMode.externalApplication);
                        }
                      },
                      icon: const Icon(LucideIcons.messageCircle, color: Colors.white, size: 18),
                      label: const Text('Direct WhatsApp', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF334155)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      onPressed: () async {
                        final url = Uri.parse('tel:$phone');
                        if (await canLaunchUrl(url)) {
                          await launchUrl(url);
                        }
                      },
                      icon: const Icon(LucideIcons.phone, color: Color(0xFF94A3B8), size: 18),
                      label: const Text('Call Contact', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final sessionState = ref.watch(whatsAppSessionProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D1526),
        elevation: 0,
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(LucideIcons.messageSquare, color: Color(0xFF10B981), size: 18),
            ),
            const SizedBox(width: 8),
            const Flexible(
              child: Text(
                'WA CRM',
                overflow: TextOverflow.ellipsis,
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
              ),
            ),
          ],
        ),
        actions: [
          // 24-Hour Session Status Badge
          Container(
            margin: const EdgeInsets.symmetric(vertical: 12),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: sessionState.isSessionActive
                  ? const Color(0xFF10B981).withValues(alpha: 0.15)
                  : const Color(0xFFF59E0B).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: sessionState.isSessionActive ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                CircleAvatar(
                  radius: 3,
                  backgroundColor: sessionState.isSessionActive ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                ),
                const SizedBox(width: 5),
                Text(
                  sessionState.isSessionActive ? '${sessionState.formattedRemaining} left' : '24h Sync Needed',
                  style: TextStyle(
                    color: sessionState.isSessionActive ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: Icon(
              _useWebView ? LucideIcons.layoutList : LucideIcons.globe,
              color: const Color(0xFF94A3B8),
              size: 20,
            ),
            tooltip: _useWebView ? 'Switch to Native' : 'Switch to Web CRM',
            onPressed: () => setState(() => _useWebView = !_useWebView),
          ),
          IconButton(
            icon: const Icon(LucideIcons.refreshCw, color: Color(0xFF94A3B8), size: 18),
            onPressed: () {
              if (_useWebView) {
                _webViewController.reload();
              } else {
                _fetchConversations();
              }
            },
          ),
        ],
      ),
      body: _useWebView ? _buildWebView() : _buildNativeInbox(sessionState),
    );
  }

  Widget _buildWebView() {
    return Stack(
      children: [
        WebViewWidget(controller: _webViewController),
        if (_isWebViewLoading)
          const Center(child: CircularProgressIndicator(color: Color(0xFF10B981))),
      ],
    );
  }

  Widget _buildNativeInbox(WhatsAppSessionState sessionState) {
    if (_selectedConversation != null) {
      return _buildMessageThread(sessionState);
    }

    final filtered = _conversations.filterByQueryAndFilter(_searchQuery, _activeFilter);

    return Column(
      children: [
        // 24-Hour Active Sync Banner
        _buildSessionBanner(sessionState),

        // Search & Filter Bar
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: TextField(
            onChanged: (val) => setState(() => _searchQuery = val),
            style: const TextStyle(color: Colors.white, fontSize: 13),
            decoration: InputDecoration(
              isDense: true,
              hintText: 'Search chats, contacts or messages...',
              hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
              prefixIcon: const Icon(LucideIcons.search, color: Color(0xFF64748B), size: 16),
              filled: true,
              fillColor: const Color(0xFF0F172A),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Color(0xFF1E293B)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Color(0xFF1E293B)),
              ),
            ),
          ),
        ),

        // Filter chips
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
          child: Row(
            children: _filters.map((f) {
              final isSelected = _activeFilter == f;
              return Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: ChoiceChip(
                  label: Text(
                    f.toUpperCase(),
                    style: TextStyle(
                      color: isSelected ? Colors.white : const Color(0xFF94A3B8),
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  selected: isSelected,
                  selectedColor: const Color(0xFF10B981),
                  backgroundColor: const Color(0xFF0F172A),
                  side: BorderSide(
                    color: isSelected ? const Color(0xFF10B981) : const Color(0xFF1E293B),
                  ),
                  onSelected: (_) => setState(() => _activeFilter = f),
                ),
              );
            }).toList(),
          ),
        ),

        const SizedBox(height: 6),

        // Conversation List
        Expanded(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator(color: Color(0xFF10B981)))
              : filtered.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(LucideIcons.messageSquareDashed, color: Color(0xFF64748B), size: 48),
                          const SizedBox(height: 12),
                          const Text('No conversations found', style: TextStyle(color: Color(0xFF94A3B8), fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Text('All inbound customer messages appear here in real time.', style: TextStyle(color: Colors.white.withValues(alpha: 0.4), fontSize: 12)),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      color: const Color(0xFF10B981),
                      onRefresh: _fetchConversations,
                      child: ListView.separated(
                        itemCount: filtered.length,
                        separatorBuilder: (_, __) => const Divider(color: Color(0xFF1E293B), height: 1),
                        itemBuilder: (context, index) {
                          final c = filtered[index];
                          final contact = c['contact'] ?? {};
                          final name = contact['name'] ?? 'Contact';
                          final lastMsg = c['last_message_text'] ?? 'No messages';
                          final unread = c['unread_count'] ?? 0;

                          return ListTile(
                            onTap: () => _selectConversation(c),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                            leading: Stack(
                              children: [
                                CircleAvatar(
                                  radius: 22,
                                  backgroundColor: const Color(0xFF1E293B),
                                  child: Text(
                                    name.isNotEmpty ? name[0].toUpperCase() : '?',
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                                  ),
                                ),
                                Positioned(
                                  bottom: 0,
                                  right: 0,
                                  child: Container(
                                    width: 10,
                                    height: 10,
                                    decoration: const BoxDecoration(
                                      color: Color(0xFF10B981),
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            title: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    name,
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                Text(
                                  'Active',
                                  style: TextStyle(color: Colors.white.withValues(alpha: 0.4), fontSize: 10),
                                ),
                              ],
                            ),
                            subtitle: Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    lastMsg,
                                    style: TextStyle(
                                      color: unread > 0 ? Colors.white : const Color(0xFF94A3B8),
                                      fontWeight: unread > 0 ? FontWeight.bold : FontWeight.normal,
                                      fontSize: 12,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                if (unread > 0)
                                  Container(
                                    margin: const EdgeInsets.only(left: 8),
                                    padding: const EdgeInsets.all(6),
                                    decoration: const BoxDecoration(
                                      color: Color(0xFF10B981),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Text(
                                      '$unread',
                                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
        ),
      ],
    );
  }

  Widget _buildSessionBanner(WhatsAppSessionState sessionState) {
    final active = sessionState.isSessionActive;
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: active ? const Color(0xFF10B981).withValues(alpha: 0.1) : const Color(0xFFF59E0B).withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: active ? const Color(0xFF10B981).withValues(alpha: 0.3) : const Color(0xFFF59E0B).withValues(alpha: 0.3),
        ),
      ),
      child: Row(
        children: [
          Icon(
            active ? LucideIcons.sparkles : LucideIcons.alertTriangle,
            color: active ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
            size: 18,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  active ? '24h Meta Customer Window Active' : '24h Customer Session Expired',
                  style: TextStyle(
                    color: active ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
                Text(
                  active
                      ? '${sessionState.formattedRemaining} remaining to send freeform messages without templates.'
                      : 'Send a WhatsApp Template or have customer message to reopen 24h window.',
                  style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10),
                ),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: () async {
              final user = ref.read(currentUserProvider);
              final phone = user?.phone ?? AppEnv.wabaPhone;
              final url = Uri.parse('https://wa.me/${AppEnv.wabaPhone}?text=SuprO%2024h%20Daily%20Sync%20for%20%2B91$phone%20%F0%9F%94%94');
              if (await canLaunchUrl(url)) {
                await launchUrl(url, mode: LaunchMode.externalApplication);
                await ref.read(whatsAppSessionProvider.notifier).renewSessionLocal24Hours();
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: active ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('Daily Sync', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 11)),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageThread(WhatsAppSessionState sessionState) {
    final contact = _selectedConversation?['contact'] ?? {};
    final name = contact['name'] ?? 'User';

    return Column(
      children: [
        // Thread Top Bar
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: const BoxDecoration(
            color: Color(0xFF0F172A),
            border: Border(bottom: BorderSide(color: Color(0xFF1E293B))),
          ),
          child: Row(
            children: [
              IconButton(
                icon: const Icon(LucideIcons.arrowLeft, color: Colors.white, size: 20),
                onPressed: () => setState(() => _selectedConversation = null),
              ),
              CircleAvatar(
                radius: 16,
                backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.2),
                child: Text(name.isNotEmpty ? name[0].toUpperCase() : '?', style: const TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold)),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                    const Text('WhatsApp Customer Service Window Active', style: TextStyle(color: Color(0xFF10B981), fontSize: 10)),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(LucideIcons.info, color: Color(0xFF94A3B8), size: 18),
                onPressed: _showContactDetails,
              ),
            ],
          ),
        ),

        // 24h Window countdown strip
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          color: const Color(0xFF10B981).withValues(alpha: 0.1),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(LucideIcons.clock, color: Color(0xFF10B981), size: 12),
              const SizedBox(width: 6),
              Text(
                '24h Window: ${sessionState.formattedRemaining} remaining',
                style: const TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),

        // Message stream
        Expanded(
          child: _isLoadingMessages
              ? const Center(child: CircularProgressIndicator(color: Color(0xFF10B981)))
              : ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  itemCount: _messages.length,
                  itemBuilder: (context, index) {
                    final msg = _messages[index];
                    final isAgent = msg['sender'] == 'agent' ||
                        msg['sender_type'] == 'agent' ||
                        msg['sender_type'] == 'bot';
                    final content = (msg['content_text'] as String?)?.isNotEmpty == true
                        ? msg['content_text'] as String
                        : (msg['content'] as String?)?.isNotEmpty == true
                            ? msg['content'] as String
                            : (msg['text'] as String?) ?? '';

                    String timeStr = 'Now';
                    if (msg['created_at'] != null) {
                      try {
                        final dt = DateTime.parse(msg['created_at'].toString()).toLocal();
                        final hour = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
                        final min = dt.minute.toString().padLeft(2, '0');
                        final ampm = dt.hour >= 12 ? 'PM' : 'AM';
                        timeStr = '$hour:$min $ampm';
                      } catch (_) {}
                    }

                    final status = (msg['status'] ?? 'sent').toString();

                    return Align(
                      alignment: isAgent ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: isAgent ? const Color(0xFF059669) : const Color(0xFF1E293B),
                          borderRadius: BorderRadius.only(
                            topLeft: const Radius.circular(16),
                            topRight: const Radius.circular(16),
                            bottomLeft: isAgent ? const Radius.circular(16) : const Radius.circular(4),
                            bottomRight: isAgent ? const Radius.circular(4) : const Radius.circular(16),
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: isAgent ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                          children: [
                            Text(
                              content,
                              style: const TextStyle(color: Colors.white, fontSize: 13, height: 1.3),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  timeStr,
                                  style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 9),
                                ),
                                if (isAgent) ...[
                                  const SizedBox(width: 4),
                                  Icon(
                                    status == 'read'
                                        ? LucideIcons.checkCheck
                                        : (status == 'delivered' ? LucideIcons.checkCheck : LucideIcons.check),
                                    color: status == 'read' ? const Color(0xFF38BDF8) : Colors.white70,
                                    size: 12,
                                  ),
                                ],
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),

        // Message Composer
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: const BoxDecoration(
            color: Color(0xFF0D1526),
            border: Border(top: BorderSide(color: Color(0xFF1E293B))),
          ),
          child: Row(
            children: [
              IconButton(
                icon: const Icon(LucideIcons.fileText, color: Color(0xFF10B981), size: 20),
                tooltip: 'WhatsApp Template',
                onPressed: _showTemplatePicker,
              ),
              Expanded(
                child: TextField(
                  controller: _messageController,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: InputDecoration(
                    isDense: true,
                    hintText: 'Type a message to WhatsApp customer...',
                    hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
                    filled: true,
                    fillColor: const Color(0xFF0F172A),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  ),
                  onSubmitted: (_) => _sendMessage(),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                decoration: const BoxDecoration(
                  color: Color(0xFF10B981),
                  shape: BoxShape.circle,
                ),
                child: IconButton(
                  icon: const Icon(LucideIcons.send, color: Colors.white, size: 16),
                  onPressed: () => _sendMessage(),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

extension ConversationFilter on List<Map<String, dynamic>> {
  List<Map<String, dynamic>> filterByQueryAndFilter(String query, String filter) {
    return where((c) {
      if (filter == 'unread' && (c['unread_count'] ?? 0) <= 0) return false;
      if (filter != 'all' && filter != 'unread' && c['status'] != filter) return false;

      if (query.trim().isNotEmpty) {
        final q = query.toLowerCase();
        final contact = c['contact'] ?? {};
        final name = (contact['name'] ?? '').toString().toLowerCase();
        final phone = (contact['phone'] ?? '').toString().toLowerCase();
        final lastMsg = (c['last_message_text'] ?? '').toString().toLowerCase();
        return name.contains(q) || phone.contains(q) || lastMsg.contains(q);
      }
      return true;
    }).toList();
  }
}
