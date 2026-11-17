export const getImageUrl = (imageId: string): string =>
  `${import.meta.env.VITE_API_URL}/static/images/${imageId}.webp`;
