# validation_agent.py
# 并行处理的Validation Agent

from typing import Dict, Any
from app.state import ChunkProcessState
from app.models import Ted_Shadows
from app.agents.base_agent import ChunkProcessingAgent, StateType


class ValidationChunkAgent(ChunkProcessingAgent):
    """验证单个Chunk的Shadow结果"""

    def process(self, state: StateType) -> Dict[str, Any]:
        """验证单个Chunk的Shadow结果（并行版本）"""
        chunk_id = state.get("chunk_id", 0)
        raw_shadow = state.get("raw_shadow")

        print(f"[Pipeline {chunk_id}] Validation...")

        if not raw_shadow:
            return {"validated_shadow": None}

        try:
            # 检查必要字段
            if all(raw_shadow.get(key) for key in ['original', 'imitation', 'map']):
                # Pydantic BaseModel验证
                shadow_result = Ted_Shadows(
                    original=raw_shadow['original'],
                    imitation=raw_shadow['imitation'],
                    map=raw_shadow['map'],
                    paragraph=raw_shadow.get('paragraph', ''),
                    quality_score=6.0
                )
                print(f"[Pipeline {chunk_id}] [OK] Validation通过")
                return {"validated_shadow": shadow_result}
            else:
                print(f"[Pipeline {chunk_id}] [ERROR] Validation失败: 缺少必要字段")
                return {"validated_shadow": None, "error": "Missing required fields"}
        except Exception as e:
            print(f"[Pipeline {chunk_id}] [ERROR] Validation失败: {e}")
            return {"validated_shadow": None, "error": str(e)}


# 向后兼容性：保留原函数接口
def validation_single_chunk(state: ChunkProcessState) -> dict:
    """向后兼容性函数"""
    agent = ValidationChunkAgent()
    return agent(state)
