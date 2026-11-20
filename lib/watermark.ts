/**
 * Fashion Zone - Automatic Image Watermark & Logo Overlay Engine
 * Renders an official luxury boutique logo watermark onto product images
 * dynamically scaled according to image dimensions.
 */

export interface WatermarkOptions {
  brandName?: string;
  subText?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  style?: 'luxury-pill' | 'minimal-text' | 'subtle-stamp';
  opacity?: number;
}

/**
 * Apply the official Fashion Zone brand watermark directly onto an image File.
 * Returns a high-quality watermarked image File (JPEG 92%).
 */
export async function applyWatermarkToFile(
  file: File,
  options: WatermarkOptions = {}
): Promise<File> {
  // If not an image file, return original
  if (!file.type.startsWith('image/')) return file;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            resolve(file);
            return;
          }

          // 1. Draw the base image
          ctx.drawImage(img, 0, 0);

          const w = canvas.width;
          const h = canvas.height;

          // 2. Compute proportional scaling factor (calibrated for standard 800-1600px product photos)
          const scale = Math.max(0.5, Math.min(w, h) / 900);
          const brandText = options.brandName || 'Fashion Zone';
          const subText = options.subText || 'BOUTIQUE ✨ ORIGINAL';
          const position = options.position || 'bottom-right';

          ctx.save();

          // Font setup
          const fontSize = Math.round(24 * scale);
          const subFontSize = Math.round(11 * scale);
          const paddingX = Math.round(16 * scale);
          const paddingY = Math.round(10 * scale);
          const radius = Math.round(14 * scale);
          const margin = Math.round(22 * scale);
          const iconSize = Math.round(28 * scale);
          const iconGap = Math.round(10 * scale);

          ctx.font = `900 ${fontSize}px "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif`;
          const brandMetrics = ctx.measureText(brandText);
          ctx.font = `700 ${subFontSize}px "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif`;
          const subMetrics = ctx.measureText(subText);

          const textBlockWidth = Math.max(brandMetrics.width, subMetrics.width);
          const badgeWidth = paddingX * 2 + iconSize + iconGap + textBlockWidth;
          const badgeHeight = Math.max(iconSize, fontSize + subFontSize + 6 * scale) + paddingY * 2;

          // 3. Compute Coordinates
          let x = w - badgeWidth - margin;
          let y = h - badgeHeight - margin;

          if (position === 'bottom-left') {
            x = margin;
            y = h - badgeHeight - margin;
          } else if (position === 'top-right') {
            x = w - badgeWidth - margin;
            y = margin;
          } else if (position === 'top-left') {
            x = margin;
            y = margin;
          } else if (position === 'center') {
            x = (w - badgeWidth) / 2;
            y = (h - badgeHeight) / 2;
          }

          // 4. Draw Frosted Glass Luxury Badge Background
          ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
          ctx.shadowBlur = 14 * scale;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 4 * scale;

          ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(x, y, badgeWidth, badgeHeight, radius);
          } else {
            ctx.rect(x, y, badgeWidth, badgeHeight);
          }
          ctx.fill();

          // Border: Elegant rose-gold/pink subtle stroke
          ctx.strokeStyle = 'rgba(225, 29, 72, 0.35)';
          ctx.lineWidth = Math.max(1, 1.8 * scale);
          ctx.stroke();

          // 5. Draw Icon Circle with Gradient & Crown/Sparkle
          ctx.shadowColor = 'transparent'; // clear shadow for crisp details
          const iconX = x + paddingX;
          const iconY = y + (badgeHeight - iconSize) / 2;

          // Rose circle background
          const iconGrad = ctx.createLinearGradient(iconX, iconY, iconX + iconSize, iconY + iconSize);
          iconGrad.addColorStop(0, '#fb7185'); // rose-400
          iconGrad.addColorStop(1, '#e11d48'); // rose-600
          ctx.fillStyle = iconGrad;
          ctx.beginPath();
          ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
          ctx.fill();

          // Sparkle emoji / symbol inside circle
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.round(15 * scale)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('✨', iconX + iconSize / 2, iconY + iconSize / 2 + 1);

          // 6. Draw Brand Name Text
          const textStartX = iconX + iconSize + iconGap;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillStyle = '#1c1917'; // stone-900 luxury black
          ctx.font = `900 ${fontSize}px "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif`;
          ctx.fillText(brandText, textStartX, y + paddingY);

          // 7. Draw Subtitle (Rose Pink)
          ctx.fillStyle = '#e11d48'; // rose-600
          ctx.font = `800 ${subFontSize}px "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif`;
          ctx.fillText(subText, textStartX, y + paddingY + fontSize + Math.round(2 * scale));

          ctx.restore();

          // 8. Export to Blob and File
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '-fz.jpg', {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(newFile);
            },
            'image/jpeg',
            0.92
          );
        } catch (err) {
          console.error('Watermark error:', err);
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
