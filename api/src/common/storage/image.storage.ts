import { mkdir, writeFile, unlink } from 'fs/promises';
import { basename, join } from 'path';

export type ImageFolder = 'words' | 'topics' | 'lessons';

const STATIC_DIR = join(process.cwd(), 'static');
const PUBLIC_PREFIX = '/static';

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

export const saveImage = async (
  folder: ImageFolder,
  id: string,
  file: Express.Multer.File,
): Promise<string> => {
  const ext = EXT_BY_MIME[file.mimetype] ?? 'bin';
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
