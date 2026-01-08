# services/ted_search_service.py
# TEDSearchService - 专门负责TED搜索相关的所有逻辑

from typing import Callable, Optional, List
from app.workflows import create_search_workflow
from app.models import TEDCandidate, SearchResponse
from app.memory.service import MemoryService


class TEDSearchService:
    """TED搜索服务 - 专注TED搜索业务逻辑"""

    def __init__(self, llm: Callable, memory_service: MemoryService):
        """初始化TED搜索服务

        Args:
            llm: LLM调用函数
            memory_service: 记忆服务实例
        """
        self.llm = llm
        self.memory_service = memory_service

    async def search_talks(self, topic: str, user_id: Optional[str] = None) -> SearchResponse:
        """搜索TED演讲

        Args:
            topic: 搜索主题
            user_id: 用户ID（可选）

        Returns:
            SearchResponse: 搜索结果响应
        """
        try:
            print(f"\n[TEDSearchService] 搜索TED演讲: {topic}")

            # 使用Communication Agent搜索
            workflow = create_search_workflow()

            # 初始状态 - 与原有routers/core.py中的逻辑保持一致
            initial_state = {
                "topic": topic,
                "user_id": user_id,
                "ted_candidates": [],
                "selected_ted_url": None,
                "awaiting_user_selection": False,
                "search_context": {},
                "file_path": None,
                "text": "",
                "target_topic": "",
                "ted_title": None,
                "ted_speaker": None,
                "ted_url": None,
                "semantic_chunks": [],
                "raw_shadows_chunks": [],
                "validated_shadow_chunks": [],
                "quality_shadow_chunks": [],
                "failed_quality_chunks": [],
                "corrected_shadow_chunks": [],
                "final_shadow_chunks": [],
                "current_node": "",
                "processing_logs": [],
                "errors": [],
                "error_message": None
            }

            # 运行工作流
            result = workflow.invoke(initial_state)

            # 提取候选列表
            candidates_raw = result.get("ted_candidates", [])
            search_context = result.get("search_context", {})

            # 转换为TEDCandidate格式
            candidates = []
            for c in candidates_raw:
                try:
                    candidates.append(TEDCandidate(
                        title=c.get("title", ""),
                        speaker=c.get("speaker", "Unknown"),
                        url=c.get("url", ""),
                        duration=c.get("duration", ""),
                        views=c.get("views"),
                        description=c.get("description", ""),
                        relevance_score=c.get("score", 0.0)
                    ))
                except Exception as e:
                    print(f"[WARNING] 候选转换失败: {e}")
                    continue

            print(f"[TEDSearchService] 找到 {len(candidates)} 个候选")

            # 记录搜索历史
            if user_id:
                self.memory_service.add_search_history(
                    user_id=user_id,
                    original_query=topic,
                    optimized_query=search_context.get("optimized_query", topic),
                    alternative_queries=search_context.get("alternative_queries", []),
                    results_count=len(candidates),
                    selected_url=None,  # 搜索阶段还没有选择
                    selected_title=None,
                    new_results=len(candidates),
                    filtered_seen=0,  # 这里可以计算被过滤的已观看TED数量
                    search_duration_ms=int(search_context.get("search_duration_ms", 0))
                )

            return SearchResponse(
                success=True,
                candidates=candidates,
                search_context=search_context,
                total=len(candidates)
            )

        except Exception as e:
            print(f"[TEDSearchService] 搜索失败: {e}")
            return SearchResponse(
                success=False,
                candidates=[],
                search_context={"error": str(e)},
                total=0
            )

    def _calculate_filtered_seen_count(self, all_candidates: List[dict], user_id: str) -> int:
        """计算被过滤掉的已观看TED数量

        Args:
            all_candidates: 所有候选结果
            user_id: 用户ID

        Returns:
            int: 被过滤的数量
        """
        if not user_id:
            return 0

        seen_urls = self.memory_service.get_seen_ted_urls(user_id)
        filtered_count = 0

        for candidate in all_candidates:
            if candidate.get("url") in seen_urls:
                filtered_count += 1

        return filtered_count