# run_tests.py
# 作用：运行测试并生成覆盖率报告的辅助脚本
# 使用：python run_tests.py

import subprocess
import sys
import os
from pathlib import Path


def run_command(cmd, description):
    """运行命令并显示结果"""
    print(f"\n{'='*60}")
    print(f"  {description}")
    print(f"{'='*60}\n")
    
    result = subprocess.run(cmd, shell=True)
    
    if result.returncode != 0:
        print(f"\n[WARNING] {description} failed with code {result.returncode}")
        return False
    return True


def main():
    """主函数"""
    print("\n" + "="*60)
    print("  Shadow Writing Agent - Test Suite")
    print("="*60)
    
    # 确保在backend目录
    if not os.path.exists("pytest.ini"):
        print("[ERROR] Please run this script from the backend/ directory")
        sys.exit(1)
    
    success_count = 0
    total_count = 0
    
    # 1. 运行所有测试
    total_count += 1
    if run_command(
        "pytest -v --cov=app --cov-report=term-missing --cov-report=html",
        "Running all tests with coverage"
    ):
        success_count += 1
    
    # 2. 生成覆盖率徽章（如果安装了coverage-badge）
    total_count += 1
    if run_command(
        "coverage report --format=total",
        "Generating coverage percentage"
    ):
        success_count += 1
    
    # 3. 代码风格检查
    total_count += 1
    if run_command(
        "ruff check app/ tests/",
        "Running code style check (ruff)"
    ):
        success_count += 1
    
    # 4. 类型检查（可选）
    total_count += 1
    if run_command(
        "mypy app/ --ignore-missing-imports",
        "Running type check (mypy)"
    ):
        success_count += 1
    
    # 总结
    print("\n" + "="*60)
    print(f"  Test Summary: {success_count}/{total_count} passed")
    print("="*60)
    
    # 覆盖率报告位置
    htmlcov_path = Path("htmlcov/index.html")
    if htmlcov_path.exists():
        print(f"\n  Coverage Report: {htmlcov_path.absolute()}")
        print(f"  Open in browser: file:///{htmlcov_path.absolute()}")
    
    # 退出代码
    sys.exit(0 if success_count == total_count else 1)


if __name__ == "__main__":
    main()
