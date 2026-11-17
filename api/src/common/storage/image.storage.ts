import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

const IMAGES_DIR = join(process.cwd(), 'static', 'images');
const IMAGE_FORMAT = 'webp';
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png']);

const imagePath = (imageId: string): string =>
  join(IMAGES_DIR, `${imageId}.${IMAGE_FORMAT}`);

const ensureAllowedType = async (buffer: Buffer): Promise<void> => {
  const { fileTypeFromBuffer } = await import('file-type');
  const fileType = await fileTypeFromBuffer(buffer);
  if (!fileType || !ALLOWED_MIME_TYPES.has(fileType.mime)) {
    throw new BadRequestException('Image must be a JPEG or PNG file');
  }
};

export const saveImage = async (file: Express.Multer.File): Promise<string> => {
  await ensureAllowedType(file.buffer);
  const imageId = randomUUID();
  await mkdir(IMAGES_DIR, { recursive: true });
  await sharp(file.buffer).webp().toFile(imagePath(imageId));
  return imageId;
};

export const deleteImage = async (imageId: string): Promise<void> => {
  try {
    await unlink(imagePath(imageId));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
};

export const replaceImage = async (
  file: Express.Multer.File,
  previousImageId: string | null,
): Promise<string> => {
  const imageId = await saveImage(file);
  if (previousImageId) {
    await deleteImage(previousImageId);
  }
  return imageId;
};
