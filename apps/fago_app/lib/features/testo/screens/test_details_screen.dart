import 'package:flutter/material.dart';
import '../models/testo_model.dart';
import 'package:go_router/go_router.dart';

class TestDetailsScreen extends StatelessWidget {
  final TestoTest testModel;

  const TestDetailsScreen({super.key, required this.testModel});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0F),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFFEF4444).withOpacity(0.1),
                ),
                child: const Icon(Icons.psychology_outlined, size: 72, color: Color(0xFFEF4444)),
              ),
              const SizedBox(height: 32),
              Text(
                testModel.title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 28,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.5,
                ),
              ),
              if (testModel.description != null) ...[
                const SizedBox(height: 16),
                Text(
                  testModel.description!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 16,
                    height: 1.5,
                  ),
                ),
              ],
              const SizedBox(height: 48),
              _buildStatRow(Icons.timer_outlined, 'Time Limit', '${testModel.timeLimitMinutes} Minutes'),
              const Divider(color: Colors.white10, height: 32),
              _buildStatRow(Icons.verified_outlined, 'Passing Score', '${testModel.passingScore}%'),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    // TODO: Implement actual quiz taking UI (questions fetching, timer, etc)
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Quiz UI is coming in the next iteration!')),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFEF4444),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: const Text(
                    'Start Assessment',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, color: Colors.white54, size: 24),
        const SizedBox(width: 16),
        Text(
          label,
          style: const TextStyle(color: Colors.white54, fontSize: 16),
        ),
        const Spacer(),
        Text(
          value,
          style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}
