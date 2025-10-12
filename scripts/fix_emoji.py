#!/usr/bin/env python3
"""批量修复Python文件中的emoji编码问题（Windows GBK兼容）"""

import os
import re
from pathlib import Path

# Emoji替换映射
EMOJI_REPLACEMENTS = {
    '✅': '[OK]',
    '❌': '[ERROR]',
    '⚠️': '[WARNING]',
    '🔧': '[FIX]',
    '📊': '[INFO]',
    '🎯': '[TARGET]',
    '🔄': '[RETRY]',
    '📚': '[DOCS]',
    '✓': '[OK]',
    '✗': '[ERROR]',
}

def fix_emoji_in_file(file_path: Path) -> bool:
    """修复单个文件中的emoji
    
    Args:
        file_path: 文件路径
        
    Returns:
        bool: 是否进行了修改
    """
    try:
        # 读取文件
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 替换emoji
        original_content = content
        for emoji, replacement in EMOJI_REPLACEMENTS.items():
            content = content.replace(emoji, replacement)
        
        # 如果有修改，写回文件
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  [OK] Fixed: {file_path.relative_to(Path.cwd())}")
            return True
        
        return False
        
    except Exception as e:
        print(f"  [ERROR] Failed to fix {file_path}: {e}")
        return False


def fix_emoji_in_directory(directory: Path, pattern: str = "*.py") -> None:
    """修复目录下所有Python文件中的emoji
    
    Args:
        directory: 目录路径
        pattern: 文件匹配模式
    """
    fixed_count = 0
    total_count = 0
    
    print(f"\n扫描目录: {directory}")
    print(f"匹配模式: {pattern}\n")
    
    # 递归查找所有Python文件
    for file_path in directory.rglob(pattern):
        # 跳过 __pycache__ 等目录
        if '__pycache__' in str(file_path):
            continue
            
        total_count += 1
        if fix_emoji_in_file(file_path):
            fixed_count += 1
    
    print(f"\n总计: 扫描 {total_count} 个文件, 修复 {fixed_count} 个文件")


def main():
    """主函数"""
    print("="*60)
    print("  批量修复Emoji编码问题")
    print("="*60)
    
    # 获取backend目录
    backend_dir = Path(__file__).parent.parent / "backend"
    
    if not backend_dir.exists():
        print(f"[ERROR] 找不到backend目录: {backend_dir}")
        return
    
    # 修复 app/ 目录
    print("\n[步骤1] 修复 app/ 目录...")
    fix_emoji_in_directory(backend_dir / "app")
    
    # 修复 tests/ 目录
    print("\n[步骤2] 修复 tests/ 目录...")
    fix_emoji_in_directory(backend_dir / "tests")
    
    print("\n" + "="*60)
    print("  修复完成！")
    print("="*60)


if __name__ == "__main__":
    main()
