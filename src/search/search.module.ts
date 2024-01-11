import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MantenimientoModule } from 'src/mantenimiento/mantenimiento.module';
import { InventarioModule } from 'src/inventario/inventario.module';


@Module({
  controllers: [SearchController],
  providers: [SearchService],
  imports: [
    AuthModule,
    MantenimientoModule,
    InventarioModule
  ]
})
export class SearchModule {}
