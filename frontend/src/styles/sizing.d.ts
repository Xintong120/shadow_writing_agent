// 尺寸管理系统类型定义
// 集成Mantine设计系统类型定义
export interface ComponentSize {
  height: string;
  padding: string;
  fontSize: string;
}

export interface InputSizes {
  sm: ComponentSize;
  md: ComponentSize;
  lg: ComponentSize;
}

export interface ButtonSizes {
  xs: ComponentSize;
  sm: ComponentSize;
  md: ComponentSize;
  lg: ComponentSize;
  xl: ComponentSize;
}

export interface CardSizes {
  padding: {
    sm: string;
    md: string;
    lg: string;
  };
  gap: {
    sm: string;
    md: string;
    lg: string;
  };
}

export interface AvatarSizes {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface CheckboxSizes {
  sm: string;
  md: string;
  lg: string;
}

export interface SwitchSizes {
  sm: {
    height: string;
    width: string;
    thumbSize: string;
    translateX: string;
  };
  md: {
    height: string;
    width: string;
    thumbSize: string;
    translateX: string;
  };
  lg: {
    height: string;
    width: string;
    thumbSize: string;
    translateX: string;
  };
}

export interface TabsSizes {
  list: {
    height: Record<string, string>;
    padding: Record<string, string>;
  };
  trigger: {
    padding: Record<string, string>;
    fontSize: Record<string, string>;
  };
  content: {
    marginTop: Record<string, string>;
  };
}

export interface ToastSizes {
  padding: Record<string, string>;
  action: {
    height: Record<string, string>;
    padding: Record<string, string>;
    fontSize: Record<string, string>;
  };
  close: {
    position: Record<string, string>;
    padding: Record<string, string>;
    iconSize: Record<string, string>;
  };
  title: {
    fontSize: Record<string, string>;
  };
  description: {
    fontSize: Record<string, string>;
  };
}

export interface DialogSizes {
  content: {
    maxWidth: Record<string, string>;
    padding: Record<string, string>;
    gap: Record<string, string>;
  };
  close: {
    position: Record<string, string>;
    iconSize: Record<string, string>;
  };
  title: {
    fontSize: Record<string, string>;
  };
  description: {
    fontSize: Record<string, string>;
  };
  header: {
    gap: Record<string, string>;
  };
  footer: {
    gap: Record<string, string>;
  };
}

export interface ProgressSizes {
  height: Record<string, string>;
  radius: Record<string, string>;
}

export interface ComponentSizes {
  button: ButtonSizes;
  input: InputSizes;
  card: CardSizes;
  avatar: AvatarSizes;
  checkbox: CheckboxSizes;
  switch: SwitchSizes;
  tabs: TabsSizes;
  toast: ToastSizes;
  dialog: DialogSizes;
  progress: ProgressSizes;
}

export interface LayoutSystem {
  containers: {
    breakpoints: Record<string, string>;
    content: Record<string, string>;
  };
  spacing: {
    page: Record<string, string>;
    component: Record<string, string>;
  };
  grid: {
    container: string;
    spans: Record<number, string>;
  };
  sidebar: {
    width: string;
    widthExpanded: string;
  };
  container: {
    maxWidth: string;
    padding: string;
  };
  header: {
    height: string;
  };
}

export interface MantineSizingSystem {
  scale: number;
  fontSizes: Record<string, string>;
  lineHeights: Record<string, string>;
  spacing: Record<string, string>;
  radius: Record<string, string>;
  shadows: Record<string, string>;
  headings: Record<string, { fontSize: string; lineHeight: string }>;
  breakpoints: Record<string, string>;
  base: Record<number, string>;
  component: ComponentSizes;
  layout: LayoutSystem;
}

export interface SizingSystem extends MantineSizingSystem {}

export declare const sizing: SizingSystem;
export declare const spacing: Record<string, string>;
export declare const radius: Record<string, string>;
export declare const shadows: Record<string, string>;
export declare const fontSizes: Record<string, string>;
export declare const lineHeights: Record<string, string>;
export declare const breakpoints: Record<string, string>;
export declare const componentSizes: ComponentSizes;

// 布局相关导出 (兼容layout.js)
export declare const pageLayouts: Record<string, any>;
export declare const gridSystem: any;
export declare const layoutSpacing: any;

export declare function getSize(category: string, key: string): string;
export declare function calcSize(base: string, multiplier?: number): string;
export declare function getScaledSize(base: string, scale?: number): string;
export declare function getResponsiveClass(baseClass: string, responsiveMap: any): string;
export declare function createGridLayout(columns?: number, gap?: string): string;
export declare function createContainer(maxWidth?: string, padding?: string): string;