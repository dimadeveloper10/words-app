import {
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export const imageFilePipe = (): ParseFilePipe =>
  new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: MAX_IMAGE_SIZE }),
      new FileTypeValidator({ fileType: /^image\/(jpeg|png)$/ }),
    ],
  });
