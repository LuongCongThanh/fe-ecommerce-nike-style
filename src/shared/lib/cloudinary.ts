interface CloudinaryOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'thumb';
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg';
}

export function buildImageUrl(publicId: string, options: CloudinaryOptions = {}): string {
  if (publicId.length === 0) return '/images/placeholder.jpg';

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '';
  const { width, height, crop = 'fill', quality = 'auto', format = 'auto' } = options;

  const transforms: string[] = [`f_${format}`, `q_${typeof quality === 'number' ? String(quality) : quality}`];
  if (width != null) transforms.push(`w_${String(width)}`);
  if (height != null) transforms.push(`h_${String(height)}`);
  transforms.push(`c_${crop}`);

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms.join(',')}/${publicId}`;
}
