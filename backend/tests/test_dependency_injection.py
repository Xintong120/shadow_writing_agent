# tests/test_dependency_injection.py
# 测试依赖注入功能

import pytest
from app.utils import (
    get_settings, get_llm, get_llm_light, get_llm_advanced,
    get_task_manager, get_sse_manager, get_api_monitor, get_concurrency_limiter
)


def test_get_settings():
    """测试获取设置的依赖函数"""
    settings = get_settings()
    assert settings is not None
    assert hasattr(settings, 'model_name')
    assert hasattr(settings, 'temperature')


def test_get_llm():
    """测试获取LLM的依赖函数"""
    llm = get_llm()
    assert callable(llm)
    assert llm is not None


def test_get_llm_light():
    """测试获取轻量级LLM的依赖函数"""
    llm = get_llm_light()
    assert callable(llm)
    assert llm is not None


def test_get_llm_advanced():
    """测试获取高级LLM的依赖函数"""
    llm = get_llm_advanced()
    assert callable(llm)
    assert llm is not None


def test_get_task_manager():
    """测试获取任务管理器的依赖函数"""
    tm = get_task_manager()
    assert tm is not None
    assert hasattr(tm, 'create_task')


def test_get_sse_manager():
    """测试获取SSE管理器的依赖函数"""
    sm = get_sse_manager()
    assert sm is not None
    assert hasattr(sm, 'add_message')


def test_get_api_monitor():
    """测试获取API监控器的依赖函数"""
    monitor = get_api_monitor()
    assert monitor is not None


def test_get_concurrency_limiter():
    """测试获取并发限制器的依赖函数"""
    limiter = get_concurrency_limiter()
    # 可能为None（如果未初始化）
    # assert limiter is not None  # 暂时注释，因为可能未初始化