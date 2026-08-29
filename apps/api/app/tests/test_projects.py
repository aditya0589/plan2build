import io
import pytest
from PIL import Image
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_project_lifecycle_and_upload(client: AsyncClient):
    # 1. Create project
    create_payload = {"name": "Luxury Penthouse Plan"}
    response = await client.post("/api/v1/projects/", json=create_payload)
    assert response.status_code == 201
    created = response.json()
    assert created["name"] == "Luxury Penthouse Plan"
    assert created["status"] == "CREATED"
    project_id = created["id"]

    # 2. Get project by ID
    get_response = await client.get(f"/api/v1/projects/{project_id}")
    assert get_response.status_code == 200
    retrieved = get_response.json()
    assert retrieved["id"] == project_id
    assert retrieved["name"] == "Luxury Penthouse Plan"

    # 3. Upload a mock floor plan file (real 100x100 PNG)
    test_img = Image.new("RGB", (100, 100), color="white")
    img_byte_arr = io.BytesIO()
    test_img.save(img_byte_arr, format="PNG")
    dummy_file_content = img_byte_arr.getvalue()

    files = {"file": ("penthouse_floorplan.png", dummy_file_content, "image/png")}
    upload_response = await client.post(f"/api/v1/projects/{project_id}/upload", files=files)
    assert upload_response.status_code == 200
    uploaded_data = upload_response.json()
    assert uploaded_data["status"] == "UPLOADED"
    assert uploaded_data["original_filename"] == "penthouse_floorplan.png"
    assert uploaded_data["file_size_bytes"] == len(dummy_file_content)
    assert uploaded_data["mime_type"] == "image/png"
    assert uploaded_data["metrics"]["image_width"] == 100
    assert uploaded_data["metrics"]["image_height"] == 100

    # 4. List projects with filter & search
    list_response = await client.get("/api/v1/projects/?status=UPLOADED&search=Penthouse")
    assert list_response.status_code == 200
    list_data = list_response.json()
    assert list_data["total"] >= 1
    assert any(p["id"] == project_id for p in list_data["items"])

    # 5. Check status endpoint
    status_response = await client.get(f"/api/v1/projects/{project_id}/status")
    assert status_response.status_code == 200
    status_data = status_response.json()
    assert status_data["id"] == project_id
    assert status_data["status"] == "UPLOADED"

    # 6. Patch project floor plan data
    patch_payload = {
        "name": "Luxury Penthouse Renovated",
        "status": "READY",
        "metrics": {"overall_score": 0.94, "total_rooms": 5},
    }
    patch_response = await client.patch(f"/api/v1/projects/{project_id}", json=patch_payload)
    assert patch_response.status_code == 200
    updated = patch_response.json()
    assert updated["name"] == "Luxury Penthouse Renovated"
    assert updated["status"] == "READY"
    assert updated["metrics"]["overall_score"] == 0.94

    # 7. Delete project (cascading file cleanup)
    delete_response = await client.delete(f"/api/v1/projects/{project_id}")
    assert delete_response.status_code == 204

    # 8. Verify deletion
    verify_response = await client.get(f"/api/v1/projects/{project_id}")
    assert verify_response.status_code == 404
