/**
 * Converts an image file to WebP format using the Canvas API.
 * @param {File} file - The image file to convert.
 * @param {number} quality - WebP quality (0 to 1). Default: 0.8
 * @returns {Promise<{ dataUrl: string, blob: Blob }>} - The converted image as data URL and Blob.
 */
export function convertToWebP(file, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Conversion to WebP failed"));
            return;
          }
          const reader = new FileReader();
          reader.onload = () => resolve({ dataUrl: reader.result, blob });
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        },
        "image/webp",
        quality,
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}
