# FastAPI路由设计思维导图

## 🎯 核心设计模式

### 1. 先定义Pydantic模型
```
Pydantic模型层
├── BaseModel 用于请求体验证
│   ├── 自动数据验证
│   ├── 类型转换
│   └── 字段约束
├── ResponseModel 用于响应格式定义
│   ├── 自动生成API文档
│   ├── 类型安全
│   └── 序列化控制
└── 优势
    ├── 自动生成API文档
    └── 数据验证与序列化
```

### 2. 然后定义路由函数
```
路由函数层
├── 装饰器定义
│   ├── @router.get()
│   ├── @router.post()
│   ├── @router.put()
│   ├── @router.delete()
│   └── @router.patch()
├── 函数参数类型
│   ├── 路径参数 (path parameters)
│   ├── 查询参数 (query parameters)
│   ├── 请求体 (request body)
│   ├── 表单数据 (form data)
│   └── 文件上传 (file uploads)
└── FastAPI特性
    └── 自动解析和验证
```

### 3. 函数内部异常处理
```
异常处理层
├── try-except 块
│   ├── 业务逻辑错误处理
│   ├── 数据验证错误
│   └── 第三方服务错误
├── HTTPException 抛出
│   ├── 标准HTTP状态码
│   ├── 自定义错误信息
│   └── 结构化错误响应
└── 日志记录
    ├── 错误追踪
    └── 调试信息
```

## 📋 标准实现流程

### 第一步：定义请求/响应模型
```python
# 请求模型
class ConfigUpdateRequest(BaseModel):
    groq_api_keys: Optional[List[str]] = None
    tavily_api_key: Optional[str] = None
    model_name: Optional[str] = None
    temperature: Optional[float] = None
    enable_key_rotation: Optional[bool] = None

# 响应模型
class ConfigUpdateResponse(BaseModel):
    success: bool
    message: str
    config: Dict[str, Any]
```

### 第二步：定义路由函数
```python
@router.put("/")
async def update_config(request: ConfigUpdateRequest):
    # 使用类型注解，FastAPI自动解析request参数
    pass
```

### 第三步：函数内部包含try-except
```python
@router.put("/")
async def update_config(request: ConfigUpdateRequest):
    try:
        # 业务逻辑处理
        updated_config = process_config_update(request)
        return ConfigUpdateResponse(
            success=True,
            message="配置已更新",
            config=updated_config
        )
    except ValueError as e:
        # 业务逻辑错误
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # 系统错误
        raise HTTPException(status_code=500, detail=f"配置更新失败: {str(e)}")
```

## 🏗️ 架构优势

### 类型安全
- **编译时检查**：IDE提供类型提示和错误检查
- **运行时验证**：Pydantic自动验证请求数据
- **API文档**：自动生成OpenAPI/Swagger文档

### 错误处理统一
- **标准化错误响应**：使用HTTPException统一错误格式
- **异常分类**：区分业务错误和系统错误
- **日志记录**：集中式错误追踪和监控

### 代码组织
- **关注点分离**：模型定义、业务逻辑、错误处理分离
- **可维护性**：清晰的代码结构便于维护和扩展
- **可重用性**：模型可以在多个路由中复用

## 📚 最佳实践

### 模型设计
- 使用有意义的字段名称
- 添加适当的验证约束
- 为可选字段使用 `Optional` 类型
- 使用描述性文档字符串

### 路由设计
- 使用RESTful命名约定
- 合理使用HTTP方法
- 添加适当的状态码
- 提供清晰的错误信息

### 错误处理
- 不要暴露内部实现细节
- 使用适当的HTTP状态码
- 记录详细的错误日志
- 提供用户友好的错误信息

## 🔄 实际应用示例

基于项目中的 `config.py` 路由：

```
config.py 结构
├── 导入和全局变量
├── Pydantic模型定义 (5个模型)
├── 路由函数定义 (6个路由)
│   ├── @router.get("/") - 获取配置
│   ├── @router.put("/") - 更新配置
│   ├── @router.get("/key-rotation") - 获取Key轮换状态
│   ├── @router.post("/key-rotation/toggle") - 开关轮换
│   ├── @router.post("/key-rotation/reset") - 重置轮换
│   └── @router.get("/models") - 获取可用模型
└── 辅助函数
    └── save_config_to_env_file() - 保存到环境文件
```

这个设计模式确保了代码的**类型安全**、**可维护性**和**扩展性**。