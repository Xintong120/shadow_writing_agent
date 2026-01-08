# services/ted_processing_service.py
# TEDProcessingService - 专门负责TED文件的解析和AI处理

import time
import os
import tempfile
from typing import Callable, Dict, Any
from fastapi import UploadFile, HTTPException
from app.agent import process_ted_text
from app.tools.ted_txt_parsers import parse_ted_file


class TEDProcessingService:
    """TED文件处理服务 - 专注文件解析和AI处理业务逻辑"""

    def __init__(self, llm: Callable, memory_service):
        """初始化TED处理服务

        Args:
            llm: LLM调用函数
            memory_service: 记忆服务实例
        """
        self.llm = llm
        self.memory_service = memory_service

    async def process_single_file(self, file: UploadFile) -> Dict[str, Any]:
        """处理单个TED文件

        Args:
            file: 上传的TED文件

        Returns:
            dict: 处理结果，包含success, ted_info, results等

        Raises:
            HTTPException: 文件处理失败时抛出
        """
        # 验证文件类型
        if not file.filename or not file.filename.endswith('.txt'):
            raise HTTPException(
                status_code=400,
                detail="只支持 .txt 文件格式"
            )

        # 记录处理时间
        start_time = time.time()

        try:
            # 1. 创建临时文件保存上传内容
            with tempfile.NamedTemporaryFile(mode='wb', delete=False, suffix='.txt') as temp_file:
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

            # 6. 调用 process_ted_text() 处理（传递 TED 元数据和注入的LLM）
            result = process_ted_text(
                text=transcript,
                llm=self.llm,  # 传递注入的LLM
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

            # 8. 可选：将结果保存到记忆服务（这里暂时跳过，保持测试简单）
            # TODO: 根据需要实现TED处理结果的保存逻辑
            pass

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