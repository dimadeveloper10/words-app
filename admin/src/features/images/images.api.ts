import { api } from '@/lib/api';

interface UploadedImage {
  imageId: string;
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<UploadedImage>('/images', formData);
  return data.imageId;
}
