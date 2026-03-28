import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/collage_provider.dart';
import '../models/collage_state.dart';

class Toolbar extends StatelessWidget {
  const Toolbar({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 120,
      padding: const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 5,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        children: [
          _buildToolSection(
            title: 'Layout',
            children: [
              _buildLayoutButton(context, 1),
              _buildLayoutButton(context, 2),
              _buildLayoutButton(context, 3),
              _buildLayoutButton(context, 4),
              _buildLayoutButton(context, 6),
              _buildLayoutButton(context, 9),
            ],
          ),
          const VerticalDivider(),
          _buildToolSection(
            title: 'Stickers',
            children: [
              _buildStickerButton(context, '😀'),
              _buildStickerButton(context, '❤️'),
              _buildStickerButton(context, '✨'),
              _buildStickerButton(context, '🔥'),
              _buildStickerButton(context, '🌈'),
            ],
          ),
          const VerticalDivider(),
          _buildToolSection(
            title: 'Background',
            children: [
              _buildColorButton(context, Colors.white),
              _buildColorButton(context, Colors.black),
              _buildColorButton(context, Colors.red[100]!),
              _buildColorButton(context, Colors.blue[100]!),
              _buildColorButton(context, Colors.green[100]!),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildToolSection({required String title, required List<Widget> children}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Text(
            title,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
          ),
        ),
        Row(children: children),
      ],
    );
  }

  Widget _buildLayoutButton(BuildContext context, int layout) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: InkWell(
        onTap: () => context.read<CollageProvider>().setLayout(layout),
        child: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey[300]!),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Center(child: Text(layout.toString())),
        ),
      ),
    );
  }

  Widget _buildStickerButton(BuildContext context, String emoji) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: InkWell(
        onTap: () => context.read<CollageProvider>().addSticker('emoji', emoji),
        child: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey[300]!),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Center(child: Text(emoji, style: const TextStyle(fontSize: 24))),
        ),
      ),
    );
  }

  Widget _buildColorButton(BuildContext context, Color color) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: InkWell(
        onTap: () => context.read<CollageProvider>().setBackground(CollageBackground(type: BackgroundType.color, value: color)),
        child: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: color,
            border: Border.all(color: Colors.grey[300]!),
            borderRadius: BorderRadius.circular(4),
          ),
        ),
      ),
    );
  }
}
