import { create, useStore as useZustandStore } from 'zustand';
import { temporal } from 'zundo';

export type TemplateType = '1-image' | '2-image' | '3-image' | '4-image' | '6-image' | '9-image';

export interface LayoutStyle {
  borderWidth: number;
  cornerRadius: number;
  spacing: number;
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: number;
  sepia: number;
  hueRotate: number;
  blur: number;
  background: string;
  backgroundType: 'color' | 'gradient' | 'pattern' | 'image';
  backgroundImage?: string;
}

export interface Sticker {
  id: string;
  type: 'emoji' | 'image';
  content: string; // emoji or image URL
  x: number; // 0-1 percentage
  y: number; // 0-1 percentage
  scale: number;
  rotation: number;
}

export interface ImageData {
  id: string;
  url: string;
}

const DEFAULT_STYLE: LayoutStyle = {
  borderWidth: 12,
  cornerRadius: 24,
  spacing: 16,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: 0,
  sepia: 0,
  hueRotate: 0,
  blur: 0,
  background: '#ffffff',
  backgroundType: 'color',
};

export interface ImageTransform {
  scale: number;
  x: number; // offset X
  y: number; // offset Y
}

interface AppState {
  template: TemplateType;
  style: LayoutStyle;
  images: (string | null)[];
  imageTransforms: ImageTransform[];
  stickers: Sticker[];
  favoriteFilters: string[]; // IDs of favorite filter presets
  view: 'editor' | 'gallery' | 'preview';
  selectedImageIndex: number | null;
  setTemplate: (template: TemplateType) => void;
  setStyle: (style: Partial<LayoutStyle>) => void;
  setImage: (index: number, url: string | null) => void;
  updateImageTransform: (index: number, updates: Partial<ImageTransform>) => void;
  setSelectedImageIndex: (index: number | null) => void;
  addSticker: (type: 'emoji' | 'image', content: string) => void;
  updateSticker: (id: string, updates: Partial<Sticker>) => void;
  removeSticker: (id: string) => void;
  toggleFavoriteFilter: (filterId: string) => void;
  setView: (view: 'editor' | 'gallery' | 'preview') => void;
  resetImages: () => void;
  resetToDefault: () => void;
}

const DEFAULT_TRANSFORM: ImageTransform = { scale: 1, x: 0, y: 0 };

export const useStore = create<AppState>()(
  temporal((set) => ({
    template: '3-image',
    style: { ...DEFAULT_STYLE },
    images: [null, null, null], // Initial for 3-image
    imageTransforms: [DEFAULT_TRANSFORM, DEFAULT_TRANSFORM, DEFAULT_TRANSFORM],
    stickers: [],
    favoriteFilters: [],
    view: 'editor',
    selectedImageIndex: null,
    setTemplate: (template) => {
      const count = template === '1-image' ? 1 :
                    template === '2-image' ? 2 :
                    template === '3-image' ? 3 :
                    template === '4-image' ? 4 :
                    template === '6-image' ? 6 :
                    template === '9-image' ? 9 : 3;
      set({ 
        template, 
        images: Array(count).fill(null),
        imageTransforms: Array.from({ length: count }, () => ({ ...DEFAULT_TRANSFORM })),
        selectedImageIndex: null
      });
    },
    setStyle: (style) => set((state) => ({ style: { ...state.style, ...style } })),
    setImage: (index, url) => set((state) => {
      const newImages = [...state.images];
      newImages[index] = url;
      return { images: newImages };
    }),
    updateImageTransform: (index, updates) => set((state) => {
      const newTransforms = [...state.imageTransforms];
      newTransforms[index] = { ...newTransforms[index], ...updates };
      return { imageTransforms: newTransforms };
    }),
    setSelectedImageIndex: (index) => set({ selectedImageIndex: index }),
    addSticker: (type, content) => set((state) => ({
      stickers: [...state.stickers, {
        id: Math.random().toString(36).substr(2, 9),
        type,
        content,
        x: 0.5,
        y: 0.5,
        scale: 1,
        rotation: 0,
      }]
    })),
    updateSticker: (id, updates) => set((state) => ({
      stickers: state.stickers.map(s => s.id === id ? { ...s, ...updates } : s)
    })),
    removeSticker: (id) => set((state) => ({
      stickers: state.stickers.filter(s => s.id !== id)
    })),
    toggleFavoriteFilter: (filterId) => set((state) => ({
      favoriteFilters: state.favoriteFilters.includes(filterId)
        ? state.favoriteFilters.filter(id => id !== filterId)
        : [...state.favoriteFilters, filterId]
    })),
    setView: (view) => set({ view }),
    resetImages: () => set((state) => ({ 
      images: Array(
        state.template === '1-image' ? 1 :
        state.template === '2-image' ? 2 :
        state.template === '3-image' ? 3 :
        state.template === '4-image' ? 4 :
        state.template === '6-image' ? 6 :
        state.template === '9-image' ? 9 : 3
      ).fill(null) 
    })),
    resetToDefault: () => set({
      style: { ...DEFAULT_STYLE },
      stickers: [],
    }),
  }))
);

export const useTemporalStore = <T,>(
  selector: (state: import('zundo').TemporalState<AppState>) => T,
) => useZustandStore(useStore.temporal, selector);
