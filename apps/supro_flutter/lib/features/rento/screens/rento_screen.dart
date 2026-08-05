import 'package:flutter/material.dart';

class RentoScreen extends StatelessWidget {
  const RentoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('RentoScreen'),
      ),
      body: const Center(
        child: Text('Welcome to RentoScreen'),
      ),
    );
  }
}
