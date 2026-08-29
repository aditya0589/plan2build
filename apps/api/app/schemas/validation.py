from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

class ValidationIssue(BaseModel):
    id: str
    severity: Literal["error", "warning", "info"] = "warning"
    category: Literal["topology", "enclosure", "clearance", "geometry", "scale"] = "geometry"
    element_id: Optional[str] = None
    element_type: Optional[Literal["wall", "door", "window", "room", "level"]] = None
    message: str
    details: Optional[Dict[str, Any]] = None

class ValidationReport(BaseModel):
    is_valid: bool = True
    error_count: int = 0
    warning_count: int = 0
    issues: List[ValidationIssue] = Field(default_factory=list)
