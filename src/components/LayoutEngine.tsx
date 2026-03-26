import React, { useRef, useState } from 'react';
import { useStore } from '../store';
import { ImagePlus, X, Maximize2, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LayoutEngine: React.FC = () => {
  const { template, style, images, setImage, stickers, updateSticker, removeSticker } = useStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [activeSticker, setActiveSticker] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeIndex !== null) {
      const url = URL.createObjectURL(file);
      setImage(activeIndex, url);
    }
  };

  const triggerUpload = (index: number) => {
    setActiveIndex(index);
    fileInputRef.current?.click();
  };

  const removeImage = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setImage(index, null);
  };

  const handleStickerDrag = (id: string, info: any) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (info.point.x - rect.left) / rect.width;
    const y = (info.point.y - rect.top) / rect.height;
    updateSticker(id, { x, y });
  };

  const renderSlot = (index: number, className: string) => {
    const imageUrl = images[index];
    return (
      <div
        className={`relative overflow-hidden cursor-pointer group bg-surface-container-highest ${className}`}
        style={{ 
          borderRadius: `${style.cornerRadius}px`,
          filter: `brightness(${style.brightness}%) contrast(${style.contrast}%) saturate(${style.saturation}%) grayscale(${style.grayscale}%) sepia(${style.sepia}%)`
        }}
        onClick={() => triggerUpload(index)}
      >
        <AnimatePresence mode="wait">
          {imageUrl ? (
            <motion.div
              key="image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              <img
                src={imageUrl}
                alt={`Slot ${index}`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={(e) => removeImage(e, index)}
                className="absolute top-2 right-2 p-1 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col items-center justify-center text-primary/40 gap-2"
            >
              <ImagePlus size={32} />
              <span className="text-[10px] font-bold uppercase tracking-widest">上传</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="w-full aspect-square bg-white shadow-xl rounded-2xl overflow-hidden relative" ref={containerRef}>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      
      <div 
        className="w-full h-full flex"
        style={{ padding: `${style.spacing}px` }}
      >
        {template === '1-image' && (
          <div className="w-full h-full">
            {renderSlot(0, "w-full h-full")}
          </div>
        )}

        {template === '2-image' && (
          <div className="grid grid-cols-2 w-full h-full" style={{ gap: `${style.borderWidth}px` }}>
            {renderSlot(0, "w-full h-full")}
            {renderSlot(1, "w-full h-full")}
          </div>
        )}

        {template === '3-image' && (
          <div className="flex w-full h-full" style={{ gap: `${style.borderWidth}px` }}>
            <div className="flex-[2] h-full">
              {renderSlot(0, "w-full h-full")}
            </div>
            <div className="flex-[1] flex flex-col h-full" style={{ gap: `${style.borderWidth}px` }}>
              {renderSlot(1, "flex-1")}
              {renderSlot(2, "flex-1")}
            </div>
          </div>
        )}

        {template === '4-image' && (
          <div className="grid grid-cols-2 grid-rows-2 w-full h-full" style={{ gap: `${style.borderWidth}px` }}>
            {renderSlot(0, "w-full h-full")}
            {renderSlot(1, "w-full h-full")}
            {renderSlot(2, "w-full h-full")}
            {renderSlot(3, "w-full h-full")}
          </div>
        )}

        {template === '6-image' && (
          <div className="grid grid-cols-2 grid-rows-3 w-full h-full" style={{ gap: `${style.borderWidth}px` }}>
            {[0, 1, 2, 3, 4, 5].map(i => renderSlot(i, "w-full h-full"))}
          </div>
        )}

        {template === '9-image' && (
          <div className="grid grid-cols-3 grid-rows-3 w-full h-full" style={{ gap: `${style.borderWidth}px` }}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => renderSlot(i, "w-full h-full"))}
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
