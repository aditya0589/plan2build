from datetime import datetime
from typing import Optional, Dict, Any, List, Literal
from pydantic import BaseModel, Field

ProjectStatusType = Literal[
    "CREATED",
    "UPLOADED",
    "PREPROCESSING",
    "DETECTING",
    "SEGMENTING",
    "RECONSTRUCTING",
    "GENERATING_3D",
    "READY",
    "FAILED",
]

class ProjectBase(BaseModel):
    name: str = Field(default="Untitled Floor Plan", max_length=255)

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[ProjectStatusType] = None
    floor_plan_data: Optional[Dict[str, Any]] = None
    reconstruction_data: Optional[Dict[str, Any]] = None
    scene_data: Optional[Dict[str, Any]] = None
    validation_report: Optional[Dict[str, Any]] = None
    metrics: Optional[Dict[str, Any]] = None

class ProjectResponse(BaseModel):
    id: str
    name: str
    created_at: datetime
    updated_at: datetime
    status: str
    original_filename: Optional[str] = None
    original_file_path: Optional[str] = None
    file_size_bytes: Optional[int] = None
    mime_type: Optional[str] = None
    preprocessed_image_path: Optional[str] = None
    debug_mask_path: Optional[str] = None
    floor_plan_data: Optional[Dict[str, Any]] = None
    reconstruction_data: Optional[Dict[str, Any]] = None
    scene_data: Optional[Dict[str, Any]] = None
    validation_report: Optional[Dict[str, Any]] = None
    metrics: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class ProjectListResponse(BaseModel):
    total: int
    items: List[ProjectResponse]

class ProjectStatusResponse(BaseModel):
    id: str
    status: str
    updated_at: datetime
    message: Optional[str] = None
    metrics: Optional[Dict[str, Any]] = None
