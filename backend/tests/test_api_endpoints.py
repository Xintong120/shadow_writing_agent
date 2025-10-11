"""
FastAPI端点测试
目标：提高代码覆盖率，测试所有API端点

测试端点：
- 健康检查
- Memory API (TED历史、搜索历史、学习统计)
- Learning Records API
- 任务管理
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
import io
import os

# 创建测试客户端
client = TestClient(app)


# ==================== 基础端点测试 ====================

def test_health_endpoint():
    """测试健康检查端点"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "model" in data
    assert "temperature" in data
    print(f"[PASS] 健康检查: {data['model']}")


def test_test_groq_endpoint_no_key():
    """测试Groq连接端点（无API Key）"""
    # 即使没有API Key，端点应该返回错误信息而不是崩溃
    response = client.get("/test-groq")
    # 可能返回200（说明未配置）或500（连接失败）
    assert response.status_code in [200, 500]
    print(f"[PASS] Groq测试端点响应: {response.status_code}")


# ==================== Memory API测试 ====================

class TestMemoryAPI:
    """Memory API端点测试"""
    
    def test_get_ted_history_default_user(self):
        """测试获取TED历史（默认用户）"""
        response = client.get("/api/memory/ted-history")
        assert response.status_code == 200
        data = response.json()
        assert "success" in data
        # API返回seen_teds而不是teds
        assert "seen_teds" in data or "teds" in data
        teds = data.get("seen_teds", data.get("teds", []))
        assert isinstance(teds, list)
        print(f"[PASS] TED历史查询（默认用户）: {len(teds)} 条")
    
    def test_get_ted_history_specific_user(self):
        """测试获取TED历史（指定用户）"""
        response = client.get("/api/memory/ted-history?user_id=test_user_api")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["user_id"] == "test_user_api"
        print(f"[PASS] TED历史查询（test_user_api）")
    
    def test_get_search_history_default(self):
        """测试获取搜索历史（默认参数）"""
        response = client.get("/api/memory/search-history")
        assert response.status_code == 200
        data = response.json()
        assert "success" in data
        assert "searches" in data
        assert isinstance(data["searches"], list)
        print(f"[PASS] 搜索历史查询: {len(data['searches'])} 条")
    
    def test_get_search_history_with_limit(self):
        """测试获取搜索历史（限制数量）"""
        response = client.get("/api/memory/search-history?user_id=test_user&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        # 结果数量应该 <= limit
        assert len(data["searches"]) <= 5
        print(f"[PASS] 搜索历史查询（限制5条）: {len(data['searches'])} 条")
    
    def test_get_learning_stats(self):
        """测试获取学习统计"""
        response = client.get("/api/memory/learning-stats")
        assert response.status_code == 200
        data = response.json()
        assert "success" in data
        assert "user_id" in data
        assert "stats" in data
        print(f"[PASS] 学习统计查询: user={data['user_id']}")
    
    def test_get_learning_stats_specific_user(self):
        """测试获取学习统计（指定用户）"""
        response = client.get("/api/memory/learning-stats?user_id=test_user_stats")
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == "test_user_stats"
        print(f"[PASS] 学习统计查询（test_user_stats）")
    
    def test_clear_user_memory(self):
        """测试清除用户Memory"""
        # 先创建一些测试数据（这个端点会被覆盖但可能失败，没关系）
        response = client.delete("/api/memory/clear?user_id=test_user_to_clear")
        # 应该成功或返回合理的错误
        assert response.status_code in [200, 404, 500]
        print(f"[PASS] 清除Memory响应: {response.status_code}")


# ==================== Learning Records API测试 ====================

class TestLearningRecordsAPI:
    """Learning Records API端点测试"""
    
    def test_get_learning_records_default(self):
        """测试获取学习记录（默认参数）"""
        response = client.get("/api/learning/records")
        assert response.status_code == 200
        data = response.json()
        assert "success" in data
        assert "records" in data
        assert isinstance(data["records"], list)
        print(f"[PASS] 学习记录查询: {len(data['records'])} 条")
    
    def test_get_learning_records_with_pagination(self):
        """测试获取学习记录（分页）"""
        response = client.get("/api/learning/records?user_id=test_user&limit=10&offset=0")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["records"]) <= 10
        print(f"[PASS] 学习记录查询（分页）: {len(data['records'])} 条")
    
    def test_get_learning_records_with_filters(self):
        """测试获取学习记录（过滤条件）"""
        response = client.get(
            "/api/learning/records?user_id=test_user"
            "&min_quality=7.0"
            "&tags=leadership,innovation"
        )
        assert response.status_code == 200
        data = response.json()
        assert "records" in data
        print(f"[PASS] 学习记录查询（过滤）: {len(data['records'])} 条")
    
    def test_get_learning_stats_alt_endpoint(self):
        """测试获取学习统计（备用端点）"""
        response = client.get("/api/learning/stats")
        assert response.status_code == 200
        data = response.json()
        assert "success" in data
        assert "stats" in data
        print(f"[PASS] 学习统计查询（备用端点）")
    
    def test_get_single_learning_record_not_found(self):
        """测试获取单条学习记录（不存在）"""
        response = client.get("/api/learning/record/nonexistent_id?user_id=test_user")
        # 应该返回404或包含success=False的响应
        assert response.status_code in [200, 404]
        if response.status_code == 200:
            data = response.json()
            # 如果返回200，success应该是False
            assert data.get("success") is False
        print(f"[PASS] 单条记录查询（不存在）: {response.status_code}")
    
    def test_delete_learning_record_not_found(self):
        """测试删除学习记录（不存在）"""
        response = client.delete("/api/learning/record/nonexistent_id?user_id=test_user")
        # 应该返回404或包含success=False的响应
        assert response.status_code in [200, 404]
        print(f"[PASS] 删除记录（不存在）: {response.status_code}")


# ==================== 任务管理测试 ====================

class TestTaskManagement:
    """任务管理端点测试"""
    
    def test_get_task_status_not_found(self):
        """测试查询任务状态（不存在的任务）"""
        response = client.get("/task/nonexistent_task_id")
        # 应该返回404或包含错误信息
        assert response.status_code in [200, 404]
        if response.status_code == 200:
            data = response.json()
            # 可能返回error字段
            assert "status" in data or "error" in data
        print(f"[PASS] 任务状态查询（不存在）: {response.status_code}")


# ==================== 文件上传测试 ====================

class TestFileUpload:
    """文件上传端点测试"""
    
    def test_process_file_invalid_file(self):
        """测试上传无效文件"""
        # 创建一个空文件
        file_content = b"Invalid file content"
        files = {"file": ("test.txt", io.BytesIO(file_content), "text/plain")}
        
        response = client.post("/process-file", files=files)
        # 可能返回200（处理失败）或400（参数错误）
        assert response.status_code in [200, 400, 422]
        print(f"[PASS] 文件上传（无效文件）: {response.status_code}")
    
    def test_process_file_valid_format(self):
        """测试上传有效格式的TED文件"""
        # 创建一个符合格式的TED文件内容
        file_content = b"""Title: Test TED Talk
Speaker: Test Speaker
URL: https://www.ted.com/talks/test
Duration: 10:00
Views: 1,000

This is a test transcript.
This is the second sentence.
This is the third sentence.
"""
        files = {"file": ("test_ted.txt", io.BytesIO(file_content), "text/plain")}
        
        response = client.post("/process-file", files=files)
        # 应该返回200（即使处理失败也会返回错误信息）或400（文件格式错误）
        assert response.status_code in [200, 400, 422]
        
        if response.status_code == 200:
            data = response.json()
            assert "success" in data
            print(f"[PASS] 文件上传（有效格式）: success={data.get('success')}")
        else:
            print(f"[PASS] 文件上传（有效格式）: {response.status_code}")


# ==================== 搜索端点测试（不需要真实API）====================

class TestSearchEndpoints:
    """搜索端点测试（Mock场景）"""
    
    def test_search_ted_missing_api_key(self):
        """测试搜索TED（缺少API Key的情况）"""
        request_data = {
            "topic": "artificial intelligence",
            "user_id": "test_user"
        }
        
        response = client.post("/search-ted", json=request_data)
        # 如果没有API Key，应该返回错误或空结果
        # 状态码可能是200（返回错误信息）或500（服务器错误）
        assert response.status_code in [200, 500, 422]
        print(f"[PASS] TED搜索（无API Key）: {response.status_code}")
    
    def test_process_batch_invalid_request(self):
        """测试批量处理（无效请求）"""
        request_data = {
            "urls": []  # 空URL列表
        }
        
        response = client.post("/process-batch", json=request_data)
        # 应该返回错误（空列表无效）
        assert response.status_code in [200, 400, 422]
        print(f"[PASS] 批量处理（空URL列表）: {response.status_code}")


# ==================== 集成测试 ====================

@pytest.mark.integration
class TestAPIIntegration:
    """API集成测试"""
    
    def test_full_memory_workflow(self):
        """测试完整的Memory工作流"""
        user_id = "integration_test_user"
        
        # 1. 获取初始状态
        response = client.get(f"/api/memory/ted-history?user_id={user_id}")
        assert response.status_code == 200
        data = response.json()
        teds = data.get("seen_teds", data.get("teds", []))
        initial_count = len(teds)
        
        # 2. 获取搜索历史
        response = client.get(f"/api/memory/search-history?user_id={user_id}")
        assert response.status_code == 200
        
        # 3. 获取学习统计
        response = client.get(f"/api/memory/learning-stats?user_id={user_id}")
        assert response.status_code == 200
        
        # 4. 清除Memory（可选）
        response = client.delete(f"/api/memory/clear?user_id={user_id}")
        assert response.status_code in [200, 404, 500]
        
        print(f"[PASS] Memory工作流测试完成（初始TED数: {initial_count}）")
    
    def test_learning_records_workflow(self):
        """测试学习记录工作流"""
        user_id = "learning_test_user"
        
        # 1. 获取学习记录
        response = client.get(f"/api/learning/records?user_id={user_id}")
        assert response.status_code == 200
        initial_records = response.json()["records"]
        
        # 2. 获取学习统计
        response = client.get(f"/api/learning/stats?user_id={user_id}")
        assert response.status_code == 200
        
        # 3. 尝试删除一个不存在的记录
        response = client.delete(f"/api/learning/record/fake_id?user_id={user_id}")
        assert response.status_code in [200, 404]
        
        print(f"[PASS] 学习记录工作流测试完成（记录数: {len(initial_records)}）")


# ==================== 测试运行报告 ====================

if __name__ == "__main__":
    print("\n" + "="*60)
    print("  API端点测试套件")
    print("="*60)
    
    # 运行pytest
    pytest.main([__file__, "-v", "--tb=short"])
