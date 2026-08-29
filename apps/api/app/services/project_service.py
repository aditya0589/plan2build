import os
from datetime import datetime
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, delete
from pathlib import Path
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.core.storage import storage
from app.core.logging import logger
from app.services.upload_service import UploadService

class ProjectService:
    @staticmethod
    async def create_project(db: AsyncSession, project_in: ProjectCreate) -> Project:
        project = Project(
            name=project_in.name,
            status="CREATED",
        )
        db.add(project)
        await db.commit()
        await db.refresh(project)
        logger.info(f"Project created with ID: {project.id}")
        return project

    @staticmethod
    async def get_project(db: AsyncSession, project_id: str) -> Optional[Project]:
        result = await db.execute(select(Project).where(Project.id == project_id))
        return result.scalars().first()

    @staticmethod
    async def list_projects(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 50,
        status_filter: Optional[str] = None,
        search_query: Optional[str] = None,
    ) -> Tuple[List[Project], int]:
        query = select(Project)

        if status_filter:
            query = query.where(Project.status == status_filter)
        if search_query:
            query = query.where(Project.name.ilike(f"%{search_query}%"))

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar_one()

        # Paginated items
        paginated_query = query.order_by(Project.created_at.desc()).offset(skip).limit(limit)
        result = await db.execute(paginated_query)
        items = list(result.scalars().all())

        return items, total

    @staticmethod
    async def update_project(
        db: AsyncSession, project_id: str, project_update: ProjectUpdate
    ) -> Optional[Project]:
        project = await ProjectService.get_project(db, project_id)
        if not project:
            return None

        update_data = project_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(project, key, value)

        project.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(project)
        logger.info(f"Project {project_id} updated with status: {project.status}")
        return project

    @staticmethod
    async def handle_file_upload(
        db: AsyncSession,
        project_id: str,
        filename: str,
        content: bytes,
        mime_type: str,
    ) -> Optional[Project]:
        project = await ProjectService.get_project(db, project_id)
        if not project:
            return None

        # Inspect and normalize (handling PNG, JPG, PDF)
        normalized_bytes, width, height, norm_filename = UploadService.inspect_and_normalize_image(
            content=content,
            filename=filename,
            mime_type=mime_type
        )

        safe_filename = f"{project_id}_{norm_filename}"
        relative_path = f"uploads/{safe_filename}"
        await storage.save_file(relative_path, normalized_bytes)

        # Store accessible web URL
        project.original_filename = filename
        project.original_file_path = f"/static/data/{relative_path}"
        project.file_size_bytes = len(normalized_bytes)
        project.mime_type = "image/png" if norm_filename.endswith(".png") else mime_type
        project.status = "UPLOADED"
        project.metrics = {
            "image_width": width,
            "image_height": height,
            "aspect_ratio": round(width / max(height, 1), 3),
            "file_size_kb": round(len(normalized_bytes) / 1024, 1),
        }
        project.updated_at = datetime.utcnow()

        await db.commit()
        await db.refresh(project)
        logger.info(f"File '{filename}' ({width}x{height}px) normalized and uploaded for project {project_id}")
        return project

    @staticmethod
    async def delete_project(db: AsyncSession, project_id: str) -> bool:
        project = await ProjectService.get_project(db, project_id)
        if not project:
            return False

        # Clean up associated files from storage
        for file_attr in [project.original_file_path, project.preprocessed_image_path, project.debug_mask_path]:
            if file_attr:
                # Remove static prefix if present
                clean_path = file_attr.replace("/static/data/", "")
                try:
                    await storage.delete_file(clean_path)
                except Exception as e:
                    logger.warning(f"Failed to delete file {clean_path}: {e}")

        await db.delete(project)
        await db.commit()
        logger.info(f"Project {project_id} deleted successfully.")
        return True
