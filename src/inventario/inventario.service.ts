import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UpdateInventarioDto } from './dto/update-inventario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventario } from './entities/inventario.entity';
import { DataSource, Repository } from 'typeorm';
import { InventarioImage } from './entities/inventario-image.entity';
import { User } from 'src/auth/entities/user.entity';
import { validate as isUUID } from 'uuid';
import { PaginationDto } from 'src/common/dto/pagination.tdo';

@Injectable()
export class InventarioService {

  private readonly logger = new Logger('NovedadService')

  constructor(
    @InjectRepository(Inventario)
    private readonly inventarioRepository:Repository<Inventario>,
    @InjectRepository(InventarioImage)
    private readonly inventarioImagenRepository:Repository<InventarioImage>,
    private readonly dataSource:DataSource
  ){}
  
  async create(createInventarioDto: CreateInventarioDto, user:User) {
    try {
      const {images=[], ...inventarioDetails} = createInventarioDto;
      const inventario = this.inventarioRepository.create({
        ...inventarioDetails,
        images:images.map(image=>this.inventarioImagenRepository.create({url:image})),
        user
      });

      await this.inventarioRepository.save(inventario);
      const inventarios = {...inventario, images};
      return {ok:true, inventarios};
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll(paginationDto:PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const inventario = await this.inventarioRepository.find({
      take:limit,
      skip:offset,
      relations:{
        images:true
      }
    })

    const inventarios = inventario.map(item=>({
      ...item,
      images:item.images.map(img=>img.url)
    }))

    return {ok:true, inventarios};
  }

  async findOne(termino:string) {
    let inventario:Inventario;

    if(isUUID(termino)){
      inventario = await this.inventarioRepository.findOneBy({id:termino});
    }else{
      const  queryBuilder = this.inventarioRepository.createQueryBuilder('nov');
      inventario = await queryBuilder
      .where('serviceTag=:serviceTag or numeroInventario=:numeroInventario or marca=:marca or tipo=:tipo or asignado=:asignado or division=:division or departamento=:departamento or descripcion=:descripcion or ubicaicon=:ubicacion',{
        serviceTag: termino.toUpperCase(),
        numeroInventario: termino.toLowerCase(),
        marca:termino.toLowerCase(),
        tipo:termino.toLowerCase(),
        asignado: termino.toUpperCase(),
        division: termino.toLowerCase(),
        departamento: termino.toUpperCase(),
        descripcion: termino.toLowerCase(),
        ubicaion: termino.toLowerCase()
      })
      .leftJoinAndSelect('nov.images', 'novImages')
      .getOne();
    }

    if(!inventario) throw new NotFoundException(`El registro con ${termino} no existe.`);

    return inventario;
  }

  async findOnePlane(termino:string){
    const {images = [], ...rest}= await this.findOne(termino);
    const agente = {
      ...rest,
      images:images.map(img=>img.url)
    };

    return {ok:true, agente}

  }

  async update(id: string, updateInventarioDto: UpdateInventarioDto, user:User) {
    const { images, ...toUpdate } = updateInventarioDto;
      const inventario = await this.inventarioRepository.preload({
        id,
        ...toUpdate
      });
  
      if (!inventario) throw new NotFoundException(`El registro con ${id} no existe`);
  
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        if (images) {
          await queryRunner.manager.delete(InventarioImage, { inventario: { id } });
          inventario.images = images.map(image => 
            this.inventarioImagenRepository.create({ url: image,user })
          )
        }
  
  
        inventario.user=user;
        await queryRunner.manager.save(inventario);
        await queryRunner.commitTransaction();
        await queryRunner.release();
  
  
        return this.findOnePlane(id);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
  
        this.handleExceptions(error);
      }
  }

  async remove(id: string) {
    const inventario = await this.findOne(id);
    await this.inventarioRepository.remove(inventario);
    return {ok:true,msg:'Equipo Eliminado'};
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`El registro ya existe!!`);
    }
    if (error.code === '23505') {
      throw new BadRequestException(`El registro ya existe!!`);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(`Error al crear el registro en el servidor`);
  }
}
