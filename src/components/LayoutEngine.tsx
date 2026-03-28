import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, ImageTransform } from '../store';
import { 
  ImagePlus, 
  X, 
  Maximize2, 
  RotateCw, 
  Trash2,
  Move,
  ZoomIn
} from 'lucide-react';

interface ImageSlotProps {
  index: number;
  className: string;
}

const ImageSlot: React.FC<ImageSlotProps> = ({ index, className }) => {
  const images = useStore(state => state.images);
  const setImage = useStore(state => state.setImage);
  const style = useStore(state => state.style);
  const transform = useStore(state => state.imageTransforms[index] || { scale: 1, x: 0, y: 0 });
  const updateImageTransform = useStore(state => state.updateImageTransform);
  const selectedImageIndex = useStore(state => state.selectedImageIndex);
  const setSelectedImageIndex = useStore(state => state.setSelectedImageIndex);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const startTransform = useRef({ x: 0, y: 0, scale: 1 });
  const imageUrl = images[index];
  const isSelected = selectedImageIndex === index;

  const handlePanStart = () => {
    if (!isSelected) return;
    startTransform.current = { 
      x: transform.x, 
      y: transform.y,
      scale: transform.scale 
    };
  };

  const handlePan = (_: any, info: any) => {
    if (!slotRef.current || !isSelected) return;
    
    const rect = slotRef.current.getBoundingClientRect();
    // Calculate offset as percentage of slot size
    // We divide by scale because when zoomed in, a 10px move should move the image less in percentage terms of its own size
    const dx = (info.offset.x / rect.width) * 100 / startTransform.current.scale;
    const dy = (info.offset.y / rect.height) * 100 / startTransform.current.scale;

    updateImageTransform(index, {
      x: startTransform.current.x + dx,
      y: startTransform.current.y + dy
    });
  };

  const handleSlotClick = (e: React.MouseEvent) => {
    if (!imageUrl) {
      fileInputRef.current?.click();
    } else {
      setSelectedImageIndex(isSelected ? null : index);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(index, url);
    }
  };

  const onRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImage(index, null);
    if (isSelected) setSelectedImageIndex(null);
  };

  const onReplace = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  return (
    <div
      ref={slotRef}
      className={`relative overflow-hidden cursor-pointer group bg-surface-container-highest transition-shadow ${className} ${
        isSelected ? 'ring-4 ring-primary ring-inset z-20 shadow-2xl' : 'hover:bg-primary/5'
      }`}
      style={{ borderRadius: `${style.cornerRadius}px` }}
      onClick={handleSlotClick}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange} 
      />

      <AnimatePresence mode="wait">
        {imageUrl ? (
          <motion.div
            key="image-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full relative touch-none"
          >
            {/* The Image */}
            <div className="w-full h-full overflow-hidden">
              <img
                src={imageUrl}
                alt={`Slot ${index}`}
                className="w-full h-full object-cover origin-center pointer-events-none select-none"
                style={{
                  filter: `brightness(${style.brightness}%) contrast(${style.contrast}%) saturate(${style.saturation}%) grayscale(${style.grayscale}%) sepia(${style.sepia}%)`,
                  transform: `scale(${transform.scale}) translate(${transform.x}%, ${transform.y}%)`,
                }}
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Pan Overlay - Only active when selected */}
            {isSelected && (
              <motion.div
                onPanStart={handlePanStart}
                onPan={handlePan}
                className="absolute inset-0 z-10 cursor-move flex items-center justify-center bg-primary/5"
              >
                <div className="bg-white/90 p-3 rounded-full shadow-xl border border-primary/20 pointer-events-none">
                  <Move size={24} className="text-primary" />
                </div>
              </motion.div>
            )}

            {/* Top Controls */}
            <div className={`absolute top-2 right-2 flex gap-1 z-30 transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <button
                onClick={onReplace}
                className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md text-primary transition-transform hover:scale-110"
                title="替换"
              >
                <RotateCw size={14} />
              </button>
              <button
                onClick={onRemove}
                className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md text-red-500 transition-transform hover:scale-110"
                title="删除"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Bottom Scale Slider */}
            {isSelected && (
              <div 
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-full shadow-2xl border border-primary/20 flex items-center gap-3 min-w-[200px]"
                onClick={(e) => e.stopPropagation()}
              >
                <ZoomIn size={16} className="text-primary" />
                <input 
                  type="range"
                  min="0.5"
                  max="4"
                  step="0.01"
                  value={transform.scale}
                  onChange={(e) => updateImageTransform(index, { scale: parseFloat(e.target.value) })}
                  className="flex-1 h-1.5 bg-primary/10 rounded-full appearance-none cursor-pointer accent-primary"
                />
                <span className="text-[11px] font-mono font-bold text-primary w-10 text-right">{transform.scale.toFixed(1)}x</span>
              </div>
            )}

            {/* Status Badge */}
            {isSelected && (
              <div className="absolute top-2 left-2 z-30">
                <span className="bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 uppercase tracking-wider">
                  <Maximize2 size={12} />
                  编辑中
                </span>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col items-center justify-center text-primary/30 gap-3 bg-primary/5"
          >
            <div className="p-4 bg-white rounded-full shadow-sm">
              <ImagePlus size={32} strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">点击上传图片</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const LayoutEngine: React.FC = () => {
  const template = useStore(state => state.template);
  const style = useStore(state => state.style);
  const stickers = useStore(state => state.stickers);
  const updateSticker = useStore(state => state.updateSticker);
  const removeSticker = useStore(state => state.removeSticker);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSticker, setActiveSticker] = useState<string | null>(null);

  const handleStickerDrag = (id: string, info: any) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (info.point.x - rect.left) / rect.width;
    const y = (info.point.y - rect.top) / rect.height;
    updateSticker(id, { x, y });
  };

  return (
    <div 
      className="w-full aspect-square shadow-2xl rounded-[32px] overflow-hidden relative select-none" 
      ref={containerRef}
      style={{ 
        background: style.background,
        backgroundSize: style.backgroundType === 'pattern' ? '20px 20px' : 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div 
        className="w-full h-full flex"
        style={{ padding: `${style.spacing}px` }}
      >
        {template === '1-image' && (
          <div className="w-full h-full">
            <ImageSlot index={0} className="w-full h-full" />
          </div>
        )}

        {template === '2-image' && (
          <div className="grid grid-cols-2 w-full h-full" style={{ gap: `${style.borderWidth}px` }}>
            <ImageSlot index={0} className="w-full h-full" />
            <ImageSlot index={1} className="w-full h-full" />
          </div>
        )}

        {template === '3-image' && (
          <div className="flex w-full h-full" style={{ gap: `${style.borderWidth}px` }}>
            <div className="flex-[2] h-full">
              <ImageSlot index={0} className="w-full h-full" />
            </div>
            <div className="flex-[1] flex flex-col h-full" style={{ gap: `${style.borderWidth}px` }}>
              <ImageSlot index={1} className="flex-1" />
              <ImageSlot index={2} className="flex-1" />
            </div>
          </div>
        )}

        {template === '4-image' && (
          <div className="grid grid-cols-2 grid-rows-2 w-full h-full" style={{ gap: `${style.borderWidth}px` }}>
            <ImageSlot index={0} className="w-full h-full" />
            <ImageSlot index={1} className="w-full h-full" />
            <ImageSlot index={2} className="w-full h-full" />
            <ImageSlot index={3} className="w-full h-full" />
          </div>
        )}

        {template === '6-image' && (
          <div className="grid grid-cols-2 grid-rows-3 w-full h-full" style={{ gap: `${style.borderWidth}px` }}>
            {[0, 1, 2, 3, 4, 5].map(i => <ImageSlot key={i} index={i} className="w-full h-full" />)}
          </div>
        )}

        {template === '9-image' && (
          <div className="grid grid-cols-3 grid-rows-3 w-full h-full" style={{ gap: `${style.borderWidth}px` }}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => <ImageSlot key={i} index={i} className="w-full h-full" />)}
          </div>
        )}
      </div>

      {/* Stickers Layer */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {stickers.map((sticker) => (
              <motion.div
                key={sticker.id}
                drag
                dragMomentum={false}
                onDragEnd={(_, info) => handleStickerDrag(sticker.id, info)}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: sticker.scale, 
                  opacity: 1,
                  left: `${sticker.x * 100}%`,
                  top: `${sticker.y * 100}%`,
                  rotate: sticker.rotation,
                  x: '-50%',
                  y: '-50%'
                }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute w-[60px] h-[60px] flex items-center justify-center cursor-grab active:cursor-grabbing pointer-events-auto group"
                onPointerDown={() => setActiveSticker(sticker.id)}
              >
                {sticker.type === 'emoji' ? (
                  <span className="text-5xl">{sticker.content}</span>
                ) : (
                  <img 
                    src={sticker.content} 
                    alt="Sticker" 
                    className="w-full h-full object-contain pointer-events-none" 
                    referrerPolicy="no-referrer"
                  />
                )}
                
                {activeSticker === sticker.id && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-2 bg-white shadow-xl rounded-full px-3 py-1.5 border border-purple-100">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSticker(sticker.id);
                    }}
                    className="p-1 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                  >
                    <X size={16} />
                  </button>
                  <button 
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      updateSticker(sticker.id, { scale: sticker.scale + 0.1 });
                    }}
                    className="p-1 hover:bg-purple-50 text-purple-600 rounded-full transition-colors"
                  >
                    <Maximize2 size={16} />
                  </button>
                  <button 
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      updateSticker(sticker.id, { rotation: sticker.rotation + 15 });
                    }}
                    className="p-1 hover:bg-purple-50 text-purple-600 rounded-full transition-colors"
                  >
                    <RotateCw size={16} />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {activeSticker && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => setActiveSticker(null)}
        />
      )}
    </div>
  );
};
