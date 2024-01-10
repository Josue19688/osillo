import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UpdateInventarioDto } from './dto/update-inventario.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Inventario } from './entities/inventario.entity';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dto/pagination.tdo';

@ApiTags('Inventario')
@Controller('inventario')
@Auth()
export class InventarioController {
  constructor(
    private readonly inventarioService: InventarioService
    ) {}

  @Post()
  @ApiResponse({status:201,description:'Inventario was created', type:Inventario})
  @ApiResponse({status:400,description:'Bad Request'})
  @ApiResponse({status:403,description:'Forbidden Token related'})
  create(@Body() createInventarioDto: CreateInventarioDto,  @GetUser() user:User) {
    return this.inventarioService.create(createInventarioDto, user);
  }

  @Get()
  findAll(@Query() paginatioDto:PaginationDto) {
    return this.inventarioService.findAll(paginatioDto);
  }

  @Get(':termino')
  findOne(@Param('termino') termino: string) {
    return this.inventarioService.findOnePlane(termino);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,  
    @Body() updateInventarioDto: UpdateInventarioDto,
    @GetUser() user:User
    ) {
    return this.inventarioService.update(id, updateInventarioDto, user);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventarioService.remove(id);
  }
}
