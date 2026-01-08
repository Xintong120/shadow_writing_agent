"""
Base Agent Interface for Shadow Writing Agents

This module defines the abstract base class for all agents in the system,
ensuring consistent interface and error handling across different agent implementations.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, TypeVar, Generic, Optional, List, Union
from dataclasses import dataclass, field

# Import state types for LangGraph compatibility
from app.state import Shadow_Writing_State, ChunkProcessState

# Type variable for state types - using Union to be compatible with LangGraph
StateType = Union[Dict[str, Any], Shadow_Writing_State, ChunkProcessState]


@dataclass
class AgentResult:
    """Standardized result structure for agent operations"""
    success: bool
    data: Dict[str, Any]
    error: str = ""
    logs: List[str] = field(default_factory=list)


class BaseAgent(ABC):
    """
    Abstract base class for all agents in the Shadow Writing system.

    This class defines the common interface that all agents must implement,
    ensuring type safety and consistent error handling.
    """

    def __init__(self, name: Optional[str] = None):
        self.name = name or self.__class__.__name__

    @abstractmethod
    def process(self, state: StateType) -> Dict[str, Any]:
        """
        Process the given state and return the updated state.

        This is the main interface method that all agents must implement.
        The method should be idempotent and handle errors gracefully.

        Args:
            state: The current state object to process

        Returns:
            Dict containing the updated state data

        Raises:
            AgentProcessingError: If processing fails critically
        """
        pass

    def validate_input(self, state: StateType) -> bool:
        """
        Validate the input state before processing.

        Override this method in subclasses to add specific validation logic.
        Default implementation always returns True.

        Args:
            state: The state to validate

        Returns:
            bool: True if valid, False otherwise
        """
        return True

    def handle_error(self, error: Exception, state: StateType) -> Dict[str, Any]:
        """
        Handle errors that occur during processing.

        Override this method in subclasses for custom error handling.
        Default implementation logs the error and returns error state.

        Args:
            error: The exception that occurred
            state: The current state when error occurred

        Returns:
            Dict containing error state
        """
        error_msg = f"Agent {self.name} failed: {str(error)}"
        print(f"[ERROR] {error_msg}")

        return {
            "error": error_msg,
            "processing_logs": [error_msg]
        }

    def __call__(self, state: StateType) -> Dict[str, Any]:
        """
        Callable interface for LangGraph compatibility.

        This method wraps the process method with validation and error handling.
        """
        try:
            # Validate input
            if not self.validate_input(state):
                return self.handle_error(
                    ValueError(f"Invalid input state for agent {self.name}"),
                    state
                )

            # Process the state
            result = self.process(state)

            # Ensure result is a dict
            if not isinstance(result, dict):
                raise ValueError(f"Agent {self.name} must return a dict, got {type(result)}")

            return result

        except Exception as e:
            return self.handle_error(e, state)


class ShadowWritingAgent(BaseAgent):
    """
    Base class for agents that work with Shadow_Writing_State.
    """

    def validate_input(self, state: StateType) -> bool:
        """Validate that state has required fields for shadow writing"""
        required_fields = ["text", "task_id"]
        return all(field in state for field in required_fields)


class ChunkProcessingAgent(BaseAgent):
    """
    Base class for agents that work with ChunkProcessState.
    """

    def validate_input(self, state: StateType) -> bool:
        """Validate that state has required fields for chunk processing"""
        required_fields = ["chunk_text", "chunk_id"]
        return all(field in state for field in required_fields)