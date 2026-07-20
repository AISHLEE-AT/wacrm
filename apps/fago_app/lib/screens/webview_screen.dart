import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'dart:convert';

class WebViewScreen extends StatefulWidget {
  final String url;
  
  const WebViewScreen({super.key, required this.url});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;
  bool _hasError = false;
  String _currentUrl = '';

  @override
  void initState() {
    super.initState();
    _currentUrl = widget.url;
    _initController();
  }

  /// If URL changes from parent (single-WebView mode), navigate in place
  @override
  void didUpdateWidget(WebViewScreen old) {
    super.didUpdateWidget(old);
    if (old.url != widget.url && widget.url.isNotEmpty) {
      _currentUrl = widget.url;
      _controller.loadRequest(Uri.parse(widget.url));
    }
  }

  Future<void> _injectSession() async {
    final session = Supabase.instance.client.auth.currentSession;
    if (session == null) return;
    try {
      final sessionData = json.encode({
        'access_token': session.accessToken,
        'refresh_token': session.refreshToken ?? '',
      });

      await _controller.runJavaScript('''
        (function() {
          if (window.__SUPABASE_INJECTED__) return;
          var sd = $sessionData;
          // Write into localStorage using the project-specific key
          try {
            localStorage.setItem(
              'sb-gmahjdzqitbomtmdzlfp-auth-token',
              JSON.stringify({
                access_token: sd.access_token,
                refresh_token: sd.refresh_token,
                expires_at: Math.floor(Date.now()/1000) + 3600,
                token_type: 'bearer'
              })
            );
          } catch(e) {}
          // Also fire the custom event AppProvider listens for
          window.dispatchEvent(new CustomEvent('mobileSessionInjected', { detail: sd }));
          window.__SUPABASE_INJECTED__ = true;
        })();
      ''');
    } catch (e) {
      debugPrint('JS injection error: \$e');
    }
  }

  void _initController() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0A0A0A))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) => setState(() { _isLoading = true; _hasError = false; }),
          onPageFinished: (_) async {
            // Inject session AFTER page loads - no token in URL (secure)
            await _injectSession();
            // Re-inject after 1s in case page JS wasn't ready
            Future.delayed(const Duration(milliseconds: 1000), _injectSession);
            setState(() => _isLoading = false);
          },
          onWebResourceError: (error) {
            if (error.isForMainFrame == true) {
              setState(() { _hasError = true; _isLoading = false; });
            }
          },
        ),
      )
      ..loadRequest(Uri.parse(_currentUrl));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      body: SafeArea(
        child: Stack(
          children: [
            if (_hasError)
              Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.wifi_off, color: Colors.grey, size: 56),
                    const SizedBox(height: 16),
                    const Text('No connection',
                        style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Text('Check your internet and try again.',
                        style: TextStyle(color: Colors.grey.shade500, fontSize: 13)),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF4F46E5),
                        padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () {
                        setState(() { _hasError = false; _isLoading = true; });
                        _controller.loadRequest(Uri.parse(_currentUrl));
                      },
                      icon: const Icon(Icons.refresh, color: Colors.white),
                      label: const Text('Retry', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              )
            else
              WebViewWidget(controller: _controller),

            if (_isLoading && !_hasError)
              Container(
                color: const Color(0xFF0A0A0A),
                child: const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      CircularProgressIndicator(
                        color: Color(0xFF6366F1),
                        strokeWidth: 3,
                      ),
                      SizedBox(height: 16),
                      Text('Loading...', style: TextStyle(color: Colors.white38, fontSize: 13)),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
