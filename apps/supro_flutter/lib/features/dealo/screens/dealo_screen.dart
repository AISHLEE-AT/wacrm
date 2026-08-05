import 'package:flutter/material.dart';

class DealoScreen extends StatelessWidget {
  const DealoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('DealoScreen'),
      ),
      body: const Center(
        child: Text('Welcome to DealoScreen'),
      ),
    );
  }
}
