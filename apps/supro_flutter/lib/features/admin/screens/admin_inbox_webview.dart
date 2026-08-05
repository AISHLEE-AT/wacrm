import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AdminInboxWebview extends StatefulWidget {
  const AdminInboxWebview({super.key});

  @override
  State<AdminInboxWebview> createState() => _AdminInboxWebviewState();
}

class _AdminInboxWebviewState extends State<AdminInboxWebview> {
  late final WebViewController _controller;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0a0f1e))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (String url) async {
            setState(() {
              _isLoading = false;
            });
            
            final session = Supabase.instance.client.auth.currentSession;
            if (session != null) {
              final token = session.accessToken;
              // Inject token into localStorage for Next.js app
              final js = '''
                (function() {
                  var tokenKey = 'sb-jjgdatjthyeesmgunnlp-auth-token';
                  var existing = localStorage.getItem(tokenKey);
                  if (!existing) {
                    localStorage.setItem(tokenKey, JSON.stringify({
                      access_token: "$token",
                      user: ${jsonEncode(session.user.toJson())}
                    }));
                    if (window.location.pathname !== '/inbox') {
                      window.location.href = '/inbox';
                    }
                  }
                  
                  // Hide web app nav sidebar to make it feel native
                  var style = document.createElement('style');
                  style.innerHTML = 'nav.w-64 { display: none !important; } .lg\\\\:pl-64 { padding-left: 0 !important; }';
                  document.head.appendChild(style);
                })();
              ''';
              await _controller.runJavaScript(js);
            }
          },
        ),
      )
      ..loadRequest(Uri.parse('https://watscrm.vercel.app/inbox'));
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        WebViewWidget(controller: _controller),
        if (_isLoading)
          const Center(
            child: CircularProgressIndicator(color: Color(0xFFef4444)),
          ),
      ],
    );
  }
}
