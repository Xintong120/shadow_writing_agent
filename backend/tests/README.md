# TED-Agent 测试文件

## 测试文件说明

### 1. `test_health.py` - 健康检查测试
测试 FastAPI 服务是否正常运行

**运行方式：**
```bash
cd backend
python tests/test_health.py
```

**预期输出：**
```
[SUCCESS] 服务运行正常
配置信息:
  状态: ok
  模型: llama-3.1-8b-instant
  温度: 0.1
```

---

### 2. `test_parser.py` - 文件解析器测试
测试 TED txt 文件解析功能

**运行方式：**
```bash
cd backend
python tests/test_parser.py
```

**测试内容：**
- 验证文件格式
- 解析文件内容
- 数据完整性检查

---

### 3. `test_upload.py` - 文件上传测试
测试完整的文件上传和处理流程

**运行方式：**
```bash
cd backend
python tests/test_upload.py
```

**测试流程：**
1. 上传 TED txt 文件
2. 解析文件
3. 执行 Shadow Writing 工作流
4. 返回处理结果

**注意：** 此测试需要 Groq API Key，处理时间较长（可能需要几分钟）

---

## 快速测试所有接口

```bash
# 1. 启动服务
cd backend
python -m uvicorn app.main:app --reload

# 2. 新开终端，运行测试
python tests/test_health.py
python tests/test_parser.py
python tests/test_upload.py
```

---

## 测试文件路径

测试使用的 TED 文件：
```
d:\转码\AI-all\English_news_Agent\data\How to spot fake AI photos.txt
```

如需使用其他文件，请修改测试脚本中的 `test_file_path` 变量。
