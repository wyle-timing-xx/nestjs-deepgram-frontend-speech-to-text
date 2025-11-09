import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TranscriptionModule } from './modules/transcription/transcription.module';
import { FrontendFilterModule } from './modules/frontend-filter/frontend-filter.module';
import { DeepgramModule } from './modules/deepgram/deepgram.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // 文件上传模块
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => {
        const uploadDir = './uploads';
        
        // 确保上传目录存在
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        return {
          storage: diskStorage({
            destination: uploadDir,
            filename: (req, file, cb) => {
              const randomName = Array(32)
                .fill(null)
                .map(() => (Math.round(Math.random() * 16)).toString(16))
                .join('');
              return cb(null, `${randomName}${extname(file.originalname)}`);
            },
          }),
          fileFilter: (req, file, cb) => {
            // 仅接受音频文件
            if (!file.mimetype.match(/\/(mp3|wav|m4a|ogg|flac|aac)$/)) {
              return cb(new Error('只接受音频文件！'), false);
            }
            cb(null, true);
          },
          limits: {
            fileSize: 50 * 1024 * 1024, // 50MB 最大文件大小
          },
        };
      },
      inject: [ConfigService],
    }),
    
    // 业务模块
    DeepgramModule,
    TranscriptionModule,
    FrontendFilterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
