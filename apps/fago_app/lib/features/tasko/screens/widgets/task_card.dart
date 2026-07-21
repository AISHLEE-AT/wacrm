import 'package:flutter/material.dart';
import '../../models/tasko_model.dart';
import 'package:intl/intl.dart';

class TaskCard extends StatelessWidget {
  final TaskoModel taskModel;

  const TaskCard({super.key, required this.taskModel});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF16161E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            margin: const EdgeInsets.only(top: 2),
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: _getStatusColor(taskModel.status).withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(
              taskModel.status.toUpperCase() == 'COMPLETED' ? Icons.check_circle : Icons.radio_button_unchecked,
              color: _getStatusColor(taskModel.status),
              size: 20,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  taskModel.title,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    decoration: taskModel.status.toUpperCase() == 'COMPLETED' ? TextDecoration.lineThrough : null,
                  ),
                ),
                const SizedBox(height: 8),
                if (taskModel.dueDate != null)
                  Row(
                    children: [
                      const Icon(Icons.event_rounded, size: 14, color: Colors.white54),
                      const SizedBox(width: 4),
                      Text(
                        'Due: ${DateFormat.yMMMd().format(taskModel.dueDate!)}',
                        style: const TextStyle(color: Colors.white54, fontSize: 12),
                      ),
                    ],
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'TODO':
        return Colors.orangeAccent;
      case 'IN_PROGRESS':
        return Colors.blueAccent;
      case 'COMPLETED':
        return Colors.greenAccent;
      default:
        return Colors.white54;
    }
  }
}
