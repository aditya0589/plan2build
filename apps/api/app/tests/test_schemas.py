import pytest
from app.schemas.floorplan import (
    SemanticFloorPlan,
    Wall,
    Door,
    Window,
    Room,
    Point2D,
    BoundingBox2D,
    Level,
    MaterialDef,
)

def test_semantic_floorplan_schema():
    plan = SemanticFloorPlan(
        version="1.0.0",
        project_id="test_proj_001",
        units="meters",
        scale=0.015,
        bounds=BoundingBox2D(min_x=0.0, min_y=0.0, max_x=12.0, max_y=8.0),
        levels=[
            Level(id="level_0", name="Ground Floor", elevation=0.0, height=2.8, slab_thickness=0.2)
        ],
        walls=[
            Wall(
                id="w_01",
                start=Point2D(x=0.0, y=0.0),
                end=Point2D(x=6.0, y=0.0),
                thickness=0.20,
                height=2.8,
                type="exterior",
            ),
            Wall(
                id="w_02",
                start=Point2D(x=6.0, y=0.0),
                end=Point2D(x=6.0, y=5.0),
                thickness=0.20,
                height=2.8,
                type="exterior",
            ),
        ],
        doors=[
            Door(
                id="d_01",
                wall_id="w_01",
                position=2.5,
                width=0.9,
                height=2.1,
                type="single",
            )
        ],
        windows=[
            Window(
                id="win_01",
                wall_id="w_02",
                position=2.0,
                width=1.2,
                height=1.4,
                sill_height=0.9,
                type="standard",
            )
        ],
        rooms=[
            Room(
                id="rm_01",
                name="Living Room",
                type="living_room",
                polygon=[
                    Point2D(x=0.0, y=0.0),
                    Point2D(x=6.0, y=0.0),
                    Point2D(x=6.0, y=5.0),
                    Point2D(x=0.0, y=5.0),
                ],
                area=30.0,
                centroid=Point2D(x=3.0, y=2.5),
            )
        ],
        materials={
            "mat_plaster_white": MaterialDef(id="mat_plaster_white", name="Plaster", color="#FFFFFF")
        }
    )

    data = plan.model_dump()
    assert data["project_id"] == "test_proj_001"
    assert len(data["walls"]) == 2
    assert len(data["doors"]) == 1
    assert len(data["rooms"]) == 1
    assert data["rooms"][0]["area"] == 30.0
