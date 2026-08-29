# Plan2Build AI — Architecture Specification

## 1. System Vision

**Plan2Build AI** is an end-to-end architectural AI and computational geometry platform that converts 2D floor plan raster images/PDFs into verified, canonical semantic building representations and reconstructs them into editable 3D architectural models rendered in an interactive web-based CAD viewer.

---

## 2. Core Architectural Principle: Strict Separation of Concerns

```
┌────────────────────────────────────────────────────────┐
│               1. Perception Layer (CV / AI)            │
│  - Raster Preprocessing (deskew, filter, threshold)    │
│  - Wall Line Vectorization (Hough, contours, skeleton) │
│  - Room Detection (connected components, polygons)     │
│  - OCR Text & Label Extraction (Tesseract/EasyOCR)     │
│  - Scale & Dimension Estimation (annotations/calib)    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│        2. Canonical Semantic Floor Plan (SSOT)         │
│  - Scaled metric coordinates (meters)                  │
│  - Parametric walls, doors, windows, rooms, levels     │
│  - Topological Connectivity Graph                      │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
              ▼                           ▼
┌───────────────────────────┐ ┌──────────────────────────┐
│   3. Validation Engine    │ │  4. 2D Interactive CAD   │
│  - Geometric manifoldness │ │  - SVG/Canvas editor     │
│  - Loop closure & gaps    │ │  - Human-in-the-loop fix │
│  - Architectural rules    │ │  - Real-time sync to SSOT│
└─────────────┬─────────────┘ └──────────────────────────┘
              │
              ▼
┌────────────────────────────────────────────────────────┐
│         5. Deterministic 3D Geometry Engine            │
│  - Extrusion of walls with CSG door/window cutouts     │
│  - Parametric frames, glass, sills, and hardware       │
│  - Floor slabs, ceilings, roofs, columns, stairs       │
│  - Furniture heuristic placement & material mappings   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             6. 3D Scene Graph & Web Viewer             │
│  - Three.js / React Three Fiber interactive viewport   │
│  - Orbit, First-Person Walkthrough, Layer Toggles      │
│  - Raycasting selection & parametric property editor   │
│  - Safe AI Architect Assistant command execution       │
│  - Multi-floor elevation stacking & GLB/OBJ export     │
└────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend UI & 3D** | React 18/19, TypeScript, Vite, Tailwind CSS, Three.js, `@react-three/fiber`, `@react-three/drei`, Zustand, Lucide Icons |
| **Backend API** | Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0 (Async), aiosqlite / asyncpg, Uvicorn |
| **Computer Vision** | OpenCV (`opencv-python-headless`), NumPy, SciPy, Shapely, PyPDF2 / pdf2image |
| **Geometry & 3D** | Shapely (2D polygons/boolean ops), Trimesh (3D mesh operations & exporters), Three.js (WebGL rendering) |
| **Shared Contracts** | JSON Schema / TypeScript interfaces (`packages/shared-types`) |
| **Storage & Persistence** | PostgreSQL (with SQLite async local fallback), Local Filesystem Storage (with S3/Blob interface) |
| **Testing** | Pytest, Vitest |

---

## 4. Directory Layout

```text
plan2build/
├── apps/
│   ├── web/                     # React + Three.js / R3F frontend application
│   │   ├── src/
│   │   │   ├── components/      # UI components (Header, Toolbar, Inspector, Layers)
│   │   │   ├── features/        # Feature domains (upload, floorplan 2d, viewer 3d, ai-assistant)
│   │   │   ├── stores/          # Zustand stores (projectStore, floorplanStore, viewerStore)
│   │   │   ├── lib/             # API clients, math utilities, geometry helpers
│   │   │   └── types/           # Type definitions
│   │   └── package.json
│   └── api/                     # FastAPI computational backend
│       ├── app/
│       │   ├── api/             # API v1 routes & endpoints
│       │   ├── core/            # Configuration, database session, storage abstraction
│       │   ├── models/          # SQLAlchemy ORM models
│       │   ├── schemas/         # Pydantic validation schemas
│       │   ├── cv/              # Preprocessing, wall/room detection, OCR mapping
│       │   ├── geometry/        # 2D polygon math, 3D mesh generation, openings cutouts
│       │   ├── services/        # Orchestration services & AI command executor
│       │   └── tests/           # Automated pytest suite
│       └── requirements.txt
├── packages/
│   └── shared-types/            # Canonical data types & schemas shared across web & api
├── data/
│   ├── uploads/                 # Original user uploads
│   ├── processed/               # Intermediate CV stage debugging images
│   ├── examples/                # Test fixtures & sample architectural floor plans
│   └── outputs/                 # Exported GLB/OBJ models
├── docs/                        # Specifications and design docs
├── docker-compose.yml
├── .env.example
└── README.md
```
