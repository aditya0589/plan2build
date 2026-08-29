/**
 * Plan2Build AI - Canonical Shared Types & Schemas
 * Single Source of Truth for 2D Semantic Floor Plans, 3D Geometry, and AI Interop
 */

export type ProjectStatus =
  | 'CREATED'
  | 'UPLOADED'
  | 'PREPROCESSING'
  | 'DETECTING'
  | 'SEGMENTING'
  | 'RECONSTRUCTING'
  | 'GENERATING_3D'
  | 'READY'
  | 'FAILED';

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface BoundingBox2D {
  min_x: number;
  min_y: number;
  max_x: number;
  max_y: number;
}

export interface Dimensions3D {
  width: number;
  depth: number;
  height: number;
}

export type WallType = 'interior' | 'exterior' | 'bearing' | 'partition' | 'curtain';

export interface Wall {
  id: string;
  level_id: string;
  start: Point2D;
  end: Point2D;
  thickness: number; // in meters
  height: number;    // in meters
  type: WallType;
  material_id?: string;
  confidence?: number;
}

export type DoorType = 'single' | 'double' | 'sliding' | 'pocket' | 'bifold' | 'archway';
export type SwingDirection = 'inward_left' | 'inward_right' | 'outward_left' | 'outward_right' | 'sliding';

export interface Door {
  id: string;
  wall_id: string;
  level_id: string;
  position: number; // offset distance in meters from wall.start
  width: number;    // opening width in meters (e.g. 0.9m)
  height: number;   // opening height in meters (e.g. 2.1m)
  type: DoorType;
  swing_direction?: SwingDirection;
  material_id?: string;
  confidence?: number;
}

export type WindowType = 'standard' | 'casement' | 'double_hung' | 'fixed' | 'sliding' | 'bay';

export interface Window {
  id: string;
  wall_id: string;
  level_id: string;
  position: number; // offset distance in meters from wall.start
  width: number;    // opening width in meters (e.g. 1.2m)
  height: number;   // opening height in meters (e.g. 1.4m)
  sill_height: number; // height above floor in meters (e.g. 0.9m)
  type: WindowType;
  material_id?: string;
  confidence?: number;
}

export type RoomType =
  | 'living_room'
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'dining'
  | 'hallway'
  | 'balcony'
  | 'utility'
  | 'study'
  | 'storage'
  | 'garage'
  | 'terrace'
  | 'foyer'
  | 'unknown';

export interface Room {
  id: string;
  level_id: string;
  name: string;
  type: RoomType;
  polygon: Point2D[]; // closed 2D boundary
  area: number;       // calculated area in square meters
  centroid: Point2D;
  floor_material_id?: string;
  wall_material_id?: string;
  ceiling_material_id?: string;
  confidence?: number;
}

export interface Column {
  id: string;
  level_id: string;
  position: Point2D;
  shape: 'rectangular' | 'circular';
  width: number;  // or diameter
  depth: number;
  height: number;
  material_id?: string;
}

export interface Stair {
  id: string;
  level_id: string;
  start: Point2D;
  end: Point2D;
  width: number;
  step_count: number;
  riser_height: number;
  tread_depth: number;
  has_railing: boolean;
}

export type RoofType = 'flat' | 'gable' | 'hip' | 'shed' | 'mansard';

export interface Roof {
  id: string;
  type: RoofType;
  overhang: number;
  thickness: number;
  pitch_degrees: number;
  material_id?: string;
}

export interface FurnitureItem {
  id: string;
  room_id?: string;
  level_id: string;
  item_type: string; // e.g. 'king_bed', 'sofa_3seater', 'dining_table_6p'
  category: 'bedroom' | 'living' | 'dining' | 'kitchen' | 'bathroom' | 'office' | 'outdoor';
  position: Point3D;
  rotation: Point3D;
  dimensions: Dimensions3D;
  material_id?: string;
}

export interface Level {
  id: string;
  name: string;
  elevation: number;       // vertical offset in meters
  height: number;          // ceiling height in meters
  slab_thickness: number;  // floor slab thickness in meters
}

export interface MaterialDef {
  id: string;
  name: string;
  color: string;           // Hex string e.g. '#F4F4F6'
  roughness?: number;
  metalness?: number;
  opacity?: number;
  transparent?: boolean;
  texture_url?: string;
}

export interface SemanticFloorPlan {
  version: string;
  project_id: string;
  units: 'meters' | 'feet';
  scale: number;           // meters per pixel
  bounds: BoundingBox2D;
  levels: Level[];
  walls: Wall[];
  doors: Door[];
  windows: Window[];
  rooms: Room[];
  columns: Column[];
  stairs: Stair[];
  roof?: Roof;
  furniture: FurnitureItem[];
  materials: Record<string, MaterialDef>;
}

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  category: 'topology' | 'enclosure' | 'clearance' | 'geometry' | 'scale';
  element_id?: string;
  element_type?: 'wall' | 'door' | 'window' | 'room' | 'level';
  message: string;
  details?: Record<string, any>;
}

export interface ValidationReport {
  is_valid: boolean;
  error_count: number;
  warning_count: number;
  issues: ValidationIssue[];
}

export interface ReconstructionMetrics {
  wall_detection_confidence: number;
  room_segmentation_confidence: number;
  ocr_confidence: number;
  overall_score: number;
  estimated_area_m2: number;
  total_walls: number;
  total_rooms: number;
  total_doors: number;
  total_windows: number;
  processing_time_seconds: number;
}

export interface ProjectMetadata {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  original_filename?: string;
  file_url?: string;
  status: ProjectStatus;
  metrics?: ReconstructionMetrics;
}

export interface AICommand {
  action:
    | 'resize_room'
    | 'change_material'
    | 'add_wall'
    | 'delete_wall'
    | 'add_opening'
    | 'add_furniture'
    | 'change_level_height'
    | 'custom';
  target_id?: string;
  parameters: Record<string, any>;
  explanation?: string;
}
