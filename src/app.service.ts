import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string; version: string } {
    return {
      message: 'Deepgram 前端语音转文字 API 服务运行中',
      version: '1.0.0',
    };
  }
}
