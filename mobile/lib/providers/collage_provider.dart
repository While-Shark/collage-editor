import 'package:flutter/material.dart';
import '../models/collage_state.dart';
import 'dart:collection';

class CollageState {
  final int layout;
  final List<CollageImage?> images;
  final List<Sticker> stickers;
  final CollageBackground background;
  final int? selectedIndex;
  final double borderWidth;
  final double cornerRadius;
  final double spacing;

  CollageState({
    this.layout = 1,
    this.images = const [null],
    this.stickers = const [],
    CollageBackground? background,
    this.selectedIndex,
    this.borderWidth = 12.0,
    this.cornerRadius = 24.0,
    this.spacing = 16.0,
  }) : background = background ?? CollageBackground();

  CollageState copyWith({
    int? layout,
    List<CollageImage?>? images,
    List<Sticker>? stickers,
    CollageBackground? background,
    int? selectedIndex,
    bool clearSelection = false,
    double? borderWidth,
    double? cornerRadius,
    double? spacing,
  }) {
    return CollageState(
      layout: layout ?? this.layout,
      images: images ?? this.images,
      stickers: stickers ?? this.stickers,
      background: background ?? this.background,
      selectedIndex: clearSelection ? null : (selectedIndex ?? this.selectedIndex),
      borderWidth: borderWidth ?? this.borderWidth,
      cornerRadius: cornerRadius ?? this.cornerRadius,
      spacing: spacing ?? this.spacing,
    );
  }
}

class CollageProvider with ChangeNotifier {
  CollageState _state = CollageState();
  final List<CollageState> _undoStack = [];
  final List<CollageState> _redoStack = [];

  CollageState get state => _state;

  void setSelectedIndex(int? index) {
    _state = _state.copyWith(selectedIndex: index, clearSelection: index == null);
    notifyListeners();
  }

  void setStyle({double? borderWidth, double? cornerRadius, double? spacing}) {
    _pushToUndo();
    _state = _state.copyWith(
      borderWidth: borderWidth,
      cornerRadius: cornerRadius,
      spacing: spacing,
    );
    notifyListeners();
  }

  void updateImageFilters(int index, Map<String, double> filters) {
    _pushToUndo();
    List<CollageImage?> newImages = List.from(_state.images);
    if (newImages[index] != null) {
      final currentFilters = Map<String, double>.from(newImages[index]!.filters);
      currentFilters.addAll(filters);
      newImages[index] = newImages[index]!.copyWith(filters: currentFilters);
    }
    _state = _state.copyWith(images: newImages);
    notifyListeners();
  }

  void _pushToUndo() {
    _undoStack.add(_state);
    _redoStack.clear();
    if (_undoStack.length > 50) _undoStack.removeAt(0);
  }

  void setLayout(int layout) {
    _pushToUndo();
    List<CollageImage?> newImages = List.filled(layout, null);
    for (int i = 0; i < layout && i < _state.images.length; i++) {
      newImages[i] = _state.images[i];
    }
    _state = _state.copyWith(layout: layout, images: newImages);
    notifyListeners();
  }

  void setImage(int index, String url) {
    _pushToUndo();
    List<CollageImage?> newImages = List.from(_state.images);
    newImages[index] = CollageImage(id: DateTime.now().toString(), url: url);
    _state = _state.copyWith(images: newImages);
    notifyListeners();
  }

  void updateImageTransform(int index, {Offset? position, double? scale, double? rotation}) {
    // We don't push to undo on every tiny movement to avoid bloat, 
    // but for simplicity here we will. In a real app, we might push on gesture end.
    _pushToUndo();
    List<CollageImage?> newImages = List.from(_state.images);
    if (newImages[index] != null) {
      newImages[index] = newImages[index]!.copyWith(
        position: position,
        scale: scale,
        rotation: rotation,
      );
    }
    _state = _state.copyWith(images: newImages);
    notifyListeners();
  }

  void addSticker(String type, String content) {
    _pushToUndo();
    List<Sticker> newList = List.from(_state.stickers);
    newList.add(Sticker(id: DateTime.now().toString(), type: type, content: content));
    _state = _state.copyWith(stickers: newList);
    notifyListeners();
  }

  void updateSticker(String id, {Offset? position, double? scale, double? rotation}) {
    _pushToUndo();
    List<Sticker> newList = _state.stickers.map((s) {
      if (s.id == id) {
        return s.copyWith(position: position, scale: scale, rotation: rotation);
      }
      return s;
    }).toList();
    _state = _state.copyWith(stickers: newList);
    notifyListeners();
  }

  void setBackground(CollageBackground bg) {
    _pushToUndo();
    _state = _state.copyWith(background: bg);
    notifyListeners();
  }

  void undo() {
    if (_undoStack.isNotEmpty) {
      _redoStack.add(_state);
      _state = _undoStack.removeLast();
      notifyListeners();
    }
  }

  void redo() {
    if (_redoStack.isNotEmpty) {
      _undoStack.add(_state);
      _state = _redoStack.removeLast();
      notifyListeners();
    }
  }
}
