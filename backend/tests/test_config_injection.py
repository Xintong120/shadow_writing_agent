# tests/test_config_injection.py
# 测试配置依赖注入功能

import pytest
from app.config import ConfigProvider, Settings, update_settings


def test_config_provider_initialization():
    """测试配置提供者初始化"""
    provider = ConfigProvider()
    assert provider is not None
    assert provider.config is not None
    assert hasattr(provider.config, 'model_name')


def test_config_provider_with_custom_config():
    """测试配置提供者使用自定义配置"""
    custom_settings = Settings()
    custom_settings.model_name = "custom-model"
    custom_settings.temperature = 0.5

    provider = ConfigProvider(custom_settings)
    assert provider.get_model_name() == "custom-model"
    assert provider.get_temperature() == 0.5


def test_update_settings_returns_new_provider():
    """测试update_settings返回新的配置提供者实例"""
    original_provider = ConfigProvider()
    original_model = original_provider.get_model_name()

    # 更新设置
    updates = {"model_name": "updated-model", "temperature": 0.8}
    new_provider = update_settings(updates, original_provider)

    # 验证原始提供者不变
    assert original_provider.get_model_name() == original_model

    # 验证新提供者有更新
    assert new_provider.get_model_name() == "updated-model"
    assert new_provider.get_temperature() == 0.8


def test_config_provider_methods():
    """测试配置提供者的各种方法"""
    provider = ConfigProvider()

    # 测试基本属性访问
    assert isinstance(provider.get_model_name(), str)
    assert isinstance(provider.get_temperature(), float)
    assert isinstance(provider.get_api_key(), str)
    assert isinstance(provider.get_cors_origins(), list)
    assert isinstance(provider.get_available_providers(), list)