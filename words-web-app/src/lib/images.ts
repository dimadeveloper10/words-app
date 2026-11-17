import { api } from './api';

export const IMAGE_FORMATS = [{ ext: 'webp', type: 'image/webp' }] as const;

export const FALLBACK_FORMAT = 'webp';

export function getImageUrl(imageId: string, ext: string): string {
  return `${api.defaults.baseURL ?? ''}/static/images/${imageId}.${ext}`;
}
