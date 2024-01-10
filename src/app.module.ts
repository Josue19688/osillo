import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { SearchModule } from './search/search.module';
import { EmailModule } from './email/email.module';
import { InventarioModule } from './inventario/inventario.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host:'****',
      port:7431,
      database:'***',
      username:'****',
      password:'*******',
      // host: process.env.HOST,
      // port: +process.env.DB_PORT,
      // database: process.env.NAME,
      // username: process.env.DB_USERNAME,
      // password: process.env.DB_PASSWORD,
      autoLoadEntities:true,
      synchronize:true, ///solo para desarrollo en produccion cambiar a false
    }),
     
    
    CommonModule,
    FilesModule,
    AuthModule,
    SearchModule,
    EmailModule,
    InventarioModule, 
  ],

})
export class AppModule {}
