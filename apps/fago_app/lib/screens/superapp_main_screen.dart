import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'webview_screen.dart';

final _kBaseUrl = 'https://watscrm.vercel.app';

class SuperAppMainScreen extends ConsumerStatefulWidget {
  final String? initialUrl;
  final int initialIndex;
  const SuperAppMainScreen({super.key, this.initialUrl, this.initialIndex = 0});

  @override
  ConsumerState<SuperAppMainScreen> createState() => _SuperAppMainScreenState();
}

class _SuperAppMainScreenState extends ConsumerState<SuperAppMainScreen> {
  String _activeWebUrl = '/';

  @override
  void initState() {
    super.initState();
    if (widget.initialUrl != null && widget.initialUrl!.isNotEmpty && widget.initialUrl != 'rideo') {
      _activeWebUrl = widget.initialUrl!;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      body: WebViewScreen(
        key: const ValueKey('main_webview'),
        url: _activeWebUrl,
      ),
    );
  }
}
