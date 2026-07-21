import 'package:flutter/material.dart';
import '../../models/testo_model.dart';
import 'package:go_router/go_router.dart';

class TestCard extends StatelessWidget {
  final TestoTest testModel;

  const TestCard({super.key, required this.testModel});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        context.push('/testo/test/${testModel.id}', extra: testModel);
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: const Color(0xFF16161E),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.2),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEF4444).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.timer_outlined, size: 14, color: Color(0xFFEF4444)),
                        const SizedBox(width: 4),
                        Text(
                          '${testModel.timeLimitMinutes} Mins',
                          style: const TextStyle(
                            color: Color(0xFFEF4444),
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.05),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.fact_check_rounded, color: Colors.white54, size: 20),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                testModel.title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (testModel.description != null) ...[
                const SizedBox(height: 8),
                Text(
                  testModel.description!,
                  style: const TextStyle(color: Colors.white54, fontSize: 13, height: 1.4),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
              const SizedBox(height: 20),
              Row(
                children: [
                  const Icon(Icons.check_circle_outline, size: 16, color: Colors.greenAccent),
                  const SizedBox(width: 6),
                  Text(
                    'Passing Score: ${testModel.passingScore}%',
                    style: const TextStyle(color: Colors.white70, fontSize: 13),
                  ),
                  const Spacer(),
                  const Icon(Icons.arrow_forward_rounded, color: Colors.white38, size: 20),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
