from typing import List, Dict, Optional, Literal
from pydantic import BaseModel, Field

class Point2D(BaseModel):
    x: float
    y: float

class Point3D(BaseModel):
    x: float
    y: float
    z: float

class BoundingBox2D(BaseModel):
    min_x: float
    min_y: float
    max_x: float
    max_y: float

class Dimensions3D(BaseModel):
    width: float
    depth: float
    height: float

class Wall(BaseModel):
    id: str
    level_id: str = "level_0"
    start: Point2D
    end: Point2D
    thickness: float = 0.20  # meters
    height: float = 2.80     # meters
    type: Literal["interior", "exterior", "bearing", "partition", "curtain"] = "interior"
    material_id: Optional[str] = "mat_plaster_white"
    confidence: Optional[float] = 1.0

class Door(BaseModel):
    id: str
    wall_id: str
    level_id: str = "level_0"
    position: float          # offset in meters along the wall from start
    width: float = 0.90      # meters
    height: float = 2.10     # meters
    type: Literal["single", "double", "sliding", "pocket", "bifold", "archway"] = "single"
    swing_direction: Optional[Literal["inward_left", "inward_right", "outward_left", "outward_right", "sliding"]] = "inward_right"
    material_id: Optional[str] = "mat_wood_oak"
    confidence: Optional[float] = 1.0

class Window(BaseModel):
    id: str
    wall_id: str
    level_id: str = "level_0"
    position: float          # offset in meters along the wall from start
    width: float = 1.20      # meters
    height: float = 1.40     # meters
    sill_height: float = 0.90 # meters from floor
    type: Literal["standard", "casement", "double_hung", "fixed", "sliding", "bay"] = "standard"
    material_id: Optional[str] = "mat_glass_clear"
    confidence: Optional[float] = 1.0

class Room(BaseModel):
    id: str
    level_id: str = "level_0"
    name: str
    type: Literal[
        "living_room", "bedroom", "kitchen", "bathroom", "dining",
        "hallway", "balcony", "utility", "study", "storage", "garage",
        "terrace", "foyer", "unknown"
    ] = "unknown"
    polygon: List[Point2D]
    area: float              # m^2
    centroid: Point2D
    floor_material_id: Optional[str] = "mat_parquet_oak"
    wall_material_id: Optional[str] = "mat_plaster_white"
    ceiling_material_id: Optional[str] = "mat_paint_white"
    confidence: Optional[float] = 1.0

class Column(BaseModel):
    id: str
    level_id: str = "level_0"
    position: Point2D
    shape: Literal["rectangular", "circular"] = "rectangular"
    width: float = 0.3
    depth: float = 0.3
    height: float = 2.8
    material_id: Optional[str] = "mat_concrete"

class Stair(BaseModel):
    id: str
    level_id: str = "level_0"
    start: Point2D
    end: Point2D
    width: float = 1.0
    step_count: int = 16
    riser_height: float = 0.175
    tread_depth: float = 0.28
    has_railing: bool = True

class Roof(BaseModel):
    id: str
    type: Literal["flat", "gable", "hip", "shed", "mansard"] = "flat"
    overhang: float = 0.3
    thickness: float = 0.2
    pitch_degrees: float = 0.0
    material_id: Optional[str] = "mat_roof_tiles"

class FurnitureItem(BaseModel):
    id: str
    room_id: Optional[str] = None
    level_id: str = "level_0"
    item_type: str
    category: Literal["bedroom", "living", "dining", "kitchen", "bathroom", "office", "outdoor"]
    position: Point3D
    rotation: Point3D = Field(default_factory=lambda: Point3D(x=0, y=0, z=0))
    dimensions: Dimensions3D
    material_id: Optional[str] = None

class Level(BaseModel):
    id: str = "level_0"
    name: str = "Ground Floor"
    elevation: float = 0.0
    height: float = 2.80
    slab_thickness: float = 0.20

class MaterialDef(BaseModel):
    id: str
    name: str
    color: str
    roughness: Optional[float] = 0.7
    metalness: Optional[float] = 0.0
    opacity: Optional[float] = 1.0
    transparent: Optional[bool] = False
    texture_url: Optional[str] = None

class SemanticFloorPlan(BaseModel):
    version: str = "1.0.0"
    project_id: str
    units: Literal["meters", "feet"] = "meters"
    scale: float = 0.01  # meters per pixel
    bounds: BoundingBox2D
    levels: List[Level] = Field(default_factory=lambda: [Level()])
    walls: List[Wall] = Field(default_factory=list)
    doors: List[Door] = Field(default_factory=list)
    windows: List[Window] = Field(default_factory=list)
    rooms: List[Room] = Field(default_factory=list)
    columns: List[Column] = Field(default_factory=list)
    stairs: List[Stair] = Field(default_factory=list)
    roof: Optional[Roof] = None
    furniture: List[FurnitureItem] = Field(default_factory=list)
    materials: Dict[str, MaterialDef] = Field(default_factory=dict)
