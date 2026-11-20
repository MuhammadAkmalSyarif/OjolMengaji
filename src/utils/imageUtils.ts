/**
 * Client-side image compression and resizing utility using HTML5 Canvas.
 * Compresses raw camera photos (often 3MB-10MB) down to ~30KB-70KB
 * to guarantee instant loading and prevent localStorage quota overflow.
 */
export async function compressImage(
  file: File | Blob | string,
  maxWidth = 480,
  maxHeight = 480,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let { width, height } = img;

      // Calculate proportional dimensions
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Draw high-quality scaled image
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Export as compressed JPEG Data URL
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(dataUrl);
    };

    img.onerror = (err) => {
      reject(new Error('Failed to load image for compression'));
    };

    if (typeof file === 'string') {
      img.src = file;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(new Error('FileReader returned empty result'));
        }
      };
      reader.onerror = () => reject(new Error('FileReader failed'));
      reader.readAsDataURL(file);
    }
  });
}
