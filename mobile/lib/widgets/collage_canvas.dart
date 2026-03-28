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

    return LayoutBuilder(
      builder: (context, constraints) {
        return GestureDetector(
          onTap: () => context.read<CollageProvider>().setSelectedIndex(null),
          child: Stack(
            children: [
              // Background
              _buildBackground(state.background),
              // Layout Grid
              _buildLayout(state, constraints.maxWidth, constraints.maxHeight),
              // Stickers
              ...state.stickers.map((s) => StickerItem(sticker: s)),
            ],
          ),
        );
      },
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

  Widget _buildLayout(CollageState state, double w, double h) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final totalW = constraints.maxWidth;
        final totalH = constraints.maxHeight;

        // Apply outer border (padding)
        final canvasRect = Rect.fromLTWH(
          state.borderWidth,
          state.borderWidth,
          totalW - (state.borderWidth * 2),
          totalH - (state.borderWidth * 2),
        );

        List<Widget> children = [];
        List<Rect> rects = _getRectsForLayout(
          state.layout,
          canvasRect.width,
          canvasRect.height,
          state.spacing,
        );

        for (int i = 0; i < state.layout; i++) {
          final rect = rects[i].shift(Offset(canvasRect.left, canvasRect.top));
          children.add(
            Positioned.fromRect(
              rect: rect,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(state.cornerRadius),
                child: ImageItem(
                  index: i,
                  image: state.images[i],
                ),
              ),
            ),
          );
        }

        return Stack(children: children);
      },
    );
  }

  List<Rect> _getRectsForLayout(int layout, double w, double h, double spacing) {
    final halfSpacing = spacing / 2;
    
    switch (layout) {
      case 1:
        return [Rect.fromLTWH(0, 0, w, h)];
      case 2:
        return [
          Rect.fromLTWH(0, 0, w / 2 - halfSpacing, h),
          Rect.fromLTWH(w / 2 + halfSpacing, 0, w / 2 - halfSpacing, h),
        ];
      case 3:
        return [
          Rect.fromLTWH(0, 0, w / 2 - halfSpacing, h),
          Rect.fromLTWH(w / 2 + halfSpacing, 0, w / 2 - halfSpacing, h / 2 - halfSpacing),
          Rect.fromLTWH(w / 2 + halfSpacing, h / 2 + halfSpacing, w / 2 - halfSpacing, h / 2 - halfSpacing),
        ];
      case 4:
        return [
          Rect.fromLTWH(0, 0, w / 2 - halfSpacing, h / 2 - halfSpacing),
          Rect.fromLTWH(w / 2 + halfSpacing, 0, w / 2 - halfSpacing, h / 2 - halfSpacing),
          Rect.fromLTWH(0, h / 2 + halfSpacing, w / 2 - halfSpacing, h / 2 - halfSpacing),
          Rect.fromLTWH(w / 2 + halfSpacing, h / 2 + halfSpacing, w / 2 - halfSpacing, h / 2 - halfSpacing),
        ];
      case 6:
        return [
          Rect.fromLTWH(0, 0, w / 3 - spacing * 2/3, h / 2 - halfSpacing),
          Rect.fromLTWH(w / 3 + spacing * 1/3, 0, w / 3 - spacing * 2/3, h / 2 - halfSpacing),
          Rect.fromLTWH(2 * w / 3 + spacing * 2/3, 0, w / 3 - spacing * 2/3, h / 2 - halfSpacing),
          Rect.fromLTWH(0, h / 2 + halfSpacing, w / 3 - spacing * 2/3, h / 2 - halfSpacing),
          Rect.fromLTWH(w / 3 + spacing * 1/3, h / 2 + halfSpacing, w / 3 - spacing * 2/3, h / 2 - halfSpacing),
          Rect.fromLTWH(2 * w / 3 + spacing * 2/3, h / 2 + halfSpacing, w / 3 - spacing * 2/3, h / 2 - halfSpacing),
        ];
      case 9:
        return List.generate(9, (i) {
          int row = i ~/ 3;
          int col = i % 3;
          double itemW = (w - spacing * 2) / 3;
          double itemH = (h - spacing * 2) / 3;
          return Rect.fromLTWH(
            col * (itemW + spacing),
            row * (itemH + spacing),
            itemW,
            itemH,
          );
        });
      default:
        return [Rect.fromLTWH(0, 0, w, h)];
    }
  }
}
