import { BadRequestException } from '@nestjs/common';
import { mkdir, writeFile, unlink } from 'fs/promises';
import { basename, join } from 'path';

export type ImageFolder = 'words' | 'topics' | 'lessons';

const STATIC_DIR = join(process.cwd(), 'static');
const PUBLIC_PREFIX = '/static';

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

const detectExtension = async (buffer: Buffer): Promise<string> => {
  const { fileTypeFromBuffer } = await import('file-type');
  const fileType = await fileTypeFromBuffer(buffer);
  const ext = fileType && EXT_BY_MIME[fileType.mime];
  if (!ext) {
    throw new BadRequestException('Image must be a JPEG or PNG file');
  }
  return ext;
};

export const saveImage = async (
  folder: ImageFolder,
  id: string,
  file: Express.Multer.File,
): Promise<string> => {
  const ext = await detectExtension(file.buffer);
  const filename = `${id}.${ext}`;
  const dir = join(STATIC_DIR, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), file.buffer);
  return `${PUBLIC_PREFIX}/${folder}/${filename}`;
};

export const deleteImage = async (
  folder: ImageFolder,
  imageUrl: string,
): Promise<void> => {
  if (!imageUrl.startsWith(`${PUBLIC_PREFIX}/${folder}/`)) {
    return;
  }
  try {
    await unlink(join(STATIC_DIR, folder, basename(imageUrl)));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
};

export const replaceImage = async (
  folder: ImageFolder,
  id: string,
  file: Express.Multer.File,
  previousUrl: string | null,
): Promise<string> => {
  const imageUrl = await saveImage(folder, id, file);
  if (previousUrl && previousUrl !== imageUrl) {
    await deleteImage(folder, previousUrl);
  }
  return imageUrl;
};
