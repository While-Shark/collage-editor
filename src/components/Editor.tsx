import React, { useState, useRef } from 'react';
import { useStore, useTemporalStore, LayoutStyle } from '../store';
import { 
  Download, 
  Share2, 
  Settings2, 
  Sparkles, 
  Sticker as StickerIcon, 
  Heart, 
  Plus, 
  Upload,
  Undo2,
  Redo2,
  RotateCcw
} from 'lucide-react';
import { exportToCanvas } from '../CanvasUtils';

const EMOJIS = ['✨', '💖', '🌈', '🌸', '🎨', '📸', '🎀', '🦋', '🌟', '🍀', '🧸', '🍭'];

interface FilterPreset {
  id: string;
  name: string;
  category: string;
  style: Partial<LayoutStyle>;
}

const FILTER_PRESETS: FilterPreset[] = [
  { id: 'none', name: '原图', category: '基础', style: { brightness: 100, contrast: 100, saturation: 100, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0 } },
  { id: 'vivid', name: '鲜艳', category: '基础', style: { brightness: 110, contrast: 110, saturation: 130 } },
  { id: 'soft', name: '柔和', category: '基础', style: { brightness: 105, contrast: 90, saturation: 90 } },
  { id: 'retro', name: '复古', category: '胶片', style: { sepia: 50, contrast: 110, brightness: 90 } },
  { id: 'bw', name: '黑白', category: '胶片', style: { grayscale: 100, contrast: 120 } },
  { id: 'cool', name: '冷调', category: '调色', style: { hueRotate: 180, saturation: 80 } },
  { id: 'warm', name: '暖阳', category: '调色', style: { sepia: 30, brightness: 110, saturation: 110 } },
  { id: 'dreamy', name: '梦幻', category: '艺术', style: { blur: 2, brightness: 110, saturation: 120 } },
  { id: 'noir', name: '午夜', category: '艺术', style: { grayscale: 100, contrast: 150, brightness: 70 } },
];

const FILTER_CATEGORIES = ['收藏', '基础', '胶片', '调色', '艺术'];

export const Editor: React.FC = () => {
  const { 
    style, 
    setStyle, 
    template, 
    images, 
    addSticker, 
    favoriteFilters, 
    toggleFavoriteFilter,
    resetToDefault
  } = useStore();
  
  const { undo, redo, pastStates, futureStates } = useTemporalStore((state) => state);
  
  const [activeTab, setActiveTab] = useState<'layout' | 'filters' | 'stickers'>('layout');
  const [activeFilterCategory, setActiveFilterCategory] = useState('基础');
  const longPressTimer = useRef<any>(null);

  const handleExport = async (type: 'album' | 'wechat') => {
    try {
      const dataUrl = await exportToCanvas(template, images, style);
      const link = document.createElement('a');
      link.download = `editorial-canvas-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      if (type === 'wechat') {
        alert('图片已生成！在真实应用中，这将触发微信分享 SDK。');
      }
    } catch (err) {
      console.error('导出失败', err);
    }
  };

  const handleFilterLongPressStart = (filterId: string) => {
    longPressTimer.current = setTimeout(() => {
      toggleFavoriteFilter(filterId);
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    }, 600);
  };

  const handleFilterLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleCustomStickerUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        addSticker('image', url);
      }
    };
    input.click();
  };

  const ControlSlider = ({ label, value, min, max, onChange, unit = 'px' }: any) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="font-headline font-semibold text-xs tracking-tight text-on-surface/70 uppercase">{label}</label>
        <span className="text-primary text-[10px] font-bold font-mono bg-primary/10 px-2 py-0.5 rounded-full">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1 bg-secondary-container rounded-full appearance-none cursor-pointer accent-primary"
      />
    </div>
  );

  const filteredPresets = activeFilterCategory === '收藏'
    ? FILTER_PRESETS.filter(p => favoriteFilters.includes(p.id))
    : FILTER_PRESETS.filter(p => p.category === activeFilterCategory);

  return (
    <div className="space-y-6">
      {/* History & Reset Toolbar */}
      <div className="flex justify-between items-center px-2">
        <div className="flex gap-2">
          <button
            onClick={() => undo()}
            disabled={pastStates.length === 0}
            className={`p-2 rounded-full transition-all ${
              pastStates.length > 0 
                ? 'bg-surface-container-low text-primary hover:bg-surface-container-high' 
                : 'text-on-surface/20 cursor-not-allowed'
            }`}
            title="撤销"
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={() => redo()}
            disabled={futureStates.length === 0}
            className={`p-2 rounded-full transition-all ${
              futureStates.length > 0 
                ? 'bg-surface-container-low text-primary hover:bg-surface-container-high' 
                : 'text-on-surface/20 cursor-not-allowed'
            }`}
            title="重做"
          >
            <Redo2 size={18} />
          </button>
        </div>
        
        <button
          onClick={() => {
            if (confirm('确定要重置所有修改吗？（图片将保留）')) {
              resetToDefault();
            }
          }}
          className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface/40 hover:text-primary transition-all px-3 py-1.5 rounded-full hover:bg-primary/5"
        >
          <RotateCcw size={14} />
          恢复默认
        </button>
      </div>

      {/* Main Tabs */}
      <div className="flex bg-surface-container-low p-1 rounded-2xl border border-white/10">
        {[
          { id: 'layout', icon: Settings2, label: '布局' },
          { id: 'filters', icon: Sparkles, label: '滤镜' },
          { id: 'stickers', icon: StickerIcon, label: '贴纸' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-on-surface/40 hover:text-on-surface/60'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <section className="bg-surface-container-low/50 p-6 rounded-3xl backdrop-blur-sm border border-white/20 min-h-[350px] flex flex-col">
        {activeTab === 'layout' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ControlSlider 
              label="边框宽度" 
              value={style.borderWidth} 
              min={0} max={40} 
              onChange={(val: number) => setStyle({ borderWidth: val })} 
            />
            <ControlSlider 
              label="圆角大小" 
              value={style.cornerRadius} 
              min={0} max={60} 
              onChange={(val: number) => setStyle({ cornerRadius: val })} 
            />
            <ControlSlider 
              label="内边距" 
              value={style.spacing} 
              min={0} max={32} 
              onChange={(val: number) => setStyle({ spacing: val })} 
            />
          </div>
        )}

        {activeTab === 'filters' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col h-full">
            {/* Filter Categories */}
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {FILTER_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilterCategory(cat)}
                  className={`whitespace-nowrap text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                    activeFilterCategory === cat
                      ? 'bg-primary text-white'
                      : 'text-on-surface/40 hover:text-on-surface/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Filter Presets Grid/Scroll */}
            <div className="flex gap-4 overflow-x-auto py-4 no-scrollbar">
              {filteredPresets.length > 0 ? (
                filteredPresets.map(preset => (
                  <button
                    key={preset.id}
                    onPointerDown={() => handleFilterLongPressStart(preset.id)}
                    onPointerUp={handleFilterLongPressEnd}
                    onPointerLeave={handleFilterLongPressEnd}
                    onClick={() => setStyle(preset.style)}
                    className="flex-shrink-0 flex flex-col items-center gap-2 group"
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-transparent group-hover:border-primary/50 transition-all">
                      <div 
                        className="w-full h-full bg-purple-100"
                        style={{
                          filter: `brightness(${preset.style.brightness ?? 100}%) contrast(${preset.style.contrast ?? 100}%) saturate(${preset.style.saturation ?? 100}%) grayscale(${preset.style.grayscale ?? 0}%) sepia(${preset.style.sepia ?? 0}%) blur(${preset.style.blur ?? 0}px)`
                        }}
                      />
                      {favoriteFilters.includes(preset.id) && (
                        <div className="absolute top-1 right-1 text-red-500">
                          <Heart size={10} fill="currentColor" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-on-surface/60">{preset.name}</span>
                  </button>
                ))
              ) : (
                <div className="w-full py-10 flex flex-col items-center justify-center text-on-surface/30 gap-2">
                  <Heart size={24} />
                  <span className="text-xs">暂无收藏滤镜</span>
                  <span className="text-[10px]">长按滤镜可添加收藏</span>
                </div>
              )}
            </div>

            <div className="mt-auto pt-4 border-t border-white/10 space-y-4">
              <ControlSlider 
                label="亮度" value={style.brightness} min={50} max={150} unit="%"
                onChange={(val: number) => setStyle({ brightness: val })} 
              />
              <ControlSlider 
                label="对比度" value={style.contrast} min={50} max={150} unit="%"
                onChange={(val: number) => setStyle({ contrast: val })} 
              />
            </div>
          </div>
        )}

        {activeTab === 'stickers' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center mb-4">
              <label className="font-headline font-semibold text-xs tracking-tight text-on-surface/70 uppercase">选择贴纸</label>
              <button 
                onClick={handleCustomStickerUpload}
                className="flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-all"
              >
                <Upload size={12} />
                导入图片
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => addSticker('emoji', emoji)}
                  className="aspect-square flex items-center justify-center text-2xl bg-white/50 hover:bg-white rounded-2xl border border-white/20 transition-all hover:scale-110 active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <p className="mt-6 text-[10px] text-on-surface/40 text-center leading-relaxed">
              长按滤镜可快速收藏，点击贴纸可自由编辑
            </p>
          </div>
        )}
      </section>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleExport('album')}
          className="flex items-center justify-center gap-2 py-4 px-6 bg-surface-container-highest text-on-surface font-headline font-bold rounded-full hover:bg-surface-container-high transition-colors active:scale-95"
        >
          <Download size={20} />
          保存到相册
        </button>
        <button
          onClick={() => handleExport('wechat')}
          className="flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-primary to-primary-dim text-white font-headline font-bold rounded-full shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity active:scale-95"
        >
          <Share2 size={20} />
          微信分享
        </button>
      </div>
    </div>
  );
};
