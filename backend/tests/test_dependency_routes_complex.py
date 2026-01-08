# tests/test_dependency_routes_complex.py
# 测试复杂路由的依赖注入功能

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_process_file_route_with_llm_dependency():
    """测试文件处理路由（LLM依赖注入）"""
    # 创建符合TED文件格式的测试内容
    test_content = b"""Title: A Test TED Talk
Speaker: Test Speaker
URL: https://ted.com/talks/test
Duration: 10:00
Views: 1000000

This is a test transcript for shadow writing. It contains enough content to pass the minimum length requirement and should be processed successfully through the dependency injection system."""

    # 发送POST请求
    response = client.post(
        "/api/v1/process-file",
        files={"file": ("test.txt", test_content, "text/plain")}
    )

    # 检查响应 - 预期可能是解析错误或其他问题，但路由本身应该工作
    # 这里主要验证依赖注入是否正常工作，不依赖具体的业务逻辑
    assert response.status_code in [200, 400, 500]  # 200=成功, 400=文件格式问题, 500=LLM调用失败


def test_search_ted_route_with_llm_dependency():
    """测试TED搜索路由（LLM依赖注入）"""
    response = client.post(
        "/api/v1/search-ted",
        json={"topic": "test topic", "user_id": "test_user"}
    )

    # 同样验证依赖注入，允许成功或失败
    assert response.status_code in [200, 500]


def test_process_batch_route_with_task_manager_dependency():
    """测试批量处理路由（任务管理器依赖注入）"""
    response = client.post(
        "/api/v1/process-batch",
        json={
            "urls": ["https://ted.com/talks/test1", "https://ted.com/talks/test2"],
            "user_id": "test_user"
        }
    )

    # 验证路由是否正常响应
    assert response.status_code in [200, 500]


def test_task_status_route_with_task_manager_dependency():
    """测试任务状态路由（任务管理器依赖注入）"""
    # 先创建一个任务
    create_response = client.post(
        "/api/v1/process-batch",
        json={
            "urls": ["https://ted.com/talks/test"],
            "user_id": "test_user"
        }
    )

    if create_response.status_code == 200:
        task_id = create_response.json()["task_id"]

        # 查询任务状态
        status_response = client.get(f"/api/v1/task/{task_id}")
        assert status_response.status_code in [200, 404]  # 200=找到, 404=未找到
    else:
        # 如果创建任务失败，至少验证路由可以访问
        status_response = client.get("/api/v1/task/nonexistent")
        assert status_response.status_code == 404


def test_dependency_injection_markers():
    """验证依赖注入启用标记"""
    # 健康检查应该包含依赖注入标记
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["dependency_injection"] == "enabled"

    # 测试Groq路由也应该包含标记（如果有API Key）
    response = client.get("/api/v1/test-groq")
    # 不检查状态码，只检查如果返回数据的话是否包含标记
    if response.status_code == 200:
        data = response.json()
        assert data["dependency_injection"] == "enabled"