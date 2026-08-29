# Canonical Semantic Floor Plan Schema

The **Semantic Floor Plan** is the single source of truth (SSOT) contract between Perception (AI/CV), Editing (2D/3D), and Geometry Generation.

---

## Complete JSON Schema Example

```json
{
  "version": "1.0.0",
  "project_id": "proj_abc123",
  "units": "meters",
  "scale": 0.015,
  "bounds": {
    "min_x": 0.0,
    "min_y": 0.0,
    "max_x": 18.5,
    "max_y": 14.2
  },
  "levels": [
    {
      "id": "level_0",
      "name": "Ground Floor",
      "elevation": 0.0,
      "height": 2.8,
      "slab_thickness": 0.2
    }
  ],
  "walls": [
    {
      "id": "w_001",
      "level_id": "level_0",
      "start": { "x": 0.0, "y": 0.0 },
      "end": { "x": 10.0, "y": 0.0 },
      "thickness": 0.20,
      "height": 2.80,
      "type": "exterior",
      "material_id": "mat_plaster_white",
      "confidence": 0.95
    }
  ],
  "doors": [
    {
      "id": "d_001",
      "wall_id": "w_001",
      "level_id": "level_0",
      "position": 4.5,
      "width": 0.90,
      "height": 2.10,
      "type": "single",
      "swing_direction": "inward_right",
      "material_id": "mat_wood_oak",
      "confidence": 0.88
    }
  ],
  "windows": [
    {
      "id": "win_001",
      "wall_id": "w_001",
      "level_id": "level_0",
      "position": 8.0,
      "width": 1.40,
      "height": 1.20,
      "sill_height": 0.90,
      "type": "standard",
      "material_id": "mat_glass_clear",
      "confidence": 0.91
    }
  ],
  "rooms": [
    {
      "id": "rm_001",
      "level_id": "level_0",
      "name": "Master Bedroom",
      "type": "bedroom",
      "polygon": [
        { "x": 0.0, "y": 0.0 },
        { "x": 5.0, "y": 0.0 },
        { "x": 5.0, "y": 4.5 },
        { "x": 0.0, "y": 4.5 }
      ],
      "area": 22.5,
      "centroid": { "x": 2.5, "y": 2.25 },
      "floor_material_id": "mat_parquet_oak",
      "wall_material_id": "mat_paint_warm_gray",
      "ceiling_material_id": "mat_paint_white",
      "confidence": 0.92
    }
  ],
  "columns": [
    {
      "id": "col_001",
      "level_id": "level_0",
      "position": { "x": 5.0, "y": 5.0 },
      "shape": "rectangular",
      "width": 0.3,
      "depth": 0.3,
      "height": 2.8,
      "material_id": "mat_concrete"
    }
  ],
  "stairs": [
    {
      "id": "stair_001",
      "level_id": "level_0",
      "start": { "x": 8.0, "y": 2.0 },
      "end": { "x": 8.0, "y": 5.5 },
      "width": 1.0,
      "step_count": 16,
      "riser_height": 0.175,
      "tread_depth": 0.28,
      "has_railing": true
    }
  ],
  "roof": {
    "id": "roof_001",
    "type": "flat",
    "overhang": 0.3,
    "thickness": 0.2,
    "material_id": "mat_roof_tiles",
    "pitch_degrees": 0.0
  },
  "furniture": [
    {
      "id": "furn_001",
      "room_id": "rm_001",
      "level_id": "level_0",
      "item_type": "king_bed",
      "category": "bedroom",
      "position": { "x": 2.5, "y": 1.2, "z": 0.0 },
      "rotation": { "x": 0.0, "y": 0.0, "z": 0.0 },
      "dimensions": { "width": 1.9, "depth": 2.1, "height": 1.0 }
    }
  ],
  "materials": {
    "mat_plaster_white": { "name": "White Plaster", "color": "#F4F4F6", "roughness": 0.8, "metalness": 0.0 },
    "mat_wood_oak": { "name": "Natural Oak Wood", "color": "#B8860B", "roughness": 0.6, "metalness": 0.1 },
    "mat_glass_clear": { "name": "Clear Architectural Glass", "color": "#E6F2FF", "roughness": 0.1, "metalness": 0.1, "opacity": 0.35, "transparent": true },
    "mat_parquet_oak": { "name": "Oak Parquet Flooring", "color": "#C89D66", "roughness": 0.5, "metalness": 0.05 },
    "mat_concrete": { "name": "Structural Concrete", "color": "#9E9E9E", "roughness": 0.9, "metalness": 0.1 }
  }
}
```
