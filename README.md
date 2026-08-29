# Plan2Build AI — AI Floor Plan to Editable 3D Building

**Plan2Build AI** is an advanced architectural AI and computational geometry web application that converts 2D floor-plan raster images/PDFs into verified, canonical semantic building representations and reconstructs them into editable, production-grade 3D buildings in an interactive WebGL CAD environment.

---

## 🏛️ System Architecture Overview

```
                      ┌──────────────────────┐
                      │ 2D Floor Plan Image  │
                      │      (PNG / PDF)     │
                      └──────────┬───────────┘
                                 │
                                 ▼
                      ┌──────────────────────┐
                      │  AI / CV Perception  │
                      │  - Wall Vectorization│
                      │  - Room Segmentation │
                      │  - OCR Label Mapping │
                      │  - Scale Estimation  │
                      └──────────┬───────────┘
                                 │
                                 ▼
                      ┌──────────────────────┐
                      │ Semantic Floor Plan  │
                      │ Single Source Truth  │
                      └──────────┬───────────┘
                                 │
                                 ▼
                      ┌──────────────────────┐
                      │  Geometric Validation│
                      │  - Manifoldness      │
                      │  - Opening Clearance │
                      └──────────┬───────────┘
                                 │
                                 ▼
                      ┌──────────────────────┐
                      │ 3D Geometry Engine   │
                      │ - Walls with Cutouts │
                      │ - Floors & Ceilings  │
                      │ - Doors & Windows    │
                      │ - Parametric Props   │
                      └──────────┬───────────┘
                                 │
                                 ▼
                      ┌──────────────────────┐
                      │ Three.js CAD Studio  │
                      │ - 2D / 3D Split View │
                      │ - Real-time Editing  │
                      │ - Day/Night Lighting │
                      │ - GLB / OBJ Export   │
                      └──────────────────────┘
```

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Backend Setup (FastAPI)
```bash
cd apps/api
python -m pip install -r requirements.txt
python -m pytest -v
python app/main.py
```
Backend runs on: `http://localhost:8000` (Swagger UI at `/docs`, Health check at `/api/health`).

### 2. Frontend Setup (React Three Fiber + Vite)
```bash
cd apps/web
npm install
npm run dev
```
Frontend runs on: `http://localhost:5173`.

### 3. Containerized Run (Docker Compose)
```bash
docker-compose up --build
```

---

## 📐 Project Structure

```text
plan2build/
├── apps/
│   ├── web/                    # React + Vite + Three.js + R3F + Tailwind + Zustand
│   │   ├── src/
│   │   │   ├── components/     # Layout, Toolbar, Properties Inspector, Layer Manager
│   │   │   ├── features/       # 2D CAD canvas, 3D R3F Viewport, Upload modal, AI Assistant
│   │   │   ├── stores/         # Zustand stores (projectStore, floorplanStore, viewerStore)
│   │   │   └── types/          # Canonical TypeScript contracts
│   │   └── package.json
│   └── api/                    # FastAPI + Async SQLAlchemy + OpenCV + Shapely
│       ├── app/
│       │   ├── api/v1/         # Health & Project endpoints
│       │   ├── core/           # Config, database engine, storage abstraction, logging
│       │   ├── models/         # SQLAlchemy ORM models
│       │   ├── schemas/        # Canonical Pydantic floorplan schemas
│       │   └── tests/          # Pytest suite
│       └── requirements.txt
├── packages/
│   └── shared-types/           # Shared TypeScript interfaces
├── data/
│   ├── uploads/
│   ├── processed/
│   ├── examples/
│   └── outputs/
├── docs/                       # Specifications (architecture.md, pipeline.md, floorplan-schema.md)
├── docker-compose.yml
├── .env.example
└── README.md
```