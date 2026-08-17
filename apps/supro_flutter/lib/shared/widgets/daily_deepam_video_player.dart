import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

class DailyDeepamVideoPlayer extends StatefulWidget {
  final String videoId;
  final String? videoTitle;
  final VoidCallback onVideoEnded;

  const DailyDeepamVideoPlayer({
    super.key,
    required this.videoId,
    this.videoTitle,
    required this.onVideoEnded,
  });

  @override
  State<DailyDeepamVideoPlayer> createState() => _DailyDeepamVideoPlayerState();
}

class _DailyDeepamVideoPlayerState extends State<DailyDeepamVideoPlayer>
    with SingleTickerProviderStateMixin {
  late final WebViewController _controller;
  bool _isLoading = true;
  bool _hasEnded = false;
  bool _canSkip = false;
  bool _isEnding = false;

  Timer? _skipTimer;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    _pulseAnimation = Tween<double>(begin: 0.9, end: 1.1).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _skipTimer = Timer(const Duration(seconds: 3), () {
      if (mounted) setState(() => _canSkip = true);
    });

    final String htmlContent = '''
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body {
              width: 100%;
              height: 100%;
              background-color: #0a0f1e;
              overflow: hidden;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .video-wrapper {
              position: relative;
              width: 100%;
              height: 100%;
              overflow: hidden;
              background: #000;
              border-radius: 12px;
            }
            iframe {
              position: absolute;
              top: -15%;
              left: -2%;
              width: 104%;
              height: 130%;
              border: 0;
              pointer-events: none;
            }
            .touch-blocker {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              z-index: 10;
              background: transparent;
            }
          </style>
        </head>
        <body>
          <div class="video-wrapper">
            <iframe
              id="ytplayer"
              src="https://www.youtube.com/embed/${widget.videoId}?autoplay=1&mute=0&controls=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&iv_load_policy=3&fs=0&disablekb=1&showinfo=0&origin=https://www.youtube.com"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen>
            </iframe>
            <div class="touch-blocker"></div>
          </div>
          <script>
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            var player;
            var pollTimer = null;
            var hasTriggeredEnd = false;

            function notifyFlutter(type) {
              if (window.FlutterDeepamBridge) {
                window.FlutterDeepamBridge.postMessage(JSON.stringify({ type: type }));
              }
            }

            function checkVideoProgress() {
              if (hasTriggeredEnd || !player) return;
              try {
                if (player.getCurrentTime && player.getDuration) {
                  var current = player.getCurrentTime();
                  var duration = player.getDuration();
                  if (duration > 0 && (duration - current) <= 0.35) {
                    hasTriggeredEnd = true;
                    if (pollTimer) clearInterval(pollTimer);
                    notifyFlutter('NEAR_END');
                  }
                }
              } catch(e) {}
            }

            function onYouTubeIframeAPIReady() {
              try {
                player = new YT.Player('ytplayer', {
                  events: {
                    'onReady': function(e) {
                      try {
                        e.target.unMute();
                        e.target.setVolume(100);
                        e.target.playVideo();
                      } catch(err) {}
                      notifyFlutter('READY');
                    },
                    'onStateChange': function(e) {
                      if (e.data === 1 || e.data === 3) {
                        try {
                          e.target.unMute();
                          e.target.setVolume(100);
                        } catch(err) {}
                        notifyFlutter('PLAYING');
                        if (!pollTimer) {
                          pollTimer = setInterval(checkVideoProgress, 150);
                        }
                      } else if (e.data === 0) {
                        if (!hasTriggeredEnd) {
                          hasTriggeredEnd = true;
                          if (pollTimer) clearInterval(pollTimer);
                          notifyFlutter('ENDED');
                        }
                      }
                    },
                    'onError': function(e) {
                      notifyFlutter('ERROR');
                    }
                  }
                });
              } catch(err) {}
            }
          </script>
        </body>
      </html>
    ''';

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0A0F1E))
      ..setUserAgent(
        'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      )
      ..addJavaScriptChannel(
        'FlutterDeepamBridge',
        onMessageReceived: (JavaScriptMessage message) {
          try {
            final data = jsonDecode(message.message);
            final type = data['type'];
            if (type == 'ENDED' || type == 'NEAR_END') {
              _triggerFinish();
            } else if (type == 'PLAYING' || type == 'READY') {
              if (mounted) setState(() => _isLoading = false);
            } else if (type == 'ERROR') {
              if (mounted) setState(() => _isLoading = false);
            }
          } catch (_) {
            if (mounted) setState(() => _isLoading = false);
          }
        },
      )
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (String url) {
            if (mounted) setState(() => _isLoading = false);
          },
        ),
      )
      ..loadHtmlString(htmlContent, baseUrl: 'https://www.youtube.com');
  }

  void _triggerFinish() {
    if (_isEnding) return;
    _isEnding = true;
    if (mounted) {
      setState(() => _hasEnded = true);
    }
    widget.onVideoEnded();
  }

  @override
  void dispose() {
    _skipTimer?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(top: 16),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF0D1526),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: const Color(0xFF10B981).withValues(alpha: 0.3),
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF10B981).withValues(alpha: 0.08),
            blurRadius: 16,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Banner Header
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ScaleTransition(
                scale: _pulseAnimation,
                child: const Icon(LucideIcons.sparkles, color: Color(0xFFFBBF24), size: 14),
              ),
              const SizedBox(width: 8),
              const Text(
                "✦ TODAY'S SUPRO DEEPAM BROADCAST ✦",
                style: TextStyle(
                  color: Color(0xFFFBBF24),
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 0.8,
                ),
              ),
              const SizedBox(width: 8),
              ScaleTransition(
                scale: _pulseAnimation,
                child: const Icon(LucideIcons.sparkles, color: Color(0xFFFBBF24), size: 14),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            widget.videoTitle ?? 'SuprO commercial ad #suprotrailer #suprotec #supro',
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.7),
              fontSize: 11,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 10),

          // Video Container
          AspectRatio(
            aspectRatio: 16 / 9,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Stack(
                children: [
                  WebViewWidget(controller: _controller),
                  if (_isLoading)
                    Container(
                      color: const Color(0xFF0A0F1E),
                      child: const Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Color(0xFF10B981),
                              ),
                            ),
                            SizedBox(height: 8),
                            Text(
                              'Starting Daily Broadcast...',
                              style: TextStyle(
                                color: Color(0xFF10B981),
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  if (_hasEnded)
                    Container(
                      color: const Color(0xFF0A0F1E).withValues(alpha: 0.95),
                      child: const Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(LucideIcons.circleCheck, color: Color(0xFF10B981), size: 32),
                            SizedBox(height: 6),
                            Text(
                              'Broadcast Completed',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              'Entering SuprO...',
                              style: TextStyle(
                                color: Color(0xFF10B981),
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),

          // Action row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 6,
                    height: 6,
                    decoration: const BoxDecoration(
                      color: Color(0xFF10B981),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 6),
                  const Text(
                    '1st Start Daily Message',
                    style: TextStyle(
                      color: Color(0xFF10B981),
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              if (_canSkip && !_hasEnded)
                InkWell(
                  onTap: _triggerFinish,
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: const Color(0xFF10B981).withValues(alpha: 0.4),
                      ),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Continue to Login',
                          style: TextStyle(
                            color: Color(0xFF6EE7B7),
                            fontSize: 11,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        SizedBox(width: 4),
                        Icon(LucideIcons.arrowRight, color: Color(0xFF6EE7B7), size: 12),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
