import React from 'react';
import { Eye, EyeOff, Layers, X, Sliders } from 'lucide-react';
import { useViewerStore, LayerVisibility } from '../../stores/viewerStore';
import { useFloorPlanStore } from '../../stores/floorplanStore';

const LAYER_LABELS: { key: keyof LayerVisibility; label: string }[] = [
  { key: 'walls', label: 'Walls & Partitions' },
  { key: 'doors', label: 'Door Openings & Slabs' },
  { key: 'windows', label: 'Window Openings & Glass' },
  { key: 'rooms', label: 'Room Polygon Overlays' },
  { key: 'floors', label: 'Floor Slabs' },
  { key: 'ceilings', label: 'Ceiling Slabs' },
  { key: 'roof', label: 'Roof Structure' },
  { key: 'furniture', label: 'Furniture Items' },
  { key: 'columns', label: 'Structural Columns' },
  { key: 'stairs', label: 'Staircases' },
  { key: 'dimensions', label: 'Dimension Calipers' },
  { key: 'grid', label: 'Grid Reference Plane' },
];

export const LayerManager: React.FC = () => {
  const { layers, toggleLayer, showLayerManager, setShowLayerManager } = useViewerStore();
  const { underlayImageUrl, underlayOpacity, setUnderlayOpacity } = useFloorPlanStore();

  if (!showLayerManager) return null;

  return (
    <div className="absolute top-16 right-84 w-64 bg-studio-850/95 backdrop-blur-md border border-studio-700 rounded-xl shadow-2xl z-40 p-4 select-none animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between border-b border-studio-750 pb-2.5 mb-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
          <Layers className="w-4 h-4 text-blue-400" />
          <span>Layer Visibility</span>
        </div>
        <button
          onClick={() => setShowLayerManager(false)}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-studio-750 transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {underlayImageUrl && (
        <div className="mb-3 pb-3 border-b border-studio-750 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="flex items-center space-x-1.5">
              <Sliders className="w-3 h-3 text-blue-400" />
              <span>Original Plan Underlay</span>
            </span>
            <span className="font-mono text-slate-400">{Math.round(underlayOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={underlayOpacity}
            onChange={(e) => setUnderlayOpacity(parseFloat(e.target.value))}
            className="w-full h-1 bg-studio-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      )}

      <div className="space-y-1">
        {LAYER_LABELS.map(({ key, label }) => {
          const isVisible = layers[key];
          return (
            <button
              key={key}
              onClick={() => toggleLayer(key)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
                isVisible
                  ? 'bg-studio-800 text-slate-200 hover:bg-studio-750'
                  : 'text-slate-500 hover:bg-studio-800/50'
              }`}
            >
              <span>{label}</span>
              {isVisible ? (
                <Eye className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-slate-600" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
