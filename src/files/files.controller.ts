import { Controller, Get, Post, Param, UploadedFile, UseInterceptors, BadRequestException, Res, UploadedFiles, ParseUUIDPipe, Body } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { diskStorage } from 'multer';
import { fileName, fileFilter } from './helpers';
import { ConfigService } from '@nestjs/config';
import { fileFilters } from './helpers/fileFilter';
import { fileNames } from './helpers/fileName';
import { User } from 'src/auth/entities/user.entity';
import { Auth, GetUser } from 'src/auth/decorators';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';


@ApiTags('Files')
@Controller('files')
//@Auth()
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) { }


  /**
   * IMPLEMENTAR PARA SUBIR IMAGENES POR COLLECIONES
   */

  @Get('uploads/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string
  ) {
    const path = this.filesService.getStaticProductImage(imageName);
    res.sendFile(path);
  }




  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './static/productos',
      filename: fileName
    })
  }))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,

  ) {

    if (!file) throw new BadRequestException(`El archivo no puede ser vacio`);

    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;


    return { secureUrl };
  }



 


  /**
   * Metodo general para subir imagenes o archivos por collecion o entidad
   * el cual se reutilizara segun necesidades
   * @param files 
   * @param id 
   * @param modelo 
   * @param user 
   * @returns 
   */
  @Post('uploads')
  @Auth()
  @UseInterceptors(FilesInterceptor('files', undefined, {
    fileFilter: fileFilters,
    storage: diskStorage({
      destination: './static/uploads',
      filename: fileNames
    })
  }))
  uploadModelImages(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body('id', ParseUUIDPipe) id: string,
    @Body('modelo') modelo: string,
    @GetUser() user: User
  ) {

    const modelos = ['usuario', 'producto', 'novedad', 'agente', 'visita', 'archivo','post'];

    if (!modelos.includes(modelo)) throw new BadRequestException('Models NotFound...');

    if (!files.length) throw new BadRequestException('File is required, only accepted images');
    let secureUrls: any[] = [];

    secureUrls = files.map(files => `${this.configService.get('HOST_API')}/files/uploads/${files.filename}`);
    const arrayImages = secureUrls;

    switch (modelo) {
      case 'usuario':
        this.authService.update(id, { images: arrayImages }, user);
        break;
      default:
        'No se encontro el modelo';
    }

    return {
      secureUrls
    }

  }


}
