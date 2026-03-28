import 'package:flutter/material.dart';

enum BackgroundType { color, gradient, pattern, image }

class CollageImage {
  final String id;
  final String url;
  final Offset position;
  final double scale;
  final double rotation;
  final Map<String, double> filters;

  CollageImage({
    required this.id,
    required this.url,
    this.position = Offset.zero,
    this.scale = 1.0,
    this.rotation = 0.0,
    this.filters = const {
      'brightness': 1.0,
      'contrast': 1.0,
      'saturation': 1.0,
      'grayscale': 0.0,
      'sepia': 0.0,
    },
  });

  CollageImage copyWith({
    String? url,
    Offset? position,
    double? scale,
    double? rotation,
    Map<String, double>? filters,
  }) {
    return CollageImage(
      id: id,
      url: url ?? this.url,
      position: position ?? this.position,
      scale: scale ?? this.scale,
      rotation: rotation ?? this.rotation,
      filters: filters ?? this.filters,
    );
  }
}

class Sticker {
  final String id;
  final String type; // 'emoji' or 'image'
  final String content;
  final Offset position;
  final double scale;
  final double rotation;

  Sticker({
    required this.id,
    required this.type,
    required this.content,
    this.position = Offset.zero,
    this.scale = 1.0,
    this.rotation = 0.0,
  });

  Sticker copyWith({
    Offset? position,
    double? scale,
    double? rotation,
  }) {
    return Sticker(
      id: id,
      type: type,
      content: content,
      position: position ?? this.position,
      scale: scale ?? this.scale,
      rotation: rotation ?? this.rotation,
    );
  }
}

class CollageBackground {
  final BackgroundType type;
  final dynamic value; // Color, List<Color>, String (pattern/image)

  CollageBackground({
    this.type = BackgroundType.color,
    this.value = Colors.white,
  });
}
