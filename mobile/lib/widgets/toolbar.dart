import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/collage_provider.dart';
import '../models/collage_state.dart';

class Toolbar extends StatefulWidget {
  const Toolbar({super.key});

  @override
  State<Toolbar> createState() => _ToolbarState();
}

class _ToolbarState extends State<Toolbar> {
  int _activeSubTab = 1; // Default to Filters

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(32),
          topRight: Radius.circular(32),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildSubTabs(),
          const SizedBox(height: 24),
          _buildActivePanel(),
        ],
      ),
    );
  }

  Widget _buildSubTabs() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24),
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: const Color(0xFFF0E6FF),
        borderRadius: BorderRadius.circular(30),
      ),
      child: Row(
        children: [
          _buildSubTabItem(0, Icons.grid_view, '布局'),
          _buildSubTabItem(1, Icons.auto_awesome, '滤镜'),
          _buildSubTabItem(2, Icons.sticky_note_2, '贴纸'),
          _buildSubTabItem(3, Icons.palette, '背景'),
        ],
      ),
    );
  }

  Widget _buildSubTabItem(int index, IconData icon, String label) {
    final isSelected = _activeSubTab == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _activeSubTab = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(26),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 10,
                    )
                  ]
                : null,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 16,
                color: isSelected ? const Color(0xFF7C4DFF) : Colors.grey[600],
              ),
              const SizedBox(width: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  color: isSelected ? const Color(0xFF7C4DFF) : Colors.grey[600],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildActivePanel() {
    switch (_activeSubTab) {
      case 0: return _buildLayoutStylePanel();
      case 1: return _buildFilterPanel();
      case 2: return _buildStickerPanel();
      case 3: return _buildBackgroundPanel();
      default: return const SizedBox.shrink();
    }
  }

  Widget _buildLayoutStylePanel() {
    final state = context.watch<CollageProvider>().state;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          _buildStyleSlider('边框', state.borderWidth, 0, 40, (v) => context.read<CollageProvider>().setStyle(borderWidth: v)),
          _buildStyleSlider('圆角', state.cornerRadius, 0, 100, (v) => context.read<CollageProvider>().setStyle(cornerRadius: v)),
          _buildStyleSlider('间距', state.spacing, 0, 40, (v) => context.read<CollageProvider>().setStyle(spacing: v)),
        ],
      ),
    );
  }

  Widget _buildStyleSlider(String label, double value, double min, double max, Function(double) onChanged) {
    return Row(
      children: [
        SizedBox(width: 40, child: Text(label, style: const TextStyle(fontSize: 12))),
        Expanded(
          child: Slider(
            value: value,
            min: min,
            max: max,
            onChanged: onChanged,
          ),
        ),
        SizedBox(
          width: 40,
          child: Text(
            '${(value / max * 100).toInt()}%',
            textAlign: TextAlign.right,
            style: const TextStyle(fontSize: 10, color: Color(0xFF7C4DFF)),
          ),
        ),
      ],
    );
  }

  Widget _buildFilterPanel() {
    final provider = context.watch<CollageProvider>();
    final selectedIndex = provider.state.selectedIndex;
    final selectedImage = selectedIndex != null ? provider.state.images[selectedIndex] : null;
    final filters_state = selectedImage?.filters ?? {};

    final filters = [
      {'name': '原图', 'values': {'brightness': 1.0, 'contrast': 1.0, 'saturation': 1.0, 'grayscale': 0.0, 'sepia': 0.0}},
      {'name': '鲜艳', 'values': {'saturation': 1.5, 'contrast': 1.1}},
      {'name': '柔和', 'values': {'saturation': 0.8, 'brightness': 1.1}},
      {'name': '胶片', 'values': {'sepia': 0.3, 'contrast': 1.2}},
      {'name': '黑白', 'values': {'grayscale': 1.0}},
    ];

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                '滤镜预设',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
              ),
              if (selectedIndex != null)
                TextButton.icon(
                  onPressed: () {
                    // This will be handled in the filter selection logic
                  },
                  icon: const Icon(Icons.done_all, size: 16, color: Color(0xFF7C4DFF)),
                  label: const Text(
                    '应用到所有',
                    style: TextStyle(color: Color(0xFF7C4DFF), fontSize: 12),
                  ),
                ),
            ],
          ),
        ),
        SizedBox(
          height: 90,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 24),
            itemCount: filters.length,
            itemBuilder: (context, index) {
              final filter = filters[index];
              return Padding(
                padding: const EdgeInsets.only(right: 16),
                child: Column(
                  children: [
                    GestureDetector(
                      onLongPress: () {
                        provider.applyFiltersToAll(filter['values'] as Map<String, double>);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('已应用到所有图片')),
                        );
                      },
                      onTap: () {
                        if (selectedIndex != null) {
                          provider.updateImageFilters(selectedIndex, filter['values'] as Map<String, double>);
                        }
                      },
                      child: Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          color: const Color(0xFFF0E6FF),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFF7C4DFF).withOpacity(0.1)),
                        ),
                        child: const Icon(Icons.filter_hdr, color: Color(0xFF7C4DFF), size: 20),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      filter['name'] as String,
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 24),
          child: Text(
            '提示：长按滤镜可应用到所有图片',
            style: TextStyle(fontSize: 10, color: Colors.grey),
          ),
        ),
        if (selectedIndex != null) ...[
          const Divider(height: 32, indent: 24, endIndent: 24),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              children: [
                _buildStyleSlider(
                  '亮度',
                  filters_state['brightness'] ?? 1.0,
                  0.5,
                  1.5,
                  (v) => provider.updateImageFilters(selectedIndex, {'brightness': v}),
                ),
                _buildStyleSlider(
                  '对比度',
                  filters_state['contrast'] ?? 1.0,
                  0.5,
                  1.5,
                  (v) => provider.updateImageFilters(selectedIndex, {'contrast': v}),
                ),
              ],
            ),
          ),
        ] else
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 20),
            child: Text(
              '选择一张图片进行调节',
              style: TextStyle(color: Colors.grey, fontSize: 12),
            ),
          ),
      ],
    );
  }

  Widget _buildStickerPanel() {
    final stickers = ['😀', '❤️', '✨', '🔥', '🌈', '🌸', '🐱', '🍕'];
    return SizedBox(
      height: 60,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 24),
        itemCount: stickers.length,
        itemBuilder: (context, index) {
          return GestureDetector(
            onTap: () => context.read<CollageProvider>().addSticker('emoji', stickers[index]),
            child: Container(
              width: 50,
              height: 50,
              margin: const EdgeInsets.only(right: 12),
              decoration: BoxDecoration(
                color: const Color(0xFFF8F7FF),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Center(child: Text(stickers[index], style: const TextStyle(fontSize: 24))),
            ),
          );
        },
      ),
    );
  }

  Widget _buildBackgroundPanel() {
    final colors = [Colors.white, Colors.black, Colors.purple[100]!, Colors.blue[100]!, Colors.pink[100]!, Colors.orange[100]!];
    return SizedBox(
      height: 50,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 24),
        itemCount: colors.length,
        itemBuilder: (context, index) {
          return GestureDetector(
            onTap: () => context.read<CollageProvider>().setBackground(CollageBackground(type: BackgroundType.color, value: colors[index])),
            child: Container(
              width: 40,
              height: 40,
              margin: const EdgeInsets.only(right: 12),
              decoration: BoxDecoration(
                color: colors[index],
                shape: BoxShape.circle,
                border: Border.all(color: Colors.grey[300]!),
              ),
            ),
          );
        },
      ),
    );
  }
}
