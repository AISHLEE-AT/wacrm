import 'package:flutter/material.dart';

class TouroScreen extends StatelessWidget {
  const TouroScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('TouroScreen'),
      ),
      body: const Center(
        child: Text('Welcome to TouroScreen'),
      ),
    );
  }
}
