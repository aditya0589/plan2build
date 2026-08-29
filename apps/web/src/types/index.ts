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
  thickness: number; // meters
  height: number;    // meters
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
  position: number; // offset in meters from wall start
  width: number;    // meters
  height: number;   // meters
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
  position: number; // offset in meters from wall start
  width: number;    // meters
  height: number;   // meters
  sill_height: number; // meters
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
  polygon: Point2D[];
  area: number; // m^2
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
  width: number;
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
  item_type: string;
  category: 'bedroom' | 'living' | 'dining' | 'kitchen' | 'bathroom' | 'office' | 'outdoor';
  position: Point3D;
  rotation: Point3D;
  dimensions: Dimensions3D;
  material_id?: string;
}

export interface Level {
  id: string;
  name: string;
  elevation: number;
  height: number;
  slab_thickness: number;
}

export interface MaterialDef {
  id: string;
  name: string;
  color: string;
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
  scale: number; // meters per pixel
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

export interface ProjectMetadata {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  status: ProjectStatus;
  original_filename?: string;
  original_file_path?: string;
  preprocessed_image_path?: string;
  debug_mask_path?: string;
  floor_plan_data?: SemanticFloorPlan;
  metrics?: Record<string, any>;
}

export type CadTool =
  | 'select'
  | 'wall'
  | 'door'
  | 'window'
  | 'room'
  | 'column'
  | 'stair'
  | 'dimension'
  | 'calibrate'
  | 'pan';
