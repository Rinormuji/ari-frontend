const MAX_IMAGE_EDGE = 1400;
const IMAGE_QUALITY = 0.74;

const readAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error("Fotoja nuk mund të lexohet."));
  reader.readAsDataURL(file);
});

const compressImage = async (file) => {
  if (!/^image\/(jpeg|png|webp)$/i.test(file.type) || file.size < 200_000) {
    return readAsDataUrl(file);
  }

  let objectUrl;
  try {
    objectUrl = URL.createObjectURL(file);
    const image = await new Promise((resolve, reject) => {
      const preview = new Image();
      preview.onload = () => resolve(preview);
      preview.onerror = () => reject(new Error("Fotoja nuk mund të përpunohet."));
      preview.src = objectUrl;
    });
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) return readAsDataUrl(file);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const outputType = file.type === "image/jpeg" ? "image/jpeg" : "image/webp";
    const compressed = canvas.toDataURL(outputType, IMAGE_QUALITY);
    if (compressed.startsWith(`data:${outputType};`) && compressed.length < file.size * 4 / 3) {
      return compressed;
    }
    return readAsDataUrl(file);
  } catch {
    return readAsDataUrl(file);
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
};

export const preparePropertyImages = (images) => Promise.all(
  images.map((image) => image instanceof File ? compressImage(image) : image),
);
