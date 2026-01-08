# correction_agent.py
# 并行处理的Correction Agent

from typing import Dict, Any
from app.state import ChunkProcessState
from app.agents.base_agent import ChunkProcessingAgent, StateType
from app.prompts import prompt_manager
from app.utils import ensure_dependencies, create_llm_function_native


class CorrectionChunkAgent(ChunkProcessingAgent):
    """修正单个Chunk"""

    def process(self, state: StateType) -> Dict[str, Any]:
        """修正单个Chunk（并行版本）"""
        chunk_id = state.get("chunk_id", 0)
        validated = state.get("validated_shadow")
        quality_detail = state.get("quality_detail", {})

        print(f"[Pipeline {chunk_id}] Correction...")

        if not validated or not quality_detail:
            return {"corrected_shadow": None}

        # 检查是否需要修正（质量不合格）
        quality_passed = state.get("quality_passed", True)
        if quality_passed:
            print(f"[Pipeline {chunk_id}] [SKIP] Quality passed, no correction needed")
            return {"corrected_shadow": validated}

        try:
            ensure_dependencies()
            llm_function = create_llm_function_native()

            # 获取原始数据
            original = validated.original
            imitation = validated.imitation
            word_map = validated.map
            paragraph = validated.paragraph

            # 获取质量评估详情
            quality_score = state.get("quality_score", 0)
            step1_grammar = quality_detail.get('step1_grammar', 0)
            step2_content = quality_detail.get('step2_content', 0)
            step3_logic = quality_detail.get('step3_logic', 0)
            step3_issues = quality_detail.get('step3_issues', [])
            step4_topic = quality_detail.get('step4_topic', 0)
            step5_learning = quality_detail.get('step5_learning', 0)
            quality_reasoning = quality_detail.get('reasoning', '')
            logic_veto = quality_detail.get('logic_veto', False)

            # 渲染correction模板
            correction_prompt = prompt_manager.render_prompt(
                "correction.main",
                original=original,
                imitation=imitation,
                word_map=word_map,
                quality_score=quality_score,
                step1_grammar=step1_grammar,
                step2_content=step2_content,
                step3_logic=step3_logic,
                step3_issues=step3_issues,
                step4_topic=step4_topic,
                step5_learning=step5_learning,
                quality_reasoning=quality_reasoning,
                logic_veto=logic_veto
            )

            correction_format = {
                "original": "Original sentence, str",
                "imitation": "Improved migrated sentence, str",
                "map": "Improved word mapping dictionary, dict"
            }

            result = llm_function(correction_prompt, correction_format)

            if result and isinstance(result, dict):
                improved_original = str(result.get('original', original)).strip()
                improved_imitation = str(result.get('imitation', '')).strip()
                improved_map = result.get('map', {})

                # 验证修正结果
                if (improved_imitation and
                    len(improved_imitation.split()) >= 8 and
                    isinstance(improved_map, dict) and
                    len(improved_map) >= 2):

                    corrected_data = type('obj', (object,), {
                        'original': improved_original,
                        'imitation': improved_imitation,
                        'map': improved_map,
                        'paragraph': paragraph
                    })

                    print(f"[Pipeline {chunk_id}] [SUCCESS] Correction completed")
                    print(f"   Original: {original[:50]}...")
                    print(f"   Improved: {improved_imitation[:50]}...")
                    print(f"   Map entries: {len(improved_map)}")

                    return {"corrected_shadow": corrected_data}
                else:
                    print(f"[Pipeline {chunk_id}] [FAIL] Correction failed: Invalid result format")
                    return {"corrected_shadow": None, "error": "Invalid correction result"}

        except Exception as e:
            print(f"[Pipeline {chunk_id}] [ERROR] Correction failed: {e}")
            return {"corrected_shadow": None, "error": str(e)}


# 向后兼容性：保留原函数接口
def correction_single_chunk(state: ChunkProcessState) -> dict:
    """向后兼容性函数"""
    agent = CorrectionChunkAgent()
    return agent(state)
