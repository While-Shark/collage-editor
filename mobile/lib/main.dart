import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/collage_provider.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => CollageProvider()),
      ],
      child: const CollageApp(),
    ),
  );
}

class CollageApp extends StatelessWidget {
  const CollageApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Collage Editor',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}
