# TED Agent 可视化系统

基于React前端 + FastAPI后端的TED句子改写Agent可视化平台

## 项目简介

这是一个用于可视化TED句子改写Agent工作流的Web应用。通过直观的界面展示LangGraph工作流的执行过程，包括：
- 语义分块 (Semantic Chunking)
- 句子改写 (Sentence Variation)
- 验证 (Validation)
- 质量检查 (Quality Check)
- 修正改进 (Correction)

## 技术栈

### 前端
- **React 18** - UI框架
- **Vite** - 构建工具
- **TailwindCSS** - 样式框架
- **ReactFlow** - 工作流可视化
- **Axios** - HTTP客户端

### 后端
- **FastAPI** - Python Web框架
- **WebSocket** - 实时通信
- **Pydantic** - 数据验证
- **LangGraph** - Agent工作流引擎

## 项目结构与文件说明

### 目录树
```
TED-Agent/
├── frontend/                      # React前端项目
│   ├── src/
│   │   ├── components/           # React组件目录
│   │   │   ├── InputPanel.jsx    # 输入面板：文本输入、提交按钮
│   │   │   ├── WorkflowVisualizer.jsx  # 工作流可视化：ReactFlow图表
│   │   │   ├── ResultDisplay.jsx       # 结果展示：改写结果列表
│   │   │   └── StatusBar.jsx           # 状态栏：当前处理节点、进度
│   │   ├── services/             # API服务层
│   │   │   └── api.js            # 封装后端API调用、WebSocket连接
│   │   ├── hooks/                # 自定义React Hooks
│   │   │   └── useWebSocket.js   # WebSocket连接管理Hook
│   │   ├── utils/                # 工具函数
│   │   │   └── helpers.js        # 通用辅助函数
│   │   ├── App.jsx               # 主应用组件：组合所有子组件
│   │   ├── main.jsx              # React入口文件
│   │   └── index.css             # 全局样式、TailwindCSS导入
│   ├── public/                   # 静态资源
│   │   └── vite.svg              # 网站图标
│   ├── index.html                # HTML模板
│   ├── package.json              # npm依赖配置
│   ├── vite.config.js            # Vite构建配置、代理设置
│   ├── tailwind.config.js        # TailwindCSS配置
│   ├── postcss.config.js         # PostCSS配置
│   └── .env.example              # 环境变量示例
│
├── backend/                      # FastAPI后端项目
│   ├── app/
│   │   ├── main.py               # FastAPI主应用：路由、CORS、启动
│   │   ├── agent.py              # Agent封装：调用Groq API执行LangGraph工作流
│   │   ├── websocket.py          # WebSocket处理：实时推送处理进度
│   │   ├── models.py             # Pydantic数据模型：请求/响应格式
│   │   └── config.py             # 配置管理：API密钥、环境变量
│   ├── requirements.txt          # Python依赖包列表
│   └── .env.example              # 环境变量示例
│
├── docs/                         # 文档目录
│   ├── LEARNING.md               # React学习指南：从零开始的教程
│   ├── API.md                    # API文档：接口说明、请求格式
│   └── ARCHITECTURE.md           # 架构文档：系统设计说明
│
├── .gitignore                    # Git忽略文件配置
└── README.md                     # 项目说明文档
```

### 核心文件详解

#### 前端核心文件

**1. `frontend/src/App.jsx`**
- 作用：主应用组件，组织整个前端结构
- 功能：状态管理、子组件组合、数据流控制
- React学习重点：useState、组件组合、Props传递

**2. `frontend/src/components/InputPanel.jsx`**
- 作用：用户输入TED文本的面板
- 功能：文本框、提交按钮、输入验证
- React学习重点：表单处理、事件处理、受控组件

**3. `frontend/src/components/WorkflowVisualizer.jsx`**
- 作用：可视化LangGraph工作流执行过程
- 功能：使用ReactFlow展示节点图、高亮当前节点
- React学习重点：第三方库集成、动态更新

**4. `frontend/src/components/ResultDisplay.jsx`**
- 作用：展示句子改写结果
- 功能：原句、改写句列表、质量评分展示
- React学习重点：列表渲染、数据展示

**5. `frontend/src/components/StatusBar.jsx`**
- 作用：显示当前处理状态
- 功能：进度指示器、当前节点名称、错误提示
- React学习重点：条件渲染、动态样式

**6. `frontend/src/services/api.js`**
- 作用：封装所有后端API调用
- 功能：HTTP请求、WebSocket连接、错误处理
- React学习重点：异步操作、Promise、async/await

**7. `frontend/src/hooks/useWebSocket.js`**
- 作用：管理WebSocket连接的自定义Hook
- 功能：建立连接、接收消息、重连机制
- React学习重点：自定义Hooks、useEffect、状态同步

#### 后端核心文件

**1. `backend/app/main.py`**
- 作用：FastAPI应用入口
- 功能：
  - 定义API路由（POST /process）
  - 配置CORS跨域
  - 启动WebSocket端点
  - 健康检查接口

**2. `backend/app/agent.py`**
- 作用：TED Agent核心逻辑封装
- 功能：
  - 集成你的`news-agent-TED-9.0`代码
  - 调用Groq API执行LangGraph工作流
  - 包装SemanticChunkingAgent、句子改写、质量检查等节点
  - 返回结构化结果

**3. `backend/app/websocket.py`**
- 作用：WebSocket实时通信
- 功能：
  - 建立WebSocket连接
  - 推送每个节点的处理进度
  - 发送错误信息
  - 维护连接状态

**4. `backend/app/models.py`**
- 作用：Pydantic数据模型定义
- 功能：
  - ProcessRequest：输入文本请求模型
  - ProcessResponse：处理结果响应模型
  - ParaphraseItem：改写句子数据模型
  - 数据验证和序列化

**5. `backend/app/config.py`**
- 作用：配置管理
- 功能：
  - 读取环境变量（GROQ_API_KEY）
  - 模型配置（model_name: llama-3.1-8b-instant）
  - 系统参数配置

#### 配置文件

**1. `frontend/vite.config.js`**
- 作用：Vite构建工具配置
- 功能：开发服务器、API代理、构建优化

**2. `frontend/tailwind.config.js`**
- 作用：TailwindCSS样式配置
- 功能：主题定制、颜色配置、响应式断点

**3. `backend/requirements.txt`**
- 作用：Python依赖包列表
- 内容：fastapi、uvicorn、groq、pydantic、websockets等

**4. `.env.example`**
- 作用：环境变量模板
- 内容：GROQ_API_KEY、API_URL等配置项

## 快速开始

### 前置要求
- Node.js 18+
- Python 3.10+
- Groq API密钥（免费，需VPN访问）
  - 注册: https://console.groq.com
  - 获取API Key: https://console.groq.com/keys

### 推荐模型配置

#### 最佳选择：`llama-3.1-8b-instant`
适合大多数场景，性能与质量的最佳平衡：
- ✅ 速度极快（~500 tokens/s）
- ✅ 质量好，足够处理句子改写
- ✅ 免费额度下最稳定
- ✅ 完全满足TED句子改写需求
- 📊 免费额度：14,400 RPM / 14,400 RPD

#### 备选方案：`llama-3.3-70b-versatile`
需要更高质量时的选择：
- ✅ 更强大的理解能力
- ✅ 更好的句子改写质量
- ✅ 适合复杂的语义理解
- ⚠️ 速度稍慢，但免费额度仍然够用

#### 其他可用模型
- `openai/gpt-oss-20b` - 通用任务
- `openai/gpt-oss-120b` - 高级任务
- `qwen/qwen3-32b` - Qwen系列（预览版）

> **注意**：所有Groq模型在免费层都可使用，唯一限制是请求速率（RPM/TPM）

### 1. 安装前端依赖

```bash
cd frontend
npm install
```

### 2. 安装后端依赖

```bash
cd backend
pip install -r requirements.txt
```

### 3. 启动后端服务

```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

### 4. 启动前端开发服务器

```bash
cd frontend
npm run dev
```

### 5. 访问应用

打开浏览器访问: `http://localhost:5173`

## 功能特性

### 已实现
- [ ] 文本输入界面
- [ ] Agent工作流可视化
- [ ] 实时处理进度显示
- [ ] 改写结果展示
- [ ] 质量评分可视化

### 规划中
- [ ] 历史记录查询
- [ ] 批量处理
- [ ] 结果导出
- [ ] 性能统计

## 学习路径

如果你是React新手，建议按以下顺序学习：

1. **第1-3天**: React基础
   - 组件、Props、State
   - 看 `docs/LEARNING.md`

2. **第4-7天**: 实战练习
   - 修改 `frontend/src/components/InputPanel.jsx`
   - 添加新的UI元素

3. **第8-10天**: API集成
   - 学习 `frontend/src/services/api.js`
   - 连接后端接口

4. **第11-14天**: 高级功能
   - 学习ReactFlow可视化
   - WebSocket实时更新

## 开发指南

### 前端开发
```bash
cd frontend
npm run dev      # 开发模式
npm run build    # 生产构建
npm run preview  # 预览构建结果
```

### 后端开发

```bash
cd D:\转码\AI-all\shadow_writing_agent\backend
python -m uvicorn app.main:app --reload   
python tests/test_upload.py
```

### 代码规范
- 前端: ESLint + Prettier
- 后端: Black + isort

## API文档

启动后端后访问: `http://localhost:8000/docs`

## 贡献指南

欢迎提交Issue和Pull Request！

## 许可证

MIT License

## 作者

你的名字

---

快乐编码！ 🚀

#架构

┌─────────────────────────────────────┐
│  main.py (API层)                     │
│  - POST /search-ted                  │
│  - POST /process-batch               │
└────────────┬────────────────────────┘
             │ 调用
             ↓
┌─────────────────────────────────────┐
│  agent.py (接口层)                   │
│  - process_ted_text()               │
└────────────┬────────────────────────┘
             │ 使用
             ↓
┌─────────────────────────────────────┐
│  workflows.py (工作流层)             │
│  - create_search_workflow()         │
│  - create_shadow_writing_workflow() │
└────────────┬────────────────────────┘
             │ 编排
             ↓
┌─────────────────────────────────────┐
│  agents/ (节点层)                    │
│  - communication.py                  │
│  - semantic_chunking.py              │
│  - sentence_shadow_writing.py        │
│  - validation.py                     │
│  - quality.py                        │
│  - correction.py                     │
│  - finalize.py                       │
└─────────────────────────────────────┘

#目录结构
backend/
├── app/
│   ├── main.py                 # FastAPI入口，7个API端点
│   ├── config.py              # 配置管理（多API Key轮换）
│   ├── models.py              # Pydantic数据模型
│   ├── state.py               # LangGraph工作流状态
│   ├── workflows.py           # 3个LangGraph工作流定义
│   ├── batch_processor.py     # 批量异步处理核心逻辑
│   ├── task_manager.py        # 任务状态管理
│   ├── websocket_manager.py   # WebSocket连接管理
│   ├── utils.py               # 工具函数（API Key轮换等）
│   │
│   ├── agents/                # LangGraph Agent节点
│   │   ├── communication.py        # 搜索Agent
│   │   ├── semantic_chunking.py    # 语义分块Agent
│   │   ├── sentence_shadow_writing.py  # Shadow Writing生成Agent
│   │   ├── validation.py           # JSON格式验证Agent
│   │   ├── quality.py              # 质量评估Agent
│   │   ├── correction.py           # 自我修正Agent
│   │   └── finalize.py             # 结果汇总Agent
│   │
│   └── tools/                 # 工具模块
│       ├── ted_search_optimizer.py    # 搜索查询优化
│       ├── ted_tavily_search.py       # Tavily搜索集成
│       ├── ted_tavily_extract.py      # TED内容提取
│       ├── ted_transcript_tool.py     # 字幕提取
│       ├── ted_txt_parsers.py         # TED文件解析
│       └── ted_file_manager.py        # 文件缓存管理
│
├── tests/
│   └── test_batch_processing.py      # 自动化测试脚本
│
├── data/                      # 缓存目录
├── requirements.txt           # 依赖包
├── .env                       # 环境变量（API Keys）
└── .env.example              # 环境变量模板