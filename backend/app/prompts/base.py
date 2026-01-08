"""
Base classes for Prompt Management System

This module provides the core classes for managing LLM prompts in a structured way.
"""

import os
from pathlib import Path
from typing import Dict, Any, Optional, List
from dataclasses import dataclass


@dataclass
class PromptMetadata:
    """Metadata for a prompt template"""
    name: str
    version: str
    description: str
    variables: List[str]
    created_at: str
    updated_at: str


class PromptTemplate:
    """
    A template for LLM prompts with variable substitution.

    This class loads prompt templates from files and provides variable substitution.
    """

    def __init__(self, template_path: str, version: str = "latest"):
        self.template_path = Path(template_path)
        self.version = version
        self._template_content: Optional[str] = None
        self.metadata: Optional[PromptMetadata] = None

    def _load_template(self) -> str:
        """Load template content from file"""
        if self._template_content is None:
            if not self.template_path.exists():
                raise FileNotFoundError(f"Prompt template not found: {self.template_path}")

            with open(self.template_path, 'r', encoding='utf-8') as f:
                self._template_content = f.read()

        return self._template_content

    def render(self, **kwargs) -> str:
        """
        Render the template with provided variables.

        Args:
            **kwargs: Variables to substitute in the template

        Returns:
            Rendered prompt string
        """
        template = self._load_template()

        try:
            return template.format(**kwargs)
        except KeyError as e:
            raise ValueError(f"Missing required variable for prompt {self.template_path.name}: {e}")
        except ValueError as e:
            raise ValueError(f"Invalid format string in prompt {self.template_path.name}: {e}")

    def validate_variables(self, **kwargs) -> List[str]:
        """
        Validate that all required variables are provided.

        Returns:
            List of missing variables (empty if all present)
        """
        template = self._load_template()
        required_vars = self._extract_variables(template)
        provided_vars = set(kwargs.keys())

        return [var for var in required_vars if var not in provided_vars]

    def _extract_variables(self, template: str) -> List[str]:
        """Extract variable names from template format strings"""
        import re
        # Find all {variable_name} patterns
        variables = re.findall(r'\{([^}]+)\}', template)
        return list(set(variables))  # Remove duplicates


class PromptManager:
    """
    Manager for loading and rendering prompt templates.

    This class provides a centralized way to manage all prompt templates
    in the application.
    """

    def __init__(self, templates_dir: Optional[str] = None):
        if templates_dir is None:
            # Default to prompts/templates relative to this file
            current_dir = Path(__file__).parent
            self.templates_dir = current_dir / "templates"
        else:
            self.templates_dir = Path(templates_dir)

        self._templates: Dict[str, PromptTemplate] = {}

    def get_template(self, name: str, version: str = "latest") -> PromptTemplate:
        """
        Get a prompt template by name.

        Args:
            name: Template name (e.g., "shadow_writing.main")
            version: Template version

        Returns:
            PromptTemplate instance
        """
        cache_key = f"{name}:{version}"

        if cache_key not in self._templates:
            template_path = self._find_template_path(name, version)
            self._templates[cache_key] = PromptTemplate(str(template_path), version)

        return self._templates[cache_key]

    def render_prompt(self, template_name: str, version: str = "latest", **variables) -> str:
        """
        Render a prompt template with variables.

        Args:
            template_name: Template name
            version: Template version
            **variables: Variables to substitute

        Returns:
            Rendered prompt string
        """
        template = self.get_template(template_name, version)
        return template.render(**variables)

    def validate_prompt(self, template_name: str, version: str = "latest", **variables) -> List[str]:
        """
        Validate that a prompt can be rendered with given variables.

        Returns:
            List of missing variables
        """
        template = self.get_template(template_name, version)
        return template.validate_variables(**variables)

    def _find_template_path(self, name: str, version: str) -> Path:
        """
        Find the template file path.

        Supports names like "shadow_writing.main" which maps to
        "templates/shadow_writing/main.txt"
        """
        parts = name.split('.')
        if len(parts) != 2:
            raise ValueError(f"Invalid template name format: {name}. Expected 'category.template'")

        category, template_name = parts
        template_path = self.templates_dir / category / f"{template_name}.txt"

        if not template_path.exists():
            raise FileNotFoundError(f"Template not found: {template_path}")

        return template_path

    def list_templates(self) -> Dict[str, List[str]]:
        """
        List all available templates.

        Returns:
            Dict mapping categories to list of template names
        """
        templates = {}

        if not self.templates_dir.exists():
            return templates

        for category_dir in self.templates_dir.iterdir():
            if category_dir.is_dir():
                category_name = category_dir.name
                template_files = []

                for template_file in category_dir.glob("*.txt"):
                    template_name = template_file.stem
                    template_files.append(template_name)

                if template_files:
                    templates[category_name] = template_files

        return templates


# Global instance for easy access
prompt_manager = PromptManager()