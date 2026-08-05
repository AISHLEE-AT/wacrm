import 'package:flutter/material.dart';

class TeachoScreen extends StatelessWidget {
  const TeachoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('TeachoScreen'),
      ),
      body: const Center(
        child: Text('Welcome to TeachoScreen'),
      ),
    );
  }
}
