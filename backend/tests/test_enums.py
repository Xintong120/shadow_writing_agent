# test_enums.py
# 作用：测试枚举类和配置常量
# 测试目标：app/enums.py

from app.enums import (
    TaskStatus, MessageType, ProcessingStep, MemoryNamespace,
    SystemConfig, ModelName, ErrorType,
    get_enum_values, is_valid_enum_value
)


class TestTaskStatus:
    """测试TaskStatus枚举"""
    
    def test_all_status_values(self):
        """测试所有状态值"""
        assert TaskStatus.PENDING.value == "pending"
        assert TaskStatus.PROCESSING.value == "processing"
        assert TaskStatus.COMPLETED.value == "completed"
        assert TaskStatus.FAILED.value == "failed"
    
    def test_status_string_representation(self):
        """测试字符串表示"""
        assert str(TaskStatus.PENDING) == "pending"
        assert str(TaskStatus.COMPLETED) == "completed"
    
    def test_status_comparison(self):
        """测试状态比较"""
        status = TaskStatus.PENDING
        assert status == TaskStatus.PENDING
        assert status != TaskStatus.COMPLETED


class TestMessageType:
    """测试MessageType枚举"""
    
    def test_all_message_types(self):
        """测试所有消息类型"""
        assert MessageType.CONNECTED.value == "connected"
        assert MessageType.STARTED.value == "started"
        assert MessageType.PROGRESS.value == "progress"
        assert MessageType.COMPLETED.value == "completed"
        assert MessageType.TASK_COMPLETED.value == "task_completed"
        assert MessageType.STEP.value == "step"
        assert MessageType.URL_COMPLETED.value == "url_completed"
        assert MessageType.ERROR.value == "error"
    
    def test_message_type_count(self):
        """测试消息类型数量"""
        message_types = list(MessageType)
        assert len(message_types) == 8


class TestProcessingStep:
    """测试ProcessingStep枚举"""
    
    def test_all_steps(self):
        """测试所有处理步骤"""
        assert ProcessingStep.EXTRACTING_TRANSCRIPT.value == "extracting_transcript"
        assert ProcessingStep.SHADOW_WRITING.value == "shadow_writing"
        assert ProcessingStep.VALIDATING.value == "validating"
        assert ProcessingStep.QUALITY_CHECK.value == "quality_check"
        assert ProcessingStep.CORRECTING.value == "correcting"
        assert ProcessingStep.FINALIZING.value == "finalizing"
        assert ProcessingStep.SAVING.value == "saving"
    
    def test_step_string_representation(self):
        """测试步骤字符串表示"""
        step = ProcessingStep.SHADOW_WRITING
        assert str(step) == "shadow_writing"


class TestMemoryNamespace:
    """测试MemoryNamespace枚举"""
    
    def test_all_namespaces(self):
        """测试所有命名空间"""
        assert MemoryNamespace.TED_HISTORY.value == "ted_history"
        assert MemoryNamespace.SEARCH_HISTORY.value == "search_history"
        assert MemoryNamespace.LEARNING_RECORDS.value == "learning_records"


class TestSystemConfig:
    """测试SystemConfig常量"""
    
    def test_memory_config(self):
        """测试Memory配置常量"""
        assert SystemConfig.DEFAULT_COOLDOWN_SECONDS == 60
        assert SystemConfig.MAX_CACHE_SIZE_MB == 500
        assert SystemConfig.MEMORY_CLEANUP_AGE_HOURS == 24
        assert isinstance(SystemConfig.DEFAULT_COOLDOWN_SECONDS, int)
    
    def test_chunk_config(self):
        """测试分块配置常量"""
        assert SystemConfig.CHUNK_SIZE == 4000
        assert SystemConfig.SMALL_CHUNK_SIZE == 200
        assert SystemConfig.MIN_CHUNK_LENGTH == 50
        assert SystemConfig.CHUNK_SIZE > SystemConfig.SMALL_CHUNK_SIZE
    
    def test_quality_config(self):
        """测试质量控制配置"""
        assert SystemConfig.MIN_QUALITY_SCORE == 6.0
        assert SystemConfig.MAX_QUALITY_SCORE == 8.0
        assert SystemConfig.MIN_WORD_COUNT == 8
        assert SystemConfig.MAX_WORD_COUNT == 50
        assert SystemConfig.MIN_QUALITY_SCORE < SystemConfig.MAX_QUALITY_SCORE
    
    def test_llm_config(self):
        """测试LLM配置"""
        assert SystemConfig.DEFAULT_TEMPERATURE == 0.1
        assert SystemConfig.QUALITY_CHECK_TEMPERATURE == 0.1
        assert SystemConfig.CREATIVE_TEMPERATURE == 0.4
        assert SystemConfig.MAX_TOKENS == 4096
        assert 0 <= SystemConfig.DEFAULT_TEMPERATURE <= 1
    
    def test_api_config(self):
        """测试API配置"""
        assert SystemConfig.MAX_RETRY_COUNT == 3
        assert SystemConfig.REQUEST_TIMEOUT_SECONDS == 30
        assert SystemConfig.BATCH_SIZE_LIMIT == 10
        assert SystemConfig.MAX_RETRY_COUNT > 0
    
    def test_search_config(self):
        """测试搜索配置"""
        assert SystemConfig.DEFAULT_SEARCH_RESULTS == 5
        assert SystemConfig.MAX_SEARCH_RESULTS == 10
        assert SystemConfig.MIN_SEARCH_RESULTS == 3
        assert (SystemConfig.MIN_SEARCH_RESULTS <= 
                SystemConfig.DEFAULT_SEARCH_RESULTS <= 
                SystemConfig.MAX_SEARCH_RESULTS)


class TestModelName:
    """测试ModelName枚举"""
    
    def test_all_models(self):
        """测试所有模型名称"""
        assert ModelName.LLAMA_3_1_8B.value == "llama-3.1-8b-instant"
        assert ModelName.LLAMA_3_3_70B.value == "llama-3.3-70b-versatile"
        assert ModelName.DEFAULT.value == "llama-3.3-70b-versatile"
        assert ModelName.LIGHT.value == "llama-3.1-8b-instant"
        assert ModelName.ADVANCED.value == "llama-3.3-70b-versatile"
    
    def test_model_aliases(self):
        """测试模型别名"""
        assert ModelName.DEFAULT.value == ModelName.LLAMA_3_3_70B.value
        assert ModelName.LIGHT.value == ModelName.LLAMA_3_1_8B.value
        assert ModelName.ADVANCED.value == ModelName.LLAMA_3_3_70B.value


class TestErrorType:
    """测试ErrorType枚举"""
    
    def test_all_error_types(self):
        """测试所有错误类型"""
        assert ErrorType.VALIDATION_ERROR.value == "validation_error"
        assert ErrorType.API_ERROR.value == "api_error"
        assert ErrorType.RATE_LIMIT_ERROR.value == "rate_limit_error"
        assert ErrorType.TIMEOUT_ERROR.value == "timeout_error"
        assert ErrorType.PARSING_ERROR.value == "parsing_error"
        assert ErrorType.NOT_FOUND_ERROR.value == "not_found_error"
        assert ErrorType.PERMISSION_ERROR.value == "permission_error"
        assert ErrorType.SYSTEM_ERROR.value == "system_error"


class TestUtilityFunctions:
    """测试工具函数"""
    
    def test_get_enum_values(self):
        """测试获取枚举值列表"""
        values = get_enum_values(TaskStatus)
        assert isinstance(values, list)
        assert len(values) == 4
        assert "pending" in values
        assert "processing" in values
        assert "completed" in values
        assert "failed" in values
    
    def test_get_enum_values_message_type(self):
        """测试获取消息类型枚举值"""
        values = get_enum_values(MessageType)
        assert len(values) == 8
        assert "connected" in values
        assert "error" in values
    
    def test_is_valid_enum_value_valid(self):
        """测试有效的枚举值"""
        assert is_valid_enum_value(TaskStatus, "pending") is True
        assert is_valid_enum_value(TaskStatus, "completed") is True
        assert is_valid_enum_value(MessageType, "started") is True
    
    def test_is_valid_enum_value_invalid(self):
        """测试无效的枚举值"""
        assert is_valid_enum_value(TaskStatus, "invalid") is False
        assert is_valid_enum_value(TaskStatus, "running") is False
        assert is_valid_enum_value(MessageType, "unknown") is False
    
    def test_is_valid_enum_value_case_sensitive(self):
        """测试枚举值区分大小写"""
        assert is_valid_enum_value(TaskStatus, "PENDING") is False
        assert is_valid_enum_value(TaskStatus, "Pending") is False


class TestEnumIntegration:
    """测试枚举集成使用"""
    
    def test_enum_in_dict(self):
        """测试枚举在字典中使用"""
        data = {
            "status": TaskStatus.PENDING,
            "type": MessageType.STARTED
        }
        assert data["status"] == TaskStatus.PENDING
        assert data["type"] == MessageType.STARTED
    
    def test_enum_serialization(self):
        """测试枚举序列化"""
        status = TaskStatus.COMPLETED
        assert status.value == "completed"
        assert str(status) == "completed"
    
    def test_enum_iteration(self):
        """测试枚举迭代"""
        all_statuses = [s for s in TaskStatus]
        assert len(all_statuses) == 4
        assert TaskStatus.PENDING in all_statuses
