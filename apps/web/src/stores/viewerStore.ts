import { create } from 'zustand';

export type ViewMode = '2D' | '3D' | 'split' | 'walkthrough';
export type LightingPreset = 'day' | 'night' | 'golden_hour' | 'studio';

export interface LayerVisibility {
  walls: boolean;
  doors: boolean;
  windows: boolean;
  rooms: boolean;
  floors: boolean;
  ceilings: boolean;
  roof: boolean;
  furniture: boolean;
  columns: boolean;
  stairs: boolean;
  dimensions: boolean;
  grid: boolean;
}

interface ViewerState {
  viewMode: ViewMode;
  lightingPreset: LightingPreset;
  layers: LayerVisibility;
  cameraPreset: 'perspective' | 'top' | 'front' | 'isometric';
  sunAzimuth: number;    // degrees (0-360)
  sunElevation: number;  // degrees (0-90)
  isPresentationMode: boolean;
  showAiAssistant: boolean;
  showUploadModal: boolean;
  showLayerManager: boolean;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setLightingPreset: (preset: LightingPreset) => void;
  toggleLayer: (layer: keyof LayerVisibility) => void;
  setLayerVisibility: (layer: keyof LayerVisibility, visible: boolean) => void;
  setCameraPreset: (preset: 'perspective' | 'top' | 'front' | 'isometric') => void;
  setSunAngles: (azimuth: number, elevation: number) => void;
  togglePresentationMode: () => void;
  setShowAiAssistant: (show: boolean) => void;
  setShowUploadModal: (show: boolean) => void;
  setShowLayerManager: (show: boolean) => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  viewMode: '3D',
  lightingPreset: 'day',
  layers: {
    walls: true,
    doors: true,
    windows: true,
    rooms: true,
    floors: true,
    ceilings: false,
    roof: false,
    furniture: true,
    columns: true,
    stairs: true,
    dimensions: true,
    grid: true,
  },
  cameraPreset: 'isometric',
  sunAzimuth: 135,
  sunElevation: 45,
  isPresentationMode: false,
  showAiAssistant: false,
  showUploadModal: false,
  showLayerManager: false,

  setViewMode: (viewMode) => set({ viewMode }),
  setLightingPreset: (lightingPreset) => set({ lightingPreset }),
  toggleLayer: (layer) =>
    set((state) => ({
      layers: { ...state.layers, [layer]: !state.layers[layer] },
    })),
  setLayerVisibility: (layer, visible) =>
    set((state) => ({
      layers: { ...state.layers, [layer]: visible },
    })),
  setCameraPreset: (cameraPreset) => set({ cameraPreset }),
  setSunAngles: (sunAzimuth, sunElevation) => set({ sunAzimuth, sunElevation }),
  togglePresentationMode: () =>
    set((state) => ({ isPresentationMode: !state.isPresentationMode })),
  setShowAiAssistant: (showAiAssistant) => set({ showAiAssistant }),
  setShowUploadModal: (showUploadModal) => set({ showUploadModal }),
  setShowLayerManager: (showLayerManager) => set({ showLayerManager }),
}));
