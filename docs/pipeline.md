# Plan2Build AI — Pipeline Specification

This document defines each stage in the end-to-end transformation pipeline from raw floor plan image/PDF to interactive 3D building.

---

## Pipeline Overview

```
Input Image/PDF
      ↓
Stage 1: Preprocessing & Normalization
      ↓
Stage 2: Feature Detection (Walls, Openings, Rooms)
      ↓
Stage 3: Optical Character Recognition & Labeling
      ↓
Stage 4: Scale Inference & Metric Normalization
      ↓
Stage 5: Canonical Semantic Floor Plan Construction
      ↓
Stage 6: Topological Graph & Geometric Validation
      ↓
Stage 7: 2D Interactive Verification & Human Correction
      ↓
Stage 8: Deterministic 3D Geometry Extrusion & CSG Openings
      ↓
Stage 9: Floor Slabs, Ceilings, Roofs, Stairs & Columns
      ↓
Stage 10: Parametric Furniture Placement & Materials
      ↓
Stage 11: 3D Scene Graph Assembly & Three.js Rendering
      ↓
Stage 12: Object Editing, Multi-Floor & Model Export (GLB/OBJ)
```

---

## Detailed Stages

### Stage 1: Preprocessing & Normalization
- **Deskewing / Orientation Correction**: Compute projection profiles or Hough line dominant angles to align orthogonal axes.
- **Grayscale & Bilateral Filtering**: Preserve crisp wall edges while eliminating compression noise.
- **Adaptive Thresholding (Otsu & Sauvola)**: Separate architectural ink strokes from parchment background.
- **Morphological Filtering**: Connect close collinear wall segments and filter annotation noise.
- **Debug Artifact**: Outputs `preprocessed.png` and `binary_mask.png` for user inspection.

### Stage 2: Wall & Opening Detection
- **Centerline & Thickness Extraction**:
  - Distance transform / morphological skeletonization.
  - Probabilistic Hough Transform (`cv2.HoughLinesP`) and Line Segment Detector (LSD).
  - Cluster collinear line segments and merge overlaps.
  - Compute wall thickness from normal distance profile or default to standard architectural thicknesses (0.20m exterior / 0.12m interior).
- **Door & Window Opening Candidates**:
  - Identify wall gaps, swing arcs (Hough circles/ellipses), and three-parallel-line window glyphs.
  - Compute opening bounds and attach to parent wall segments.

### Stage 3: Room Segmentation & OCR
- **Enclosed Region Flood Fill & Contour Tracing**:
  - Invert the wall mask and compute connected components.
  - Simplify contour polygons using Douglas-Peucker algorithm.
  - Calculate room bounding box, polygon, area ($m^2$), and centroid.
- **OCR Text Detection**:
  - Run OCR bounding box detection across text regions.
  - Match extracted text (e.g. "BEDROOM", "KITCHEN", "LIVING", "BATH") to room polygon containment.
  - Assign standardized semantic room types.

### Stage 4: Dimension & Scale Inference
- **Methods**:
  - **Direct OCR**: Search for dimension strings (e.g., `4.20m`, `3500mm`, `12' - 6"`).
  - **User Calibration**: Interactive 2-point caliper tool where the user specifies known length.
  - **Architectural Default**: Automatic estimate based on standard door clearance (0.90m) or standard room proportions.
- Compute global scaling factor `meters_per_pixel`.

### Stage 5: Canonical Semantic Floor Plan (SSOT)
- Construct unified JSON payload conforming to the canonical schema:
  - Scaled coordinates in meters.
  - Walls with start, end, thickness, height, type.
  - Openings (doors, windows) with position along wall, width, height, sill elevation.
  - Rooms with simplified boundary polygons and classifications.
  - Building levels with elevation offsets.

### Stage 6: Geometric & Constraint Validation
- **Topology checks**:
  - Non-manifold walls, micro-gaps (< 0.05m), self-intersections.
  - Floating doors/windows (openings without host wall).
  - Degenerate / zero-area rooms.
  - Minimum corridor width & minimum door clearance guidelines.
- Return structured `ValidationReport` with severity levels (`error`, `warning`, `info`).

### Stage 7: 2D Interactive Verification
- User can visually inspect every detection layer in the 2D CAD canvas.
- Real-time vertex editing, wall dragging, manual addition of missing doors/windows, and room type re-labeling.

### Stage 8–10: 3D Geometry Extrusion
- **Wall Extrusion with Openings**:
  - Extrude 2D wall polygons vertically to ceiling height ($H$).
  - For each door opening: subtract rectangular volume from floor level to $H_{door}$.
  - For each window opening: subtract rectangular volume from $H_{sill}$ to $H_{sill} + H_{window}$.
- **Floor & Ceiling Slabs**: Extrude room polygons downward (floor) and upward (ceiling).
- **Parametric Openings**:
  - Door frames, door slabs (swung open 30° for realism), handles.
  - Window frames, double-glazed glass panes with translucent PBR shader.
- **Roofs, Stairs & Columns**:
  - Flat, gable, or hip roof generation over perimeter boundary polygon.
  - Parametric stair treads, risers, and handrails.
  - Rectangular or circular column extrusions.

### Stage 11–12: 3D Scene Rendering & Export
- Interactive React Three Fiber scene with OrbitControls, First-Person pointer lock walkthrough, day/night directional sun simulation, shadows, and layer visibility toggles.
- Object raycasting and property inspection.
- Model export to `.glb` and `.obj`.
