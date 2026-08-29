import React from 'react';
import {
  Sliders,
  Trash2,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useFloorPlanStore } from '../../stores/floorplanStore';
import { RoomType, WallType } from '../../types';

export const PropertiesPanel: React.FC = () => {
  const {
    plan,
    selection,
    setSelection,
    updateWall,
    deleteWall,
    updateDoor,
    deleteDoor,
    updateWindow,
    deleteWindow,
    updateRoom,
    deleteRoom,
    updateFurniture,
    deleteFurniture,
  } = useFloorPlanStore();

  if (selection.type === 'none' || !selection.id) {
    return (
      <aside className="w-80 bg-studio-850 border-l border-studio-750 p-4 flex flex-col justify-between overflow-y-auto select-none">
        <div>
          <div className="flex items-center space-x-2 text-slate-300 font-semibold text-sm border-b border-studio-750 pb-3 mb-4">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>Building Overview</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-studio-800 rounded-lg border border-studio-700">
              <div className="text-xs text-slate-400 mb-1">Total Floor Area</div>
              <div className="text-xl font-bold text-white font-mono">
                {plan.rooms.reduce((acc, r) => acc + r.area, 0).toFixed(1)} m²
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-studio-800 rounded-lg border border-studio-700">
                <span className="text-slate-400 block mb-0.5">Walls</span>
                <span className="text-base font-semibold text-slate-200">{plan.walls.length}</span>
              </div>
              <div className="p-2.5 bg-studio-800 rounded-lg border border-studio-700">
                <span className="text-slate-400 block mb-0.5">Rooms</span>
                <span className="text-base font-semibold text-slate-200">{plan.rooms.length}</span>
              </div>
              <div className="p-2.5 bg-studio-800 rounded-lg border border-studio-700">
                <span className="text-slate-400 block mb-0.5">Doors</span>
                <span className="text-base font-semibold text-slate-200">{plan.doors.length}</span>
              </div>
              <div className="p-2.5 bg-studio-800 rounded-lg border border-studio-700">
                <span className="text-slate-400 block mb-0.5">Windows</span>
                <span className="text-base font-semibold text-slate-200">{plan.windows.length}</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300 flex items-start space-x-2">
              <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <span>Click on any wall, room, door, or window in either 2D CAD or 3D view to inspect and edit properties.</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-studio-750 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Scale: {plan.scale} m/px</span>
          <span className="text-emerald-400 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Geometry Validated</span>
          </span>
        </div>
      </aside>
    );
  }

  // --- WALL INSPECTOR ---
  if (selection.type === 'wall') {
    const wall = plan.walls.find((w) => w.id === selection.id);
    if (!wall) return null;

    const length = Math.hypot(wall.end.x - wall.start.x, wall.end.y - wall.start.y);

    return (
      <aside className="w-80 bg-studio-850 border-l border-studio-750 p-4 flex flex-col justify-between overflow-y-auto select-none">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-studio-750 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="font-semibold text-sm text-slate-200">Wall Inspector</span>
            </div>
            <button
              onClick={() => deleteWall(wall.id)}
              className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-studio-750 transition"
              title="Delete Wall"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Wall Type</label>
              <select
                value={wall.type}
                onChange={(e) => updateWall(wall.id, { type: e.target.value as WallType })}
                className="w-full bg-studio-800 border border-studio-700 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="interior">Interior Partition</option>
                <option value="exterior">Exterior Envelope</option>
                <option value="bearing">Load-Bearing</option>
                <option value="partition">Light Partition</option>
                <option value="curtain">Curtain Wall</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Length (m)</label>
              <input
                type="text"
                readOnly
                value={`${length.toFixed(2)} m`}
                className="w-full bg-studio-800/50 border border-studio-700/50 rounded-md px-2.5 py-1.5 text-slate-300 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Thickness (m)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.05"
                  max="1.0"
                  value={wall.thickness}
                  onChange={(e) => updateWall(wall.id, { thickness: parseFloat(e.target.value) || 0.2 })}
                  className="w-full bg-studio-800 border border-studio-700 rounded-md px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Height (m)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="10.0"
                  value={wall.height}
                  onChange={(e) => updateWall(wall.id, { height: parseFloat(e.target.value) || 2.8 })}
                  className="w-full bg-studio-800 border border-studio-700 rounded-md px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Material</label>
              <select
                value={wall.material_id || 'mat_plaster_white'}
                onChange={(e) => updateWall(wall.id, { material_id: e.target.value })}
                className="w-full bg-studio-800 border border-studio-700 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {Object.values(plan.materials).map((mat) => (
                  <option key={mat.id} value={mat.id}>
                    {mat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={() => setSelection({ type: 'none', id: null })}
          className="w-full py-2 bg-studio-800 hover:bg-studio-750 text-slate-300 text-xs font-medium rounded-lg border border-studio-700 transition"
        >
          Deselect
        </button>
      </aside>
    );
  }

  // --- ROOM INSPECTOR ---
  if (selection.type === 'room') {
    const room = plan.rooms.find((r) => r.id === selection.id);
    if (!room) return null;

    return (
      <aside className="w-80 bg-studio-850 border-l border-studio-750 p-4 flex flex-col justify-between overflow-y-auto select-none">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-studio-750 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="font-semibold text-sm text-slate-200">Room Inspector</span>
            </div>
            <button
              onClick={() => deleteRoom(room.id)}
              className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-studio-750 transition"
              title="Delete Room"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Room Name</label>
              <input
                type="text"
                value={room.name}
                onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                className="w-full bg-studio-800 border border-studio-700 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Room Classification</label>
              <select
                value={room.type}
                onChange={(e) => updateRoom(room.id, { type: e.target.value as RoomType })}
                className="w-full bg-studio-800 border border-studio-700 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="living_room">Living Room</option>
                <option value="bedroom">Bedroom</option>
                <option value="kitchen">Kitchen</option>
                <option value="bathroom">Bathroom</option>
                <option value="dining">Dining Room</option>
                <option value="hallway">Hallway / Corridor</option>
                <option value="balcony">Balcony / Terrace</option>
                <option value="study">Home Office / Study</option>
                <option value="storage">Storage / Utility</option>
                <option value="unknown">Unspecified</option>
              </select>
            </div>

            <div className="p-3 bg-studio-800 rounded-lg border border-studio-700">
              <span className="text-slate-400 block mb-0.5">Calculated Area</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">{room.area.toFixed(2)} m²</span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Floor Material</label>
              <select
                value={room.floor_material_id || 'mat_parquet_oak'}
                onChange={(e) => updateRoom(room.id, { floor_material_id: e.target.value })}
                className="w-full bg-studio-800 border border-studio-700 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {Object.values(plan.materials).map((mat) => (
                  <option key={mat.id} value={mat.id}>
                    {mat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={() => setSelection({ type: 'none', id: null })}
          className="w-full py-2 bg-studio-800 hover:bg-studio-750 text-slate-300 text-xs font-medium rounded-lg border border-studio-700 transition"
        >
          Deselect
        </button>
      </aside>
    );
  }

  // --- DOOR / WINDOW INSPECTOR ---
  if (selection.type === 'door' || selection.type === 'window') {
    const isDoor = selection.type === 'door';
    const item = isDoor
      ? plan.doors.find((d) => d.id === selection.id)
      : plan.windows.find((w) => w.id === selection.id);
    if (!item) return null;

    return (
      <aside className="w-80 bg-studio-850 border-l border-studio-750 p-4 flex flex-col justify-between overflow-y-auto select-none">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-studio-750 pb-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isDoor ? 'bg-amber-500' : 'bg-cyan-500'}`} />
              <span className="font-semibold text-sm text-slate-200">
                {isDoor ? 'Door Opening' : 'Window Opening'}
              </span>
            </div>
            <button
              onClick={() => (isDoor ? deleteDoor(item.id) : deleteWindow(item.id))}
              className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-studio-750 transition"
              title="Delete Opening"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Width (m)</label>
                <input
                  type="number"
                  step="0.05"
                  value={item.width}
                  onChange={(e) => {
                    const width = parseFloat(e.target.value) || 0.9;
                    isDoor ? updateDoor(item.id, { width }) : updateWindow(item.id, { width });
                  }}
                  className="w-full bg-studio-800 border border-studio-700 rounded-md px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Height (m)</label>
                <input
                  type="number"
                  step="0.05"
                  value={item.height}
                  onChange={(e) => {
                    const height = parseFloat(e.target.value) || 2.1;
                    isDoor ? updateDoor(item.id, { height }) : updateWindow(item.id, { height });
                  }}
                  className="w-full bg-studio-800 border border-studio-700 rounded-md px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {!isDoor && (
              <div>
                <label className="text-slate-400 block mb-1">Sill Height (m)</label>
                <input
                  type="number"
                  step="0.05"
                  value={(item as any).sill_height || 0.9}
                  onChange={(e) =>
                    updateWindow(item.id, { sill_height: parseFloat(e.target.value) || 0.9 })
                  }
                  className="w-full bg-studio-800 border border-studio-700 rounded-md px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            <div>
              <label className="text-slate-400 block mb-1">Position on Wall (m)</label>
              <input
                type="number"
                step="0.1"
                value={item.position}
                onChange={(e) => {
                  const position = parseFloat(e.target.value) || 0;
                  isDoor ? updateDoor(item.id, { position }) : updateWindow(item.id, { position });
                }}
                className="w-full bg-studio-800 border border-studio-700 rounded-md px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => setSelection({ type: 'none', id: null })}
          className="w-full py-2 bg-studio-800 hover:bg-studio-750 text-slate-300 text-xs font-medium rounded-lg border border-studio-700 transition"
        >
          Deselect
        </button>
      </aside>
    );
  }

  // --- FURNITURE INSPECTOR ---
  if (selection.type === 'furniture') {
    const furn = plan.furniture.find((f) => f.id === selection.id);
    if (!furn) return null;

    return (
      <aside className="w-80 bg-studio-850 border-l border-studio-750 p-4 flex flex-col justify-between overflow-y-auto select-none">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-studio-750 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
              <span className="font-semibold text-sm text-slate-200">Furniture Item</span>
            </div>
            <button
              onClick={() => deleteFurniture(furn.id)}
              className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-studio-750 transition"
              title="Delete Furniture"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Item Model</label>
              <input
                type="text"
                readOnly
                value={furn.item_type}
                className="w-full bg-studio-800/50 border border-studio-700/50 rounded-md px-2.5 py-1.5 text-slate-300 font-mono capitalize"
              />
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <div>
                <label className="text-slate-400 block mb-1">Width</label>
                <input
                  type="number"
                  step="0.1"
                  value={furn.dimensions.width}
                  onChange={(e) =>
                    updateFurniture(furn.id, {
                      dimensions: { ...furn.dimensions, width: parseFloat(e.target.value) || 1 },
                    })
                  }
                  className="w-full bg-studio-800 border border-studio-700 rounded px-2 py-1 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Depth</label>
                <input
                  type="number"
                  step="0.1"
                  value={furn.dimensions.depth}
                  onChange={(e) =>
                    updateFurniture(furn.id, {
                      dimensions: { ...furn.dimensions, depth: parseFloat(e.target.value) || 1 },
                    })
                  }
                  className="w-full bg-studio-800 border border-studio-700 rounded px-2 py-1 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Height</label>
                <input
                  type="number"
                  step="0.1"
                  value={furn.dimensions.height}
                  onChange={(e) =>
                    updateFurniture(furn.id, {
                      dimensions: { ...furn.dimensions, height: parseFloat(e.target.value) || 1 },
                    })
                  }
                  className="w-full bg-studio-800 border border-studio-700 rounded px-2 py-1 text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setSelection({ type: 'none', id: null })}
          className="w-full py-2 bg-studio-800 hover:bg-studio-750 text-slate-300 text-xs font-medium rounded-lg border border-studio-700 transition"
        >
          Deselect
        </button>
      </aside>
    );
  }

  return null;
};
