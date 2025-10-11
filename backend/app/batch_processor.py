# batch_processor.py
# 作用：批量处理多个TED URLs的核心逻辑

from typing import List
from app.task_manager import task_manager
from app.websocket_manager import ws_manager
from app.tools.ted_transcript_tool import extract_ted_transcript
from app.workflows import create_parallel_shadow_writing_workflow
from app.enums import TaskStatus, MessageType, ProcessingStep


async def process_urls_batch(task_id: str, urls: List[str]):
    """
    批量异步处理多个TED URLs
    
    流程：
    1. 遍历每个URL
    2. 提取transcript
    3. 运行Shadow Writing工作流
    4. 实时推送进度
    5. 收集结果
    
    Args:
        task_id: 任务ID
        urls: TED URL列表
    """
    total = len(urls)
    task_manager.update_status(task_id, TaskStatus.PROCESSING)
    
    print(f"\n[BATCH PROCESSOR] 开始处理 {total} 个URLs")
    
    # 发送开始消息
    await ws_manager.broadcast_progress(
        task_id,
        MessageType.STARTED,
        {
            "total": total,
            "message": f"开始处理 {total} 个TED演讲"
        }
    )
    
    # 创建Shadow Writing工作流（并行版本）
    workflow = create_parallel_shadow_writing_workflow()
    # workflow = create_shadow_writing_workflow()  # 旧版串行（已弃用）
    
    # 遍历处理每个URL
    for idx, url in enumerate(urls, 1):
        try:
            print(f"\n[BATCH PROCESSOR] 处理 [{idx}/{total}]: {url}")
            
            # 更新进度
            task_manager.update_progress(task_id, idx, url)
            await ws_manager.broadcast_progress(
                task_id,
                MessageType.PROGRESS,
                {
                    "current": idx,
                    "total": total,
                    "url": url,
                    "status": f"Processing {idx}/{total}"
                }
            )
            
            # ========== 步骤1: 提取Transcript ==========
            await ws_manager.broadcast_progress(
                task_id,
                MessageType.STEP,
                {
                    "current": idx,
                    "total": total,
                    "step": ProcessingStep.EXTRACTING_TRANSCRIPT.value,
                    "url": url,
                    "message": f"正在提取字幕 ({idx}/{total})"
                }
            )
            
            transcript_data = extract_ted_transcript(url)
            
            if not transcript_data or not transcript_data.transcript:
                raise Exception("Failed to extract transcript")
            
            print(f"   提取字幕成功: {len(transcript_data.transcript)} 字符")
            
            # ========== 步骤2: 运行Shadow Writing工作流 ==========
            await ws_manager.broadcast_progress(
                task_id,
                MessageType.STEP,
                {
                    "current": idx,
                    "total": total,
                    "step": ProcessingStep.SHADOW_WRITING.value,
                    "url": url,
                    "message": f"正在生成Shadow Writing ({idx}/{total})"
                }
            )
            
            # 准备工作流初始状态（并行版本简化）
            initial_state = {
                "text": transcript_data.transcript,
                "target_topic": "",
                "ted_title": transcript_data.title,
                "ted_speaker": transcript_data.speaker,
                "ted_url": url,
                "semantic_chunks": [],
                "final_shadow_chunks": [],  # 并行版本：operator.add自动汇总
                "current_node": "",
                "error_message": None
            }
            
            # 运行并行工作流
            print("   启动并行Shadow Writing工作流...")
            result = workflow.invoke(initial_state)
            
            # 提取最终结果
            final_chunks = result.get("final_shadow_chunks", [])
            
            # 处理返回值：可能是字典列表或对象列表
            processed_results = []
            for item in final_chunks:
                if isinstance(item, dict):
                    processed_results.append(item)
                elif hasattr(item, 'dict'):
                    processed_results.append(item.dict())
                elif hasattr(item, 'model_dump'):
                    processed_results.append(item.model_dump())
                else:
                    processed_results.append(str(item))
            
            print(f"   Shadow Writing完成: {len(processed_results)} 个结果")
            
            # ========== 步骤3: 保存结果 ==========
            result_data = {
                "url": url,
                "ted_info": {
                    "title": transcript_data.title,
                    "speaker": transcript_data.speaker,
                    "url": url,
                    "transcript_length": len(transcript_data.transcript)
                },
                "results": processed_results,
                "result_count": len(processed_results)
            }
            
            task_manager.add_result(task_id, result_data)
            
            # ========== 步骤4: 推送完成消息 ==========
            await ws_manager.broadcast_progress(
                task_id,
                MessageType.URL_COMPLETED,
                {
                    "current": idx,
                    "total": total,
                    "url": url,
                    "result_count": len(processed_results),
                    "message": f"完成 ({idx}/{total}): 生成 {len(processed_results)} 个结果"
                }
            )
            
        except Exception as e:
            error_msg = f"Error processing {url}: {str(e)}"
            print(f"   [ERROR] {error_msg}")
            
            task_manager.add_error(task_id, error_msg)
            
            await ws_manager.broadcast_progress(
                task_id,
                MessageType.ERROR,
                {
                    "current": idx,
                    "total": total,
                    "url": url,
                    "error": error_msg
                }
            )
    
    # ========== 全部完成 ==========
    task_manager.complete_task(task_id)
    
    task = task_manager.get_task(task_id)
    
    await ws_manager.broadcast_progress(
        task_id,
        MessageType.COMPLETED,
        {
            "total": total,
            "successful": len(task.results),
            "failed": len(task.errors),
            "message": f"全部完成: 成功 {len(task.results)}/{total}"
        }
    )
    
    print(f"\n[BATCH PROCESSOR] 批量处理完成: 成功 {len(task.results)}/{total}")
