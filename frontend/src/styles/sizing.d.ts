// 尺寸管理系统类型定义
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
  sm: ComponentSize;
  md: ComponentSize;
  lg: ComponentSize;
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

export interface ComponentSizes {
  button: ButtonSizes;
  input: InputSizes;
  card: CardSizes;
  avatar: AvatarSizes;
}

export interface SizingSystem {
  base: Record<number, string>;
  spacing: Record<string, string>;
  radius: Record<string, string>;
  component: ComponentSizes;
  layout: {
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
  };
  breakpoints: Record<string, string>;
}

export declare const sizing: SizingSystem;
export declare const spacing: Record<string, string>;
export declare const radius: Record<string, string>;
export declare const componentSizes: ComponentSizes;

export declare function getSize(category: string, key: string): string;
export declare function calcSize(base: string, multiplier?: number): string;