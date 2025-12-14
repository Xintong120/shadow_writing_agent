## 系统配置和架构基础

#### `backend/app/config.py` - 系统配置管理

**静态字段定义:**

1. API配置

   > `groq_api_key`、`groq_api_keys`(轮换list)、`tavily_api_key`、`openai_api_key`、`deepseek_api_key`

2. LLM模型配置

   > `model_name`、`system_prompt`、`temperature`、`max_tokens`、`top_p`、`frequency_penalty`

3. FastAPI配置

   > - 定义服务器监听的网络地址
   > - 定义服务器监听的端口号
   > - (开发阶段)开启调试模式，提供详细的错误信息和开发工具

4. CORS配置

   > - 服务器通过HTTP头信息告知浏览器允许跨域访问
   > - 在安全的前提下实现前后端分离架构
   > - 前端在 `http://localhost:5173` 运行
   > - 后端 API 在 `http://localhost:8000` 运行
   > - 通过 CORS 配置允许前端访问后端 API

5. LLM API轮换配置

6. TED文件管理（缓存、删除）

7. 外观设置

8. 学习偏好

**初始化后执行:**

1. `model_post_init` —— 初始化后自动读取多个 API Key

   > - **Pydantic Settings 对象创建时**自动触发
   > - 只执行一次（对象初始化时）
   > - 不需要手动调用

2. `get_available_api_providers` —— 获取可用的API提供商列表

   > **触发时机：** [`backend/app/routers/settings.py:211`](vscode-webview://1kv83b3lkeshf6cl6bkncha5ak7ssn4qvu4h6pi47jfvc26j0eua/backend/app/routers/settings.py) `providers = settings.get_available_api_providers()`
   >
   > **API 端点：** `GET /api/settings/api-providers`
   >
   > **触发条件：**
   >
   > - 前端请求获取可用API提供商列表时
   > - 设置页面加载时
   > - 管理员查看API状态时

3. `rotate_api_key` —— 轮换到下一个可用的API Key

   > **触发时机：** [`backend/app/routers/settings.py:197`](vscode-webview://1kv83b3lkeshf6cl6bkncha5ak7ssn4qvu4h6pi47jfvc26j0eua/backend/app/routers/settings.py) `next_key = settings.rotate_api_key()`
   >
   > **API 端点：** `POST /api/settings/rotate-api-key`
   >
   > **触发条件：**
   >
   > - 前端发送轮换API Key请求时
   > - 管理员手动轮换时
   > - API调用失败后需要切换时

4. `get_current_api_key` —— 获取当前使用的API Key

   > 待完善触发条件

**验证配置**

> 1. 必需的API Keys
> 2. 至少需要一个主要的LLM API提供商
> 3. 如果启用了API轮换，需要至少两个GROQ API Keys
> 4. 当前提供商必须有对应的API Key
> 5. 验证LLM模型配置合理性

**返回前端需要的设置字典**

**更新设置（从前端接收）**

----------------------------------------------------------------------------------------------------

#### `backend/app/enums.py` - 系统枚举类型定义

> 目的：消除Magic String

`TaskStatus` **任务状态枚举**

`MessageType` **WebSocket消息类型枚举**

`ProcessingStep` **处理步骤枚举**

`MemoryNamespace` **Memory命名空间类型枚举**

`SystemConfig` **系统配置常量**

`ModelName` **LLM模型名称枚举**

`ErrorType` **错误类型枚举**

**帮助函数**: `get_enum_values`（用于调试和验证）、 `is_valid_enum_value`（用于输入验证）

## 核心数据模型

`backend/app/models.py` 

> ###### 核心数据结构
> - `TedTxt` (@dataclass) - TED文本文件数据结构
> - `Ted_Shadows(BaseModel)` - TED句子改写数据模型
> - `Ted_Shadows_Result(BaseModel)` - TED句子改写结果数据模型
>
> ###### API模型
> - `SearchRequest(BaseModel)` - 搜索TED演讲请求
> - `TEDCandidate(BaseModel)` - TED演讲候选信息
> - `SearchResponse(BaseModel)` - 搜索响应结果
> - `BatchProcessRequest(BaseModel)` - 批量处理请求
> - `BatchProcessResponse(BaseModel)` - 批量处理响应
> - `TaskStatusResponse(BaseModel)` - 任务状态响应
>
> ###### 数据流向
>
> 1. **搜索阶段**: `SearchRequest` → `SearchResponse` (包含 `TEDCandidate` 列表)
> 2. **处理阶段**: `BatchProcessRequest` → `TaskStatusResponse` → 最终结果
> 3. **核心数据**: `TedTxt` → `Ted_Shadows` → `Ted_Shadows_Result`

`backend/app/state.py` - 工作流状态定义

> ###### __LangGraph 工作流__
>
> - 状态驱动的工作流系统
> - 节点函数接收状态，返回更新后的状态
> - 状态在节点间流动，实现复杂业务逻辑
>
> ###### __TypedDict 状态定义__
>
> - 类型安全的字典结构
> - 编译时类型检查
> - IDE智能提示支持
>
> ###### 完整工作流过程
>
> - __初始状态__: 用户输入topic
> - __通信节点__: 搜索TED → 候选列表 → 用户选择
> - __文本处理__: 提取transcript → 语义分块
> - __并行处理__: 每个chunk生成shadow writing
> - __结果合并__: operator.add自动汇总所有结果

__主状态类详解__:

用户输入字段

```python
topic: Optional[str]                   # 用户输入的搜索主题
user_id: Optional[str]                 # 用户ID（用于memory namespace）
```

通信阶段字段

```python
ted_candidates: Optional[List[dict]]   # 搜索到的TED演讲候选列表
selected_ted_url: Optional[str]        # 用户选择的TED URL
awaiting_user_selection: Optional[bool] # 是否等待用户选择
search_context: Optional[dict]         # 搜索上下文
file_path: Optional[str]               # 保存的TED文件路径
```

文本处理字段

```python
text: str                              # 原始TED文本
target_topic: Optional[str]            # 目标话题
ted_title: Optional[str]               # TED标题
ted_speaker: Optional[str]             # TED演讲者
ted_url: Optional[str]                 # TED URL
```

分块处理字段

```python
semantic_chunks: List[str]             # 语义块列表
final_shadow_chunks: Annotated[List[Ted_Shadows], operator.add]  # 自动合并结果
```

元数据字段

```python
current_node: str                      # 当前节点名称
processing_logs: Optional[List[str]]   # 处理日志
errors: Optional[List[str]]            # 错误列表
error_message: Optional[str]           # 错误信息
```

__子状态类详解__:

ChunkProcessState 设计理念:

- 并行处理单个语义块的状态
- 避免与主状态的字段冲突
- 支持并发安全

__关键设计考虑__

1. 字段所有权分离

- __主状&#x6001;__&#x62E5;有全局字段：`ted_url`, `ted_title`, `user_id` 等
- __子状&#x6001;__&#x53EA;拥有局部字段：`chunk_text`, `chunk_id`, 结果等

2. 并发写入隔离

```javascript
线程1处理Chunk 1:
├── chunk_text: "第一段文本"
├── final_shadow_chunks: [result1]
└── 不碰 全局字段

线程2处理Chunk 2:  
├── chunk_text: "第二段文本"
├── final_shadow_chunks: [result2]
└── 不碰 全局字段

线程3处理Chunk 3:
├── chunk_text: "第三段文本"  
├── final_shadow_chunks: [result3]
└── 不碰 全局字段
```

**Annotated** 特殊用法

自动结果合并

```python
final_shadow_chunks: Annotated[List[Ted_Shadows], operator.add]
```

- `operator.add` 实现自动累加

> operator.add 自动执行：
>
> `main_state.final_shadow_chunks + chunk1.final_shadow_chunks +` 
> `chunk2.final_shadow_chunks + chunk3.final_shadow_chunks`
>
> 结果：[result1, result2, result3]

- 并行任务结果自动合并
- 无需手动处理并发结果

--------------------------------------------------------------------------------------------------------------------------------

## 任务管理系统

`backend/app/task_manager.py` - 任务管理器

> 定义`Task`类，提供`to_dict()` 方法封装数据封装
>
> 定义`TaskManager`类：
>
> - `__init__`  方法初始化了一个空的任务存储字典
> - `create_task` 创建新任务
> - `get_task`获取新任务
> - `update_status` 更新任务状态
> - `update_progress` 更新任务进度
> - `add_result` 添加处理结果
> - `add_error` 添加错误信息
> - `complete_task` 完成任务
> - `fail_task` 任务失败
> - `cleanup_old_tasks` 清理旧任务（可选）

`backend/app/batch_processor.py` - 批量处理器

> #### 1. **概述和核心功能**
>
> **概述**
>
> 批量处理器的核心作用是异步处理多个TED URLs，将每个演讲转换为Shadow Writing内容。
>
> **核心功能**
>
> - **异步批量处理**: 顺序处理多个TED URLs
> - **实时进度推送**: 通过WebSocket实时更新处理状态
> - **错误处理**: 完善的错误捕获和报告机制
> - **结果收集**: 汇总所有处理结果
>
> #### 2. **处理流程详解**
>
> ```mermaid
> graph TD
>     A[开始批量处理] --> B[更新任务状态为PROCESSING]
>     B --> C[发送开始消息]
>     C --> D[创建并行SW工作流]
>     D --> E[遍历每个URL]
>     
>     E --> F{处理单个URL}
>     F --> G[更新进度]
>     G --> H[提取Transcript]
>     H --> I{transcript存在?}
>     I --> J[运行Shadow Writing工作流] 
>     I --> K[抛出异常]
>     
>     J --> L[处理结果]
>     L --> M[保存结果]
>     M --> N[推送完成消息]
>     N --> O[继续下一个URL]
>     
>     K --> P[记录错误]
>     P --> Q[推送错误消息]
>     Q --> O
>     
>     O --> R{还有URL?}
>     R --> E
>     R --> S[全部完成]
>     S --> T[更新任务状态为COMPLETED]
>     T --> U[发送最终完成消息]
> ```
>
> **关键步骤说明**
>
> **步骤1: Transcript提取**
>
> ```python
> # 核心逻辑
> transcript_data = extract_ted_transcript(url)
> 
> if not transcript_data or not transcript_data.transcript:
>     raise Exception("Failed to extract transcript")
> ```
> **处理策略：**
> - 调用 `ted_transcript_tool.extract_ted_transcript()`
> - 验证transcript是否存在
> - 失败时抛出异常，中断处理
>
> ##### **步骤2: Shadow Writing工作流**
> ```python
> # 并行工作流初始化
> workflow = create_parallel_shadow_writing_workflow()
> 
> # 准备初始状态
> initial_state = {
>     "text": transcript_data.transcript,
>     "ted_title": transcript_data.title,
>     "ted_speaker": transcript_data.speaker,
>     "final_shadow_chunks": [],  # operator.add自动汇总
> }
> 
> # 执行工作流
> result = workflow.invoke(initial_state)
> ```
> **并行处理特性：**
> - 使用 `operator.add` 自动合并结果
> - 支持并发chunk处理
> - 结果自动累积到 `final_shadow_chunks`
>
> ##### **步骤3: 结果处理和转换**
> ```python
> # 处理不同类型的返回值
> processed_results = []
> for item in final_chunks:
>     if isinstance(item, dict):
>         processed_results.append(item)
>     elif hasattr(item, 'dict'):
>         processed_results.append(item.dict())
>     elif hasattr(item, 'model_dump'):
>         processed_results.append(item.model_dump())
>     else:
>         processed_results.append(str(item))
> ```
> **兼容性处理：**
> - 支持字典、Pydantic对象等多种返回值格式
> - 统一转换为字典格式
> - 保证API响应的一致性
>
> #### 3.WebSocket实时通信
>
> **消息类型和时机**
>
> | 消息类型        | 发送时机       | 包含数据            |
> | --------------- | -------------- | ------------------- |
> | `STARTED`       | 处理开始时     | 总数、开始消息      |
> | `PROGRESS`      | 每个URL开始时  | 当前进度、URL、状态 |
> | `STEP`          | 关键步骤开始时 | 步骤类型、URL、描述 |
> | `URL_COMPLETED` | 单个URL完成时  | 结果数量、完成消息  |
> | `ERROR`         | 处理出错时     | 错误信息、URL       |
> | `COMPLETED`     | 全部完成时     | 成功/失败统计       |
>
> #### **消息格式示例**
> ```json
> {
>   "task_id": "abc-123",
>   "type": "progress", 
>   "data": {
>     "current": 2,
>     "total": 5,
>     "url": "https://ted.com/talks/example",
>     "status": "Processing 2/5"
>   }
> }
> ```
>
> #### 4. **错误处理机制**
>
> **错误分类**
>
> - **Transcript提取失败**: TED网站无字幕或网络错误
> - **工作流执行失败**: Shadow Writing处理异常
> - **结果处理失败**: 数据格式转换错误
>
> **错误恢复策略**
>
> ```python
> try:
>     # 处理单个URL
>     transcript_data = extract_ted_transcript(url)
>     if not transcript_data.transcript:
>         raise Exception("No transcript available")
>     
>     # 执行Shadow Writing
>     result = workflow.invoke(initial_state)
>     
> except Exception as e:
>     # 记录错误但继续处理其他URLs
>     task_manager.add_error(task_id, f"Error processing {url}: {str(e)}")
>     await ws_manager.broadcast_progress(task_id, MessageType.ERROR, {...})
> ```
>
> #### 5. **性能和并发考虑**
>
> **异步处理设计**
>
> ```python
> async def process_urls_batch(task_id: str, urls: List[str]):
>     # 异步函数，支持并发WebSocket通信
>     await ws_manager.broadcast_progress(...)  # 异步推送
> ```
>
> **资源管理**
>
> - **顺序处理**: 避免同时处理过多URLs
> - **内存控制**: 及时释放中间结果
> - **错误隔离**: 单个URL失败不影响整体处理
>
> #### 6. **集成关系图**
>
> **与其他组件的关系**
>
> ```
> API路由 (core.py)
>     ↓
> 批量处理请求 (BatchProcessRequest)
>     ↓
> 任务管理器 (TaskManager)
>     ↓
> 批量处理器 (process_urls_batch) ← 当前文件
>     ↓
> ├── TED工具 (extract_ted_transcript)
> ├── 工作流 (create_parallel_shadow_writing_workflow)
> ├── WebSocket管理器 (ws_manager)
> └── 任务管理器 (task_manager)
> ```
>
> #### 7. **配置和限制**
>
> **处理限制**
>
> - 最大URL数量: 10个
> - 超时控制: 每个URL独立超时
> - 重试机制: transcript提取失败重试
>
> **监控指标**
>
> - 处理进度: `current/total`
> - 成功率: `successful/failed`
> - 平均处理时间: 每个URL的耗时
>

## 工作流设计

`backend/app/workflows.py` - LangGraph 工作流定义

- **串行工作流**（已弃用）：逐个处理语义块

- **并行工作流**（当前使用）：使用 `Send API` 并行处理所有语义块

  > 

##  API 和通信机制

`backend/app/main.py` - FastAPI 应用入口

> 

`backend/app/websocket_manager.py` - WebSocket 管理器

> 

## 业务逻辑

`backend/app/agents/` 目录 - 各个业务代理

`backend/app/tools/` 目录 - 工具函数

`backend/app/memory/` 目录 - 记忆系统

`backend/app/routers/` 目录 - API 路由实现
