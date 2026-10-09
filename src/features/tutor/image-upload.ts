export interface PreparedPhoto { data: string; mime: 'image/jpeg'; preview: string }

/** EXIF orientation is applied by the decoder; additional rotation is baked into the uploaded pixels. */
export async function preparePhoto(file: Blob, rotation = 0): Promise<PreparedPhoto> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Wybierz zdjęcie JPEG, PNG lub WebP. Na iPhonie możesz zrobić zdjęcie bezpośrednio przyciskiem aparatu.');
  if (file.size > 20 * 1024 * 1024) throw new Error('Zdjęcie jest większe niż 20 MB. Zrób nowe zdjęcie kartki.');
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => { throw new Error('Nie udało się otworzyć zdjęcia.'); });
  try {
    if (bitmap.width > 16000 || bitmap.height > 16000 || bitmap.width * bitmap.height > 80_000_000) throw new Error('Zdjęcie ma zbyt dużą rozdzielczość.');
    const ratio = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * ratio), h = Math.round(bitmap.height * ratio);
    const swap = rotation % 180 !== 0;
    const canvas = document.createElement('canvas'); canvas.width = swap ? h : w; canvas.height = swap ? w : h;
    const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Przeglądarka nie obsługuje przygotowania zdjęć.');
    ctx.fillStyle = 'white'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width / 2, canvas.height / 2); ctx.rotate(rotation * Math.PI / 180);
    ctx.drawImage(bitmap, -w / 2, -h / 2, w, h);
    let preview = canvas.toDataURL('image/jpeg', 0.88);
    if (preview.length > 3_400_000) preview = canvas.toDataURL('image/jpeg', 0.65);
    if (preview.length > 3_400_000) throw new Error('Nie udało się zmniejszyć zdjęcia. Zrób zdjęcie samej kartki.');
    return { data: preview.split(',')[1]!, mime: 'image/jpeg', preview };
  } finally { bitmap.close(); }
}
