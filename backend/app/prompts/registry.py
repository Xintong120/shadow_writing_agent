"""
Prompt Registry for managing prompt metadata and versions.

This module provides functionality to register, version, and validate prompts.
"""

from typing import Dict, List, Optional
from .base import PromptMetadata


class PromptRegistry:
    """
    Registry for managing prompt templates and their metadata.

    This class provides functionality to register prompts, manage versions,
    and validate prompt configurations.
    """

    def __init__(self):
        self._registry: Dict[str, Dict[str, PromptMetadata]] = {}
        self._current_versions: Dict[str, str] = {}

    def register_prompt(self, metadata: PromptMetadata) -> None:
        """
        Register a prompt template with its metadata.

        Args:
            metadata: PromptMetadata object containing prompt information
        """
        if metadata.name not in self._registry:
            self._registry[metadata.name] = {}

        self._registry[metadata.name][metadata.version] = metadata

        # Update current version (always keep the latest registered version)
        self._current_versions[metadata.name] = metadata.version

    def get_prompt_metadata(self, name: str, version: str = "latest") -> Optional[PromptMetadata]:
        """
        Get metadata for a specific prompt version.

        Args:
            name: Prompt name
            version: Version to retrieve

        Returns:
            PromptMetadata if found, None otherwise
        """
        if name in self._registry and version in self._registry[name]:
            return self._registry[name][version]

        # Try to resolve "latest" version
        if version == "latest" and name in self._current_versions:
            current_version = self._current_versions[name]
            return self._registry[name].get(current_version)

        return None

    def list_prompts(self) -> Dict[str, List[str]]:
        """
        List all registered prompts and their versions.

        Returns:
            Dict mapping prompt names to list of available versions
        """
        result = {}
        for name, versions in self._registry.items():
            result[name] = list(versions.keys())
        return result

    def get_current_version(self, name: str) -> Optional[str]:
        """
        Get the current version for a prompt.

        Args:
            name: Prompt name

        Returns:
            Current version string or None if not found
        """
        return self._current_versions.get(name)

    def validate_prompt(self, name: str, version: str = "latest") -> List[str]:
        """
        Validate that a prompt is properly registered and configured.

        Args:
            name: Prompt name
            version: Version to validate

        Returns:
            List of validation errors (empty if valid)
        """
        errors = []

        metadata = self.get_prompt_metadata(name, version)
        if not metadata:
            errors.append(f"Prompt '{name}' version '{version}' not found")
            return errors

        # Check required fields
        if not metadata.name:
            errors.append("Prompt name is required")

        if not metadata.version:
            errors.append("Prompt version is required")

        if not metadata.variables:
            errors.append("Prompt variables list cannot be empty")

        # Check variable names
        for var in metadata.variables:
            if not isinstance(var, str) or not var.strip():
                errors.append(f"Invalid variable name: {var}")

        return errors


# Global registry instance
prompt_registry = PromptRegistry()