import 'package:flutter/material.dart';

class TvoScreen extends StatelessWidget {
  const TvoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('TvoScreen'),
      ),
      body: const Center(
        child: Text('Welcome to TvoScreen'),
      ),
    );
  }
}
