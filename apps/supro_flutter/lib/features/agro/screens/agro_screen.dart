import 'package:flutter/material.dart';

class AgroScreen extends StatelessWidget {
  const AgroScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AgroScreen'),
      ),
      body: const Center(
        child: Text('Welcome to AgroScreen'),
      ),
    );
  }
}
