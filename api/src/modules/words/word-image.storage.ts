import { mkdir, writeFile, unlink } from 'fs/promises';
import { basename, join } from 'path';
import { randomUUID } from 'crypto';

const WORDS_IMAGE_DIR = join(process.cwd(), 'static', 'words');
const PUBLIC_PREFIX = '/static/words';

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

export const saveWordImage = async (
  file: Express.Multer.File,
): Promise<string> => {
  const ext = EXT_BY_MIME[file.mimetype] ?? 'bin';
  const filename = `${randomUUID()}.${ext}`;
  await mkdir(WORDS_IMAGE_DIR, { recursive: true });
  await writeFile(join(WORDS_IMAGE_DIR, filename), file.buffer);
  return `${PUBLIC_PREFIX}/${filename}`;
};

export const deleteWordImage = async (imageUrl: string): Promise<void> => {
  try {
    await unlink(join(WORDS_IMAGE_DIR, basename(imageUrl)));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
};
