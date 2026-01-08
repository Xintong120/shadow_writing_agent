"""
Tests for Prompt Registry
"""

import pytest
from app.prompts.registry import PromptRegistry
from app.prompts.base import PromptMetadata


class TestPromptRegistry:
    """Test PromptRegistry class"""

    def test_register_and_get_metadata(self):
        """Test registering and retrieving prompt metadata"""
        registry = PromptRegistry()

        metadata = PromptMetadata(
            name="test.prompt",
            version="1.0",
            description="Test prompt",
            variables=["var1", "var2"],
            created_at="2024-01-01",
            updated_at="2024-01-01"
        )

        registry.register_prompt(metadata)

        retrieved = registry.get_prompt_metadata("test.prompt", "1.0")
        assert retrieved == metadata

    def test_get_current_version(self):
        """Test getting current version for a prompt"""
        registry = PromptRegistry()

        # Register version 1.0
        metadata1 = PromptMetadata(
            name="test.prompt",
            version="1.0",
            description="Test prompt v1",
            variables=["var1"],
            created_at="2024-01-01",
            updated_at="2024-01-01"
        )
        registry.register_prompt(metadata1)

        # Register version 2.0
        metadata2 = PromptMetadata(
            name="test.prompt",
            version="2.0",
            description="Test prompt v2",
            variables=["var1", "var2"],
            created_at="2024-01-02",
            updated_at="2024-01-02"
        )
        registry.register_prompt(metadata2)

        # Current version should be 2.0 (last registered)
        current = registry.get_current_version("test.prompt")
        assert current == "2.0"

    def test_latest_version_resolution(self):
        """Test resolving 'latest' version"""
        registry = PromptRegistry()

        metadata = PromptMetadata(
            name="test.prompt",
            version="1.0",
            description="Test prompt",
            variables=["var1"],
            created_at="2024-01-01",
            updated_at="2024-01-01"
        )
        registry.register_prompt(metadata)

        # Should resolve "latest" to "1.0"
        retrieved = registry.get_prompt_metadata("test.prompt", "latest")
        assert retrieved == metadata

    def test_list_prompts(self):
        """Test listing all prompts and versions"""
        registry = PromptRegistry()

        # Register multiple prompts
        registry.register_prompt(PromptMetadata(
            name="prompt1", version="1.0", description="",
            variables=[], created_at="", updated_at=""
        ))
        registry.register_prompt(PromptMetadata(
            name="prompt1", version="2.0", description="",
            variables=[], created_at="", updated_at=""
        ))
        registry.register_prompt(PromptMetadata(
            name="prompt2", version="1.0", description="",
            variables=[], created_at="", updated_at=""
        ))

        prompts = registry.list_prompts()
        assert "prompt1" in prompts
        assert "prompt2" in prompts
        assert set(prompts["prompt1"]) == {"1.0", "2.0"}
        assert prompts["prompt2"] == ["1.0"]

    def test_validation(self):
        """Test prompt validation"""
        registry = PromptRegistry()

        # Valid prompt
        valid_metadata = PromptMetadata(
            name="valid.prompt",
            version="1.0",
            description="Valid prompt",
            variables=["var1", "var2"],
            created_at="2024-01-01",
            updated_at="2024-01-01"
        )
        registry.register_prompt(valid_metadata)

        errors = registry.validate_prompt("valid.prompt", "1.0")
        assert len(errors) == 0

        # Test invalid prompt (not registered)
        errors = registry.validate_prompt("nonexistent.prompt", "1.0")
        assert len(errors) > 0
        assert "not found" in errors[0]

        # Test invalid metadata
        invalid_metadata = PromptMetadata(
            name="",  # Empty name
            version="",  # Empty version
            description="",
            variables=[],  # Empty variables
            created_at="",
            updated_at=""
        )
        registry.register_prompt(invalid_metadata)

        errors = registry.validate_prompt("", "")
        assert len(errors) >= 3  # Should have multiple validation errors