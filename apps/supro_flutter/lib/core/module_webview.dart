import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

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
          onNavigationRequest: (NavigationRequest request) async {
            final url = request.url;
            debugPrint('ModuleWebView navigation request: $url');
            
            // Intercept WhatsApp, phone calls, mailto, and external map links
            if (url.startsWith('whatsapp://') ||
                url.startsWith('https://wa.me/') ||
                url.startsWith('https://api.whatsapp.com/') ||
                url.startsWith('tel:') ||
                url.startsWith('mailto:') ||
                url.startsWith('geo:') ||
                url.contains('maps.google.com') ||
                url.contains('google.com/maps')) {
              try {
                final uri = Uri.parse(url);
                if (await canLaunchUrl(uri)) {
                  await launchUrl(uri, mode: LaunchMode.externalApplication);
                } else {
                  // Fallback: convert whatsapp:// to https://wa.me/
                  if (url.startsWith('whatsapp://send')) {
                    final uriParsed = Uri.parse(url);
                    final phone = uriParsed.queryParameters['phone'] ?? '';
                    final text = uriParsed.queryParameters['text'] ?? '';
                    final fallbackUri = Uri.parse('https://wa.me/$phone?text=${Uri.encodeComponent(text)}');
                    await launchUrl(fallbackUri, mode: LaunchMode.externalApplication);
                  }
                }
              } catch (e) {
                debugPrint('Failed to launch external URL: $e');
              }
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
          onPageFinished: (String url) async {
            if (mounted) {
              setState(() {
                _isLoading = false;
              });
            }
            
            // Hide desktop nav sidebar to make it feel native
            final js = '''
              (function() {
                var style = document.createElement('style');
                style.innerHTML = 'nav.w-64 { display: none !important; } .lg\\\\:pl-64 { padding-left: 0 !important; } header { display: none !important; }';
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
