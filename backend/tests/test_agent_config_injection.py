# tests/test_agent_config_injection.py
# 测试agents的配置注入功能

import pytest
from unittest.mock import Mock, patch
from app.agents.parallel.quality_agent import QualityChunkAgent
from app.agents.parallel.correction_agent import CorrectionChunkAgent
from app.state import ChunkProcessState


class TestAgentConfigInjection:
    """测试agents的配置注入功能"""

    def test_quality_agent_uses_injected_llm(self):
        """测试QualityChunkAgent使用注入的LLM函数"""
        # 创建mock LLM函数
        mock_llm = Mock(return_value={
            "step1_grammar": 3,
            "step2_content": 2,
            "step3_logic": 3,
            "step3_issues": [],
            "step4_topic": 2,
            "step5_learning": 1,
            "total_score": 11,
            "pass": True,
            "reasoning": "Test reasoning"
        })

        # 创建测试状态，包含注入的LLM
        validated_shadow = Mock()
        validated_shadow.original = "Original sentence"
        validated_shadow.imitation = "Imitation sentence"
        validated_shadow.map = {"word": ["synonym"]}
        validated_shadow.paragraph = "Test paragraph"

        state = {
            "chunk_id": 0,
            "validated_shadow": validated_shadow,
            "llm_function": mock_llm
        }

        # 执行agent
        agent = QualityChunkAgent()
        result = agent.process(state)

        # 验证结果
        assert result["quality_passed"] is True
        assert result["quality_score"] == 11.0

        # 验证mock LLM被调用
        mock_llm.assert_called_once()

    def test_quality_agent_fallback_to_global_config(self):
        """测试QualityChunkAgent在没有注入LLM时fallback到全局配置"""
        # 创建测试状态，不包含注入的LLM
        validated_shadow = Mock()
        validated_shadow.original = "Original sentence"
        validated_shadow.imitation = "Imitation sentence"
        validated_shadow.map = {"word": ["synonym"]}
        validated_shadow.paragraph = "Test paragraph"

        state = {
            "chunk_id": 0,
            "validated_shadow": validated_shadow
            # 没有llm_function
        }

        # Mock全局配置函数和依赖检查
        with patch('app.agents.parallel.quality_agent.create_llm_function_native') as mock_create_llm, \
             patch('app.agents.parallel.quality_agent.ensure_dependencies') as mock_ensure:

            mock_llm = Mock(return_value={
                "step1_grammar": 3,
                "step2_content": 2,
                "step3_logic": 3,
                "step3_issues": [],
                "step4_topic": 2,
                "step5_learning": 1,
                "total_score": 11,
                "pass": True,
                "reasoning": "Test reasoning"
            })
            mock_create_llm.return_value = mock_llm

            # 执行agent
            agent = QualityChunkAgent()
            result = agent.process(state)

            # 验证结果
            assert result["quality_passed"] is True
            assert result["quality_score"] == 11.0

            # 验证fallback函数被调用
            mock_create_llm.assert_called_once()
            mock_llm.assert_called_once()
            mock_ensure.assert_called_once()

    def test_correction_agent_uses_injected_llm(self):
        """测试CorrectionChunkAgent使用注入的LLM函数"""
        # 创建mock LLM函数
        mock_llm = Mock(return_value={
            "original": "Original sentence",
            "imitation": "This is an improved imitation with more words than the required minimum to pass validation",
            "map": {"word": ["synonym1", "synonym2"], "another": ["alt1", "alt2"]}
        })

        # 创建测试状态，包含注入的LLM
        validated_shadow = Mock()
        validated_shadow.original = "Original sentence"
        validated_shadow.imitation = "Short imitation"
        validated_shadow.map = {"word": ["synonym"]}
        validated_shadow.paragraph = "Test paragraph"

        state = {
            "chunk_id": 0,
            "validated_shadow": validated_shadow,
            "quality_detail": {
                "step1_grammar": 1,
                "step2_content": 1,
                "step3_logic": 1,
                "step3_issues": ["Test issue"],
                "step4_topic": 1,
                "step5_learning": 0,
                "reasoning": "Test reasoning",
                "logic_veto": False
            },
            "quality_passed": False,  # 需要修正
            "quality_score": 3.0,
            "llm_function": mock_llm
        }

        # 执行agent
        agent = CorrectionChunkAgent()
        result = agent.process(state)

        # 验证结果
        assert "corrected_shadow" in result
        assert result["corrected_shadow"] is not None

        # 验证mock LLM被调用
        mock_llm.assert_called_once()

    def test_correction_agent_fallback_to_global_config(self):
        """测试CorrectionChunkAgent在没有注入LLM时fallback到全局配置"""
        # 创建测试状态，不包含注入的LLM
        validated_shadow = Mock()
        validated_shadow.original = "Original sentence"
        validated_shadow.imitation = "Short imitation"
        validated_shadow.map = {"word": ["synonym"]}
        validated_shadow.paragraph = "Test paragraph"

        state = {
            "chunk_id": 0,
            "validated_shadow": validated_shadow,
            "quality_detail": {
                "step1_grammar": 1,
                "step2_content": 1,
                "step3_logic": 1,
                "step3_issues": ["Test issue"],
                "step4_topic": 1,
                "step5_learning": 0,
                "reasoning": "Test reasoning",
                "logic_veto": False
            },
            "quality_passed": False,  # 需要修正
            "quality_score": 3.0
            # 没有llm_function
        }

        # Mock全局配置函数和依赖检查
        with patch('app.agents.parallel.correction_agent.create_llm_function_native') as mock_create_llm, \
             patch('app.agents.parallel.correction_agent.ensure_dependencies') as mock_ensure:

            mock_llm = Mock(return_value={
                "original": "Original sentence",
                "imitation": "This is an improved imitation with more words than the required minimum to pass validation",
                "map": {"word": ["synonym1", "synonym2"], "another": ["alt1", "alt2"]}
            })
            mock_create_llm.return_value = mock_llm

            # 执行agent
            agent = CorrectionChunkAgent()
            result = agent.process(state)

            # 验证结果
            assert "corrected_shadow" in result
            assert result["corrected_shadow"] is not None

            # 验证fallback函数被调用
            mock_create_llm.assert_called_once()
            mock_llm.assert_called_once()
            mock_ensure.assert_called_once()

    def test_agents_handle_invalid_llm_response(self):
        """测试agents处理无效的LLM响应"""
        # 创建返回无效响应的mock LLM
        mock_llm = Mock(return_value=None)

        # 测试QualityAgent
        validated_shadow = Mock()
        validated_shadow.original = "Original sentence"
        validated_shadow.imitation = "Imitation sentence"
        validated_shadow.map = {"word": ["synonym"]}
        validated_shadow.paragraph = "Test paragraph"

        state = {
            "chunk_id": 0,
            "validated_shadow": validated_shadow,
            "llm_function": mock_llm
        }

        agent = QualityChunkAgent()
        result = agent.process(state)

        # 应该返回失败结果
        assert result["quality_passed"] is False
        assert result["quality_score"] == 0.0
        assert "error" in result

        # 测试CorrectionAgent
        state_correction = {
            "chunk_id": 0,
            "validated_shadow": Mock(
                original="Original sentence",
                imitation="Short imitation",
                map={"word": ["synonym"]},
                paragraph="Test paragraph"
            ),
            "quality_detail": {
                "step1_grammar": 1,
                "step2_content": 1,
                "step3_logic": 1,
                "step3_issues": ["Test issue"],
                "step4_topic": 1,
                "step5_learning": 0,
                "reasoning": "Test reasoning",
                "logic_veto": False
            },
            "quality_passed": False,
            "quality_score": 3.0,
            "llm_function": mock_llm  # 返回None的mock
        }

        agent = CorrectionChunkAgent()
        result = agent.process(state_correction)

        # 应该返回失败结果
        assert result["corrected_shadow"] is None
        assert "error" in result