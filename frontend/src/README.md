## **项目概述 (Overview)**

整体架构、入口文件和技术栈

### `main.jsx`

> 前端入口文件
>
> 负责创建 React 应用的根节点，并渲染 `App.tsx` 组件到 DOM 中。

### `App.tsx`

> 前端应用的根组件，主要作用如下：
>
> 1. __路由管理__：使用 `BrowserRouter` 和 `Routes` 配置应用的页面路由，包括主页（`SearchPage`）、批量处理页面（`BatchProcessPage`）、结果页面（`ResultsPage`）、历史页面（`HistoryPage`）和设置页面（`SettingsPage`）。
>
> 2. __全局状态管理__：通过 `TaskProvider` 提供任务相关的全局状态上下文。
>
> 3. __布局结构__：使用 `ShadowWritingAppShell` 组件作为所有页面的布局容器。
>
> 4. __开发环境支持__：在开发模式下动态导入并添加多个测试路由，用于组件开发和测试。

### `vite-env.d.ts`

> `Vite` 项目的 TypeScript 类型声明文件
>
> 引用 `Vite` 的客户端类型定义

### `index.css`

> 前端项目的全局样式文件，主要包含：
>
> 1. **字体导入**：从 Google Fonts 导入 Inter 字体族，确保一致的排版
>
> 2. **UI 库样式**：导入 `Mantine UI` 组件库的基础样式
>
> 3. **CSS 自定义属性**：定义颜色系统变量，包括浅色/深色主题的颜色值（primary、secondary、accent 等）
>
> 4. **Tailwind CSS 集成**：导入 `Tailwind` 的基础、组件和工具类
>
> 5. **组件样式覆盖**：针对 `Mantine` 的 `Textarea` 组件强制移除边框和阴影，确保样式一致性
>
> 6. **全局样式**：设置根元素和 body 的基础样式，包括背景色、前景色和字体
>
> - `Mantine` 提供核心组件和布局系统
>
> - `Tailwind` 补充细粒度样式调整
>
> - 通过 CSS 变量实现两种系统的主题协调

## **组件系统 (Component System)**

- 详细描述原子组件、分子组件、有机组件和模板组件的设计和实现
- 包含文件夹：`components/`（包括 `atoms/`、`molecules/`、`organisms/`、`templates/`、`examples/`）

## **页面组件 (Pages)**

- 说明各个页面的结构、功能和路由
- 包含文件夹：`pages/`

## **服务层 (Services)**

- 描述API调用、数据存储、WebSocket通信等服务逻辑
- 包含文件夹：`services/`（包括 `__mocks__/`）

## **工具函数和Hooks (Utilities and Hooks)**

- 介绍自定义工具函数和React Hooks的使用
- 包含文件夹：`utils/`、`hooks/`

## **样式和主题 (Styling and Theming)**

- 说明样式系统、颜色配置和主题管理
- 包含文件夹：`styles/`、`theme/`

## **类型定义 (Type Definitions)**

- 描述TypeScript类型和接口定义
- 包含文件夹：`types/`

## **配置管理 (Configuration)**

### `config/`

> - __API 端点配置__：`API_BASE` 定义后端 API 基础 URL
>
> - __调试开关__：`IS_DEBUG` 控制调试模式
>
> - __环境变量集成__：读取 `Vite` 的环境变量，支持运行时配置

## **上下文和状态管理 (Contexts)**

### `frontend/src/contexts/TaskContext.tsx`

> 全局任务状态管理，主要功能包括：
>
> **核心接口定义：**
>
> - `SearchTask`：搜索任务接口，包含查询、状态、结果等字段
> - `BatchTask`：批量处理任务接口，包含 URL 列表、进度、时间戳等字段
> - `TaskContextType`：Context 类型定义，包含状态和方法接口
>
> **TaskProvider 组件：**
>
> 核心 Provider 组件，实现 Context 的创建和状态管理
>
> 使用 `useState` 管理任务状态，使用 `useCallback` 优化方法性能
>
> 提供任务操作方法：
>
> 1. **搜索任务管理**：`startSearchTask` 异步执行搜索，更新状态并显示结果
> 2. **批量任务管理**：`startBatchTask` 创建批量处理任务，`updateTaskProgress` 更新进度
> 3. **任务完成处理**：`completeTask` 标记任务完成，显示成功通知和跳转链接
> 4. **状态计算**：`hasActive` 计算是否有活跃任务
>
> **Context 提供的内容：**
> - `tasks`：包含搜索任务、批量任务列表、当前任务和活跃状态
> - 各种任务操作方法
> - TypeScript 类型安全
>
> **技术特点：**
> - 使用 `useState` 和 `useCallback` 管理状态和优化性能
> - 集成 `sonner` Toast 库提供用户反馈
> - 错误处理和状态同步
> - Hook 模式：`useTasks` 提供类型安全的 Context 访问
>

`frontend/src/contexts/ThemeContext.tsx`

> 全局主题和缩放管理的 React Context，主要功能包括：
>
> __核心接口定义：__
>
> - `ThemeContextType`：定义主题 Context 的接口，包含缩放比例、主题对象和工具方法
>
> __ThemeProvider 组件：__
>
> - 核心 Provider 组件，管理应用的主题状态
> - 支持自动检测浏览器字体大小来设置初始缩放比例
> - 通过 CSS 自定义属性 `--mantine-scale` 实现全局缩放
> - 提供缩放比例的设置和验证（限制在 0.8-1.4 范围内）
>
> __核心功能：__
>
> 1. __缩放比例管理__：`scale` 状态控制全局缩放，影响 Mantine 组件的尺寸
> 2. __浏览器适配__：`getBrowserScale()` 检测浏览器默认字体大小
> 3. __动态缩放__：`getScaledValue()` 工具函数计算缩放后的尺寸值
> 4. __主题对象__：集成 `MantineSizingSystem` 提供完整的尺寸系统
>
> __提供的 Hooks 和工具：__
>
> - `useTheme()`：获取完整的主题 Context
> - `useScale()`：便捷 Hook，只获取缩放相关的状态和方法
> - `withTheme()`：高阶组件，为组件注入主题访问能力
>
> __技术特点：__
>
> - __CSS 自定义属性集成__：通过 `--mantine-scale` 与 CSS 变量系统配合
> - __自适应设计__：根据浏览器设置自动调整组件尺寸
> - __类型安全__：完整的 TypeScript 类型定义
> - __性能优化__：使用 `useEffect` 高效更新 CSS 属性
>
> 这个 Context 实现了 Mantine UI 的响应式缩放系统，确保应用在不同设备和浏览器设置下都能保持良好的视觉一致性。

## **布局系统 (Layouts)**

- 说明应用布局组件和结构
- 包含文件夹：`layouts/`

## **静态资源 (Assets)**

- 介绍字体、图片等资源管理
- 包含文件夹：`assets/`

## **测试体系 (Testing)**

- 描述单元测试、集成测试和测试工具
- 包含文件夹：`__tests__/`、`test-utils/`

## **开发工具 (Development Tools)**

- 介绍开发阶段的测试和示例组件
- 包含文件夹：`dev/`