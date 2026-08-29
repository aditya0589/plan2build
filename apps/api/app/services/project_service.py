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

        # Store file in uploads directory: data/uploads/{project_id}_{filename}
        file_ext = Path(filename).suffix
        safe_filename = f"{project_id}_{Path(filename).stem}{file_ext}"
        relative_path = f"uploads/{safe_filename}"
        saved_path = await storage.save_file(relative_path, content)

        project.original_filename = filename
        project.original_file_path = saved_path
        project.file_size_bytes = len(content)
        project.mime_type = mime_type
        project.status = "UPLOADED"
        project.updated_at = datetime.utcnow()

        await db.commit()
        await db.refresh(project)
        logger.info(f"File '{filename}' ({len(content)} bytes) uploaded for project {project_id}")
        return project

    @staticmethod
    async def delete_project(db: AsyncSession, project_id: str) -> bool:
        project = await ProjectService.get_project(db, project_id)
        if not project:
            return False

        # Clean up associated files from storage
        for file_attr in [project.original_file_path, project.preprocessed_image_path, project.debug_mask_path]:
            if file_attr:
                try:
                    await storage.delete_file(file_attr)
                except Exception as e:
                    logger.warning(f"Failed to delete file {file_attr}: {e}")

        await db.delete(project)
        await db.commit()
        logger.info(f"Project {project_id} deleted successfully.")
        return True
