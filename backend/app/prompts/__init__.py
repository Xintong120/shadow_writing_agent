"""
Prompt Management System for Shadow Writing Agents

This module provides a structured way to manage, version, and test LLM prompts
used throughout the Shadow Writing application.
"""

from .base import PromptTemplate, PromptManager, prompt_manager
from .registry import PromptRegistry

__all__ = ['PromptTemplate', 'PromptManager', 'PromptRegistry', 'prompt_manager']