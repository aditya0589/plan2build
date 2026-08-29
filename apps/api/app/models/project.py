import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON, Float, Integer, Index
from app.core.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, default="Untitled Floor Plan", index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Status tracking
    # Possible values: CREATED, UPLOADED, PREPROCESSING, DETECTING, SEGMENTING, RECONSTRUCTING, GENERATING_3D, READY, FAILED
    status = Column(
        String(50),
        nullable=False,
        default="CREATED",
        index=True
    )

    # File references
    original_filename = Column(String(255), nullable=True)
    original_file_path = Column(String(1024), nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    mime_type = Column(String(100), nullable=True)
    preprocessed_image_path = Column(String(1024), nullable=True)
    debug_mask_path = Column(String(1024), nullable=True)

    # Canonical representations (JSONB / JSON)
    floor_plan_data = Column(JSON, nullable=True)
    reconstruction_data = Column(JSON, nullable=True)
    scene_data = Column(JSON, nullable=True)
    validation_report = Column(JSON, nullable=True)
    metrics = Column(JSON, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "status": self.status,
            "original_filename": self.original_filename,
            "original_file_path": self.original_file_path,
            "file_size_bytes": self.file_size_bytes,
            "mime_type": self.mime_type,
            "preprocessed_image_path": self.preprocessed_image_path,
            "debug_mask_path": self.debug_mask_path,
            "floor_plan_data": self.floor_plan_data,
            "reconstruction_data": self.reconstruction_data,
            "scene_data": self.scene_data,
            "validation_report": self.validation_report,
            "metrics": self.metrics,
        }
