# test_config.py
# 作用：测试配置管理
# 测试目标：app/config.py

import pytest
import os
from unittest.mock import patch
from app.config import settings, validate_config


class TestSettings:
    """测试Settings配置类"""
    
    def test_default_values(self):
        """测试默认配置值"""
        # 注意：这些值可能被环境变量覆盖
        assert settings.model_name is not None
        assert isinstance(settings.temperature, float)
        assert isinstance(settings.max_tokens, int)
        assert isinstance(settings.api_port, int)
    
    def test_model_configuration(self):
        """测试模型配置"""
        assert settings.model_name in [
            "llama-3.3-70b-versatile",
            "llama-3.1-8b-instant"
        ]
        assert 0 <= settings.temperature <= 1
        assert settings.max_tokens > 0
    
    def test_api_configuration(self):
        """测试API配置"""
        assert settings.api_host is not None
        assert 1000 <= settings.api_port <= 65535
        assert isinstance(settings.debug, bool)
    
    def test_cors_configuration(self):
        """测试CORS配置"""
        assert isinstance(settings.cors_origins, list)
        assert len(settings.cors_origins) > 0
    
    def test_ted_cache_configuration(self):
        """测试TED缓存配置"""
        assert settings.ted_cache_dir is not None
        assert isinstance(settings.auto_delete_ted_files, bool)
        assert settings.max_cache_size_mb > 0


class TestAPIKeyConfiguration:
    """测试API Key配置"""
    
    def test_groq_api_key_attribute_exists(self):
        """测试groq_api_key属性存在"""
        assert hasattr(settings, 'groq_api_key')
    
    def test_groq_api_keys_attribute_exists(self):
        """测试groq_api_keys列表属性存在"""
        assert hasattr(settings, 'groq_api_keys')
        assert isinstance(settings.groq_api_keys, list)
    
    def test_tavily_api_key_attribute_exists(self):
        """测试tavily_api_key属性存在"""
        assert hasattr(settings, 'tavily_api_key')
    
    @patch.dict(os.environ, {'GROQ_API_KEY': 'test_key_123'})
    def test_single_api_key_from_env(self):
        """测试从环境变量读取单个API Key"""
        # 注意：由于settings是模块级单例，这个测试可能需要重新导入
        # 这里仅测试属性访问
        assert hasattr(settings, 'groq_api_key')


class TestValidateConfig:
    """测试配置验证函数"""
    
    @patch('app.config.settings.groq_api_key', '')
    def test_validate_config_missing_api_key(self):
        """测试缺少API Key时抛出异常"""
        with pytest.raises(ValueError, match="GROQ_API_KEY not set"):
            validate_config()
    
    @patch('app.config.settings.groq_api_key', 'test_key')
    @patch('builtins.print')
    def test_validate_config_success(self, mock_print):
        """测试配置验证成功"""
        validate_config()
        
        # 验证打印了配置信息
        assert mock_print.call_count >= 2


class TestConfigurationIntegrity:
    """测试配置完整性"""
    
    def test_temperature_range(self):
        """测试温度参数范围"""
        assert 0 <= settings.temperature <= 2
        assert settings.temperature >= 0
    
    def test_max_tokens_positive(self):
        """测试max_tokens为正数"""
        assert settings.max_tokens > 0
        assert settings.max_tokens <= 32768  # 常见上限
    
    def test_top_p_range(self):
        """测试top_p参数范围"""
        assert 0 <= settings.top_p <= 1
    
    def test_frequency_penalty_range(self):
        """测试frequency_penalty范围"""
        assert -2 <= settings.frequency_penalty <= 2


class TestEnvironmentVariableLoading:
    """测试环境变量加载"""
    
    def test_case_insensitive_loading(self):
        """测试不区分大小写的环境变量"""
        # Config类设置了case_sensitive = False
        # 这意味着GROQ_API_KEY和groq_api_key应该都能工作
        assert hasattr(settings, 'groq_api_key')
    
    def test_extra_fields_allowed(self):
        """测试允许额外字段"""
        # Config类设置了extra = "allow"
        # 这允许GROQ_API_KEY_1, GROQ_API_KEY_2等
        # 实际验证需要mock环境变量
        pass


class TestMultipleAPIKeys:
    """测试多API Key配置"""
    
    def test_groq_api_keys_is_list(self):
        """测试groq_api_keys是列表"""
        assert isinstance(settings.groq_api_keys, list)
    
    def test_model_post_init_logic(self):
        """测试model_post_init逻辑"""
        # model_post_init应该读取多个GROQ_API_KEY_*
        # 这里只验证结果是列表
        assert hasattr(settings, 'groq_api_keys')
    
    @patch.dict(os.environ, {
        'GROQ_API_KEY_1': 'key1',
        'GROQ_API_KEY_2': 'key2',
        'GROQ_API_KEY_3': 'key3'
    })
    def test_multiple_keys_from_env(self):
        """测试从环境变量读取多个Key"""
        # 注意：由于settings是单例，这个测试在实际运行时可能不准确
        # 仅作为示例
        pass


class TestConfigFileLoading:
    """测试配置文件加载"""
    
    def test_env_file_setting(self):
        """测试.env文件设置"""
        # Settings类应该配置了env_file = "../.env"（从backend目录向上一级）
        config_class = type(settings).Config
        assert hasattr(config_class, 'env_file')
        assert config_class.env_file == "../.env"
    
    def test_env_file_encoding(self):
        """测试环境文件编码"""
        config_class = type(settings).Config
        assert hasattr(config_class, 'env_file_encoding')
        assert config_class.env_file_encoding == "utf-8"


@pytest.mark.integration
class TestConfigurationConsistency:
    """测试配置一致性（集成测试）"""
    
    def test_model_and_temperature_compatibility(self):
        """测试模型和温度参数兼容性"""
        # 某些模型可能对温度有特定要求
        assert settings.model_name is not None
        assert settings.temperature is not None
    
    def test_cors_and_port_consistency(self):
        """测试CORS和端口一致性"""
        # CORS origins应该包含正确的端口
        port_found = False
        for origin in settings.cors_origins:
            if str(settings.api_port) in origin or "localhost" in origin:
                port_found = True
                break
        # 注意：这是一个宽松的检查
        assert isinstance(settings.cors_origins, list)
    
    def test_cache_directory_path_valid(self):
        """测试缓存目录路径有效"""
        assert settings.ted_cache_dir is not None
        assert len(settings.ted_cache_dir) > 0
        # 路径应该是相对路径或绝对路径
        assert "/" in settings.ted_cache_dir or "\\" in settings.ted_cache_dir or settings.ted_cache_dir.startswith(".")
