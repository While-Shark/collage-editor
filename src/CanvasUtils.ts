import { LayoutStyle, TemplateType, useStore, ImageTransform } from './store';

export const EXPORT_SIZE = 2160;

export async function exportToCanvas(
  template: TemplateType,
  images: (string | null)[],
  style: LayoutStyle,
  imageTransforms: ImageTransform[]
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = EXPORT_SIZE;
  canvas.height = EXPORT_SIZE;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  // Background
  if (style.backgroundType === 'gradient') {
    const colors = style.background.match(/#[a-fA-F0-9]{6}/g);
    if (colors && colors.length >= 2) {
      const grad = ctx.createLinearGradient(0, 0, EXPORT_SIZE, EXPORT_SIZE);
      colors.forEach((color, index) => {
        grad.addColorStop(index / (colors.length - 1), color);
      });
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);
    }
  } else if (style.backgroundType === 'pattern') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);
    
    if (style.background.startsWith('url')) {
      // SVG Pattern
      const dataUri = style.background.match(/url\("?(.*?)"?\)/)?.[1];
      if (dataUri) {
        const patternImg = new Image();
        await new Promise((resolve, reject) => {
          patternImg.onload = resolve;
          patternImg.onerror = reject;
          patternImg.src = dataUri;
        });
        const pattern = ctx.createPattern(patternImg, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);
        }
      }
    } else {
      // CSS Gradient Pattern (Simplified for Canvas)
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = '#000000';
      const gap = 60;
      if (style.background.includes('radial-gradient')) {
        for (let x = 0; x < EXPORT_SIZE; x += gap) {
          for (let y = 0; y < EXPORT_SIZE; y += gap) {
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (style.background.includes('linear-gradient')) {
        ctx.lineWidth = 2;
        for (let i = 0; i < EXPORT_SIZE * 2; i += gap) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(0, i);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  } else if (style.backgroundType === 'image' && style.backgroundImage) {
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
      bgImg.onload = resolve;
      bgImg.onerror = reject;
      bgImg.src = style.backgroundImage!;
    });
    
    const imgAspect = bgImg.width / bgImg.height;
    const targetAspect = 1; // Square
    let drawW, drawH, drawX, drawY;
    if (imgAspect > targetAspect) {
      drawH = EXPORT_SIZE;
      drawW = EXPORT_SIZE * imgAspect;
      drawX = -(drawW - EXPORT_SIZE) / 2;
      drawY = 0;
    } else {
      drawW = EXPORT_SIZE;
      drawH = EXPORT_SIZE / imgAspect;
      drawX = 0;
      drawY = -(drawH - EXPORT_SIZE) / 2;
    }
    ctx.drawImage(bgImg, drawX, drawY, drawW, drawH);
  } else {
    ctx.fillStyle = style.background;
    ctx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);
  }

  const scale = EXPORT_SIZE / 400; // Assuming 400px is our base UI size for calculations
  const spacing = style.spacing * scale;
  const borderWidth = style.borderWidth * scale;
  const cornerRadius = style.cornerRadius * scale;

  const drawImage = async (imgUrl: string | null, x: number, y: number, w: number, h: number, index: number) => {
    if (!imgUrl) {
      ctx.fillStyle = '#f3e2ff';
      roundRect(ctx, x, y, w, h, cornerRadius);
      ctx.fill();
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imgUrl;
    });

    const transform = imageTransforms[index] || { scale: 1, x: 0, y: 0 };

    ctx.save();
    roundRect(ctx, x, y, w, h, cornerRadius);
    ctx.clip();

    // Apply Filters
    ctx.filter = `brightness(${style.brightness}%) contrast(${style.contrast}%) saturate(${style.saturation}%) grayscale(${style.grayscale}%) sepia(${style.sepia}%)`;

    // Object-fit: cover logic
    const imgAspect = img.width / img.height;
    const targetAspect = w / h;
    let drawW, drawH, drawX, drawY;

    if (imgAspect > targetAspect) {
      drawH = h;
      drawW = h * imgAspect;
      drawX = x - (drawW - w) / 2;
      drawY = y;
    } else {
      drawW = w;
      drawH = w / imgAspect;
      drawX = x;
      drawY = y - (drawH - h) / 2;
    }

    // Apply Transforms
    ctx.save();
    const centerX = x + w / 2;
    const centerY = y + h / 2;
    ctx.translate(centerX, centerY);
    ctx.scale(transform.scale, transform.scale);
    ctx.translate((transform.x / 100) * w, (transform.y / 100) * h);
    
    ctx.drawImage(img, drawX - centerX, drawY - centerY, drawW, drawH);
    ctx.restore();

    ctx.restore();
    ctx.filter = 'none'; // Reset filter for next elements
  };

  const contentSize = EXPORT_SIZE - spacing * 2;
  const startX = spacing;
  const startY = spacing;

  if (template === '1-image') {
    await drawImage(images[0], startX, startY, contentSize, contentSize, 0);
  } else if (template === '2-image') {
    const itemW = (contentSize - borderWidth) / 2;
    await drawImage(images[0], startX, startY, itemW, contentSize, 0);
    await drawImage(images[1], startX + itemW + borderWidth, startY, itemW, contentSize, 1);
  } else if (template === '3-image') {
    const largeW = (contentSize - borderWidth) * (2 / 3);
    const smallW = contentSize - largeW - borderWidth;
    const smallH = (contentSize - borderWidth) / 2;

    await drawImage(images[0], startX, startY, largeW, contentSize, 0);
    await drawImage(images[1], startX + largeW + borderWidth, startY, smallW, smallH, 1);
    await drawImage(images[2], startX + largeW + borderWidth, startY + smallH + borderWidth, smallW, smallH, 2);
  } else if (template === '4-image') {
    const itemSize = (contentSize - borderWidth) / 2;
    await drawImage(images[0], startX, startY, itemSize, itemSize, 0);
    await drawImage(images[1], startX + itemSize + borderWidth, startY, itemSize, itemSize, 1);
    await drawImage(images[2], startX, startY + itemSize + borderWidth, itemSize, itemSize, 2);
    await drawImage(images[3], startX + itemSize + borderWidth, startY + itemSize + borderWidth, itemSize, itemSize, 3);
  } else if (template === '6-image') {
    const itemW = (contentSize - borderWidth) / 2;
    const itemH = (contentSize - borderWidth * 2) / 3;
    for (let i = 0; i < 6; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      await drawImage(
        images[i],
        startX + col * (itemW + borderWidth),
        startY + row * (itemH + borderWidth),
        itemW,
        itemH,
        i
      );
    }
  } else if (template === '9-image') {
    const itemSize = (contentSize - borderWidth * 2) / 3;
    for (let i = 0; i < 9; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      await drawImage(
        images[i],
        startX + col * (itemSize + borderWidth),
        startY + row * (itemSize + borderWidth),
        itemSize,
        itemSize,
        i
      );
    }
  }

  // Draw Stickers
  const { stickers } = useStore.getState();

  for (const sticker of stickers) {
    ctx.save();
    const x = sticker.x * EXPORT_SIZE;
    const y = sticker.y * EXPORT_SIZE;
    ctx.translate(x, y);
    ctx.rotate((sticker.rotation * Math.PI) / 180);
    ctx.scale(sticker.scale, sticker.scale);

    if (sticker.type === 'emoji') {
      ctx.font = `${80 * scale}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sticker.content, 0, 0);
    } else {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = sticker.content;
      });
      const stickerSize = 120 * scale;
      ctx.drawImage(img, -stickerSize / 2, -stickerSize / 2, stickerSize, stickerSize);
    }
    ctx.restore();
  }

  return canvas.toDataURL('image/png');
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}
