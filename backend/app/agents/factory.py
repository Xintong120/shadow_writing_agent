"""
Agent Factory for Shadow Writing System

This module provides a centralized factory for creating and managing all agents
in the Shadow Writing system, ensuring consistent instantiation and configuration.
"""

from typing import Dict, Any, Optional, Union
from app.agents.base_agent import BaseAgent, ShadowWritingAgent, ChunkProcessingAgent
from app.agents.shared.semantic_chunking import Semantic_Chunking_Agent
from app.agents.serial.validation import ValidationAgent
from app.agents.parallel.shadow_writing_agent import shadow_writing_single_chunk
from app.agents.parallel.validation_agent import ValidationChunkAgent, validation_single_chunk
from app.agents.parallel.quality_agent import QualityChunkAgent, quality_single_chunk
from app.agents.parallel.correction_agent import CorrectionChunkAgent, correction_single_chunk
from app.agents.parallel.finalize_agent import FinalizeChunkAgent, finalize_single_chunk


class AgentFactory:
    """
    Factory class for creating agents with consistent configuration.

    This factory ensures that all agents are created with the same settings
    and provides a centralized place to manage agent instantiation.
    """

    _agents = {}

    @classmethod
    def get_shadow_writing_agent(cls, name: str = "shadow_writing") -> Semantic_Chunking_Agent:
        """Get the semantic chunking agent for shadow writing workflows"""
        if name not in cls._agents:
            cls._agents[name] = Semantic_Chunking_Agent()
        return cls._agents[name]

    @classmethod
    def get_validation_agent(cls, name: str = "validation") -> ValidationAgent:
        """Get the validation agent for serial workflows"""
        if name not in cls._agents:
            cls._agents[name] = ValidationAgent()
        return cls._agents[name]

    @classmethod
    def get_chunk_validation_agent(cls, name: str = "chunk_validation") -> ValidationChunkAgent:
        """Get the validation agent for parallel chunk processing"""
        if name not in cls._agents:
            cls._agents[name] = ValidationChunkAgent()
        return cls._agents[name]

    @classmethod
    def get_quality_agent(cls, name: str = "chunk_quality") -> QualityChunkAgent:
        """Get the quality assessment agent for parallel chunk processing"""
        if name not in cls._agents:
            cls._agents[name] = QualityChunkAgent()
        return cls._agents[name]

    @classmethod
    def get_correction_agent(cls, name: str = "chunk_correction") -> CorrectionChunkAgent:
        """Get the correction agent for parallel chunk processing"""
        if name not in cls._agents:
            cls._agents[name] = CorrectionChunkAgent()
        return cls._agents[name]

    @classmethod
    def get_finalize_agent(cls, name: str = "chunk_finalize") -> FinalizeChunkAgent:
        """Get the finalize agent for parallel chunk processing"""
        if name not in cls._agents:
            cls._agents[name] = FinalizeChunkAgent()
        return cls._agents[name]

    @classmethod
    def get_legacy_functions(cls) -> Dict[str, callable]:
        """
        Get legacy function interfaces for backward compatibility.

        These functions wrap the new class-based agents to maintain
        compatibility with existing LangGraph workflows.
        """
        return {
            'shadow_writing_single_chunk': shadow_writing_single_chunk,
            'validation_single_chunk': validation_single_chunk,
            'quality_single_chunk': quality_single_chunk,
            'correction_single_chunk': correction_single_chunk,
            'finalize_single_chunk': finalize_single_chunk,
        }

    @classmethod
    def clear_cache(cls):
        """Clear the agent cache - useful for testing or configuration changes"""
        cls._agents.clear()


# Convenience functions for easy access
def create_shadow_writing_agent() -> Semantic_Chunking_Agent:
    """Create a new shadow writing agent instance"""
    return AgentFactory.get_shadow_writing_agent()

def create_validation_agent() -> ValidationAgent:
    """Create a new validation agent instance"""
    return AgentFactory.get_validation_agent()

def create_chunk_agents() -> Dict[str, BaseAgent]:
    """Create all chunk processing agents"""
    return {
        'validation': AgentFactory.get_chunk_validation_agent(),
        'quality': AgentFactory.get_quality_agent(),
        'correction': AgentFactory.get_correction_agent(),
        'finalize': AgentFactory.get_finalize_agent(),
    }