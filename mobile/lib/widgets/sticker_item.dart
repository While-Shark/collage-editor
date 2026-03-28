import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/collage_provider.dart';
import '../models/collage_state.dart';

class StickerItem extends StatelessWidget {
  final Sticker sticker;

  const StickerItem({super.key, required this.sticker});

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: sticker.position.dx,
      top: sticker.position.dy,
      child: GestureDetector(
        onScaleUpdate: (details) {
          final provider = context.read<CollageProvider>();
          provider.updateSticker(
            sticker.id,
            position: sticker.position + details.focalPointDelta,
            scale: sticker.scale * details.scale,
            rotation: sticker.rotation + details.rotation,
          );
        },
        child: Transform(
          alignment: Alignment.center,
          transform: Matrix4.identity()
            ..scale(sticker.scale)
            ..rotateZ(sticker.rotation),
          child: sticker.type == 'emoji'
              ? Text(
                  sticker.content,
                  style: const TextStyle(fontSize: 40),
                )
              : Image.network(
                  sticker.content,
                  width: 100,
                  height: 100,
                  fit: BoxFit.contain,
                ),
        ),
      ),
    );
  }
}
