# NestJS Deepgram 前端相关语音转文字服务

这是一个使用NestJS和Deepgram API的服务，用于将语音转换为文本，专注于前端开发相关内容。该服务可以接收音频文件或流，并返回转录文本，同时识别和过滤出与前端开发相关的内容。

## 功能特点

- 接收音频文件或流进行语音转文字
- 专注识别与前端开发相关的内容（React、Vue、Angular等）
- 支持实时转录和预先录制的音频处理
- 提供REST API接口方便前端应用集成
- 支持WebSocket连接进行实时音频处理

## 技术栈

- NestJS - 后端框架
- Deepgram API - 语音识别服务
- TypeScript - 编程语言
- Docker - 容器化部署
- Jest - 测试框架

## 快速开始

### 前提条件

- Node.js (>= 16.x)
- npm 或 yarn
- Deepgram API 密钥

### 安装

1. 克隆仓库
```bash
git clone https://github.com/wyle-timing-xx/nestjs-deepgram-frontend-speech-to-text.git
cd nestjs-deepgram-frontend-speech-to-text
```

2. 安装依赖
```bash
npm install
# 或
yarn install
```

3. 创建环境变量文件
```bash
cp .env.example .env
```

4. 编辑 `.env` 文件，添加你的Deepgram API密钥
```
DEEPGRAM_API_KEY=your_api_key_here
```

5. 运行开发服务器
```bash
npm run start:dev
# 或
yarn start:dev
```

服务将在 `http://localhost:3000` 上运行。

## API 使用说明

### 上传音频文件进行转录

```bash
curl -X POST http://localhost:3000/api/transcribe/file \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/audio.mp3"
```

### 从URL转录

```bash
curl -X POST http://localhost:3000/api/transcribe/url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/audio.mp3"}'
```

### 建立WebSocket连接进行实时转录

```javascript
const socket = new WebSocket('ws://localhost:3000/api/transcribe/live');

// 发送音频数据
socket.onopen = () => {
  // 发送音频数据块
  socket.send(audioChunk);
};

// 接收转录结果
socket.onmessage = (event) => {
  const transcript = JSON.parse(event.data);
  console.log(transcript);
};
```

## 配置选项

服务可以通过以下环境变量进行配置：

- `PORT` - 服务器端口（默认：3000）
- `DEEPGRAM_API_KEY` - Deepgram API密钥（必需）
- `MODEL` - Deepgram模型（默认：nova-3）
- `LANGUAGE` - 语言代码（默认：zh-CN）

## 许可证

MIT

## 贡献指南

欢迎贡献！请查看[贡献指南](CONTRIBUTING.md)了解更多信息。
