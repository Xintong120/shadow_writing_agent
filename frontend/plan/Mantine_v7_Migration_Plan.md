# Mantine v7 前端组件迁移计划

## 概述

本计划旨在指导将现有基于 `shadcn/ui` 和 TailwindCSS 的前端组件逐步重构为使用 Mantine v7 UI 库。考虑到项目已初步引入 Mantine 风格的尺寸和颜色系统，但组件本身仍是 `shadcn/ui` 实现，本计划将重点解决 Mantine 与 TailwindCSS 的共存、样式冲突、主题集成以及尺寸和颜色管理等问题，帮助全栈新手深入理解 Mantine 的设计系统。

**核心目标：**

*   完全替换现有 `shadcn/ui` 组件为 Mantine v7 组件。
*   实现 Mantine 与 TailwindCSS 的平滑共存，利用 `postcss-preset-mantine` 解决样式冲突。
*   将现有自定义尺寸和颜色系统无缝集成到 Mantine 主题中。
*   确保迁移后的组件具备响应式设计、一致的视觉效果和良好的可维护性。

## 迁移阶段与详细步骤

### 阶段1：环境准备与 Mantine 安装

**思路：** 在开始组件迁移之前，首先需要搭建 Mantine 的开发环境，并逐步清理旧的 UI 库依赖，为 Mantine 的引入做好准备。

**重点：**
*   正确安装 Mantine v7 及其相关依赖。
*   理解 Vite 对 Mantine 的支持方式。
*   逐步移除 `shadcn/ui` 和 Radix UI 依赖，避免一次性破坏现有功能。

**难点：**
*   识别所有 `shadcn/ui` 和 Radix UI 的使用点，确保在移除前有 Mantine 替代方案。
*   处理潜在的包版本冲突。

**前端学习知识点：**
*   **包管理**: `npm` 或 `yarn` 的依赖安装与管理。
*   **构建工具**: Vite 的插件和配置。
*   **UI 库生态**: 了解 Mantine 的核心库 (`@mantine/core`)、Hooks (`@mantine/hooks`) 和表单 (`@mantine/form`) 等模块。

**执行顺序：**

1.  **安装 Mantine v7 核心库 (`@mantine/core`, `@mantine/hooks`, `@mantine/form` 等)**
    *   安装 Mantine 及其样式引擎（Emotion 或 Styled-components，Mantine v7 默认使用 Emotion）。
    *   安装 `@mantine/form` 用于表单处理，`@mantine/hooks` 提供常用 Hooks。
    *   安装 `postcss-preset-mantine` 用于 TailwindCSS 集成。

2.  **配置 Vite 以支持 Mantine (如果需要)**
    *   Mantine v7 通常与 Vite 兼容良好，可能不需要额外配置。
    *   检查 Mantine 官方文档中关于 Vite 集成的最新指南。

3.  **移除 `shadcn/ui` 和 Radix UI 相关依赖 (逐步移除，避免一次性破坏)**
    *   **思路：** 这是一个渐进的过程。在每个 `shadcn/ui` 组件被 Mantine 替代后，再移除其对应的 Radix UI 依赖。
    *   **具体操作：** 暂时不移除 `package.json` 中的依赖，而是在迁移单个组件时，删除该组件文件，并确保不再引用其 Radix UI 依赖。待所有组件迁移完成后，再统一清理 `package.json`。

### 阶段2：Mantine 主题与 TailwindCSS 集成

**思路：** Mantine 拥有强大的主题系统，而项目当前依赖 TailwindCSS 和自定义样式文件。本阶段目标是将 Mantine 的主题系统与现有样式定义结合，并解决 Mantine 与 TailwindCSS 的样式冲突问题，实现两者的和谐共存。

**重点：**
*   理解 Mantine 的 `createTheme` 函数和主题对象结构。
*   正确配置 `postcss-preset-mantine` 以处理 TailwindCSS 的预设。
*   将现有 `colors.js` 和 `sizing.js` 中的定义映射到 Mantine 主题变量。
*   在应用根部正确引入 `MantineProvider`。

**难点：**
*   将现有 `hsl(var(--primary))` 格式的颜色变量转换为 Mantine 主题可识别的颜色数组或对象。
*   将 `sizing.js` 中的 `rem` 值和 `componentSizes` 映射到 Mantine 的 `spacing`、`fontSizes`、`radius` 等主题属性。
*   解决 TailwindCSS 默认样式与 Mantine 组件样式之间的冲突。

**前端学习知识点：**
*   **Mantine 主题系统**: `createTheme`、`MantineProvider`、`theme` 对象结构（`colors`、`spacing`、`fontSizes`、`breakpoints` 等）。
*   **PostCSS**: 了解 PostCSS 及其插件 (`postcss-preset-mantine`) 如何处理 CSS。
*   **CSS 变量**: 深入理解 CSS 变量 (`--var`) 在主题化中的作用。
*   **样式冲突解决**: Mantine 与 TailwindCSS 共存的最佳实践。

**执行顺序：**

1.  **创建 Mantine 主题配置文件 (`frontend/src/theme/mantine-theme.ts`)**
    *   **思路：** 定义一个 Mantine 主题对象，作为所有 Mantine 组件的默认样式和行为的基础。
    *   **具体操作：** 创建 `frontend/src/theme/mantine-theme.ts` 文件，使用 `createTheme` 函数定义主题。

2.  **在 `frontend/postcss.config.js` 中集成 `postcss-preset-mantine`**
    *   **思路：** `postcss-preset-mantine` 是 Mantine 官方提供的 PostCSS 插件，用于处理 Mantine 的 CSS 变量和 TailwindCSS 的兼容性问题。
    *   **具体操作：** 修改 `frontend/postcss.config.js`，将 `postcss-preset-mantine` 添加到 PostCSS 插件列表中。

3.  **调整现有 `frontend/src/styles/colors.js` 和 `frontend/src/styles/sizing.js` 以适配 Mantine 主题对象**
    *   **思路：** 将现有自定义设计系统中的颜色和尺寸定义，转换为 Mantine 主题对象能够直接使用的格式。
    *   **具体操作：**
        *   **颜色**: 将 `colors.js` 中的 `brandColors`、`neutralColors`、`functionalColors` 转换为 Mantine 的 `colors` 属性所需的颜色数组或对象。Mantine 颜色通常是 10 个色阶的数组。
        *   **尺寸**: 将 `sizing.js` 中的 `spacing`、`fontSizes`、`radius`、`breakpoints`、`shadows` 等直接映射到 Mantine 主题的对应属性。
        *   **组件尺寸**: `componentSizes` 需要在 Mantine 主题的 `components` 属性中进行定制，为每个 Mantine 组件定义默认的 `styles` 或 `vars`。

4.  **在 `frontend/src/main.jsx` 中引入 `MantineProvider` 并应用自定义主题**
    *   **思路：** `MantineProvider` 是 Mantine 应用的根组件，它提供了主题上下文，并注入全局样式。
    *   **具体操作：** 在 `frontend/src/main.jsx` 中，将 `<App />` 组件包裹在 `<MantineProvider>` 中，并将上一步创建的自定义主题传递给 `theme` 属性。

5.  **验证 Mantine 颜色和尺寸系统是否正确应用**
    *   **思路：** 通过简单的 Mantine 组件测试，确保主题配置生效。
    *   **具体操作：** 在 `frontend/src/dev/MantineButtonTest.tsx` 或新创建的测试文件中，使用 Mantine 的 `Button`、`Text` 等组件，观察其颜色、尺寸是否与预期一致。检查浏览器开发者工具中的 CSS 变量和样式。

### 阶段3：核心原子组件迁移 (按优先级和依赖关系)

**思路：** 逐步替换 `frontend/src/components/atoms` 目录下的 `shadcn/ui` 组件为 Mantine 对应的组件。从最常用、最基础的组件开始，确保每个组件迁移后功能正常且样式一致。

**重点：**
*   理解 Mantine 组件的 Props 和 API，与现有 `shadcn/ui` 组件进行映射。
*   利用 Mantine 的 `styles` 和 `vars` 属性进行组件级样式定制，以匹配现有设计。
*   解决 `shadcn/ui` 中 `cva` 和 `cn` 函数的类名合并逻辑，转换为 Mantine 的样式方案。

**难点：**
*   `shadcn/ui` 组件通常是无样式的 Radix UI Primitive 加上 TailwindCSS 类名。Mantine 组件自带样式，需要覆盖或调整。
*   处理 `React.forwardRef` 和 `displayName` 的兼容性。
*   确保迁移后的组件在不同尺寸和变体下表现一致。

**前端学习知识点：**
*   **Mantine 组件库**: 学习 Mantine 提供的各种组件及其 Props。
*   **组件定制**: Mantine 组件的 `styles`、`vars`、`classNames` 属性，以及 `createTheme` 中的 `components` 定制。
*   **样式覆盖**: 如何使用 Mantine 的样式系统覆盖默认样式。
*   **重构技巧**: 逐步替换、测试驱动开发。

**执行顺序：**

1.  **迁移 Button 组件 (`frontend/src/components/atoms/button.tsx`)**
    *   **替换为 Mantine Button 组件**: 导入 Mantine 的 `Button` 组件。
    *   **调整 Props 和样式以匹配现有功能和设计系统**: 将现有 `variant` 和 `size` Props 映射到 Mantine Button 的 `variant` 和 `size`。使用 Mantine 主题的 `components` 定制或组件的 `styles` 属性来调整按钮的 `height`、`padding`、`fontSize` 等，以匹配 `sizing.js` 中 `componentSizes.button` 的定义。
    *   **解决 margin/padding 视觉效果不佳的问题**: 仔细检查 Mantine Button 的默认样式，并根据 `sizing.js` 中的 `componentSizes.button` 定义，通过 `styles` 或 `vars` 属性精确控制内边距和高度。

2.  **迁移 Card 组件 (`frontend/src/components/atoms/card.tsx`)**
    *   **替换为 Mantine Card 组件**: 导入 Mantine 的 `Card`、`Group`、`Text` 等组件来构建卡片结构。
    *   **调整 Props 和样式**: 将现有 `CardHeader`、`CardTitle`、`CardDescription`、`CardContent`、`CardFooter` 替换为 Mantine 的 `Card.Section`、`Card.Header`、`Title`、`Text` 等组合。利用 Mantine 的 `spacing` 和 `radius` 主题变量来设置卡片的间距、圆角和内边距。

3.  **迁移 Avatar 组件 (`frontend/src/components/atoms/avatar.tsx`)**
    *   **替换为 Mantine Avatar 组件**: 导入 Mantine 的 `Avatar` 组件。
    *   **调整 Props 和样式**: 将现有 `size` Props 映射到 Mantine Avatar 的 `size`。通过 Mantine 主题的 `components` 定制或组件的 `styles` 属性来调整头像的尺寸，以匹配 `sizing.js` 中 `componentSizes.avatar` 的定义。

4.  **迁移 Input 组件 (`frontend/src/components/atoms/input.tsx`)**
    *   **替换为 Mantine TextInput/NumberInput 等组件**: 导入 Mantine 的 `TextInput`、`NumberInput` 等组件。
    *   **调整 Props 和样式**: 将现有 `type` 属性映射到 Mantine 对应的输入组件。通过 Mantine 主题的 `components` 定制或组件的 `styles` 属性来调整输入框的 `height`、`padding`、`fontSize` 等，以匹配 `sizing.js` 中 `componentSizes.input` 的定义。

5.  **迁移 Checkbox 组件 (`frontend/src/components/atoms/checkbox.tsx`)**
6.  **迁移 Switch 组件 (`frontend/src/components/atoms/switch.tsx`)**
7.  **迁移 Tabs 组件 (`frontend/src/components/atoms/tabs.tsx`)**
8.  **迁移 Progress 组件 (`frontend/src/components/atoms/progress.tsx`)**
9.  **迁移 Dialog 组件 (`frontend/src/components/atoms/dialog.tsx`)**
10. **迁移 Toast 组件 (`frontend/src/components/atoms/toast.tsx`)**
11. **迁移 Badge 组件 (`frontend/src/components/atoms/badge.tsx`)**
12. **迁移 Label 组件 (`frontend/src/components/atoms/label.tsx`)**

### 阶段4：分子与有机体组件迁移

**思路：** 在原子组件迁移完成后，开始迁移由原子组件组成的分子和有机体组件。这个阶段主要关注组件的组合逻辑和数据流，确保 Mantine 组件能够正确地嵌套和交互。

**重点：**
*   替换内部使用的 `shadcn/ui` 原子组件为 Mantine 原子组件。
*   调整组件的布局和间距，利用 Mantine 的 `Stack`、`Group`、`Flex` 等布局组件。
*   确保数据绑定和事件处理逻辑不变。

**难点：**
*   复杂的组件组合可能需要重新思考布局结构。
*   处理 `shadcn/ui` 提供的 Hooks 或工具函数，寻找 Mantine 的替代方案。

**前端学习知识点：**
*   **Mantine 布局组件**: `Stack`、`Group`、`Flex`、`Grid` 等。
*   **组件组合**: 如何有效地组合 Mantine 原子组件来构建更复杂的 UI。
*   **数据流管理**: 确保组件间的数据传递和状态管理在迁移后依然有效。

**执行顺序：**

1.  **迁移 Carousel 组件 (`frontend/src/components/molecules/carousel.tsx`)**
    *   **思路：** `embla-carousel-react` 是一个独立的轮播库，Mantine 也有自己的 `Carousel` 组件。需要评估是继续使用 `embla-carousel-react` 并适配 Mantine 样式，还是完全替换为 Mantine 的 `Carousel`。考虑到用户希望完全替换 `shadcn/ui`，倾向于替换为 Mantine 的 `Carousel`。
    *   **具体操作：** 导入 Mantine 的 `Carousel` 组件，并将其与 `Carousel.Slide`、`Carousel.Control` 等子组件结合，替换现有实现。

2.  **迁移 ChatInterface 组件 (`frontend/src/components/organisms/ChatInterface.tsx`)**
    *   **思路：** `ChatInterface` 包含了多个原子和分子组件，如 `MessageBubble`、`ChatInput`、`QuickSuggestions` 等。需要逐一替换其内部使用的 `shadcn/ui` 组件。
    *   **具体操作：** 替换 `ChatInput` 为 Mantine 的 `TextInput` 或 `Textarea`，`MessageBubble` 内部的文本和布局使用 Mantine 的 `Text` 和 `Box`。

3.  **迁移其他分子/有机体组件 (根据依赖关系逐步进行)**
    *   按照组件的依赖关系，从底层到高层逐步迁移所有分子和有机体组件。
    *   例如，`TEDList` 依赖 `TEDCard`，`TEDCard` 可能依赖 `Card`、`Image`、`Text` 等，因此需要先迁移 `Card` 等原子组件。

### 阶段5：样式与主题深度集成

**思路：** 在大部分组件迁移完成后，本阶段将专注于 Mantine 主题的精细化调整，确保整个应用在视觉上达到统一，并充分利用 Mantine 的主题能力。

**重点：**
*   统一所有设计令牌（Design Tokens），如字体、间距、圆角、阴影等。
*   处理全局样式，确保 Mantine 的 `reset.css` 和 `global.css` 与现有样式和谐共存。
*   充分利用 Mantine 的响应式断点系统。

**难点：**
*   确保 Mantine 主题变量与现有 `sizing.js` 和 `colors.js` 中的定义完全一致。
*   处理 TailwindCSS 的 `base`、`components`、`utilities` 层与 Mantine 样式的优先级。
*   在 Mantine 主题中定义自定义组件的默认样式和变体。

**前端学习知识点：**
*   **Mantine 主题定制**: 深入学习 `createTheme` 的所有选项，包括 `components`、`primaryColor`、`primaryShade`、`fontFamily`、`headings` 等。
*   **CSS 预处理器**: 了解 Mantine 如何使用 Emotion 或 Styled-components 进行样式管理。
*   **响应式设计**: Mantine 的 `useMediaQuery` Hook 和 `theme.breakpoints` 的使用。

**执行顺序：**

1.  **统一字体、间距、圆角等 Mantine 主题变量，确保与现有设计系统一致**
    *   **思路：** 审查 `sizing.js` 中的所有定义，并将其精确地映射到 Mantine 主题的 `fontFamily`、`fontSizes`、`lineHeights`、`spacing`、`radius`、`shadows`、`headings` 和 `breakpoints`。
    *   **具体操作：** 在 `frontend/src/theme/mantine-theme.ts` 中，根据 `sizing.js` 和 `colors.js` 的内容，完善 `createTheme` 的配置。

2.  **处理全局样式和 CSS 变量，确保 Mantine 和 TailwindCSS 协同工作**
    *   **思路：** Mantine 会注入自己的全局样式。需要确保这些样式与 TailwindCSS 的 `base` 层以及现有 `index.css` 中的自定义 CSS 变量不冲突。
    *   **具体操作：**
        *   检查 `frontend/src/index.css`，确保 `@tailwind base;`、`@tailwind components;`、`@tailwind utilities;` 顺序正确。
        *   `postcss-preset-mantine` 应该已经处理了大部分冲突，但仍需手动检查和调整。
        *   考虑是否需要将 `applyCssVariables.js` 中的逻辑整合到 Mantine 主题中，或者作为 Mantine 主题的补充。

3.  **响应式设计适配，利用 Mantine 的断点系统**
    *   **思路：** Mantine 提供了强大的响应式 Hooks 和 Props。
    *   **具体操作：** 替换现有组件中硬编码的响应式逻辑（如 `sm:col-span-6`）为 Mantine 的 `responsive` Props 或 `useMediaQuery` Hook。

### 阶段6：验证、优化与文档更新

**思路：** 迁移完成后，进行全面的测试以确保功能和视觉效果的正确性。同时，对代码进行优化，并更新项目文档，记录 Mantine 的使用方式。

**重点：**
*   全面的功能测试和视觉回归测试。
*   性能分析和优化。
*   更新前端开发指南，为未来的开发提供清晰的指导。

**难点：**
*   确保所有边缘情况和交互逻辑在迁移后依然正常。
*   识别并解决潜在的性能瓶颈。

**前端学习知识点：**
*   **测试策略**: 单元测试、集成测试、端到端测试。
*   **性能优化**: React Profiler、Lighthouse 等工具的使用。
*   **文档编写**: 清晰、准确、易于理解的技术文档。

**执行顺序：**

1.  **进行全面的功能测试和视觉回归测试**
    *   **思路：** 逐一测试所有迁移后的组件和页面，确保其功能与迁移前一致，且视觉效果符合设计要求。
    *   **具体操作：**
        *   手动测试所有页面和组件的交互。
        *   利用 `frontend/src/dev/ComponentShowcase.tsx` 等测试页面进行视觉对比。
        *   如果项目有自动化测试，更新测试用例以适应 Mantine 组件。

2.  **性能优化 (如果需要)**
    *   **思路：** 检查应用性能，确保 Mantine 的引入没有导致性能下降。
    *   **具体操作：** 使用浏览器开发者工具进行性能分析，优化不必要的渲染或复杂的样式计算。

3.  **更新前端开发指南，记录 Mantine 的使用方式和最佳实践**
    *   **思路：** 将 Mantine 的主题配置、组件使用、样式定制等内容添加到 `docs/guides/前端开发指南.md` 中。
    *   **具体操作：** 详细说明 Mantine 的安装、主题配置、组件 Props、样式覆盖方法，以及 Mantine 与 TailwindCSS 共存的注意事项。

---

## 风险评估

*   **样式冲突**: Mantine 和 TailwindCSS 都对基础 HTML 元素有默认样式，`postcss-preset-mantine` 会缓解，但仍需手动调整。
*   **学习曲线**: 对于全栈新手，Mantine 的主题系统和组件 API 需要一定的学习时间。
*   **组件替换工作量**: 现有组件数量较多，完全替换需要投入大量时间和精力。
*   **功能差异**: Mantine 组件与 `shadcn/ui` 组件在功能或行为上可能存在细微差异，需要仔细测试。

## 总结

本 Mantine v7 迁移计划提供了一个结构化的实施路径，旨在帮助您逐步、深入地理解和应用 Mantine UI 库。通过遵循这些步骤，您将能够成功地将现有组件重构为 Mantine，并掌握 Mantine 的主题、样式和组件管理能力。在整个过程中，请保持耐心，并充分利用 Mantine 的官方文档和社区资源。



