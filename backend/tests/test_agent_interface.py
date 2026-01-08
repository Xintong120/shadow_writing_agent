"""
Unit tests for the new Agent interface and implementations.

This module tests the base agent functionality and the converted agent implementations
to ensure they work correctly with the new interface protocol.
"""

import pytest
from app.agents.base_agent import BaseAgent, ShadowWritingAgent, ChunkProcessingAgent, AgentResult
from app.agents.shared.semantic_chunking import Semantic_Chunking_Agent
from app.agents.serial.validation import ValidationAgent
from app.agents.parallel.validation_agent import ValidationChunkAgent
from app.agents.parallel.quality_agent import QualityChunkAgent
from app.agents.parallel.correction_agent import CorrectionChunkAgent
from app.agents.parallel.finalize_agent import FinalizeChunkAgent
from app.agents.factory import AgentFactory


class TestBaseAgent:
    """Test the base agent functionality"""

    def test_base_agent_creation(self):
        """Test that base agents can be created"""
        agent = BaseAgent("test_agent")
        assert agent.name == "test_agent"

    def test_base_agent_default_name(self):
        """Test default naming"""
        agent = BaseAgent()
        assert agent.name == "BaseAgent"

    def test_base_agent_validation_passes_by_default(self):
        """Test that validation passes by default"""
        agent = BaseAgent()
        assert agent.validate_input({}) is True

    def test_base_agent_process_not_implemented(self):
        """Test that process raises NotImplementedError"""
        agent = BaseAgent()
        with pytest.raises(NotImplementedError):
            agent.process({})


class TestShadowWritingAgent:
    """Test ShadowWritingAgent specific functionality"""

    def test_validation_with_required_fields(self):
        """Test validation passes with required fields"""
        agent = ShadowWritingAgent()
        state = {"text": "test text", "task_id": "123"}
        assert agent.validate_input(state) is True

    def test_validation_missing_text(self):
        """Test validation fails without text"""
        agent = ShadowWritingAgent()
        state = {"task_id": "123"}
        assert agent.validate_input(state) is False

    def test_validation_missing_task_id(self):
        """Test validation fails without task_id"""
        agent = ShadowWritingAgent()
        state = {"text": "test text"}
        assert agent.validate_input(state) is False


class TestChunkProcessingAgent:
    """Test ChunkProcessingAgent specific functionality"""

    def test_validation_with_required_fields(self):
        """Test validation passes with required fields"""
        agent = ChunkProcessingAgent()
        state = {"chunk_text": "test chunk", "chunk_id": 1}
        assert agent.validate_input(state) is True

    def test_validation_missing_chunk_text(self):
        """Test validation fails without chunk_text"""
        agent = ChunkProcessingAgent()
        state = {"chunk_id": 1}
        assert agent.validate_input(state) is False

    def test_validation_missing_chunk_id(self):
        """Test validation fails without chunk_id"""
        agent = ChunkProcessingAgent()
        state = {"chunk_text": "test chunk"}
        assert agent.validate_input(state) is False


class TestConvertedAgents:
    """Test the converted agent implementations"""

    def test_semantic_chunking_agent_creation(self):
        """Test Semantic_Chunking_Agent can be created"""
        agent = Semantic_Chunking_Agent()
        assert isinstance(agent, ShadowWritingAgent)
        assert agent.name == "Semantic_Chunking_Agent"

    def test_validation_agent_creation(self):
        """Test ValidationAgent can be created"""
        agent = ValidationAgent()
        assert isinstance(agent, ShadowWritingAgent)
        assert agent.name == "ValidationAgent"

    def test_chunk_validation_agent_creation(self):
        """Test ValidationChunkAgent can be created"""
        agent = ValidationChunkAgent()
        assert isinstance(agent, ChunkProcessingAgent)
        assert agent.name == "ValidationChunkAgent"

    def test_quality_agent_creation(self):
        """Test QualityChunkAgent can be created"""
        agent = QualityChunkAgent()
        assert isinstance(agent, ChunkProcessingAgent)
        assert agent.name == "QualityChunkAgent"

    def test_correction_agent_creation(self):
        """Test CorrectionChunkAgent can be created"""
        agent = CorrectionChunkAgent()
        assert isinstance(agent, ChunkProcessingAgent)
        assert agent.name == "CorrectionChunkAgent"

    def test_finalize_agent_creation(self):
        """Test FinalizeChunkAgent can be created"""
        agent = FinalizeChunkAgent()
        assert isinstance(agent, ChunkProcessingAgent)
        assert agent.name == "FinalizeChunkAgent"


class TestAgentFactory:
    """Test the AgentFactory functionality"""

    def test_factory_creates_agents(self):
        """Test factory creates agents correctly"""
        agent = AgentFactory.get_shadow_writing_agent()
        assert isinstance(agent, Semantic_Chunking_Agent)

        validation_agent = AgentFactory.get_validation_agent()
        assert isinstance(validation_agent, ValidationAgent)

    def test_factory_caches_agents(self):
        """Test factory caches agent instances"""
        agent1 = AgentFactory.get_shadow_writing_agent("test")
        agent2 = AgentFactory.get_shadow_writing_agent("test")
        assert agent1 is agent2

    def test_factory_clear_cache(self):
        """Test clearing agent cache"""
        agent1 = AgentFactory.get_shadow_writing_agent("test_clear")
        AgentFactory.clear_cache()
        agent2 = AgentFactory.get_shadow_writing_agent("test_clear")
        assert agent1 is not agent2

    def test_legacy_functions_available(self):
        """Test that legacy functions are available"""
        legacy_funcs = AgentFactory.get_legacy_functions()
        assert 'validation_single_chunk' in legacy_funcs
        assert 'quality_single_chunk' in legacy_funcs
        assert 'correction_single_chunk' in legacy_funcs
        assert 'finalize_single_chunk' in legacy_funcs


class TestAgentErrorHandling:
    """Test error handling in agents"""

    def test_error_handling_returns_dict(self):
        """Test that error handling returns proper dict"""
        agent = ShadowWritingAgent()
        # Test with invalid state
        result = agent({"invalid": "state"})
        assert isinstance(result, dict)
        assert "error" in result

    def test_process_must_return_dict(self):
        """Test that process must return dict"""

        class BadAgent(ShadowWritingAgent):
            def process(self, state):
                return "not a dict"  # Invalid return

        agent = BadAgent()
        result = agent({"text": "test", "task_id": "123"})
        assert isinstance(result, dict)
        assert "error" in result