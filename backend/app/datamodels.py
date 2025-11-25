from typing import Optional, List, Literal, Union
from pydantic import BaseModel


# -----------------------------
# Sections Provided by the User
# -----------------------------
class UserSectionDefination(BaseModel):
    section_name: Optional[str] = None
    description: Optional[str] = None

# -----------------------------
# Sections Provided by the User
# -----------------------------
class GeneratedSectionStructure(BaseModel):
    section_name: Optional[str] = None
    content: Optional[str] = None


# -----------------------------
# User State for Graph
# -----------------------------
class GenerateStateInput(BaseModel):
    main_topic: str
    dynamic_generation: Optional[Literal["true", "false"]] = "false"
    expected_sections_count: Optional[str] = ""
    sections: Optional[List[UserSectionDefination]] = []
    constraints: Optional[str] = ""
    context: Optional[str] = ""


# -----------------------------
# Eval State for Graph
# -----------------------------
class EvalStateInput(BaseModel):
    main_topic: str
    dynamic_generation: Optional[Literal["true", "false"]] = "false"
    expected_sections_count: Optional[str] = ""
    sections: Optional[List[UserSectionDefination]] = []
    constraints: Optional[str] = ""
    context: Optional[str] = ""
    generated_content: List[GeneratedSectionStructure] 



# -----------------------------
# Export State
# -----------------------------
class Section(BaseModel):
    section_name: str
    content: str
    id: str


class GenerateRequest(BaseModel):
    generated_content: List[Section]
    type: str  # "doc" or "pptx"