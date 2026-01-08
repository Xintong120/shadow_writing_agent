# tests/test_error_handling.py
# 测试统一错误处理功能

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.exceptions import (
    ConfigurationError, NotFoundError, FileProcessingError,
    ErrorCode, ValidationError
)


def test_configuration_error_response():
    """测试配置错误响应"""
    # 创建测试客户端
    client = TestClient(app)

    # 模拟触发配置错误（通过故意调用有问题的端点）
    # 这里我们直接测试错误转换，实际测试应该mock相关依赖

    # 由于我们没有直接的端点来触发配置错误，我们创建一个简单的函数测试
    error = ConfigurationError(
        message="Test configuration error",
        config_key="test_key"
    )

    assert error.error_code == ErrorCode.CONFIGURATION_ERROR
    assert error.status_code == 500
    assert error.message == "Test configuration error"
    assert error.details["config_key"] == "test_key"


def test_not_found_error():
    """测试未找到错误"""
    error = NotFoundError(resource="task", resource_id="123")

    assert error.error_code == ErrorCode.NOT_FOUND
    assert error.status_code == 404
    assert "task not found: 123" in error.message


def test_file_processing_error():
    """测试文件处理错误"""
    error = FileProcessingError(
        message="Invalid file format",
        filename="test.pdf",
        details={"expected": "txt", "actual": "pdf"}
    )

    assert error.error_code == ErrorCode.FILE_PROCESSING_ERROR
    assert error.status_code == 400
    assert error.details["filename"] == "test.pdf"
    assert error.details["expected"] == "txt"


def test_validation_error():
    """测试验证错误"""
    error = ValidationError(
        message="Invalid input data",
        details={"field": "topic", "value": "", "reason": "cannot be empty"}
    )

    assert error.error_code == ErrorCode.VALIDATION_ERROR
    assert error.status_code == 400
    assert "Invalid input data" in error.message


def test_error_inheritance():
    """测试错误继承关系"""
    from app.exceptions import AppException

    # 所有自定义异常都继承自AppException
    assert isinstance(ConfigurationError("test"), AppException)
    assert isinstance(NotFoundError("test"), AppException)
    assert isinstance(FileProcessingError("test"), AppException)
    assert isinstance(ValidationError("test"), AppException)


def test_error_codes_unique():
    """测试错误代码唯一性"""
    codes = [e.value for e in ErrorCode]
    assert len(codes) == len(set(codes)), "Error codes must be unique"