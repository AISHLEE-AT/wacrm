import 'package:flutter/material.dart';

class DriveoScreen extends StatelessWidget {
  const DriveoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('DriveoScreen'),
      ),
      body: const Center(
        child: Text('Welcome to DriveoScreen'),
      ),
    );
  }
}
