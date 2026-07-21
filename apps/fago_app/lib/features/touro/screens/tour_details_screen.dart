import 'package:flutter/material.dart';
import '../../models/touro_model.dart';
import 'package:intl/intl.dart';

class TourDetailsScreen extends StatelessWidget {
  final TouroModel touroModel;

  const TourDetailsScreen({super.key, required this.touroModel});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0F),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 300,
            pinned: true,
            backgroundColor: const Color(0xFF0A0A0F),
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Container(
                    color: const Color(0xFF3B82F6).withOpacity(0.1),
                    child: const Icon(Icons.landscape_rounded, size: 120, color: Color(0xFF3B82F6)),
                  ),
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          const Color(0xFF0A0A0F).withOpacity(0.8),
                          const Color(0xFF0A0A0F),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: _getStatusColor(touroModel.status).withOpacity(0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          touroModel.status.toUpperCase(),
                          style: TextStyle(
                            color: _getStatusColor(touroModel.status),
                            fontWeight: 
                            FontWeight.bold,
                          ),
                        ),
                      ),
                      Text(
                        DateFormat.yMMMd().format(touroModel.createdAt),
                        style: const TextStyle(color: Colors.white54),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    touroModel.tourName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 32),
                  const Text(
                    'Booking Details',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  if (touroModel.bookingDetails != null && touroModel.bookingDetails!.isNotEmpty)
                    ...touroModel.bookingDetails!.entries.map((e) => _buildDetailRow(e.key, e.value.toString()))
                  else
                    const Text(
                      'No additional details provided.',
                      style: TextStyle(color: Colors.white54, fontSize: 16),
                    ),
                  const SizedBox(height: 48),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        // Action placeholder
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF3B82F6),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: const Text(
                        'Manage Booking',
                        style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 2,
            child: Text(
              label.toUpperCase(),
              style: const TextStyle(color: Colors.white54, fontSize: 14, fontWeight: FontWeight.w600),
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(
              value,
              style: const TextStyle(color: Colors.white, fontSize: 16),
            ),
          ),
        ],
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
