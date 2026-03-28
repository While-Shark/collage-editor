import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/collage_provider.dart';
import '../models/collage_state.dart';
import 'image_item.dart';
import 'sticker_item.dart';

class CollageCanvas extends StatelessWidget {
  const CollageCanvas({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<CollageProvider>().state;

    return Stack(
      children: [
        // Background
        _buildBackground(state.background),
        // Layout Grid
        _buildLayout(state.layout, state.images),
        // Stickers
        ...state.stickers.map((s) => StickerItem(sticker: s)),
      ],
    );
  }

  Widget _buildBackground(CollageBackground bg) {
    switch (bg.type) {
      case BackgroundType.color:
        return Container(color: bg.value as Color);
      case BackgroundType.gradient:
        return Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: bg.value as List<Color>,
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        );
      case BackgroundType.pattern:
      case BackgroundType.image:
        return Container(
          decoration: BoxDecoration(
            image: DecorationImage(
              image: NetworkImage(bg.value as String),
              fit: BoxFit.cover,
            ),
          ),
        );
    }
  }

  Widget _buildLayout(int layout, List<CollageImage?> images) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final w = constraints.maxWidth;
        final h = constraints.maxHeight;

        List<Widget> children = [];
        List<Rect> rects = _getRectsForLayout(layout, w, h);

        for (int i = 0; i < layout; i++) {
          final rect = rects[i];
          children.add(
            Positioned.fromRect(
              rect: rect,
              child: ImageItem(
                index: i,
                image: images[i],
              ),
            ),
          );
        }

        return Stack(children: children);
      },
    );
  }

  List<Rect> _getRectsForLayout(int layout, double w, double h) {
    switch (layout) {
      case 1:
        return [Rect.fromLTWH(0, 0, w, h)];
      case 2:
        return [
          Rect.fromLTWH(0, 0, w / 2, h),
          Rect.fromLTWH(w / 2, 0, w / 2, h),
        ];
      case 3:
        return [
          Rect.fromLTWH(0, 0, w / 2, h),
          Rect.fromLTWH(w / 2, 0, w / 2, h / 2),
          Rect.fromLTWH(w / 2, h / 2, w / 2, h / 2),
        ];
      case 4:
        return [
          Rect.fromLTWH(0, 0, w / 2, h / 2),
          Rect.fromLTWH(w / 2, 0, w / 2, h / 2),
          Rect.fromLTWH(0, h / 2, w / 2, h / 2),
          Rect.fromLTWH(w / 2, h / 2, w / 2, h / 2),
        ];
      case 6:
        return [
          Rect.fromLTWH(0, 0, w / 3, h / 2),
          Rect.fromLTWH(w / 3, 0, w / 3, h / 2),
          Rect.fromLTWH(2 * w / 3, 0, w / 3, h / 2),
          Rect.fromLTWH(0, h / 2, w / 3, h / 2),
          Rect.fromLTWH(w / 3, h / 2, w / 3, h / 2),
          Rect.fromLTWH(2 * w / 3, h / 2, w / 3, h / 2),
        ];
      case 9:
        return List.generate(9, (i) {
          int row = i ~/ 3;
          int col = i % 3;
          return Rect.fromLTWH(col * w / 3, row * h / 3, w / 3, h / 3);
        });
      default:
        return [Rect.fromLTWH(0, 0, w, h)];
    }
  }
}
