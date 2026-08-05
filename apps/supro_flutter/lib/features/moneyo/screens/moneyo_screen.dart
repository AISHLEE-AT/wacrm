import 'package:flutter/material.dart';

class MoneyoScreen extends StatelessWidget {
  const MoneyoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('MoneyoScreen'),
      ),
      body: const Center(
        child: Text('Welcome to MoneyoScreen'),
      ),
    );
  }
}
