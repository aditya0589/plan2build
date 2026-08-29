from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.project import (
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
    ProjectListResponse,
    ProjectStatusResponse,
)
from app.services.project_service import ProjectService

router = APIRouter()

@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_in: ProjectCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new floor plan project."""
    return await ProjectService.create_project(db, project_in)

@router.get("/", response_model=ProjectListResponse)
async def list_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = Query(None, description="Filter by status (CREATED, UPLOADED, etc.)"),
    search: Optional[str] = Query(None, description="Search by project name"),
    db: AsyncSession = Depends(get_db)
):
    """List all projects with pagination and filtering."""
    items, total = await ProjectService.list_projects(
        db, skip=skip, limit=limit, status_filter=status, search_query=search
    )
    return ProjectListResponse(total=total, items=items)

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve a single project by ID."""
    project = await ProjectService.get_project(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID '{project_id}' not found."
        )
    return project

@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_update: ProjectUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update project metadata or floor plan data."""
    project = await ProjectService.update_project(db, project_id, project_update)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID '{project_id}' not found."
        )
    return project

@router.post("/{project_id}/upload", response_model=ProjectResponse)
async def upload_project_file(
    project_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Upload a floor plan raster image or PDF document."""
    allowed_types = ["image/png", "image/jpeg", "image/jpg", "application/pdf"]
    content_type = file.content_type or "application/octet-stream"

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    # 50MB max limit
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum 50MB limit."
        )

    project = await ProjectService.handle_file_upload(
        db=db,
        project_id=project_id,
        filename=file.filename or "floorplan_upload.png",
        content=content,
        mime_type=content_type,
    )
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID '{project_id}' not found."
        )
    return project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete a project and associated files."""
    success = await ProjectService.delete_project(db, project_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID '{project_id}' not found."
        )
    return None

@router.get("/{project_id}/status", response_model=ProjectStatusResponse)
async def get_project_status(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get the current pipeline processing status of a project."""
    project = await ProjectService.get_project(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID '{project_id}' not found."
        )
    return ProjectStatusResponse(
        id=project.id,
        status=project.status,
        updated_at=project.updated_at,
        metrics=project.metrics,
    )
