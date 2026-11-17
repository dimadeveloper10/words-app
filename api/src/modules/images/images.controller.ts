import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiImageUpload } from '../../common/decorators/api-image-upload.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { imageFilePipe } from '../../common/pipes/image-file.pipe';
import { UploadedImageDto } from './dto/uploaded-image.dto';
import { ImagesService } from './images.service';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @ApiImageUpload()
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile(imageFilePipe()) file: Express.Multer.File,
  ): Promise<UploadedImageDto> {
    const imageId = await this.imagesService.save(file);
    return { imageId };
  }
}
