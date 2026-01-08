"""
Tests for Prompt Management System
"""

import pytest
import tempfile
from pathlib import Path
from app.prompts.base import PromptTemplate, PromptManager


class TestPromptTemplate:
    """Test PromptTemplate class"""

    def test_template_loading(self):
        """Test template loading from file"""
        # Create a temporary template file
        template_content = "Hello {name}, welcome to {place}!"

        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write(template_content)
            template_path = f.name

        try:
            template = PromptTemplate(template_path)
            assert template.render(name="Alice", place="Wonderland") == "Hello Alice, welcome to Wonderland!"
        finally:
            Path(template_path).unlink()

    def test_missing_variable(self):
        """Test error handling for missing variables"""
        template_content = "Hello {name}, welcome to {place}!"

        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write(template_content)
            template_path = f.name

        try:
            template = PromptTemplate(template_path)
            with pytest.raises(ValueError, match="Missing required variable"):
                template.render(name="Alice")  # Missing 'place'
        finally:
            Path(template_path).unlink()

    def test_validate_variables(self):
        """Test variable validation"""
        template_content = "Hello {name}, welcome to {place}!"

        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write(template_content)
            template_path = f.name

        try:
            template = PromptTemplate(template_path)
            missing = template.validate_variables(name="Alice")  # Missing 'place'
            assert "place" in missing
            assert len(missing) == 1

            # All variables present
            missing = template.validate_variables(name="Alice", place="Wonderland")
            assert len(missing) == 0
        finally:
            Path(template_path).unlink()

    def test_extract_variables(self):
        """Test variable extraction from template"""
        template_content = "Hello {name}, welcome to {place}! {greeting}"

        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write(template_content)
            template_path = f.name

        try:
            template = PromptTemplate(template_path)
            variables = template._extract_variables(template_content)
            assert set(variables) == {"name", "place", "greeting"}
        finally:
            Path(template_path).unlink()


class TestPromptManager:
    """Test PromptManager class"""

    def test_template_discovery(self):
        """Test template file discovery"""
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            # Create template directory structure
            shadow_dir = temp_path / "shadow_writing"
            shadow_dir.mkdir()

            quality_dir = temp_path / "quality"
            quality_dir.mkdir()

            # Create template files
            (shadow_dir / "main.txt").write_text("Shadow writing template")
            (quality_dir / "evaluation.txt").write_text("Quality evaluation template")

            manager = PromptManager(str(temp_path))

            # Test template listing
            templates = manager.list_templates()
            assert "shadow_writing" in templates
            assert "quality" in templates
            assert "main" in templates["shadow_writing"]
            assert "evaluation" in templates["quality"]

    def test_get_template(self):
        """Test getting templates by name"""
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            # Create template file
            shadow_dir = temp_path / "shadow_writing"
            shadow_dir.mkdir()
            (shadow_dir / "main.txt").write_text("Hello {name}!")

            manager = PromptManager(str(temp_path))

            template = manager.get_template("shadow_writing.main")
            assert isinstance(template, PromptTemplate)
            assert template.render(name="World") == "Hello World!"

    def test_render_prompt(self):
        """Test prompt rendering through manager"""
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            # Create template file
            shadow_dir = temp_path / "shadow_writing"
            shadow_dir.mkdir()
            (shadow_dir / "main.txt").write_text("Hello {name} from {place}!")

            manager = PromptManager(str(temp_path))

            result = manager.render_prompt("shadow_writing.main", **{"name": "Alice", "place": "Wonderland"})
            assert result == "Hello Alice from Wonderland!"

    def test_validate_prompt(self):
        """Test prompt validation through manager"""
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            # Create template file
            shadow_dir = temp_path / "shadow_writing"
            shadow_dir.mkdir()
            (shadow_dir / "main.txt").write_text("Hello {name} from {place}!")

            manager = PromptManager(str(temp_path))

            # Missing variables
            missing = manager.validate_prompt("shadow_writing.main", **{"name": "Alice"})
            assert "place" in missing

            # All variables present
            missing = manager.validate_prompt("shadow_writing.main", **{"name": "Alice", "place": "Wonderland"})
            assert len(missing) == 0

    def test_invalid_template_name(self):
        """Test error handling for invalid template names"""
        manager = PromptManager()

        with pytest.raises(ValueError, match="Invalid template name format"):
            manager.get_template("invalid_name")

        with pytest.raises(FileNotFoundError):
            manager.get_template("nonexistent.category")