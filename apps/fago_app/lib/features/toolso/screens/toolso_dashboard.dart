import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:math';

class ToolsODashboard extends ConsumerStatefulWidget {
  const ToolsODashboard({super.key});

  @override
  ConsumerState<ToolsODashboard> createState() => _ToolsODashboardState();
}

class _ToolsODashboardState extends ConsumerState<ToolsODashboard> {
  final List<String> _tabs = [
    'Crop Disease Analysis',
    'TN WhatsApp Certificates',
    'TN E-Sevai Chat',
    'Info Hub',
    'Quiz Creator',
    'Notes Maker',
    'Finance Tracker',
    'Agri Ledger',
    'LetterPDF AI'
  ];
  
  String _activeTab = 'Crop Disease Analysis';
  final _inputController = TextEditingController();
  bool _loading = false;
  String _output = '';

  @override
  void dispose() {
    _inputController.dispose();
    super.dispose();
  }

  void _handleGenerate() {
    if (_inputController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a query first.'), backgroundColor: Colors.redAccent),
      );
      return;
    }

    setState(() {
      _loading = true;
      _output = '';
    });

    Future.delayed(const Duration(seconds: 3), () {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _output = '''### AI Generated Result for: $_activeTab

Based on your query: "${_inputController.text}"

Here is the simulated AI response from the Gemini Engine. 
In the next phase, this will be wired directly to the real API.

- **Feature 1:** High-speed processing.
- **Feature 2:** Deep contextual understanding.
- **Feature 3:** Actionable intelligence.

*Note: UI parity completed.*
''';
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: Row(
          children: [
            const Icon(Icons.auto_awesome, color: Color(0xFF00F0FF), size: 28),
            const SizedBox(width: 12),
            const Text('Aishlee Tools', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 24)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.grid_view_rounded, color: Colors.white70),
            onPressed: () => context.go('/'),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          // Horizontal Tabs
          Container(
            height: 50,
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: Color(0xFF1E293B))),
            ),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _tabs.length,
              itemBuilder: (context, index) {
                final tab = _tabs[index];
                final isActive = tab == _activeTab;
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0, top: 8.0, bottom: 8.0),
                  child: InkWell(
                    onTap: () {
                      setState(() {
                        _activeTab = tab;
                        _output = '';
                      });
                    },
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: isActive ? const Color(0xFF00F0FF) : Colors.transparent,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        tab,
                        style: TextStyle(
                          color: isActive ? Colors.black : Colors.grey,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Input Area
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFF334155)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'What do you want to know about $_activeTab?',
                          style: const TextStyle(color: Colors.grey, fontSize: 14),
                        ),
                        const SizedBox(height: 12),
                        TextField(
                          controller: _inputController,
                          style: const TextStyle(color: Colors.white),
                          maxLines: 4,
                          decoration: InputDecoration(
                            hintText: 'Type your query here...',
                            hintStyle: const TextStyle(color: Colors.white30),
                            filled: true,
                            fillColor: const Color(0xFF0F172A),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            IconButton(
                              onPressed: () {},
                              icon: const Icon(Icons.attach_file, color: Colors.grey),
                              tooltip: 'Attach File',
                            ),
                            IconButton(
                              onPressed: () {},
                              icon: const Icon(Icons.camera_alt, color: Colors.grey),
                              tooltip: 'Use Camera',
                            ),
                            const Spacer(),
                            ElevatedButton.icon(
                              onPressed: _loading ? null : _handleGenerate,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF00F0FF),
                                foregroundColor: Colors.black,
                                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              icon: _loading 
                                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2))
                                : const Icon(Icons.send, size: 18),
                              label: Text(_loading ? 'Thinking...' : 'Generate', style: const TextStyle(fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  if (_output.isNotEmpty) ...[
                    const SizedBox(height: 24),
                    // Result Area
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF0A0A0F),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFF334155)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                            decoration: const BoxDecoration(
                              border: Border(bottom: BorderSide(color: Color(0xFF1E293B))),
                            ),
                            child: const Row(
                              children: [
                                Icon(Icons.auto_awesome, color: Color(0xFF00F0FF), size: 18),
                                SizedBox(width: 8),
                                Text('Generated Result', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(20),
                            child: Text(
                              _output,
                              style: const TextStyle(color: Colors.white70, fontSize: 16, height: 1.5),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
