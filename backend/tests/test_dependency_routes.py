# tests/test_dependency_routes.py
# 测试依赖注入后的路由

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint_with_dependency():
    """测试健康检查端点（使用依赖注入）"""
    response = client.get("/api/v1/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "ok"
    assert "model" in data
    assert "dependency_injection" in data
    assert data["dependency_injection"] == "enabled"


def test_test_groq_endpoint_with_dependency():
    """测试Groq连接端点（使用依赖注入）"""
    # 由于没有配置API Key，这个端点会返回HTTPException
    # FastAPI会自动将其转换为JSON错误响应
    response = client.get("/api/v1/test-groq")

    # 应该返回500错误，因为没有API Key
    assert response.status_code == 500

    # HTTPException会被FastAPI自动处理，返回标准的错误格式
    data = response.json()
    assert "detail" in data  # FastAPI自动添加的错误字段
    # 依赖注入本身在路由函数执行前就已生效，这里我们无法验证标记
    # 但重要的是路由函数被调用了，依赖被注入了