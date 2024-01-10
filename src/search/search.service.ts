import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { GraficaModeloDto } from 'src/common/dto/graficaModelo.tdo';
import { SearchDto } from 'src/common/dto/search.dto';
import { SearchFindAllDto } from 'src/common/dto/searchFindAll.dto';
import { SearchTerminoDto } from 'src/common/dto/searchTermino.dto';



import { ArrayContains, Between, Like, Repository } from 'typeorm';

@Injectable()
export class SearchService {


  private readonly logger = new Logger('ProductsService')
  constructor(
    
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }




  /**
   * BUSQUEDA DE DATOS O FILTRADO POR FECHAS Y MODELOS
   * @param searchDto 
   * @returns 
   */

  async findAllModelsDate(searchDto: SearchDto) {
    const { inicio, fin, modelo } = searchDto;

    const modelos = ['usuario', 'producto', 'novedad', 'agente', 'visita', 'archivo'];

    if (!modelos.includes(modelo)) throw new BadRequestException('Models NotFound...');

    let data: any[] = [];

    switch (modelo) {
      case 'usuario':
        data = await this.userRepository.find({
          where: {
            createdAt: Between(
              new Date(inicio),
              new Date(fin)
            ),
          },
          relations: {
            images: true
          }
        })
        break;
      default:
        return { ok: false, msg: 'Collecion no encontrada' };

    }
    
    return {resultado:data};

  }

  async findAllModelsTermimo(searchTerminoDto: SearchTerminoDto) {

    const { modelo, termino, inicio, fin } = searchTerminoDto;

    const modelos = ['usuario', 'producto', 'novedad', 'agente', 'visita', 'archivo'];

    if (!modelos.includes(modelo)) throw new BadRequestException('Models NotFound...');

    let data: any[] = [];

    switch (modelo) {
      case 'usuario':
        data = await this.userRepository.find({
          where: [
            {
              email: Like(`%${termino}%`)
            },
            {
              fullName: Like(`%${termino}%`)
            },
          ],
          relations: {
            images: true
          }
        })
        break;
      default:
        return { ok: false, msg: 'Collecion no encontrada' };

    }

    return {resultado:data};

  }


  /**
   * Buscar por Tipo de modelo y termino 
   */

  async findAllModelosTerminos(searchFindAllDto: SearchFindAllDto) {

    const { modelo, termino} = searchFindAllDto;

    const modelos = ['usuario', 'producto', 'novedad', 'agente', 'visita', 'archivo'];

    if (!modelos.includes(modelo)) throw new BadRequestException('Models NotFound...');

    let data: any[] = [];

    switch (modelo) {
      case 'usuario':
        data = await this.userRepository.find({
          where: [
            {
              email: Like(`%${termino}%`)
            },
            {
              fullName: Like(`%${termino}%`)
            },
          ],
          relations: {
            images: true
          }
        })
        break;
      default:
        return { ok: false, msg: 'Collecion no encontrada' };

    }

    return {resultado:data};

  }

 
  /**
   * Reporteria
   */

  async countModels(){
    let data:any[]=[];

    const usuario =await this.userRepository.count();
    
    
    data.push(usuario);
    return data;
   
  }

  

  async graficas(graficaModeloDto:GraficaModeloDto){
    const {modelo}=graficaModeloDto;
    const modelos = ['usuario', 'producto', 'novedad', 'agente', 'visita', 'archivo'];

    if (!modelos.includes(modelo)) throw new BadRequestException('Models NotFound...');

    let data:any[]=[];
   
    switch (modelo) {
      case 'usuario':
        data = await this.userRepository
        .createQueryBuilder('user')
        .select("user.isActive")
        .addSelect("COUNT(*)")
        .groupBy("user.isActive")
        .execute();
        break;
      default:
        return { ok: false, msg: 'Collecion no encontrada' };

    }

    return {resultado:data};

  }


  // async SearchVisitaByDate(){


  //   let date = new Date()
  //   let day = `${(date.getDate())}`.padStart(2,'0');
  //   let month = `${(date.getMonth()+1)}`.padStart(2,'0');
  //   let year = date.getFullYear();
    
  //   const hoy =`${year}-${month}-${day}`;
    
  //   const data = await this.visitaRepository.find({
  //     where:{
  //       autorizacion_admin:true,
  //       autorizacion_seguridad:true,
  //       fechas:ArrayContains([hoy])
  //     },
  //     relations:{
  //       images:true
  //     }
  //   })
    
        

  //   const visitas = data.map(item=>({
  //     ...item,
  //     images:item.images.map(img=>img.url)
  //   }))

  //   return {ok:true, visitas};
  // }


}
