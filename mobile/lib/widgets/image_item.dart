import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/collage_provider.dart';
import '../models/collage_state.dart';
import 'package:image_picker/image_picker.dart';

class ImageItem extends StatefulWidget {
  final int index;
  final CollageImage? image;

  const ImageItem({super.key, required this.index, this.image});

  @override
  State<ImageItem> createState() => _ImageItemState();
}

class _ImageItemState extends State<ImageItem> {
  final ImagePicker _picker = ImagePicker();

  Future<void> _pickImage() async {
    final XFile? pickedFile = await _picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      context.read<CollageProvider>().setImage(widget.index, pickedFile.path);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<CollageProvider>().state;
    final isSelected = state.selectedIndex == widget.index;

    if (widget.image == null) {
      return GestureDetector(
        onTap: _pickImage,
        child: Container(
          color: Colors.grey[300],
          child: const Icon(Icons.add_a_photo, color: Colors.grey),
        ),
      );
    }

    final isNetwork = widget.image!.url.startsWith('http');

    return GestureDetector(
      onTap: () => context.read<CollageProvider>().setSelectedIndex(widget.index),
      child: Container(
        decoration: BoxDecoration(
          border: isSelected ? Border.all(color: Colors.blue, width: 3) : null,
        ),
        child: ClipRect(
          child: Stack(
            children: [
              GestureDetector(
                onScaleUpdate: (details) {
                  if (!isSelected) return;
                  final provider = context.read<CollageProvider>();
                  final current = widget.image!;
                  provider.updateImageTransform(
                    widget.index,
                    position: current.position + details.focalPointDelta,
                    scale: current.scale * details.scale,
                    rotation: current.rotation + details.rotation,
                  );
                },
                child: Transform(
                  alignment: Alignment.center,
                  transform: Matrix4.identity()
                    ..translate(widget.image!.position.dx, widget.image!.position.dy)
                    ..scale(widget.image!.scale)
                    ..rotateZ(widget.image!.rotation),
                  child: ColorFiltered(
                    colorFilter: _getColorFilter(widget.image!.filters),
                    child: isNetwork
                        ? Image.network(
                            widget.image!.url,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return const Center(child: Icon(Icons.error));
                            },
                          )
                        : Image.file(
                            File(widget.image!.url),
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return const Center(child: Icon(Icons.error));
                            },
                          ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  ColorFilter _getColorFilter(Map<String, double> filters) {
    final brightness = filters['brightness'] ?? 1.0;
    final contrast = filters['contrast'] ?? 1.0;
    final saturation = filters['saturation'] ?? 1.0;
    final grayscale = filters['grayscale'] ?? 0.0;
    final sepia = filters['sepia'] ?? 0.0;

    // This is a simplified matrix approach. For full control, 
    // multiple matrices should be concatenated.
    // Brightness/Contrast matrix
    double t = (1.0 - contrast) / 2.0;
    List<double> matrix = [
      contrast * brightness, 0, 0, 0, t * 255,
      0, contrast * brightness, 0, 0, t * 255,
      0, 0, contrast * brightness, 0, t * 255,
      0, 0, 0, 1, 0,
    ];

    // Grayscale
    if (grayscale > 0) {
      final g = grayscale;
      final invG = 1.0 - g;
      final r = 0.2126 * g;
      final gr = 0.7152 * g;
      final b = 0.0722 * g;
      
      List<double> grayMatrix = [
        invG + r, gr, b, 0, 0,
        r, invG + gr, b, 0, 0,
        r, gr, invG + b, 0, 0,
        0, 0, 0, 1, 0,
      ];
      matrix = _multiplyMatrices(matrix, grayMatrix);
    }

    // Sepia
    if (sepia > 0) {
      final s = sepia;
      final invS = 1.0 - s;
      List<double> sepiaMatrix = [
        invS + 0.393 * s, 0.769 * s, 0.189 * s, 0, 0,
        0.349 * s, invS + 0.686 * s, 0.168 * s, 0, 0,
        0.272 * s, 0.534 * s, invS + 0.131 * s, 0, 0,
        0, 0, 0, 1, 0,
      ];
      matrix = _multiplyMatrices(matrix, sepiaMatrix);
    }

    return ColorFilter.matrix(matrix);
  }

  List<double> _multiplyMatrices(List<double> m1, List<double> m2) {
    List<double> result = List.filled(20, 0.0);
    for (int i = 0; i < 4; i++) {
      for (int j = 0; j < 5; j++) {
        double sum = 0;
        for (int k = 0; k < 4; k++) {
          sum += m1[i * 5 + k] * m2[k * 5 + j];
        }
        if (j == 4) {
          sum += m1[i * 5 + 4];
        }
        result[i * 5 + j] = sum;
      }
    }
    return result;
  }
}
