import React, { useState, useRef } from 'react';
import { useFloorPlanStore } from '../../stores/floorplanStore';
import { useViewerStore } from '../../stores/viewerStore';

export const FloorPlan2D: React.FC = () => {
  const {
    plan,
    selection,
    setSelection,
    activeTool,
    underlayImageUrl,
    underlayOpacity,
  } = useFloorPlanStore();
  const { layers } = useViewerStore();

  const [zoom, setZoom] = useState(45); // pixels per meter
  const [pan, setPan] = useState({ x: 180, y: 140 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'pan' || e.button === 1 || e.altKey) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 15), 180));
  };

  // Convert metric coordinates (x, y) to SVG canvas coordinates
  const toSvgX = (mX: number) => pan.x + mX * zoom;
  const toSvgY = (mY: number) => pan.y + mY * zoom;

  // Calculate plan boundary
  let maxW = 12;
  let maxH = 10;
  plan.walls.forEach((w) => {
    maxW = Math.max(maxW, w.start.x, w.end.x);
    maxH = Math.max(maxH, w.start.y, w.end.y);
  });

  return (
    <div
      className="w-full h-full relative overflow-hidden bg-studio-900 cad-grid-bg select-none cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      <svg
        ref={svgRef}
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid-pattern" width={zoom} height={zoom} patternUnits="userSpaceOnUse">
            <path
              d={`M ${zoom} 0 L 0 0 0 ${zoom}`}
              fill="none"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        {layers.grid && (
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        )}

        {/* 0. UNDERLAY ARCHITECTURAL DRAWING IMAGE */}
        {underlayImageUrl && (
          <image
            href={underlayImageUrl}
            x={toSvgX(0)}
            y={toSvgY(0)}
            width={(maxW + 1) * zoom}
            height={(maxH + 1) * zoom}
            opacity={underlayOpacity}
            preserveAspectRatio="none"
            style={{ pointerEvents: 'none' }}
          />
        )}

        {/* 1. ROOMS (Polygons & Labels) */}
        {layers.rooms &&
          plan.rooms.map((room) => {
            const isSelected = selection.type === 'room' && selection.id === room.id;
            const pointsString = room.polygon
              .map((p) => `${toSvgX(p.x)},${toSvgY(p.y)}`)
              .join(' ');

            return (
              <g key={room.id}>
                <polygon
                  points={pointsString}
                  fill={isSelected ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.08)'}
                  stroke={isSelected ? '#3B82F6' : 'rgba(59, 130, 246, 0.3)'}
                  strokeWidth={isSelected ? 2 : 1}
                  strokeDasharray="4 2"
                  className="cursor-pointer transition-all hover:fill-blue-500/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelection({ type: 'room', id: room.id });
                  }}
                />
                {/* Room Label & Area */}
                <text
                  x={toSvgX(room.centroid.x)}
                  y={toSvgY(room.centroid.y)}
                  textAnchor="middle"
                  className="fill-slate-300 font-sans font-semibold text-[11px] pointer-events-none"
                >
                  {room.name}
                </text>
                <text
                  x={toSvgX(room.centroid.x)}
                  y={toSvgY(room.centroid.y) + 14}
                  textAnchor="middle"
                  className="fill-slate-500 font-mono text-[9px] pointer-events-none"
                >
                  {room.area.toFixed(1)} m²
                </text>
              </g>
            );
          })}

        {/* 2. WALL FOOTPRINTS & CENTERLINES */}
        {layers.walls &&
          plan.walls.map((wall) => {
            const isSelected = selection.type === 'wall' && selection.id === wall.id;
            const x1 = toSvgX(wall.start.x);
            const y1 = toSvgY(wall.start.y);
            const x2 = toSvgX(wall.end.x);
            const y2 = toSvgY(wall.end.y);

            return (
              <g key={wall.id} className="cursor-pointer">
                {/* Wall thickness stroke */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isSelected ? '#3B82F6' : wall.type === 'exterior' ? '#E2E8F0' : '#94A3B8'}
                  strokeWidth={wall.thickness * zoom}
                  strokeLinecap="square"
                  className="transition-colors hover:stroke-blue-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelection({ type: 'wall', id: wall.id });
                  }}
                />
                {/* Centerline indicator */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isSelected ? '#60A5FA' : 'rgba(0, 0, 0, 0.4)'}
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  pointerEvents="none"
                />
              </g>
            );
          })}

        {/* 3. DOORS */}
        {layers.doors &&
          plan.doors.map((door) => {
            const hostWall = plan.walls.find((w) => w.id === door.wall_id);
            if (!hostWall) return null;

            const isSelected = selection.type === 'door' && selection.id === door.id;

            // Compute door center along host wall
            const dx = hostWall.end.x - hostWall.start.x;
            const dy = hostWall.end.y - hostWall.start.y;
            const wallLen = Math.hypot(dx, dy);
            const ratio = wallLen > 0 ? door.position / wallLen : 0.5;

            const cx = hostWall.start.x + dx * ratio;
            const cy = hostWall.start.y + dy * ratio;

            return (
              <g
                key={door.id}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelection({ type: 'door', id: door.id });
                }}
              >
                {/* Door opening gap cutout indicator */}
                <circle
                  cx={toSvgX(cx)}
                  cy={toSvgY(cy)}
                  r={(door.width / 2) * zoom}
                  fill="none"
                  stroke={isSelected ? '#3B82F6' : '#F59E0B'}
                  strokeWidth="2"
                  strokeDasharray="2 2"
                />
                <circle
                  cx={toSvgX(cx)}
                  cy={toSvgY(cy)}
                  r="3"
                  fill={isSelected ? '#3B82F6' : '#F59E0B'}
                />
              </g>
            );
          })}

        {/* 4. WINDOWS */}
        {layers.windows &&
          plan.windows.map((win) => {
            const hostWall = plan.walls.find((w) => w.id === win.wall_id);
            if (!hostWall) return null;

            const isSelected = selection.type === 'window' && selection.id === win.id;

            const dx = hostWall.end.x - hostWall.start.x;
            const dy = hostWall.end.y - hostWall.start.y;
            const wallLen = Math.hypot(dx, dy);
            const ratio = wallLen > 0 ? win.position / wallLen : 0.5;

            const cx = hostWall.start.x + dx * ratio;
            const cy = hostWall.start.y + dy * ratio;

            return (
              <g
                key={win.id}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelection({ type: 'window', id: win.id });
                }}
              >
                <rect
                  x={toSvgX(cx) - ((win.width / 2) * zoom)}
                  y={toSvgY(cy) - 4}
                  width={win.width * zoom}
                  height="8"
                  fill={isSelected ? '#60A5FA' : '#38BDF8'}
                  stroke={isSelected ? '#2563EB' : '#0284C7'}
                  strokeWidth="1.5"
                  rx="1"
                />
              </g>
            );
          })}

        {/* 5. COLUMNS */}
        {layers.columns &&
          plan.columns.map((col) => {
            const isSelected = selection.type === 'column' && selection.id === col.id;
            return (
              <g
                key={col.id}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelection({ type: 'column', id: col.id });
                }}
              >
                <rect
                  x={toSvgX(col.position.x - col.width / 2)}
                  y={toSvgY(col.position.y - col.depth / 2)}
                  width={col.width * zoom}
                  height={col.depth * zoom}
                  fill={isSelected ? '#3B82F6' : '#64748B'}
                  stroke={isSelected ? '#93C5FD' : '#334155'}
                  strokeWidth="1.5"
                />
              </g>
            );
          })}

        {/* 6. FURNITURE */}
        {layers.furniture &&
          plan.furniture.map((item) => {
            const isSelected = selection.type === 'furniture' && selection.id === item.id;
            const rotAngle = item.rotation ? item.rotation.z || item.rotation.y || 0 : 0;
            return (
              <g
                key={item.id}
                className="cursor-pointer"
                transform={`rotate(${rotAngle}, ${toSvgX(item.position.x)}, ${toSvgY(
                  item.position.y
                )})`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelection({ type: 'furniture', id: item.id });
                }}
              >
                <rect
                  x={toSvgX(item.position.x - item.dimensions.width / 2)}
                  y={toSvgY(item.position.y - item.dimensions.depth / 2)}
                  width={item.dimensions.width * zoom}
                  height={item.dimensions.depth * zoom}
                  fill={isSelected ? 'rgba(59, 130, 246, 0.4)' : 'rgba(148, 163, 184, 0.2)'}
                  stroke={isSelected ? '#3B82F6' : '#94A3B8'}
                  strokeWidth="1"
                  rx="3"
                />
                <text
                  x={toSvgX(item.position.x)}
                  y={toSvgY(item.position.y)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-400 font-mono text-[8px] pointer-events-none"
                >
                  {item.category}
                </text>
              </g>
            );
          })}
      </svg>

      {/* Viewport Floating Controls */}
      <div className="absolute bottom-4 right-4 bg-studio-850/90 backdrop-blur border border-studio-700 rounded-xl p-1.5 flex items-center space-x-2 shadow-lg text-xs font-mono text-slate-300">
        <button
          onClick={() => setZoom((prev) => Math.max(prev * 0.85, 15))}
          className="px-2 py-1 bg-studio-800 hover:bg-studio-750 rounded text-slate-200"
          title="Zoom Out"
        >
          -
        </button>
        <span className="min-w-[50px] text-center">{Math.round(zoom)} px/m</span>
        <button
          onClick={() => setZoom((prev) => Math.min(prev * 1.15, 180))}
          className="px-2 py-1 bg-studio-800 hover:bg-studio-750 rounded text-slate-200"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => {
            setZoom(45);
            setPan({ x: 180, y: 140 });
          }}
          className="px-2 py-1 bg-studio-800 hover:bg-studio-750 rounded text-[11px] text-blue-400"
          title="Reset View"
        >
          Reset
        </button>
      </div>
    </div>
  );
};
