import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { AuthModule } from 'src/auth/auth.module';


@Module({
  controllers: [SearchController],
  providers: [SearchService],
  imports: [
    AuthModule,
  ]
})
export class SearchModule {}
