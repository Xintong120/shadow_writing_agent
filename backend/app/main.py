# main.py
# 作用：FastAPI应用入口
# 功能：定义API路由、配置CORS、启动WebSocket端点、健康检查接口

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings, validate_config
from app.models import Ted_Shadows
from app.agent import process_ted_text
from app.ted_txt_parsers import parse_ted_file
from app.utils import initialize_key_manager  # 导入初始化函数
from typing import List, Dict, Any
import time
import os
import tempfile

# 创建FastAPI应用
app = FastAPI(
    title="TED Shadow Writing API",
    description="TED Shadow Writing API",
    version="1.0.0"
)

# 配置CORS（允许前端跨域访问）
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 启动时验证配置
@app.on_event("startup")
async def startup_event():
    validate_config()
    
    # 初始化 API Key 管理器
    initialize_key_manager(cooldown_seconds=60)
    
    print("✅ TED Agent API 启动成功！")
    print(f"📚 访问文档：http://localhost:8000/docs")

# 1. 健康检查接口
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "model": settings.model_name,
        "temperature": settings.temperature
    }

# 2. 文件上传处理接口
@app.post("/process-file")
async def process_file(file: UploadFile = File(...)):
    """
    上传TED txt文件并处理
    
    请求格式：
        - 文件类型：.txt
        - 文件格式：TED演讲文本（包含Title, Speaker, Transcript等字段）
    
    返回格式：
        {
            "success": true,
            "ted_info": {...},
            "results": [...],
            "result_count": 5,
            "processing_time": 12.34
        }
    """
    # 验证文件类型
    if not file.filename.endswith('.txt'):
        raise HTTPException(
            status_code=400,
            detail="只支持 .txt 文件格式"
        )
    
    # 记录处理时间
    start_time = time.time()
    
    try:
        # 1. 创建临时文件保存上传内容
        with tempfile.NamedTemporaryFile(mode='wb', delete=False, suffix='.txt') as temp_file:
            # 读取上传的文件内容
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        # 2. 调用 parse_ted_file() 解析文件
        ted_data = parse_ted_file(temp_file_path)
        
        # 3. 删除临时文件
        os.unlink(temp_file_path)
        
        # 4. 验证解析结果
        if not ted_data:
            raise HTTPException(
                status_code=400,
                detail="文件解析失败：请检查文件格式是否正确"
            )
        
        # 5. 提取 transcript
        transcript = ted_data.transcript
        
        if not transcript or len(transcript.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Transcript 内容太短，至少需要50个字符"
            )
        
        # 6. 调用 process_ted_text() 处理（传递 TED 元数据）
        result = process_ted_text(
            text=transcript,
            target_topic="",
            ted_title=ted_data.title,
            ted_speaker=ted_data.speaker,
            ted_url=ted_data.url
        )
        
        # 7. 添加 TED 元数据和处理时间
        result["ted_info"] = {
            "title": ted_data.title,
            "speaker": ted_data.speaker,
            "url": ted_data.url,
            "duration": ted_data.duration,
            "views": ted_data.views,
            "transcript_length": len(transcript)
        }
        result["processing_time"] = time.time() - start_time
        
        return result
        
    except HTTPException:
        # 重新抛出 HTTP 异常
        raise
    except Exception as e:
        # 捕获其他异常
        raise HTTPException(
            status_code=500,
            detail=f"处理文件时发生错误: {str(e)}"
        )

# 3. 测试Groq连接（可选）
@app.get("/test-groq")
def test_groq_connection():
    """测试Groq API连接"""
    if not settings.groq_api_key or settings.groq_api_key == "":
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY未配置"
        )
    
    return {
        "status": "configured",
        "model": settings.model_name,
        "api_key_length": len(settings.groq_api_key)
    }

# 运行方式：
# uvicorn app.main:app --reload --host 0.0.0.0 --port 8000