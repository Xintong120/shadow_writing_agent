# 测试指南

## 快速开始

### 1. 安装依赖

```bash
cd backend
pip install -r requirements-dev.txt
```

### 2. 运行所有测试

```bash
# 方式1：使用pytest（推荐）
pytest

# 方式2：使用运行脚本
python run_tests.py

# 方式3：详细输出
pytest -v
```

### 3. 查看覆盖率

```bash
# 生成HTML报告
pytest --cov=app --cov-report=html

# 打开报告（Windows）
start htmlcov/index.html

# 打开报告（Mac）
open htmlcov/index.html
```

---

## 测试命令速查

### 基本命令

```bash
# 运行所有测试
pytest

# 详细输出
pytest -v

# 显示print输出
pytest -s

# 运行特定文件
pytest tests/test_enums.py

# 运行特定测试类
pytest tests/test_enums.py::TestTaskStatus

# 运行特定测试函数
pytest tests/test_enums.py::TestTaskStatus::test_all_status_values
```

### 覆盖率命令

```bash
# 生成终端覆盖率报告
pytest --cov=app --cov-report=term

# 显示缺失的行号
pytest --cov=app --cov-report=term-missing

# 生成HTML报告
pytest --cov=app --cov-report=html

# 生成XML报告（CI使用）
pytest --cov=app --cov-report=xml

# 检查覆盖率阈值
pytest --cov=app --cov-fail-under=70
```

### 标记筛选

```bash
# 只运行单元测试
pytest -m unit

# 只运行集成测试
pytest -m integration

# 排除慢速测试
pytest -m "not slow"

# 只运行Memory测试
pytest -m memory
```

### 其他有用选项

```bash
# 失败时停止
pytest -x

# 并行运行（需要pytest-xdist）
pytest -n auto

# 显示最慢的10个测试
pytest --durations=10

# 只运行上次失败的测试
pytest --lf

# 运行上次失败的 + 新的测试
pytest --ff
```

---

## 测试文件组织

```
tests/
├── README_TESTING.md          # 本文件
├── conftest.py                # pytest fixtures（如果有）
├── test_enums.py              # 枚举测试
├── test_task_manager.py       # 任务管理器测试
├── test_websocket_manager.py  # WebSocket管理器测试
├── test_config.py             # 配置测试
├── test_memory.py             # Memory测试
├── test_learning_records.py   # 学习记录测试
├── test_batch_processing.py   # 批处理测试
├── test_communication_agent.py # 通信Agent测试
├── test_monitoring.py         # 监控测试
├── test_tools.py              # 工具测试
├── test_parser.py             # 解析器测试
├── test_llm_functions.py      # LLM函数测试
├── test_parallel.py           # 并行处理测试
└── test_health.py             # 健康检查测试
```

---

## 编写测试

### 测试模板

```python
# test_example.py
import pytest
from app.your_module import YourClass


class TestYourClass:
    """测试YourClass"""
    
    def setup_method(self):
        """每个测试前执行"""
        self.instance = YourClass()
    
    def test_basic_functionality(self):
        """测试基本功能"""
        result = self.instance.method()
        assert result == expected_value
    
    def test_edge_case(self):
        """测试边界情况"""
        with pytest.raises(ValueError):
            self.instance.method(invalid_input)
    
    @pytest.mark.asyncio
    async def test_async_method(self):
        """测试异步方法"""
        result = await self.instance.async_method()
        assert result is not None
```

### 测试最佳实践

#### 1. AAA模式：Arrange-Act-Assert

```python
def test_example():
    # Arrange: 准备测试数据
    manager = TaskManager()
    urls = ["url1", "url2"]
    
    # Act: 执行操作
    task_id = manager.create_task(urls, "user123")
    
    # Assert: 验证结果
    task = manager.get_task(task_id)
    assert task is not None
    assert task.total == 2
```

#### 2. 使用描述性的测试名称

```python
# ❌ 不好
def test_1():
    ...

# ✅ 好
def test_create_task_with_valid_urls():
    ...
```

#### 3. 一个测试只测试一件事

```python
# ❌ 不好
def test_everything():
    test_create()
    test_update()
    test_delete()

# ✅ 好
def test_create():
    ...

def test_update():
    ...

def test_delete():
    ...
```

#### 4. 测试边界和异常

```python
def test_empty_input():
    result = function("")
    assert result is None

def test_none_input():
    result = function(None)
    assert result is None

def test_invalid_input_raises_error():
    with pytest.raises(ValueError):
        function("invalid")
```

---

## Mock和Fixture

### 使用Mock

```python
from unittest.mock import Mock, patch, AsyncMock

def test_with_mock():
    # Mock对象
    mock_obj = Mock()
    mock_obj.method.return_value = 42
    
    assert mock_obj.method() == 42
    mock_obj.method.assert_called_once()

@patch('app.module.external_api')
def test_with_patch(mock_api):
    # patch外部依赖
    mock_api.return_value = {"status": "ok"}
    
    result = your_function_that_calls_api()
    assert result["status"] == "ok"

@pytest.mark.asyncio
async def test_async_with_mock():
    mock_ws = AsyncMock()
    await mock_ws.send_json({"test": "data"})
    mock_ws.send_json.assert_called_once()
```

### 使用Fixture

```python
# conftest.py
import pytest

@pytest.fixture
def sample_data():
    """提供测试数据"""
    return {
        "key1": "value1",
        "key2": "value2"
    }

@pytest.fixture
def task_manager():
    """提供TaskManager实例"""
    from app.task_manager import TaskManager
    return TaskManager()

# test_example.py
def test_with_fixture(sample_data):
    """使用fixture"""
    assert sample_data["key1"] == "value1"

def test_task_creation(task_manager):
    """使用TaskManager fixture"""
    task_id = task_manager.create_task(["url1"], "user")
    assert task_id is not None
```

---

## 覆盖率目标

### 模块覆盖率要求

- **核心模块**: ≥90%
  - enums.py
  - task_manager.py
  - websocket_manager.py
  
- **业务逻辑**: ≥80%
  - memory/
  - agents/
  - workflows.py
  
- **工具模块**: ≥70%
  - tools/
  - utils.py

### 查看覆盖率

```bash
# 终端查看
pytest --cov=app --cov-report=term-missing

# 输出示例：
# Name                          Stmts   Miss  Cover   Missing
# -----------------------------------------------------------
# app/enums.py                     50      0   100%
# app/task_manager.py             100      5    95%   23-27
# app/batch_processor.py          150     30    80%   45-50, 78-92
# -----------------------------------------------------------
# TOTAL                           500     80    84%
```

---

## CI/CD集成

### GitHub Actions自动运行

每次push时自动：
1. 运行所有测试
2. 检查覆盖率≥70%
3. 代码风格检查
4. 类型检查

### 本地模拟CI

```bash
# 完整CI检查
pytest --cov=app --cov-fail-under=70
ruff check app/ tests/
mypy app/ --ignore-missing-imports
```

---

## 常见问题

### Q: 测试运行很慢怎么办？

A: 使用并行运行
```bash
pip install pytest-xdist
pytest -n auto
```

### Q: 如何跳过某个测试？

A: 使用skip标记
```python
@pytest.mark.skip(reason="Not implemented yet")
def test_future_feature():
    pass
```

### Q: 如何标记慢速测试？

A: 使用自定义标记
```python
@pytest.mark.slow
def test_slow_operation():
    pass

# 运行时排除
pytest -m "not slow"
```

### Q: 如何测试异步函数？

A: 使用pytest-asyncio
```python
@pytest.mark.asyncio
async def test_async_function():
    result = await async_function()
    assert result is not None
```

---

## 参考资源

- [pytest 文档](https://docs.pytest.org/)
- [pytest-cov 文档](https://pytest-cov.readthedocs.io/)
- [unittest.mock 文档](https://docs.python.org/3/library/unittest.mock.html)
- [Coverage.py 文档](https://coverage.readthedocs.io/)

---

**Happy Testing! 🧪**
