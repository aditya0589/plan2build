import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_and_get_project(client: AsyncClient):
    # 1. Create project
    create_payload = {"name": "Modern Villa Floor Plan"}
    response = await client.post("/api/v1/projects/", json=create_payload)
    assert response.status_code == 201
    created = response.json()
    assert created["name"] == "Modern Villa Floor Plan"
    assert created["status"] == "CREATED"
    project_id = created["id"]

    # 2. Get project by ID
    get_response = await client.get(f"/api/v1/projects/{project_id}")
    assert get_response.status_code == 200
    retrieved = get_response.json()
    assert retrieved["id"] == project_id
    assert retrieved["name"] == "Modern Villa Floor Plan"

    # 3. List projects
    list_response = await client.get("/api/v1/projects/")
    assert list_response.status_code == 200
    projects = list_response.json()
    assert len(projects) >= 1
    assert any(p["id"] == project_id for p in projects)

    # 4. Check status endpoint
    status_response = await client.get(f"/api/v1/projects/{project_id}/status")
    assert status_response.status_code == 200
    status_data = status_response.json()
    assert status_data["id"] == project_id
    assert status_data["status"] == "CREATED"

    # 5. Patch project
    patch_payload = {"name": "Renovated Villa Floor Plan", "status": "PREPROCESSING"}
    patch_response = await client.patch(f"/api/v1/projects/{project_id}", json=patch_payload)
    assert patch_response.status_code == 200
    updated = patch_response.json()
    assert updated["name"] == "Renovated Villa Floor Plan"
    assert updated["status"] == "PREPROCESSING"

    # 6. Delete project
    delete_response = await client.delete(f"/api/v1/projects/{project_id}")
    assert delete_response.status_code == 204

    # 7. Verify deletion
    verify_response = await client.get(f"/api/v1/projects/{project_id}")
    assert verify_response.status_code == 404
