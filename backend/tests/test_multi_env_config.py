# tests/test_multi_env_config.py
# 测试多环境配置支持

import pytest
from app.config import ConfigProvider, Settings
from app.utils import get_settings, get_llm
from fastapi import Depends


def test_different_config_instances():
    """测试不同配置实例的隔离性"""
    # 创建两个不同的配置
    config1 = Settings()
    config1.model_name = "model-1"
    config1.temperature = 0.1

    config2 = Settings()
    config2.model_name = "model-2"
    config2.temperature = 0.9

    provider1 = ConfigProvider(config1)
    provider2 = ConfigProvider(config2)

    # 验证配置隔离
    assert provider1.get_model_name() == "model-1"
    assert provider1.get_temperature() == 0.1

    assert provider2.get_model_name() == "model-2"
    assert provider2.get_temperature() == 0.9


def test_dependency_injection_with_mock_config():
    """测试依赖注入使用mock配置"""
    # 创建mock配置
    mock_config = Settings()
    mock_config.model_name = "mock-model"
    mock_config.temperature = 0.5
    mock_config.groq_api_key = "mock-key"

    mock_provider = ConfigProvider(mock_config)

    # 模拟依赖注入（在实际应用中由FastAPI处理）
    # 这里直接调用函数，传入mock provider
    settings = get_settings(mock_provider)

    assert settings.model_name == "mock-model"
    assert settings.temperature == 0.5
    assert settings.groq_api_key == "mock-key"


def test_config_immutability():
    """测试配置的不可变性（通过创建新实例）"""
    original = ConfigProvider()

    # 创建修改后的配置
    modified_config = Settings()
    for key, value in original.config.__dict__.items():
        setattr(modified_config, key, value)

    modified_config.model_name = "modified-model"
    modified_provider = ConfigProvider(modified_config)

    # 验证原始配置不变
    assert original.get_model_name() != "modified-model"
    assert modified_provider.get_model_name() == "modified-model"