import React from 'react';
import {
  Layers,
  Camera,
  Compass,
  Ruler,
} from 'lucide-react';
import { useFloorPlanStore } from '../../stores/floorplanStore';
import { useViewerStore } from '../../stores/viewerStore';

export const StatusBar: React.FC = () => {
  const { plan, activeLevelId, setActiveLevelId } = useFloorPlanStore();
  const { cameraPreset, setCameraPreset, viewMode } = useViewerStore();

  return (
    <footer className="h-9 bg-studio-850 border-t border-studio-750 px-4 flex items-center justify-between text-xs text-slate-400 select-none z-20">
      {/* Levels Switcher */}
      <div className="flex items-center space-x-1">
        <span className="text-[11px] text-slate-500 mr-1 flex items-center space-x-1">
          <Layers className="w-3.5 h-3.5" />
          <span>Level:</span>
        </span>
        {plan.levels.map((lvl) => (
          <button
            key={lvl.id}
            onClick={() => setActiveLevelId(lvl.id)}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition ${
              activeLevelId === lvl.id
                ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
                : 'bg-studio-800 text-slate-400 hover:text-slate-200 border border-studio-700'
            }`}
          >
            {lvl.name} ({lvl.elevation}m)
          </button>
        ))}
      </div>

      {/* Camera Presets (Only active in 3D/Split) */}
      {(viewMode === '3D' || viewMode === 'split') && (
        <div className="flex items-center space-x-1 bg-studio-800 rounded px-1 py-0.5 border border-studio-700">
          <Camera className="w-3 h-3 text-slate-500 mr-1 ml-1" />
          {(['isometric', 'top', 'front', 'perspective'] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => setCameraPreset(preset)}
              className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider transition ${
                cameraPreset === preset
                  ? 'bg-studio-700 text-blue-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      )}

      {/* Metric Units & Coordinate Indicator */}
      <div className="flex items-center space-x-4 text-[11px] font-mono text-slate-400">
        <div className="flex items-center space-x-1">
          <Ruler className="w-3.5 h-3.5 text-slate-500" />
          <span>Units: Meters (1px = {(1 / plan.scale).toFixed(0)}mm)</span>
        </div>
        <div className="flex items-center space-x-1">
          <Compass className="w-3.5 h-3.5 text-slate-500" />
          <span>North: 0.0°</span>
        </div>
      </div>
    </footer>
  );
};
