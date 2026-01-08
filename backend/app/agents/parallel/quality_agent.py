# quality_agent.py
# 并行处理的Quality Check Agent

from typing import Dict, Any
from app.state import ChunkProcessState
from app.utils import ensure_dependencies, create_llm_function_native
from app.agents.base_agent import ChunkProcessingAgent, StateType


class QualityChunkAgent(ChunkProcessingAgent):
    """质量评估单个Chunk"""

    def process(self, state: StateType) -> Dict[str, Any]:
        """质量评估单个Chunk（并行版本）"""
        chunk_id = state.get("chunk_id", 0)
        validated = state.get("validated_shadow")

        print(f"[Pipeline {chunk_id}] Quality Check...")

        if not validated:
            return {"quality_passed": False, "quality_score": 0.0}

        try:
            ensure_dependencies()
            llm_function = create_llm_function_native()

            # 获取验证通过的Shadow数据
            original = validated.original
            imitation = validated.imitation
            word_map = validated.map
            paragraph = validated.paragraph

            # 使用与原版完全相同的quality_prompt（简化版本，生产环境应使用完整版本）
            quality_prompt = f"""
            You are a Shadow Writing Quality Evaluator. You understand that Shadow Writing is NOT template filling, but learning sentence craftsmanship by "standing in the author's shadow."

            ORIGINAL SENTENCE: "{original}"
            MIGRATED SENTENCE: "{imitation}"
            WORD MAPPING: {word_map}
            SOURCE PARAGRAPH: "{paragraph[:200]}..."

            Evaluate this Shadow Writing attempt. Check if:
            1. Grammar structure is preserved
            2. Content words are appropriately replaced
            3. Logic makes sense
            4. Topic migration is successful

            Provide evaluation in JSON format:
            {{
              "pass": <true/false>,
              "score": <0-11>,
              "reasoning": "<brief explanation>"
            }}
            """

            evaluation_format = {
                "pass": "true if quality is good, bool",
                "score": "score out of 11, int",
                "reasoning": "brief explanation, str"
            }

            result = llm_function(quality_prompt, evaluation_format)

            if result and isinstance(result, dict):
                passed = result.get('pass', False)
                score = float(result.get('score', 0.0))
                reasoning = result.get('reasoning', '')

                status = "[OK]" if passed else "[ERROR]"
                print(f"[Pipeline {chunk_id}] {status} Quality: {score}/11")
                if reasoning:
                    print(f"   推理: {reasoning}")

                return {
                    "quality_passed": passed,
                    "quality_score": score,
                    "quality_detail": {
                        "reasoning": reasoning,
                        "evaluation": result
                    }
                }
            else:
                print(f"[Pipeline {chunk_id}] [ERROR] Quality评估失败: 无效响应")
                return {"quality_passed": False, "quality_score": 0.0, "error": "Invalid LLM response"}

        except Exception as e:
            print(f"[Pipeline {chunk_id}] [ERROR] Quality失败: {e}")
            return {"quality_passed": False, "quality_score": 0.0, "error": str(e)}


# 向后兼容性：保留原函数接口
def quality_single_chunk(state: ChunkProcessState) -> dict:
    """向后兼容性函数"""
    agent = QualityChunkAgent()
    return agent(state)
