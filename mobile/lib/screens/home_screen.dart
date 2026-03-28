import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:screenshot/screenshot.dart';
import 'package:share_plus/share_plus.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';
import '../providers/collage_provider.dart';
import '../widgets/collage_canvas.dart';
import '../widgets/toolbar.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 1; // Default to Preview
  final ScreenshotController _screenshotController = ScreenshotController();

  Future<void> _saveAndShare(bool isShare) async {
    try {
      final image = await _screenshotController.capture();
      if (image == null) return;

      final directory = await getApplicationDocumentsDirectory();
      final imagePath = await File('${directory.path}/collage_${DateTime.now().millisecondsSinceEpoch}.png').create();
      await imagePath.writeAsBytes(image);

      if (isShare) {
        await Share.shareXFiles([XFile(imagePath.path)], text: 'Check out my collage!');
      } else {
        // In a real mobile app, we'd save to gallery. 
        // For now, we'll just show a success message.
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('拼图已保存至: ${imagePath.path}')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('操作失败: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: const Padding(
          padding: EdgeInsets.all(8.0),
          child: CircleAvatar(
            backgroundColor: Color(0xFF7C4DFF),
            child: Icon(Icons.grid_view, color: Colors.white, size: 18),
          ),
        ),
        title: Text(_getTitle()),
        actions: [
          IconButton(
            icon: const Icon(Icons.save_alt_outlined),
            onPressed: () => _saveAndShare(false),
          ),
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: () => _saveAndShare(true),
          ),
        ],
      ),
      body: Stack(
        children: [
          IndexedStack(
            index: _currentIndex,
            children: [
              const LayoutTabView(),
              PreviewTabView(controller: _screenshotController),
              EditTabView(controller: _screenshotController),
            ],
          ),
          _buildBottomNav(),
        ],
      ),
    );
  }

  String _getTitle() {
    switch (_currentIndex) {
      case 0: return '布局选择';
      case 1: return '拼图预览';
      case 2: return '拼图编辑器';
      default: return '拼图编辑器';
    }
  }

  Widget _buildBottomNav() {
    return Align(
      alignment: Alignment.bottomCenter,
      child: Container(
        margin: const EdgeInsets.only(bottom: 24, left: 24, right: 24),
        height: 70,
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.9),
          borderRadius: BorderRadius.circular(35),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _buildNavItem(0, Icons.dashboard_outlined, '布局'),
            _buildNavItem(1, Icons.grid_on_outlined, '预览'),
            _buildNavItem(2, Icons.tune_outlined, '编辑'),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label) {
    final isSelected = _currentIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _currentIndex = index),
      child: Container(
        width: 60,
        height: 60,
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF7C4DFF) : Colors.transparent,
          shape: BoxShape.circle,
        ),
        child: Icon(
          icon,
          color: isSelected ? Colors.white : Colors.grey[400],
          size: 24,
        ),
      ),
    );
  }
}

class LayoutTabView extends StatelessWidget {
  const LayoutTabView({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<CollageProvider>();
    final currentLayout = provider.state.layout;

    final layouts = [
      {'id': 1, 'name': '单图布局', 'desc': '最适合展示焦点图片'},
      {'id': 2, 'name': '双图并列', 'desc': '对比与叙事的经典选择'},
      {'id': 3, 'name': '三图流动', 'desc': '适合时尚故事和社论'},
      {'id': 4, 'name': '平衡方块', 'desc': '视觉叙事的完美对称'},
      {'id': 6, 'name': '六图网格', 'desc': '丰富内容的集合展示'},
      {'id': 9, 'name': '九宫格', 'desc': '瞬间的完整记录'},
    ];

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(24, 12, 24, 120),
      itemCount: layouts.length,
      itemBuilder: (context, index) {
        final layout = layouts[index];
        final id = layout['id'] as int;
        final isSelected = currentLayout == id;

        return GestureDetector(
          onTap: () => provider.setLayout(id),
          child: Container(
            margin: const EdgeInsets.only(bottom: 24),
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(32),
              border: isSelected
                  ? Border.all(color: const Color(0xFF7C4DFF), width: 2)
                  : null,
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF7C4DFF).withOpacity(0.05),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF7C4DFF),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Icon(Icons.grid_view, color: Colors.white, size: 24),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            layout['name'] as String,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            layout['desc'] as String,
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (isSelected)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFF7C4DFF),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Text(
                          '当前使用',
                          style: TextStyle(color: Colors.white, fontSize: 10),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 24),
                _buildLayoutPreview(id),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildLayoutPreview(int layout) {
    return AspectRatio(
      aspectRatio: 1.5,
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFFF0E6FF),
          borderRadius: BorderRadius.circular(24),
        ),
        padding: const EdgeInsets.all(16),
        child: _MiniCollagePreview(layout: layout),
      ),
    );
  }
}

class _MiniCollagePreview extends StatelessWidget {
  final int layout;
  const _MiniCollagePreview({required this.layout});

  @override
  Widget build(BuildContext context) {
    // Simplified version of the layout logic for preview
    return LayoutBuilder(builder: (context, constraints) {
      final w = constraints.maxWidth;
      final h = constraints.maxHeight;
      final spacing = 4.0;

      List<Rect> rects = [];
      switch (layout) {
        case 1:
          rects = [Rect.fromLTWH(0, 0, w, h)];
          break;
        case 2:
          rects = [
            Rect.fromLTWH(0, 0, w / 2 - spacing / 2, h),
            Rect.fromLTWH(w / 2 + spacing / 2, 0, w / 2 - spacing / 2, h),
          ];
          break;
        case 3:
          rects = [
            Rect.fromLTWH(0, 0, w / 2 - spacing / 2, h),
            Rect.fromLTWH(w / 2 + spacing / 2, 0, w / 2 - spacing / 2, h / 2 - spacing / 2),
            Rect.fromLTWH(w / 2 + spacing / 2, h / 2 + spacing / 2, w / 2 - spacing / 2, h / 2 - spacing / 2),
          ];
          break;
        case 4:
          rects = [
            Rect.fromLTWH(0, 0, w / 2 - spacing / 2, h / 2 - spacing / 2),
            Rect.fromLTWH(w / 2 + spacing / 2, 0, w / 2 - spacing / 2, h / 2 - spacing / 2),
            Rect.fromLTWH(0, h / 2 + spacing / 2, w / 2 - spacing / 2, h / 2 - spacing / 2),
            Rect.fromLTWH(w / 2 + spacing / 2, h / 2 + spacing / 2, w / 2 - spacing / 2, h / 2 - spacing / 2),
          ];
          break;
        case 6:
          rects = [
            Rect.fromLTWH(0, 0, w / 3 - spacing * 2 / 3, h / 2 - spacing / 2),
            Rect.fromLTWH(w / 3 + spacing / 3, 0, w / 3 - spacing * 2 / 3, h / 2 - spacing / 2),
            Rect.fromLTWH(w * 2 / 3 + spacing * 2 / 3, 0, w / 3 - spacing * 2 / 3, h / 2 - spacing / 2),
            Rect.fromLTWH(0, h / 2 + spacing / 2, w / 3 - spacing * 2 / 3, h / 2 - spacing / 2),
            Rect.fromLTWH(w / 3 + spacing / 3, h / 2 + spacing / 2, w / 3 - spacing * 2 / 3, h / 2 - spacing / 2),
            Rect.fromLTWH(w * 2 / 3 + spacing * 2 / 3, h / 2 + spacing / 2, w / 3 - spacing * 2 / 3, h / 2 - spacing / 2),
          ];
          break;
        case 9:
          rects = [
            Rect.fromLTWH(0, 0, w / 3 - spacing * 2 / 3, h / 3 - spacing * 2 / 3),
            Rect.fromLTWH(w / 3 + spacing / 3, 0, w / 3 - spacing * 2 / 3, h / 3 - spacing * 2 / 3),
            Rect.fromLTWH(w * 2 / 3 + spacing * 2 / 3, 0, w / 3 - spacing * 2 / 3, h / 3 - spacing * 2 / 3),
            Rect.fromLTWH(0, h / 3 + spacing / 3, w / 3 - spacing * 2 / 3, h / 3 - spacing * 2 / 3),
            Rect.fromLTWH(w / 3 + spacing / 3, h / 3 + spacing / 3, w / 3 - spacing * 2 / 3, h / 3 - spacing * 2 / 3),
            Rect.fromLTWH(w * 2 / 3 + spacing * 2 / 3, h / 3 + spacing / 3, w / 3 - spacing * 2 / 3, h / 3 - spacing * 2 / 3),
            Rect.fromLTWH(0, h * 2 / 3 + spacing * 2 / 3, w / 3 - spacing * 2 / 3, h / 3 - spacing * 2 / 3),
            Rect.fromLTWH(w / 3 + spacing / 3, h * 2 / 3 + spacing * 2 / 3, w / 3 - spacing * 2 / 3, h / 3 - spacing * 2 / 3),
            Rect.fromLTWH(w * 2 / 3 + spacing * 2 / 3, h * 2 / 3 + spacing * 2 / 3, w / 3 - spacing * 2 / 3, h / 3 - spacing * 2 / 3),
          ];
          break;
        default:
          rects = [Rect.fromLTWH(0, 0, w, h)];
      }

      return Stack(
        children: rects.map((r) => Positioned.fromRect(
          rect: r,
          child: Container(
            decoration: BoxDecoration(
              color: const Color(0xFFDCD0FF),
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        )).toList(),
      );
    });
  }
}

class PreviewTabView extends StatelessWidget {
  final ScreenshotController controller;
  const PreviewTabView({super.key, required this.controller});
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: Center(
            child: AspectRatio(
              aspectRatio: 1,
              child: Container(
                margin: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(32),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 30,
                      offset: const Offset(0, 15),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(32),
                  child: Screenshot(
                    controller: controller,
                    child: const CollageCanvas(),
                  ),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 100), // Space for bottom nav
      ],
    );
  }
}

class EditTabView extends StatelessWidget {
  final ScreenshotController controller;
  const EditTabView({super.key, required this.controller});
  @override
  Widget build(BuildContext context) {
    final provider = context.watch<CollageProvider>();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  _buildActionButton(
                    icon: Icons.undo_outlined,
                    onPressed: provider.canUndo ? provider.undo : null,
                    isEnabled: provider.canUndo,
                  ),
                  const SizedBox(width: 12),
                  _buildActionButton(
                    icon: Icons.redo_outlined,
                    onPressed: provider.canRedo ? provider.redo : null,
                    isEnabled: provider.canRedo,
                  ),
                ],
              ),
              TextButton.icon(
                onPressed: provider.resetStyles,
                icon: const Icon(Icons.refresh, size: 18, color: Color(0xFF7C4DFF)),
                label: const Text(
                  '恢复默认',
                  style: TextStyle(
                    color: Color(0xFF7C4DFF),
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: Center(
            child: AspectRatio(
              aspectRatio: 1,
              child: Padding(
                padding: const EdgeInsets.all(32.0),
                child: Screenshot(
                  controller: controller,
                  child: const CollageCanvas(),
                ),
              ),
            ),
          ),
        ),
        const Toolbar(),
        const SizedBox(height: 100),
      ],
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required VoidCallback? onPressed,
    required bool isEnabled,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: isEnabled ? const Color(0xFFF0E6FF) : Colors.grey[100],
        shape: BoxShape.circle,
      ),
      child: IconButton(
        icon: Icon(icon, size: 20),
        color: isEnabled ? const Color(0xFF7C4DFF) : Colors.grey[400],
        onPressed: onPressed,
      ),
    );
  }
}
