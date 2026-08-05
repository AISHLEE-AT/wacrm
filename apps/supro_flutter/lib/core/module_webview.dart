import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:flutter_dotenv/flutter_dotenv.dart';

class ModuleWebView extends StatefulWidget {
  final String path;

  const ModuleWebView({super.key, required this.path});

  @override
  State<ModuleWebView> createState() => _ModuleWebViewState();
}

class _ModuleWebViewState extends State<ModuleWebView> {
  late final WebViewController _controller;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    
    final session = Supabase.instance.client.auth.currentSession;
    String authQueryParams = '?embed=true';
    if (session != null) {
      final token = session.accessToken;
      final refresh = session.refreshToken ?? '';
      authQueryParams += '&access_token=$token&refresh_token=$refresh';
    }
    
    if (widget.path.contains('?')) {
      authQueryParams = authQueryParams.replaceFirst('?', '&');
    }

    final targetUrl = 'https://watscrm.vercel.app${widget.path}$authQueryParams';

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0a0f1e))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (String url) async {
            if (mounted) {
              setState(() {
                _isLoading = false;
              });
            }
            
            // Hide web app desktop nav sidebar to make it feel native
            final js = '''
              (function() {
                var style = document.createElement('style');
                style.innerHTML = 'nav.w-64 { display: none !important; } .lg\\\\:pl-64 { padding-left: 0 !important; }';
                document.head.appendChild(style);
              })();
            ''';
            await _controller.runJavaScript(js);
          },
        ),
      )
      ..loadRequest(Uri.parse(targetUrl));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0f1e),
      body: SafeArea(
        child: Stack(
          children: [
            WebViewWidget(controller: _controller),
            if (_isLoading)
              const Center(
                child: CircularProgressIndicator(color: Color(0xFF10b981)),
              ),
          ],
        ),
      ),
    );
  }
}
