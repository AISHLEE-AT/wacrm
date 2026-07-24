import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
import 'package:url_launcher/url_launcher.dart';

class WebModuleScreen extends StatefulWidget {
  final String title;
  final String modulePath;

  const WebModuleScreen({
    super.key,
    required this.title,
    required this.modulePath,
  });

  @override
  State<WebModuleScreen> createState() => _WebModuleScreenState();
}

class _WebModuleScreenState extends State<WebModuleScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initWebViewController();
  }

  void _initWebViewController() {
    final cleanPath = widget.modulePath.startsWith('/') ? widget.modulePath : '/${widget.modulePath}';
    
    final List<String> urlCandidates = [
      'https://watscrm.vercel.app$cleanPath',
      'https://watscrm.vercel.app/#$cleanPath',
      'https://thamizhan.vercel.app$cleanPath',
      'https://thamizhan.vercel.app/#$cleanPath',
    ];

    int attemptIndex = 0;
    late final WebViewController controller;

    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0F172A))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            if (mounted) setState(() => _isLoading = true);
          },
          onPageFinished: (String url) {
            if (mounted) setState(() => _isLoading = false);
          },
          onHttpError: (HttpResponseError error) {
            if (error.response?.statusCode == 404 && attemptIndex < urlCandidates.length - 1) {
              attemptIndex++;
              controller.loadRequest(Uri.parse(urlCandidates[attemptIndex]));
            }
          },
          onWebResourceError: (WebResourceError error) {
            if (error.description.contains('404') && attemptIndex < urlCandidates.length - 1) {
              attemptIndex++;
              controller.loadRequest(Uri.parse(urlCandidates[attemptIndex]));
            }
          },
          onNavigationRequest: (NavigationRequest request) {
            final url = request.url;

            if (url.startsWith('whatsapp://') ||
                url.contains('wa.me') ||
                url.contains('api.whatsapp.com')) {
              _launchExternalUri(Uri.parse(url));
              return NavigationDecision.prevent;
            }

            if (url.startsWith('google.navigation:') || url.contains('google.com/maps')) {
              _launchExternalUri(Uri.parse(url));
              return NavigationDecision.prevent;
            }

            if (url.startsWith('tel:')) {
              _launchExternalUri(Uri.parse(url));
              return NavigationDecision.prevent;
            }

            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(urlCandidates[0]));

    if (controller.platform is AndroidWebViewController) {
      final androidController = controller.platform as AndroidWebViewController;
      androidController.setOnPlatformPermissionRequest(
        (PlatformWebViewPermissionRequest request) {
          request.grant();
        },
      );
    }

    _controller = controller;
  }

  Future<void> _launchExternalUri(Uri uri) async {
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: Text(widget.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: const Color(0xFF1E293B),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white70),
            onPressed: () => _controller.reload(),
            tooltip: 'Reload Module',
          ),
        ],
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(color: Color(0xFF00FF00)),
            ),
        ],
      ),
    );
  }
}
