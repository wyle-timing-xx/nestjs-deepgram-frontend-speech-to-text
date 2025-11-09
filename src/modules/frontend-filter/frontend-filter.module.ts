import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FrontendFilterService } from './frontend-filter.service';

@Module({
  imports: [ConfigModule],
  providers: [FrontendFilterService],
  exports: [FrontendFilterService],
})
export class FrontendFilterModule {}
