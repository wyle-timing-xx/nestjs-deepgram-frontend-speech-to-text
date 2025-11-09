import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface FilteredTranscript {
  text: string;
  isFrontendRelated: boolean;
  relevantSegments: {
    text: string;
    keywords: string[];
    confidence: number;
  }[];
  originalTranscript: any;
}

@Injectable()
export class FrontendFilterService implements OnModuleInit {
  private readonly logger = new Logger(FrontendFilterService.name);
  private frontendKeywords: string[] = [];
  private readonly keywordRegexMap: Map<string, RegExp> = new Map();

  constructor(private configService: ConfigService) {
    // 从环境变量获取关键词列表
    const keywordsString = this.configService.get<string>('FRONTEND_KEYWORDS');
    if (keywordsString) {
      this.frontendKeywords = keywordsString.split(',').map(k => k.trim().toLowerCase());
      
      // 为每个关键词创建正则表达式
      this.frontendKeywords.forEach(keyword => {
        this.keywordRegexMap.set(keyword, new RegExp(`\\b${keyword}\\b`, 'i'));
      });
    } else {
      this.logger.warn('未配置前端关键词列表，将使用默认列表');
      this.setDefaultKeywords();
    }
  }

  onModuleInit() {
    this.logger.log(`前端过滤服务初始化，已加载 ${this.frontendKeywords.length} 个关键词`);
    this.logger.debug(`关键词列表: ${this.frontendKeywords.join(', ')}`);
  }

  /**
   * 设置默认关键词列表
   */
  private setDefaultKeywords() {
    this.frontendKeywords = [
      'javascript', 'typescript', 'html', 'css', 
      'react', 'vue', 'angular', 'nextjs', 'nuxtjs',
      'webpack', 'vite', 'tailwind', 'bootstrap', 
      'material-ui', 'styled-components', 'redux', 'vuex',
      'pinia', 'mobx', 'graphql', 'rest', 'api',
      'web', 'frontend', '前端', '组件', '框架'
    ];
    
    // 为每个关键词创建正则表达式
    this.frontendKeywords.forEach(keyword => {
      this.keywordRegexMap.set(keyword, new RegExp(`\\b${keyword}\\b`, 'i'));
    });
  }

  /**
   * 分析转录结果，过滤出前端相关内容
   * @param transcript Deepgram 转录结果
   * @returns 过滤后的结果
   */
  filterFrontendContent(transcript: any): FilteredTranscript {
    try {
      // 确保有转录结果
      if (!transcript || !transcript.results || !transcript.results.channels) {
        throw new Error('无效的转录结果格式');
      }

      // 获取转录文本
      const fullText = transcript.results.channels[0]?.alternatives[0]?.transcript || '';
      
      if (!fullText) {
        return {
          text: '',
          isFrontendRelated: false,
          relevantSegments: [],
          originalTranscript: transcript
        };
      }
      
      // 分析句子
      const sentences = this.breakIntoSentences(fullText);
      const relevantSegments = [];
      
      // 检查每个句子中的关键词
      sentences.forEach(sentence => {
        const foundKeywords = this.findKeywordsInText(sentence);
        
        if (foundKeywords.length > 0) {
          relevantSegments.push({
            text: sentence,
            keywords: foundKeywords,
            confidence: foundKeywords.length / this.frontendKeywords.length
          });
        }
      });
      
      // 确定是否与前端相关
      const isFrontendRelated = relevantSegments.length > 0;
      
      return {
        text: fullText,
        isFrontendRelated,
        relevantSegments,
        originalTranscript: transcript
      };
    } catch (error) {
      this.logger.error(`过滤前端内容失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 将文本拆分为句子
   * @param text 文本内容
   * @returns 句子数组
   */
  private breakIntoSentences(text: string): string[] {
    // 简单按句号、问号、感叹号拆分
    return text
      .split(/[.!?。！？]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }
  
  /**
   * 在文本中查找前端相关关键词
   * @param text 文本内容
   * @returns 找到的关键词列表
   */
  private findKeywordsInText(text: string): string[] {
    const foundKeywords = [];
    const lowerCaseText = text.toLowerCase();
    
    for (const [keyword, regex] of this.keywordRegexMap.entries()) {
      if (regex.test(lowerCaseText)) {
        foundKeywords.push(keyword);
      }
    }
    
    return foundKeywords;
  }
}
