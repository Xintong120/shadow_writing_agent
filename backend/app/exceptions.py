# exceptions.py
# 统一异常处理系统
# 定义应用级别的自定义异常和错误处理器

from typing import Dict, Any, Optional
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class ErrorCode(str, Enum):
    """错误代码枚举"""
    # 通用错误
    INTERNAL_ERROR = "INTERNAL_ERROR"
    VALIDATION_ERROR = "VALIDATION_ERROR"
    NOT_FOUND = "NOT_FOUND"
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"

    # 业务特定错误
    FILE_PROCESSING_ERROR = "FILE_PROCESSING_ERROR"
    LLM_ERROR = "LLM_ERROR"
    SEARCH_ERROR = "SEARCH_ERROR"
    TASK_ERROR = "TASK_ERROR"
    CONFIGURATION_ERROR = "CONFIGURATION_ERROR"

    # 外部服务错误
    API_KEY_ERROR = "API_KEY_ERROR"
    NETWORK_ERROR = "NETWORK_ERROR"
    RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR"


class AppException(Exception):
    """应用级别的自定义异常基类"""

    def __init__(
        self,
        message: str,
        error_code: ErrorCode,
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(AppException):
    """验证错误"""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_code=ErrorCode.VALIDATION_ERROR,
            status_code=400,
            details=details
        )


class NotFoundError(AppException):
    """资源未找到错误"""

    def __init__(self, resource: str, resource_id: Optional[str] = None):
        message = f"{resource} not found"
        if resource_id:
            message += f": {resource_id}"

        super().__init__(
            message=message,
            error_code=ErrorCode.NOT_FOUND,
            status_code=404,
            details={"resource": resource, "resource_id": resource_id}
        )


class ConfigurationError(AppException):
    """配置错误"""

    def __init__(self, message: str, config_key: Optional[str] = None):
        super().__init__(
            message=message,
            error_code=ErrorCode.CONFIGURATION_ERROR,
            status_code=500,
            details={"config_key": config_key}
        )


class LLMError(AppException):
    """LLM相关错误"""

    def __init__(self, message: str, provider: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_code=ErrorCode.LLM_ERROR,
            status_code=502,
            details={"provider": provider, **(details or {})}
        )


class APIKeyError(AppException):
    """API Key相关错误"""

    def __init__(self, message: str, provider: Optional[str] = None):
        super().__init__(
            message=message,
            error_code=ErrorCode.API_KEY_ERROR,
            status_code=500,
            details={"provider": provider}
        )


class FileProcessingError(AppException):
    """文件处理错误"""

    def __init__(self, message: str, filename: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_code=ErrorCode.FILE_PROCESSING_ERROR,
            status_code=400,
            details={"filename": filename, **(details or {})}
        )


def create_error_response(
    status_code: int,
    error_code: ErrorCode,
    message: str,
    details: Optional[Dict[str, Any]] = None,
    request_id: Optional[str] = None
) -> Dict[str, Any]:
    """创建统一的错误响应格式"""
    return {
        "error": {
            "code": error_code,
            "message": message,
            "details": details or {},
            "request_id": request_id
        },
        "success": False,
        "timestamp": None  # 会在中间件中填充
    }


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """处理应用自定义异常"""
    # 记录错误日志
    logger.error(
        f"AppException: {exc.error_code} - {exc.message}",
        extra={
            "error_code": exc.error_code,
            "status_code": exc.status_code,
            "details": exc.details,
            "path": request.url.path,
            "method": request.method
        }
    )

    error_response = create_error_response(
        status_code=exc.status_code,
        error_code=exc.error_code,
        message=exc.message,
        details=exc.details,
        request_id=getattr(request.state, 'request_id', None)
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=error_response
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """处理FastAPI HTTPException，转换为统一格式"""
    # 记录错误日志
    logger.error(
        f"HTTPException: {exc.status_code} - {exc.detail}",
        extra={
            "status_code": exc.status_code,
            "detail": exc.detail,
            "path": request.url.path,
            "method": request.method
        }
    )

    # 尝试从detail中提取错误代码，如果没有则使用通用错误代码
    error_code = ErrorCode.INTERNAL_ERROR
    if exc.status_code == 400:
        error_code = ErrorCode.VALIDATION_ERROR
    elif exc.status_code == 404:
        error_code = ErrorCode.NOT_FOUND
    elif exc.status_code == 401:
        error_code = ErrorCode.UNAUTHORIZED
    elif exc.status_code == 403:
        error_code = ErrorCode.FORBIDDEN

    error_response = create_error_response(
        status_code=exc.status_code,
        error_code=error_code,
        message=exc.detail,
        request_id=getattr(request.state, 'request_id', None)
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=error_response
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """处理未捕获的异常"""
    # 记录错误日志
    logger.error(
        f"Unhandled exception: {type(exc).__name__}: {str(exc)}",
        exc_info=True,
        extra={
            "exception_type": type(exc).__name__,
            "path": request.url.path,
            "method": request.method
        }
    )

    error_response = create_error_response(
        status_code=500,
        error_code=ErrorCode.INTERNAL_ERROR,
        message="An unexpected error occurred",
        details={"exception_type": type(exc).__name__} if not isinstance(exc, (ValueError, TypeError)) else None,
        request_id=getattr(request.state, 'request_id', None)
    )

    return JSONResponse(
        status_code=500,
        content=error_response
    )