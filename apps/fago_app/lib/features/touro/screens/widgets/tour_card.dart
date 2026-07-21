import 'package:flutter/material.dart';
import '../../models/touro_model.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

class TourCard extends StatelessWidget {
  final TouroModel touroModel;

  const TourCard({super.key, required this.touroModel});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        context.push('/touro/tour/${touroModel.id}', extra: touroModel);
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: const Color(0xFF16161E),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.05)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 12,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Placeholder Image area
              Container(
                height: 140,
                width: double.infinity,
                color: const Color(0xFF3B82F6).withOpacity(0.1),
                child: const Stack(
                  alignment: Alignment.center,
                  children: [
                    Icon(Icons.landscape_rounded, size: 64, color: Color(0xFF3B82F6)),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            touroModel.tourName,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: _getStatusColor(touroModel.status).withOpacity(0.15),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            touroModel.status,
                            style: TextStyle(
                              color: _getStatusColor(touroModel.status),
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Icon(Icons.calendar_today_rounded, size: 14, color: Colors.white54),
                        const SizedBox(width: 6),
                        Text(
                          DateFormat.yMMMd().format(touroModel.createdAt),
                          style: const TextStyle(color: Colors.white70, fontSize: 13),
                        ),
                        const Spacer(),
                        const Icon(Icons.arrow_forward_rounded, color: Colors.white38, size: 20),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return Colors.greenAccent;
      case 'PENDING':
        return Colors.orangeAccent;
      case 'CANCELLED':
        return Colors.redAccent;
      default:
        return const Color(0xFF3B82F6);
    }
  }
}
