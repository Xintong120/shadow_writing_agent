# quality_agent.py
# 并行处理的Quality Check Agent

from typing import Dict, Any
from app.state import ChunkProcessState
from app.utils import ensure_dependencies, create_llm_function_native
from app.agents.base_agent import ChunkProcessingAgent, StateType
from app.prompts import prompt_manager


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
            # 优先使用注入的LLM函数，如果没有则使用全局配置
            llm_function = state.get("llm_function")
            if llm_function is None:
                # Fallback到全局配置，保持向后兼容性
                ensure_dependencies()
                llm_function = create_llm_function_native()

            # 获取验证通过的Shadow数据
            original = validated.original
            imitation = validated.imitation
            word_map = validated.map
            paragraph = validated.paragraph

            # 使用完整的quality评估模板
            quality_prompt = prompt_manager.render_prompt(
                "quality.evaluation",
                original=original,
                imitation=imitation,
                word_map=word_map,
                paragraph=paragraph[:200] + "..."
            )

            evaluation_format = {
                "step1_grammar": "Grammar structure score 0-3, int",
                "step2_content": "Content replacement score 0-2, int",
                "step3_logic": "Logic & plausibility score 0-3, int",
                "step3_issues": "List of critical logical issues, array",
                "step4_topic": "Topic migration score 0-2, int",
                "step5_learning": "Learning value score 0-1, int",
                "total_score": "Total score 0-11, int",
                "pass": "true if quality passes threshold, bool",
                "reasoning": "brief summary focusing on logic check, str"
            }

            result = llm_function(quality_prompt, evaluation_format)

            if result and isinstance(result, dict):
                passed = result.get('pass', False)
                total_score = float(result.get('total_score', 0.0))
                reasoning = result.get('reasoning', '')
                step3_issues = result.get('step3_issues', [])

                # 检查逻辑否决条件
                logic_veto = len(step3_issues) > 0 and result.get('step3_logic', 0) < 2

                status = "[OK]" if passed else "[ERROR]"
                print(f"[Pipeline {chunk_id}] {status} Quality: {total_score}/11")
                if reasoning:
                    print(f"   推理: {reasoning}")
                if step3_issues:
                    print(f"   逻辑问题: {len(step3_issues)} 个")

                return {
                    "quality_passed": passed,
                    "quality_score": total_score,
                    "quality_detail": {
                        "step1_grammar": result.get('step1_grammar', 0),
                        "step2_content": result.get('step2_content', 0),
                        "step3_logic": result.get('step3_logic', 0),
                        "step3_issues": step3_issues,
                        "step4_topic": result.get('step4_topic', 0),
                        "step5_learning": result.get('step5_learning', 0),
                        "reasoning": reasoning,
                        "evaluation": result,
                        "logic_veto": logic_veto
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
