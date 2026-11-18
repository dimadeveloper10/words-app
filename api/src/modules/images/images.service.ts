import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { access, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

const IMAGES_DIR = join(process.cwd(), 'static', 'images');
const IMAGE_FORMAT = 'webp';
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png']);

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  async save(file: Express.Multer.File): Promise<string> {
    await this.ensureAllowedType(file.buffer);
    const imageId = randomUUID();
    await mkdir(IMAGES_DIR, { recursive: true });
    await sharp(file.buffer).webp().toFile(this.imagePath(imageId));
    this.logger.log({ imageId, sizeBytes: file.size }, 'Image saved');
    return imageId;
  }

  async ensureExists(imageId: string): Promise<void> {
    try {
      await access(this.imagePath(imageId));
    } catch {
      throw new BadRequestException('Image not found');
    }
  }

  async delete(imageId: string): Promise<void> {
    try {
      await unlink(this.imagePath(imageId));
      this.logger.log({ imageId }, 'Image deleted');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async deleteIfReplaced(
    previousImageId: string | null,
    nextImageId: string | null,
  ): Promise<void> {
    if (previousImageId && previousImageId !== nextImageId) {
      await this.delete(previousImageId);
    }
  }

  private imagePath(imageId: string): string {
    return join(IMAGES_DIR, `${imageId}.${IMAGE_FORMAT}`);
  }

  private async ensureAllowedType(buffer: Buffer): Promise<void> {
    const { fileTypeFromBuffer } = await import('file-type');
    const fileType = await fileTypeFromBuffer(buffer);
    if (!fileType || !ALLOWED_MIME_TYPES.has(fileType.mime)) {
      throw new BadRequestException('Image must be a JPEG or PNG file');
    }
  }
}
