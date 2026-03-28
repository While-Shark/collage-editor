import React, { useState, useRef } from 'react';
import { useStore, useTemporalStore, LayoutStyle } from '../store';
import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/css";
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
  RotateCcw,
  Palette,
  Image as ImageIcon,
  Check,
  X
} from 'lucide-react';
import { exportToCanvas } from '../CanvasUtils';

const EMOJIS = ['✨', '💖', '🌈', '🌸', '🎨', '📸', '🎀', '🦋', '🌟', '🍀', '🧸', '🍭'];

const BACKGROUND_PRESETS = [
  { id: 'white', name: '纯白', value: '#ffffff', type: 'color' },
  { id: 'black', name: '纯黑', value: '#000000', type: 'color' },
  { id: 'cream', name: '奶油', value: '#fdf5e6', type: 'color' },
  { id: 'lavender', name: '薰衣草', value: '#e6e6fa', type: 'color' },
  { id: 'pink', name: '淡粉', value: '#fff0f5', type: 'color' },
  { id: 'mint', name: '薄荷', value: '#f5fffa', type: 'color' },
  { id: 'gradient1', name: '极光', value: 'linear-gradient(135deg, #85FFBD 0%, #FFFB7D 100%)', type: 'gradient' },
  { id: 'gradient2', name: '夕阳', value: 'linear-gradient(135deg, #FF9A8B 0%, #FF6A88 55%, #FF99AC 100%)', type: 'gradient' },
  { id: 'gradient3', name: '深海', value: 'linear-gradient(135deg, #21D4FD 0%, #B721FF 100%)', type: 'gradient' },
  { id: 'gradient4', name: '紫罗兰', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', type: 'gradient' },
];

const PATTERN_PRESETS = [
  { id: 'dots', name: '波点', value: 'radial-gradient(#000000 1px, transparent 1px)', size: '20px 20px', type: 'pattern' },
  { id: 'grid', name: '网格', value: 'linear-gradient(#000000 1px, transparent 1px), linear-gradient(90deg, #000000 1px, transparent 1px)', size: '20px 20px', type: 'pattern' },
  { id: 'stripes', name: '斜纹', value: 'repeating-linear-gradient(45deg, #000000, #000000 10px, transparent 10px, transparent 20px)', size: 'auto', type: 'pattern' },
  { id: 'circles', name: '圆圈', value: 'radial-gradient(circle, transparent 20%, #000000 20%, #000000 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, #000000 20%, #000000 80%, transparent 80%, transparent) 25px 25px', size: '50px 50px', type: 'pattern' },
  { id: 'floral', name: '繁花', value: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M20 20.5a5 5 0 1 0 0-1 5 5 0 0 0 0 1zM20 0a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM0 20a5 5 0 1 0 10 0 5 5 0 0 0-10 0zM40 20a5 5 0 1 0-10 0 5 5 0 0 0 10 0zM20 40a5 5 0 1 0 0-10 5 5 0 0 0 0 10z\' fill=\'%23000000\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")', size: '40px 40px', type: 'pattern' },
  { id: 'stars', name: '星空', value: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M10 0l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z\' fill=\'%23000000\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")', size: '20px 20px', type: 'pattern' },
  { id: 'hearts', name: '爱心', value: 'url("data:image/svg+xml,%3Csvg width=\'30\' height=\'30\' viewBox=\'0 0 30 30\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M15 25s-10-6-10-12a5 5 0 0 1 10-2 5 5 0 0 1 10 2c0 6-10 12-10 12z\' fill=\'%23000000\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")', size: '30px 30px', type: 'pattern' },
];

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
  const style = useStore(state => state.style);
  const setStyle = useStore(state => state.setStyle);
  const addSticker = useStore(state => state.addSticker);
  const favoriteFilters = useStore(state => state.favoriteFilters);
  const toggleFavoriteFilter = useStore(state => state.toggleFavoriteFilter);
  const resetToDefault = useStore(state => state.resetToDefault);
  
  const { undo, redo, pastStates, futureStates } = useTemporalStore((state) => state);
  
  const [color, setColor] = useColor(style.backgroundType === 'color' ? style.background : '#ffffff');
  
  const [activeTab, setActiveTab] = useState<'layout' | 'filters' | 'stickers' | 'background'>('layout');
  const [activeFilterCategory, setActiveFilterCategory] = useState('基础');
  const longPressTimer = useRef<any>(null);

  const handleColorChange = (newColor: any) => {
    setColor(newColor);
    setStyle({ background: newColor.hex, backgroundType: 'color' });
  };

  const handleExport = async (type: 'album' | 'wechat') => {
    const { template, images, imageTransforms } = useStore.getState();
    try {
      const dataUrl = await exportToCanvas(template, images, style, imageTransforms);
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

  const ControlSlider = ({ label, value, min, max, step = 1, onChange, unit = 'px' }: any) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="font-headline font-semibold text-xs tracking-tight text-on-surface/70 uppercase">{label}</label>
        <span className="text-primary text-[10px] font-bold font-mono bg-primary/10 px-2 py-0.5 rounded-full">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
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
          { id: 'background', icon: Palette, label: '背景' },
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

        {activeTab === 'background' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-y-auto max-h-[450px] no-scrollbar pb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="font-headline font-semibold text-xs tracking-tight text-on-surface/70 uppercase">背景模板</label>
              <button 
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setStyle({ background: `url(${url})`, backgroundType: 'image', backgroundImage: url });
                    }
                  };
                  input.click();
                }}
                className="flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-all"
              >
                <ImageIcon size={12} />
                导入背景
              </button>
            </div>
            
            <div className="grid grid-cols-5 gap-3">
              {BACKGROUND_PRESETS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => {
                    setStyle({ background: bg.value, backgroundType: bg.type as any });
                    if (bg.type === 'color') {
                      setColor({ ...color, hex: bg.value });
                    }
                  }}
                  className={`aspect-square rounded-xl border-2 transition-all relative ${
                    style.background === bg.value ? 'border-primary scale-110' : 'border-transparent hover:border-primary/30'
                  }`}
                  style={{ background: bg.value }}
                  title={bg.name}
                >
                  {style.background === bg.value && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <Check size={12} className="text-white drop-shadow-md" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <label className="font-headline font-semibold text-xs tracking-tight text-on-surface/70 uppercase block">花纹背景</label>
              <div className="grid grid-cols-4 gap-3">
                {PATTERN_PRESETS.map((pattern) => (
                  <button
                    key={pattern.id}
                    onClick={() => setStyle({ 
                      background: pattern.value, 
                      backgroundType: 'pattern'
                    })}
                    className={`aspect-square rounded-xl border-2 transition-all relative overflow-hidden ${
                      style.background === pattern.value ? 'border-primary scale-110' : 'border-transparent hover:border-primary/30'
                    }`}
                    title={pattern.name}
                  >
                    <div 
                      className="absolute inset-0 bg-white"
                      style={{ 
                        backgroundImage: pattern.value,
                        backgroundSize: pattern.size,
                        opacity: 0.5
                      }}
                    />
                    {style.background === pattern.value && (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                        <Check size={12} className="text-primary" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 py-0.5">
                      <span className="text-[8px] text-white block text-center font-bold">{pattern.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-4">
              <label className="font-headline font-semibold text-xs tracking-tight text-on-surface/70 uppercase block">自定义颜色 (圆形调色盘)</label>
              <div className="custom-color-picker w-full flex justify-center bg-white/30 p-4 rounded-3xl border border-white/20">
                <ColorPicker 
                  color={color} 
                  onChange={handleColorChange}
                  hideInput={["rgb", "hsv"]}
                  hideAlpha
                />
              </div>
              <div className="flex items-center gap-3 w-full bg-white/50 p-3 rounded-2xl border border-white/20">
                <div 
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                  style={{ background: color.hex }}
                />
                <div className="flex-1">
                  <span className="text-[10px] text-on-surface/40 font-bold uppercase block mb-1">颜色代码</span>
                  <input 
                    type="text"
                    value={color.hex}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^#[0-9A-F]{6}$/i.test(val)) {
                        setStyle({ background: val, backgroundType: 'color' });
                      }
                    }}
                    className="w-full bg-transparent border-none p-0 text-sm font-mono font-bold text-primary focus:ring-0"
                  />
                </div>
              </div>
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
