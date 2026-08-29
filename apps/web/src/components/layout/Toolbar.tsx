import React from 'react';
import {
  MousePointer2,
  Square,
  DoorOpen,
  AppWindow,
  Shapes,
  Columns,
  Footprints,
  Ruler,
  Scale,
  Hand,
} from 'lucide-react';
import { useFloorPlanStore } from '../../stores/floorplanStore';
import { CadTool } from '../../types';

interface ToolItem {
  id: CadTool;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut: string;
}

const TOOLS: ToolItem[] = [
  { id: 'select', label: 'Select & Move', icon: MousePointer2, shortcut: 'V' },
  { id: 'wall', label: 'Draw Wall', icon: Square, shortcut: 'W' },
  { id: 'door', label: 'Place Door', icon: DoorOpen, shortcut: 'D' },
  { id: 'window', label: 'Place Window', icon: AppWindow, shortcut: 'N' },
  { id: 'room', label: 'Define Room', icon: Shapes, shortcut: 'R' },
  { id: 'column', label: 'Structural Column', icon: Columns, shortcut: 'C' },
  { id: 'stair', label: 'Staircase', icon: Footprints, shortcut: 'S' },
  { id: 'dimension', label: 'Measure Dimension', icon: Ruler, shortcut: 'M' },
  { id: 'calibrate', label: 'Calibrate Scale', icon: Scale, shortcut: 'K' },
  { id: 'pan', label: 'Pan Canvas', icon: Hand, shortcut: 'H' },
];

export const Toolbar: React.FC = () => {
  const { activeTool, setActiveTool } = useFloorPlanStore();

  return (
    <aside className="w-14 bg-studio-850 border-r border-studio-750 flex flex-col items-center py-3 space-y-1.5 z-20 select-none">
      {TOOLS.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;

        return (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center relative group transition-all ${
              isActive
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-studio-750'
            }`}
            title={`${tool.label} (${tool.shortcut})`}
          >
            <Icon className="w-5 h-5" />

            {/* Tooltip */}
            <div className="absolute left-14 hidden group-hover:flex items-center space-x-1.5 px-2.5 py-1 bg-studio-900 border border-studio-700 text-slate-200 text-xs rounded shadow-lg whitespace-nowrap z-50 pointer-events-none">
              <span>{tool.label}</span>
              <span className="text-[10px] text-slate-400 font-mono bg-studio-800 px-1 rounded border border-studio-700">
                {tool.shortcut}
              </span>
            </div>
          </button>
        );
      })}
    </aside>
  );
};
