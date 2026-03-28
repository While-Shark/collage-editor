import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/collage_provider.dart';
import '../widgets/collage_canvas.dart';
import '../widgets/toolbar.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Collage Editor'),
        actions: [
          IconButton(
            icon: const Icon(Icons.undo),
            onPressed: () => context.read<CollageProvider>().undo(),
          ),
          IconButton(
            icon: const Icon(Icons.redo),
            onPressed: () => context.read<CollageProvider>().redo(),
          ),
          IconButton(
            icon: const Icon(Icons.save),
            onPressed: () {
              // Implement save functionality later
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: Center(
              child: AspectRatio(
                aspectRatio: 1,
                child: Container(
                  margin: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.grey[200],
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 10,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: const CollageCanvas(),
                ),
              ),
            ),
          ),
          const Toolbar(),
        ],
      ),
    );
  }
}
