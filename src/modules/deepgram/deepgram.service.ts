import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@deepgram/sdk';

@Injectable()
export class DeepgramService implements OnModuleInit {
  private readonly logger = new Logger(DeepgramService.name);
  private readonly deepgramClient: ReturnType<typeof createClient>;
  private readonly apiKey: string;
  private readonly model: string;
  private readonly language: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('DEEPGRAM_API_KEY');
    this.model = this.configService.get<string>('MODEL') || 'nova-3';
    this.language = this.configService.get<string>('LANGUAGE') || 'zh-CN';
    
    if (!this.apiKey) {
      this.logger.error('Deepgram API密钥未提供，请检查环境变量！');
    }
    
    // 初始化Deepgram客户端
    this.deepgramClient = createClient(this.apiKey);
  }

  onModuleInit() {
    this.logger.log(`Deepgram服务初始化 - 使用模型: ${this.model}, 语言: ${this.language}`);
  }

  /**
   * 从本地文件转录
   * @param filePath 文件路径
   * @returns 转录结果
   */
  async transcribeFile(filePath: string) {
    try {
      this.logger.log(`开始从文件转录: ${filePath}`);
      
      const { result, error } = await this.deepgramClient.listen.prerecorded.transcribeFile(
        { buffer: Buffer.from(filePath) },
        { 
          model: this.model,
          language: this.language,
          smart_format: true,
          diarize: true,
          punctuate: true,
        }
      );
      
      if (error) {
        throw new Error(`转录错误: ${error.message}`);
      }
      
      return result;
    } catch (error) {
      this.logger.error(`文件转录失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 从URL转录
   * @param url 音频URL
   * @returns 转录结果
   */
  async transcribeUrl(url: string) {
    try {
      this.logger.log(`开始从URL转录: ${url}`);
      
      const { result, error } = await this.deepgramClient.listen.prerecorded.transcribeUrl(
        { url },
        { 
          model: this.model,
          language: this.language,
          smart_format: true,
          diarize: true,
          punctuate: true,
        }
      );
      
      if (error) {
        throw new Error(`转录错误: ${error.message}`);
      }
      
      return result;
    } catch (error) {
      this.logger.error(`URL转录失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 创建实时转录连接
   */
  createLiveTranscription() {
    try {
      this.logger.log('创建实时转录连接');
      
      // 创建连接
      const deepgramLive = this.deepgramClient.listen.live({ 
        model: this.model,
        language: this.language,
        smart_format: true,
        interim_results: true,
        punctuate: true,
      });
      
      return deepgramLive;
    } catch (error) {
      this.logger.error(`创建实时转录连接失败: ${error.message}`);
      throw error;
    }
  }
}