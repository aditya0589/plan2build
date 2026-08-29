# Plan2Build AI — Master Phases & Progress Roadmap

This document serves as the master tracking checklist and technical reference for **Plan2Build AI**. It details all 47 engineering phases so development can pause and resume seamlessly across multiple sessions.

---

## 📊 High-Level Milestone Progress

- **Total Phases**: 47
- **Completed**: 2
- **In Progress**: 0
- **Remaining**: 45
- **Current Milestone**: Phase 3 — File Upload & Multi-Format Ingestion

---

## ⚡ Quickstart: How to Resume Development

Whenever you open this workspace:

1. **Verify Python & Node environments**:
   ```bash
   # Backend tests
   cd apps/api
   python -m pytest -v
   
   # Frontend build validation
   cd ../web
   npm run build
   ```

2. **Start Development Servers**:
   ```bash
   # Terminal 1 — Backend API (runs on http://127.0.0.1:8000)
   cd apps/api
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   
   # Terminal 2 — Frontend Studio (runs on http://localhost:5173)
   cd apps/web
   npm run dev
   ```

3. **Check the current phase below**, implement its requirements, run tests, update the checkbox (`[x]`), and commit changes.

---

## 📋 Master Phase Checklist

### Phase 1: Project Initialization & Monorepo Skeleton
- [x] **Status: COMPLETED** (Commit: `71b1ddb`)
- **Objectives**: Monorepo structure, FastAPI async backend, React Three Fiber CAD studio, canonical semantic schemas (`packages/shared-types`), database layer, test suites.
- **Key Deliverables**:
  - `docs/architecture.md`, `docs/pipeline.md`, `docs/floorplan-schema.md`
  - `apps/api`: Async SQLAlchemy engine, `/api/health`, `/api/v1/projects`, Pytest suite (4/4 tests passing)
  - `apps/web`: 2D SVG canvas + 3D R3F WebGL viewports, Toolbar, Properties Inspector, Layer Manager, AI Assistant modal, Sample fixtures.

---

### Phase 2: Database and Project Model CRUD
- [x] **Status: COMPLETED**
- **Objectives**: Complete project model persistence, metadata indexing, project listing with previews, and delete cascades.
- **Key Deliverables**:
  - `apps/api/app/models/project.py`: Complete SQLAlchemy Project model with status indexing, timestamps, and file metadata (`file_size_bytes`, `mime_type`).
  - `apps/api/app/schemas/project.py`: Strict `ProjectStatusType` enum literals, `ProjectListResponse` with total pagination count, and `ProjectUpdate`.
  - `apps/api/app/services/project_service.py`: Project CRUD operations, name search filter, status filter, `handle_file_upload`, and cascade file cleanup.
  - `apps/api/app/api/v1/endpoints/projects.py`: `POST /projects`, `GET /projects` (paginated + search/filter), `GET /projects/{id}`, `PATCH /projects/{id}`, `POST /projects/{id}/upload`, `DELETE /projects/{id}`, `GET /projects/{id}/status`.
  - `apps/web/src/features/projects/ProjectsModal.tsx`: Project manager drawer to browse saved projects, search by name, view status badges, switch active project, and delete projects.

---

### Phase 3: File Upload & Multi-Format Ingestion
- [ ] **Status: PENDING**
- **Objectives**: Ingest PNG, JPG, JPEG, and PDF documents.
- **Tasks**:
  - Multi-page PDF rendering via `pdf2image` / `pypdf2` with page selection.
  - MIME-type validation, size limits (up to 50MB), and dimension normalization.
  - Compute initial resolution DPI and pixel dimensions ($W \times H$).
  - Save original file into `data/uploads/{project_id}/`.

---

### Phase 4: Image Preprocessing Pipeline (OpenCV)
- [ ] **Status: PENDING**
- **Objectives**: Deskew, denoise, enhance contrast, and binarize floor plans.
- **Tasks**:
  - Dominant angle detection via Radon transform / Hough lines to auto-deskew.
  - Bilateral / Gaussian filtering to remove paper grain.
  - Adaptive thresholding (Sauvola & Otsu) to isolate black architectural line work.
  - Morphological closing to seal minute raster scan gaps.
  - Expose `/api/v1/projects/{id}/debug/images` returning side-by-side Original vs. Preprocessed mask.

---

### Phase 5: Architectural Element Detection (Walls)
- [ ] **Status: PENDING**
- **Objectives**: Deterministic wall centerline vectorization and thickness calculation.
- **Tasks**:
  - Extract line segments via Line Segment Detector (LSD) and Probabilistic Hough Transform.
  - Collinear segment clustering and overlap merging.
  - Support arbitrary wall angles (orthogonal, diagonal, curved approximations).
  - Compute wall thickness from distance transform profiles.

---

### Phase 6: Wall Centerline, Thickness & Polygons
- [ ] **Status: PENDING**
- **Objectives**: Separate wall centerlines from thickness buffers and 2D footprint polygons.
- **Tasks**:
  - Build Shapely buffer polygons around centerlines using estimated or configurable wall thickness (default 200mm exterior, 120mm interior).
  - Allow user parameter overrides for wall height ($H=2.8m$) and thickness.
  - Calculate wall intersections and miter joints at corners.

---

### Phase 7: Room Segmentation & Boundary Polygons
- [ ] **Status: PENDING**
- **Objectives**: Detect enclosed spatial zones and compute room polygons.
- **Tasks**:
  - Invert binary wall mask to compute closed connected regions.
  - Contour extraction with Douglas-Peucker polygon simplification.
  - Compute room area in square meters ($m^2$), centroids, and bounding boxes.
  - Initial heuristic categorization: Living room, Bedroom, Kitchen, Bathroom, Hallway, Balcony, Utility, Study, Storage, Garage.

---

### Phase 8: Optical Character Recognition (OCR)
- [ ] **Status: PENDING**
- **Objectives**: Extract room labels, numbers, and dimension annotations.
- **Tasks**:
  - Create `OCRProvider` abstraction (Tesseract / EasyOCR baseline).
  - Extract bounding boxes, recognized text strings, and confidence scores.
  - Spatial containment mapping: Associate OCR text bounding box with the containing room polygon to automatically label rooms (e.g. "BEDROOM 1", "KITCHEN").

---

### Phase 9: Dimension & Scale Inference
- [ ] **Status: PENDING**
- **Objectives**: Establish exact physical metric scale (`meters_per_pixel`).
- **Tasks**:
  - **Source A**: Regex parse dimension strings (e.g., `4500 mm`, `3.80m`, `12' - 6"`).
  - **Source B**: 2-point caliper tool in frontend where user specifies reference wall length.
  - **Source C**: Architectural standard heuristic fallback (door leaf width = 0.90m).
  - Tag floor plan metadata as exact or calibrated approximate.

---

### Phase 10: Canonical Semantic Floor Plan Model (SSOT)
- [ ] **Status: PENDING**
- **Objectives**: Assemble the unified canonical JSON representation.
- **Tasks**:
  - Normalize all coordinates into metric meters.
  - Construct complete `SemanticFloorPlan` model with walls, doors, windows, rooms, levels, columns, stairs, materials.
  - Validate JSON schema consistency across backend and frontend.

---

### Phase 11: Architectural Topological Graph
- [ ] **Status: PENDING**
- **Objectives**: Construct connectivity and adjacency graph.
- **Tasks**:
  - Nodes: Rooms, Doors, Windows, Stairs, Levels.
  - Edges: `adjacent_to` (shared wall), `connected_by` (door), `opens_into`, `contains`.
  - Expose graph queries (e.g. "Which rooms are connected to the hallway?", "Rooms without exterior windows").

---

### Phase 12: Geometric & Architectural Validation Engine
- [ ] **Status: PENDING**
- **Objectives**: Verify geometric sanity and architectural design guidelines.
- **Tasks**:
  - Check for non-manifold walls, self-intersections, and micro-gaps (< 0.05m).
  - Detect floating doors/windows not attached to any host wall.
  - Detect overlapping rooms and degenerate zero-area polygons.
  - Flag corridor widths < 1.0m and door openings < 0.75m as design warnings.
  - Generate structured `ValidationReport`.

---

### Phase 13: 2D Interactive CAD Editor & Correction
- [ ] **Status: PENDING**
- **Objectives**: Interactive human-in-the-loop floor plan correction.
- **Tasks**:
  - Wall dragging, vertex snapping, wall splitting, adding new walls, deleting walls.
  - Place / delete doors and windows with dynamic sliding along host walls.
  - Room polygon re-drawing and room type reassignment dropdowns.
  - Undo/redo stack and live synchronization to the 3D scene.

---

### Phase 14: Deterministic 3D Wall Generation
- [ ] **Status: PENDING**
- **Objectives**: Extrude wall meshes with exact boolean opening cutouts.
- **Tasks**:
  - Subdivide walls at door and window intervals into base, header lintels, and sills.
  - Compute mitered corner intersections for clean wall junctions.
  - Apply PBR materials (plaster, paint, brick, concrete).

---

### Phase 15: 3D Floor Slab Generation
- [ ] **Status: PENDING**
- **Objectives**: Extrude floor slabs from room and building perimeter polygons.
- **Tasks**:
  - Extrude downward by slab thickness (default 0.15m–0.20m).
  - Apply room-specific floor finishes (oak parquet, tile, carpet, polished concrete).

---

### Phase 16: 3D Ceiling Generation
- [ ] **Status: PENDING**
- **Objectives**: Generate ceiling surfaces with visibility controls.
- **Tasks**:
  - Extrude ceilings at level height $H$.
  - Provide UI toggles: Show Ceiling, Hide Ceiling, Transparent Glass Ceiling for interior inspection.

---

### Phase 17: Parametric Door Reconstruction
- [ ] **Status: PENDING**
- **Objectives**: Generate door frames, slabs, handles, and swing geometry.
- **Tasks**:
  - Support single swing, double French doors, and sliding glass doors.
  - Configurable width, height, and swing angle (default 30° open).
  - Material selection for wood, metal, and glass doors.

---

### Phase 18: Parametric Window Reconstruction
- [ ] **Status: PENDING**
- **Objectives**: Generate window frames, double-glazed panes, and sills.
- **Tasks**:
  - Support standard casement, sliding, and floor-to-ceiling windows.
  - Translucent low-roughness PBR glass shader.
  - Configurable sill elevation and frame profiles.

---

### Phase 19: Parametric Staircases
- [ ] **Status: PENDING**
- **Objectives**: Detect and place 3D stairs connecting levels.
- **Tasks**:
  - Compute steps, treads ($D \ge 0.28m$), risers ($H \le 0.18m$), and railings.
  - Straight run, L-shaped, and U-shaped stair configurations.

---

### Phase 20: Structural Columns
- [ ] **Status: PENDING**
- **Objectives**: Generate rectangular and circular structural columns.
- **Tasks**:
  - Column placement, dimensioning ($W \times D \times H$), and concrete materials.

---

### Phase 21: Roof Structure Generation
- [ ] **Status: PENDING**
- **Objectives**: Generate flat, gable, and hip roofs.
- **Tasks**:
  - Overhang calculation around exterior building perimeter.
  - Configurable roof pitch degrees and slate/shingle tile textures.

---

### Phase 22: Architectural Material System
- [ ] **Status: PENDING**
- **Objectives**: Unified PBR material palette and live assignment.
- **Tasks**:
  - Plaster, brick, wood, concrete, ceramic tile, glass, metal, stone.
  - Roughness, metalness, normal maps, and diffuse color customization from inspector.

---

### Phase 23: Parametric Furniture Library
- [ ] **Status: PENDING**
- **Objectives**: Lightweight procedural furniture models.
- **Tasks**:
  - Bedroom: King/Queen bed, wardrobe, nightstands.
  - Living: Sectional sofa, coffee table, TV console.
  - Dining & Kitchen: Dining table with chairs, kitchen counters, sink, refrigerator.
  - Bathroom: Vanity, toilet, bathtub, shower stall.

---

### Phase 24: AI & Rule-Based Furniture Placement
- [ ] **Status: PENDING**
- **Objectives**: Automatic ergonomic furniture layout heuristics.
- **Tasks**:
  - Align beds against solid walls away from door swings.
  - Maintain minimum 0.8m circulation paths in bedrooms and living rooms.
  - Place bathroom fixtures against plumbing partition walls.

---

### Phase 25: Interactive 3D Viewer & Cameras
- [ ] **Status: PENDING**
- **Objectives**: High-performance Three.js / R3F camera controls.
- **Tasks**:
  - OrbitControls with smooth damping.
  - Camera presets: Perspective, Top/Plan, Front Elevation, Isometric.
  - First-Person pointer lock walkthrough mode with collision bounds.

---

### Phase 26: Room Selection & Spatial HUD
- [ ] **Status: PENDING**
- **Objectives**: Interactive room picking in 3D and 2D.
- **Tasks**:
  - Raycasting room selection highlighting floor polygon in blue.
  - Room statistics HUD: Name, Category, Area ($m^2$), Window count, Door count.

---

### Phase 27: Object Property Editor & Bidirectional Sync
- [ ] **Status: PENDING**
- **Objectives**: Live two-way synchronization between UI and geometry.
- **Tasks**:
  - Modifying wall length/height in the property panel instantly rebuilds the 3D mesh.
  - Single Source of Truth maintained in `floorplanStore`.

---

### Phase 28: AI Architect Assistant (Structured Commands)
- [ ] **Status: PENDING**
- **Objectives**: Natural language layout modification with schema verification.
- **Tasks**:
  - LLM prompt engineering to output structured JSON actions (`resize_room`, `change_material`, `add_opening`, `reconfigure_layout`).
  - Strict schema and constraint validation before applying changes.

---

### Phase 29: Architectural Design Constraint Engine
- [ ] **Status: PENDING**
- **Objectives**: Automated rule evaluation for living spaces.
- **Tasks**:
  - Minimum room area rules (e.g. Master Bedroom $\ge 12m^2$).
  - Minimum window-to-floor area ratio ($\ge 10\%$ for habitable rooms).
  - Clear "Design guideline warning" terminology.

---

### Phase 30: Multi-Floor Building Support
- [ ] **Status: PENDING**
- **Objectives**: Stack and navigate multiple levels.
- **Tasks**:
  - Add Level, Duplicate Level, Level Elevation offset ($Z = \sum H$).
  - Stair cutouts in upper floor slabs.
  - Floor switcher UI to isolate or view all levels stacked.

---

### Phase 31: Multiple Reconstruction Strategies
- [ ] **Status: PENDING**
- **Objectives**: Pluggable reconstruction engines.
- **Tasks**:
  - `BaselineReconstructionEngine` (Deterministic OpenCV).
  - `CVReconstructionEngine` (Advanced contour & morphology).
  - `AIReconstructionEngine` (Deep learning / VLM assisted).

---

### Phase 32: Perception Confidence Scoring
- [ ] **Status: PENDING**
- **Objectives**: Confidence metrics for every detected feature.
- **Tasks**:
  - High confidence ($>0.90$): Auto-accept.
  - Medium confidence ($0.60–0.90$): Highlight with suggestion badge.
  - Low confidence ($<0.60$): Prompt user confirmation in 2D editor.

---

### Phase 33: Human-in-the-Loop Workflow Polish
- [ ] **Status: PENDING**
- **Objectives**: Seamless end-to-end review step before 3D generation.
- **Tasks**:
  - Step-by-step wizard: Upload ➔ Perception Review ➔ 3D Generation.

---

### Phase 34: 3D Model Export (GLB / OBJ)
- [ ] **Status: PENDING**
- **Objectives**: Export production-ready 3D files.
- **Tasks**:
  - GLTF / GLB binary exporter preserving hierarchy, materials, and names.
  - OBJ + MTL exporter.
  - IFC (Industry Foundation Classes) BIM schema structure preparation.

---

### Phase 35: Screenshot & Presentation Mode
- [ ] **Status: PENDING**
- **Objectives**: High-resolution rendering and UI cleanup for client demos.
- **Tasks**:
  - Clean fullscreen mode hiding toolbars.
  - Camera snapshot export (PNG) with anti-aliasing.

---

### Phase 36: Solar & Lighting Simulation
- [ ] **Status: PENDING**
- **Objectives**: Realistic daylight simulation.
- **Tasks**:
  - Sun azimuth ($0^\circ - 360^\circ$) and elevation ($0^\circ - 90^\circ$) controls.
  - Realistic directional shadows, ambient occlusion, and night mode interior lighting.

---

### Phase 37: Performance & Memory Optimization
- [ ] **Status: PENDING**
- **Objectives**: 60 FPS rendering on complex multi-room buildings.
- **Tasks**:
  - Geometry caching and selective mesh updates (do not rebuild whole scene on single property edit).
  - Instanced meshes for repeating doors, windows, and chairs.

---

### Phase 38: Comprehensive Automated Testing Suite
- [ ] **Status: PENDING**
- **Objectives**: End-to-end test coverage.
- **Tasks**:
  - Unit tests for CV algorithms (Hough line merging, polygon enclosure).
  - Unit tests for 3D extrusion and CSG boolean cutouts.
  - API integration tests for upload, reconstruction, status, and export.

---

### Phase 39: Architectural Sample Data & Test Fixtures
- [ ] **Status: PENDING**
- **Objectives**: Curated dataset of test plans.
- **Tasks**:
  - Simple 1-Bedroom Studio.
  - 2-Bedroom Urban Apartment.
  - 3-Bedroom Luxury House.
  - Diagonal wall & irregular room test fixture.
  - Two-story multi-floor residence with stairs.

---

### Phase 40: Quantitative Evaluation & Benchmark Metrics
- [ ] **Status: PENDING**
- **Objectives**: Measure perception and geometry precision.
- **Tasks**:
  - Wall detection Precision, Recall, F1, and IoU.
  - Room segmentation boundary IoU.
  - Dimension and area percentage error.
  - Quality score report card display in UI.

---

### Phase 41: Machine Learning Dataset & Training Scripts
- [ ] **Status: PENDING**
- **Objectives**: Tooling for custom deep learning model fine-tuning.
- **Tasks**:
  - Scripts: `scripts/prepare_dataset.py`, `scripts/train_detector.py`, `scripts/evaluate_detector.py`.
  - Support COCO and YOLO annotation export formats.

---

### Phase 42: Vision-Language Model (VLM) Integration
- [ ] **Status: PENDING**
- **Objectives**: Multimodal VLM for ambiguous symbol disambiguation.
- **Tasks**:
  - Query VLM for room labeling and door swing clarification when CV confidence is low.

---

### Phase 43: Architectural Knowledge Graph Engine
- [ ] **Status: PENDING**
- **Objectives**: Graph reasoning over building topology.
- **Tasks**:
  - Spatial relationships (adjacent, connected, accessible, external, internal).

---

### Phase 44: Final UI Polish & Visual Design
- [ ] **Status: PENDING**
- **Objectives**: State-of-the-art architectural CAD aesthetics.
- **Tasks**:
  - Professional typography, refined dark mode palette, micro-animations, glassmorphic HUD.

---

### Phase 45: Comprehensive Error Handling & User Feedback
- [ ] **Status: PENDING**
- **Objectives**: Helpful, human-friendly error messages at every step.
- **Tasks**:
  - Invalid image format, failed wall detection, or non-manifold warnings with suggested remediation.

---

### Phase 46: Structured Backend Logging & Observability
- [ ] **Status: PENDING**
- **Objectives**: Timing metrics and pipeline profiling.
- **Tasks**:
  - Track duration of preprocessing, wall detection, room segmentation, and 3D generation.

---

### Phase 47: Final Documentation & Release Packaging
- [ ] **Status: PENDING**
- **Objectives**: Comprehensive documentation and release notes.
- **Tasks**:
  - Complete `docs/evaluation.md`, `docs/geometry.md`, `docs/ai-models.md`, and deployment guides.

---

## 📌 Development Log & Session History

| Session Date | Phases Worked On | Summary of Changes | Next Planned Phase |
| :--- | :--- | :--- | :--- |
| **2026-08-29** | **Phase 1** | Monorepo setup, FastAPI backend, Async DB engine, React Three Fiber CAD Studio, shared types, automated test suite, pushed to GitHub (`71b1ddb`). | **Phase 2 & 3** |
