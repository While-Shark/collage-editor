import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/collage_provider.dart';
import 'screens/home_screen.dart';

void main() {
  // 确保 Flutter 绑定已初始化，防止异步调用或引擎初始化问题
  WidgetsFlutterBinding.ensureInitialized();
  
  runApp(
    MultiProvider(
      providers: [
        // 提供全局拼图状态管理
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
      title: '拼图编辑器',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF7C4DFF), // 品牌紫色
          primary: const Color(0xFF7C4DFF),
          secondary: const Color(0xFFE1D5FF),
          surface: const Color(0xFFF8F7FF),
        ),
        scaffoldBackgroundColor: const Color(0xFFF8F7FF),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
          centerTitle: false,
          titleTextStyle: TextStyle(
            color: Color(0xFF1A1A1A),
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
          iconTheme: IconThemeData(color: Color(0xFF1A1A1A)),
        ),
        // 自定义滑块样式
        sliderTheme: SliderThemeData(
          activeTrackColor: const Color(0xFF7C4DFF),
          inactiveTrackColor: const Color(0xFFE1D5FF),
          thumbColor: const Color(0xFF7C4DFF),
          overlayColor: const Color(0xFF7C4DFF).withOpacity(0.2),
        ),
      ),
      home: const HomeScreen(),
    );
  }
}
