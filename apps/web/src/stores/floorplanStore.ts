import { create } from 'zustand';
import {
  SemanticFloorPlan,
  Wall,
  Door,
  Window,
  Room,
  FurnitureItem,
  Level,
  MaterialDef,
  CadTool,
} from '../types';
import { SAMPLE_STUDIO_PLAN, SAMPLE_2BED_PLAN } from '../lib/samplePlans';

interface Selection {
  type: 'wall' | 'door' | 'window' | 'room' | 'furniture' | 'column' | 'stair' | 'roof' | 'none';
  id: string | null;
}

interface FloorPlanState {
  plan: SemanticFloorPlan;
  activeLevelId: string;
  activeTool: CadTool;
  selection: Selection;
  hoveredElement: { type: string; id: string } | null;
  underlayImageUrl: string | null;
  underlayOpacity: number;

  // History for undo/redo
  history: SemanticFloorPlan[];
  historyIndex: number;

  // Actions
  setPlan: (plan: SemanticFloorPlan) => void;
  loadSamplePlan: (sampleKey: 'studio' | '2bed') => void;
  setUnderlayImage: (url: string | null) => void;
  setUnderlayOpacity: (opacity: number) => void;
  setActiveTool: (tool: CadTool) => void;
  setActiveLevelId: (levelId: string) => void;
  setSelection: (selection: Selection) => void;
  setHoveredElement: (hover: { type: string; id: string } | null) => void;

  // Element mutations
  updateWall: (id: string, updates: Partial<Wall>) => void;
  addWall: (wall: Wall) => void;
  deleteWall: (id: string) => void;

  updateDoor: (id: string, updates: Partial<Door>) => void;
  addDoor: (door: Door) => void;
  deleteDoor: (id: string) => void;

  updateWindow: (id: string, updates: Partial<Window>) => void;
  addWindow: (win: Window) => void;
  deleteWindow: (id: string) => void;

  updateRoom: (id: string, updates: Partial<Room>) => void;
  addRoom: (room: Room) => void;
  deleteRoom: (id: string) => void;

  updateFurniture: (id: string, updates: Partial<FurnitureItem>) => void;
  addFurniture: (item: FurnitureItem) => void;
  deleteFurniture: (id: string) => void;

  updateMaterial: (id: string, updates: Partial<MaterialDef>) => void;
  updateLevel: (id: string, updates: Partial<Level>) => void;

  // Undo / Redo
  undo: () => void;
  redo: () => void;
}

export const useFloorPlanStore = create<FloorPlanState>((set, get) => ({
  plan: SAMPLE_STUDIO_PLAN,
  activeLevelId: 'level_0',
  activeTool: 'select',
  selection: { type: 'none', id: null },
  hoveredElement: null,
  underlayImageUrl: null,
  underlayOpacity: 0.6,
  history: [SAMPLE_STUDIO_PLAN],
  historyIndex: 0,

  setPlan: (newPlan) => {
    set((state) => ({
      plan: newPlan,
      history: [...state.history.slice(0, state.historyIndex + 1), newPlan],
      historyIndex: state.historyIndex + 1,
    }));
  },

  loadSamplePlan: (sampleKey) => {
    const plan = sampleKey === '2bed' ? SAMPLE_2BED_PLAN : SAMPLE_STUDIO_PLAN;
    set({
      plan,
      activeLevelId: plan.levels[0]?.id || 'level_0',
      selection: { type: 'none', id: null },
      underlayImageUrl: null,
      history: [plan],
      historyIndex: 0,
    });
  },

  setUnderlayImage: (url) => set({ underlayImageUrl: url }),
  setUnderlayOpacity: (opacity) => set({ underlayOpacity: opacity }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  setActiveLevelId: (levelId) => set({ activeLevelId: levelId }),
  setSelection: (selection) => set({ selection }),
  setHoveredElement: (hoveredElement) => set({ hoveredElement }),

  updateWall: (id, updates) => {
    set((state) => {
      const updatedWalls = state.plan.walls.map((w) => (w.id === id ? { ...w, ...updates } : w));
      const newPlan = { ...state.plan, walls: updatedWalls };
      return { plan: newPlan };
    });
  },

  addWall: (wall) => {
    set((state) => {
      const newPlan = { ...state.plan, walls: [...state.plan.walls, wall] };
      return { plan: newPlan };
    });
  },

  deleteWall: (id) => {
    set((state) => {
      const newPlan = {
        ...state.plan,
        walls: state.plan.walls.filter((w) => w.id !== id),
        doors: state.plan.doors.filter((d) => d.wall_id !== id),
        windows: state.plan.windows.filter((w) => w.wall_id !== id),
      };
      return {
        plan: newPlan,
        selection: state.selection.id === id ? { type: 'none', id: null } : state.selection,
      };
    });
  },

  updateDoor: (id, updates) => {
    set((state) => {
      const updatedDoors = state.plan.doors.map((d) => (d.id === id ? { ...d, ...updates } : d));
      return { plan: { ...state.plan, doors: updatedDoors } };
    });
  },

  addDoor: (door) => {
    set((state) => ({ plan: { ...state.plan, doors: [...state.plan.doors, door] } }));
  },

  deleteDoor: (id) => {
    set((state) => ({
      plan: { ...state.plan, doors: state.plan.doors.filter((d) => d.id !== id) },
      selection: state.selection.id === id ? { type: 'none', id: null } : state.selection,
    }));
  },

  updateWindow: (id, updates) => {
    set((state) => {
      const updatedWindows = state.plan.windows.map((w) => (w.id === id ? { ...w, ...updates } : w));
      return { plan: { ...state.plan, windows: updatedWindows } };
    });
  },

  addWindow: (win) => {
    set((state) => ({ plan: { ...state.plan, windows: [...state.plan.windows, win] } }));
  },

  deleteWindow: (id) => {
    set((state) => ({
      plan: { ...state.plan, windows: state.plan.windows.filter((w) => w.id !== id) },
      selection: state.selection.id === id ? { type: 'none', id: null } : state.selection,
    }));
  },

  updateRoom: (id, updates) => {
    set((state) => {
      const updatedRooms = state.plan.rooms.map((r) => (r.id === id ? { ...r, ...updates } : r));
      return { plan: { ...state.plan, rooms: updatedRooms } };
    });
  },

  addRoom: (room) => {
    set((state) => ({ plan: { ...state.plan, rooms: [...state.plan.rooms, room] } }));
  },

  deleteRoom: (id) => {
    set((state) => ({
      plan: { ...state.plan, rooms: state.plan.rooms.filter((r) => r.id !== id) },
      selection: state.selection.id === id ? { type: 'none', id: null } : state.selection,
    }));
  },

  updateFurniture: (id, updates) => {
    set((state) => {
      const updatedFurniture = state.plan.furniture.map((f) => (f.id === id ? { ...f, ...updates } : f));
      return { plan: { ...state.plan, furniture: updatedFurniture } };
    });
  },

  addFurniture: (item) => {
    set((state) => ({ plan: { ...state.plan, furniture: [...state.plan.furniture, item] } }));
  },

  deleteFurniture: (id) => {
    set((state) => ({
      plan: { ...state.plan, furniture: state.plan.furniture.filter((f) => f.id !== id) },
      selection: state.selection.id === id ? { type: 'none', id: null } : state.selection,
    }));
  },

  updateMaterial: (id, updates) => {
    set((state) => {
      const currentMat = state.plan.materials[id] || { id, name: id, color: '#CCCCCC' };
      const updatedMaterials = {
        ...state.plan.materials,
        [id]: { ...currentMat, ...updates },
      };
      return { plan: { ...state.plan, materials: updatedMaterials } };
    });
  },

  updateLevel: (id, updates) => {
    set((state) => {
      const updatedLevels = state.plan.levels.map((lvl) => (lvl.id === id ? { ...lvl, ...updates } : lvl));
      return { plan: { ...state.plan, levels: updatedLevels } };
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      set({
        historyIndex: historyIndex - 1,
        plan: history[historyIndex - 1],
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      set({
        historyIndex: historyIndex + 1,
        plan: history[historyIndex + 1],
      });
    }
  },
}));
