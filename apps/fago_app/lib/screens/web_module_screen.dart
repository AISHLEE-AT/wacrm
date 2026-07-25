import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
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
  bool _hasError = false;
  String _errorMessage = '';
  String _currentUrl = '';

  @override
  void initState() {
    super.initState();
    _initWebViewController();
  }

  void _initWebViewController() {
    final cleanPath = widget.modulePath.startsWith('/')
        ? widget.modulePath
        : '/${widget.modulePath}';

    // Retrieve active Supabase user credentials for seamless WebView auto-login
    final user = Supabase.instance.client.auth.currentUser;
    final session = Supabase.instance.client.auth.currentSession;
    
    String authQueryParams = '';
    if (user != null) {
      final String phone = user.phone ?? user.userMetadata?['phone']?.toString() ?? user.userMetadata?['whatsapp']?.toString() ?? '';
      final String cleanPhone = phone.replaceAll(RegExp(r'\D'), '');
      authQueryParams = '?phone=$cleanPhone&user_id=${user.id}';
      if (session?.accessToken != null) {
        authQueryParams += '&access_token=${session!.accessToken}';
      }
      if (session?.refreshToken != null) {
        authQueryParams += '&refresh_token=${session!.refreshToken}';
      }
    }

    final List<String> urlCandidates = [
      'https://watscrm.vercel.app$cleanPath$authQueryParams',
      'https://thamizhan.vercel.app$cleanPath$authQueryParams',
      'https://watscrm.vercel.app$cleanPath',
    ];

    int attemptIndex = 0;
    _currentUrl = urlCandidates[0];

    final WebViewController controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0F172A))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            if (mounted) {
              setState(() {
                _isLoading = true;
                _hasError = false;
                _currentUrl = url;
              });
            }
          },
          onPageFinished: (String url) {
            if (mounted) {
              setState(() => _isLoading = false);
            }
          },
          onHttpError: (HttpResponseError error) {
            final statusCode = error.response?.statusCode ?? 0;
            if (statusCode >= 400 && attemptIndex < urlCandidates.length - 1) {
              attemptIndex++;
              _controller.loadRequest(Uri.parse(urlCandidates[attemptIndex]));
            } else if (statusCode >= 400) {
              if (mounted) {
                setState(() {
                  _hasError = true;
                  _errorMessage = 'Module page returned HTTP $statusCode';
                });
              }
            }
          },
          onWebResourceError: (WebResourceError error) {
            // Only trigger error state for main frame load failures
            if (error.isForMainFrame == true && attemptIndex < urlCandidates.length - 1) {
              attemptIndex++;
              _controller.loadRequest(Uri.parse(urlCandidates[attemptIndex]));
            } else if (error.isForMainFrame == true) {
              if (mounted) {
                setState(() {
                  _hasError = true;
                  _errorMessage = error.description;
                });
              }
            }
          },
          onNavigationRequest: (NavigationRequest request) {
            final url = request.url;

            // Handle WhatsApp Deep Links
            if (url.startsWith('whatsapp://') ||
                url.contains('wa.me') ||
                url.contains('api.whatsapp.com')) {
              _launchExternalUri(Uri.parse(url));
              return NavigationDecision.prevent;
            }

            // Handle Navigation / Maps Links
            if (url.startsWith('google.navigation:') ||
                url.contains('google.com/maps') ||
                url.contains('maps.google.com')) {
              _launchExternalUri(Uri.parse(url));
              return NavigationDecision.prevent;
            }

            // Handle Telephone Calls
            if (url.startsWith('tel:')) {
              _launchExternalUri(Uri.parse(url));
              return NavigationDecision.prevent;
            }

            // Handle UPI Payment Links
            if (url.startsWith('upi://')) {
              _launchExternalUri(Uri.parse(url));
              return NavigationDecision.prevent;
            }

            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(urlCandidates[0]));

    // Enable essential Android WebView features for Next.js web apps
    if (controller.platform is AndroidWebViewController) {
      final androidController = controller.platform as AndroidWebViewController;
      androidController.setMediaPlaybackRequiresUserGesture(false);
      androidController.setOnPlatformPermissionRequest(
        (PlatformWebViewPermissionRequest request) {
          request.grant();
        },
      );
    }

    _controller = controller;
  }

  Future<void> _launchExternalUri(Uri uri) async {
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    } catch (e) {
      debugPrint('Could not launch URI $uri: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        if (await _controller.canGoBack()) {
          await _controller.goBack();
        } else {
          if (context.mounted) {
            Navigator.of(context).pop();
          }
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF0F172A),
        appBar: AppBar(
          title: Text(
            widget.title,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          backgroundColor: const Color(0xFF1E293B),
          foregroundColor: Colors.white,
          actions: [
            IconButton(
              icon: const Icon(Icons.refresh, color: Colors.white70),
              onPressed: () {
                setState(() => _hasError = false);
                _controller.reload();
              },
              tooltip: 'Reload Module',
            ),
            IconButton(
              icon: const Icon(Icons.open_in_browser, color: Colors.cyanAccent),
              onPressed: () {
                if (_currentUrl.isNotEmpty) {
                  _launchExternalUri(Uri.parse(_currentUrl));
                }
              },
              tooltip: 'Open in Browser',
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
            if (_hasError)
              Container(
                color: const Color(0xFF0F172A),
                padding: const EdgeInsets.all(24),
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.cloud_off, color: Colors.amber, size: 64),
                      const SizedBox(height: 16),
                      Text(
                        'Unable to load ${widget.title}',
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _errorMessage.isNotEmpty
                            ? _errorMessage
                            : 'Please check your internet connection and try again.',
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.white70, fontSize: 13),
                      ),
                      const SizedBox(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          ElevatedButton.icon(
                            onPressed: () {
                              setState(() => _hasError = false);
                              _controller.reload();
                            },
                            icon: const Icon(Icons.refresh, color: Colors.black),
                            label: const Text('Retry'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF00FF00),
                              foregroundColor: Colors.black,
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 20, vertical: 12),
                            ),
                          ),
                          const SizedBox(width: 12),
                          OutlinedButton.icon(
                            onPressed: () {
                              if (_currentUrl.isNotEmpty) {
                                _launchExternalUri(Uri.parse(_currentUrl));
                              }
                            },
                            icon: const Icon(Icons.language, color: Colors.cyanAccent),
                            label: const Text('Open Web', style: TextStyle(color: Colors.cyanAccent)),
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: Colors.cyanAccent),
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 20, vertical: 12),
                            ),
                          ),
                        ],
                      ),
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
