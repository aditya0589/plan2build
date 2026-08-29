import React, { useState, useRef } from 'react';
import { useFloorPlanStore } from '../../stores/floorplanStore';
import { useViewerStore } from '../../stores/viewerStore';

export const FloorPlan2D: React.FC = () => {
  const {
    plan,
    selection,
    setSelection,
    activeTool,
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
                  className="fill-blue-400 font-mono text-[10px] pointer-events-none"
                >
                  {room.area.toFixed(1)} m²
                </text>
              </g>
            );
          })}

        {/* 2. WALLS */}
        {layers.walls &&
          plan.walls.map((wall) => {
            const isSelected = selection.type === 'wall' && selection.id === wall.id;
            const x1 = toSvgX(wall.start.x);
            const y1 = toSvgY(wall.start.y);
            const x2 = toSvgX(wall.end.x);
            const y2 = toSvgY(wall.end.y);
            const strokeW = Math.max(wall.thickness * zoom, 4);

            return (
              <g
                key={wall.id}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelection({ type: 'wall', id: wall.id });
                }}
              >
                {/* Wall Base Stroke */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={
                    isSelected
                      ? '#3B82F6'
                      : wall.type === 'exterior'
                      ? '#94A3B8'
                      : '#64748B'
                  }
                  strokeWidth={strokeW}
                  strokeLinecap="round"
                  className="transition-colors hover:stroke-blue-400"
                />

                {/* Wall Centerline Guide */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isSelected ? '#FFFFFF' : '#1E293B'}
                  strokeWidth={1}
                />

                {/* Dimension label */}
                {layers.dimensions && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - strokeW / 2 - 4}
                    textAnchor="middle"
                    className="fill-slate-400 font-mono text-[9px] pointer-events-none"
                  >
                    {Math.hypot(wall.end.x - wall.start.x, wall.end.y - wall.start.y).toFixed(2)}m
                  </text>
                )}
              </g>
            );
          })}

        {/* 3. DOORS */}
        {layers.doors &&
          plan.doors.map((door) => {
            const hostWall = plan.walls.find((w) => w.id === door.wall_id);
            if (!hostWall) return null;

            const isSelected = selection.type === 'door' && selection.id === door.id;
            const angle = Math.atan2(
              hostWall.end.y - hostWall.start.y,
              hostWall.end.x - hostWall.start.x
            );
            const dx = Math.cos(angle);
            const dy = Math.sin(angle);

            const startX = hostWall.start.x + dx * door.position;
            const startY = hostWall.start.y + dy * door.position;
            const endX = startX + dx * door.width;
            const endY = startY + dy * door.width;

            return (
              <g
                key={door.id}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelection({ type: 'door', id: door.id });
                }}
              >
                {/* Door Opening Gap Marker */}
                <line
                  x1={toSvgX(startX)}
                  y1={toSvgY(startY)}
                  x2={toSvgX(endX)}
                  y2={toSvgY(endY)}
                  stroke={isSelected ? '#F59E0B' : '#FBBF24'}
                  strokeWidth={Math.max(hostWall.thickness * zoom, 4)}
                  strokeDasharray="2 2"
                />

                {/* Door Leaf (Swing Indicator) */}
                <line
                  x1={toSvgX(startX)}
                  y1={toSvgY(startY)}
                  x2={toSvgX(startX - dy * door.width)}
                  y2={toSvgY(startY + dx * door.width)}
                  stroke={isSelected ? '#F59E0B' : '#F59E0B'}
                  strokeWidth={2}
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
            const angle = Math.atan2(
              hostWall.end.y - hostWall.start.y,
              hostWall.end.x - hostWall.start.x
            );
            const dx = Math.cos(angle);
            const dy = Math.sin(angle);

            const startX = hostWall.start.x + dx * win.position;
            const startY = hostWall.start.y + dy * win.position;
            const endX = startX + dx * win.width;
            const endY = startY + dy * win.width;

            return (
              <g
                key={win.id}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelection({ type: 'window', id: win.id });
                }}
              >
                {/* Window Frame Marker */}
                <line
                  x1={toSvgX(startX)}
                  y1={toSvgY(startY)}
                  x2={toSvgX(endX)}
                  y2={toSvgY(endY)}
                  stroke={isSelected ? '#06B6D4' : '#22D3EE'}
                  strokeWidth={Math.max(hostWall.thickness * zoom + 2, 6)}
                />
                <line
                  x1={toSvgX(startX)}
                  y1={toSvgY(startY)}
                  x2={toSvgX(endX)}
                  y2={toSvgY(endY)}
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                />
              </g>
            );
          })}

        {/* 5. COLUMNS */}
        {layers.columns &&
          plan.columns.map((col) => (
            <rect
              key={col.id}
              x={toSvgX(col.position.x - col.width / 2)}
              y={toSvgY(col.position.y - col.depth / 2)}
              width={col.width * zoom}
              height={col.depth * zoom}
              fill="#94A3B8"
              stroke="#64748B"
              strokeWidth={1}
            />
          ))}

        {/* 6. FURNITURE (2D Footprints) */}
        {layers.furniture &&
          plan.furniture.map((furn) => {
            const isSelected = selection.type === 'furniture' && selection.id === furn.id;
            return (
              <rect
                key={furn.id}
                x={toSvgX(furn.position.x - furn.dimensions.width / 2)}
                y={toSvgY(furn.position.y - furn.dimensions.depth / 2)}
                width={furn.dimensions.width * zoom}
                height={furn.dimensions.depth * zoom}
                fill={isSelected ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.2)'}
                stroke={isSelected ? '#6366F1' : 'rgba(99, 102, 241, 0.6)'}
                strokeWidth={1.5}
                rx={2}
                className="cursor-pointer hover:fill-indigo-500/30 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelection({ type: 'furniture', id: furn.id });
                }}
              />
            );
          })}
      </svg>

      {/* 2D Zoom / Pan HUD Overlay */}
      <div className="absolute bottom-4 left-4 bg-studio-850/80 backdrop-blur border border-studio-700 px-3 py-1.5 rounded-lg text-[11px] font-mono text-slate-300 flex items-center space-x-3 select-none">
        <span>Zoom: {(zoom / 45).toFixed(1)}x</span>
        <span>•</span>
        <span>Active Tool: {activeTool.toUpperCase()}</span>
      </div>
    </div>
  );
};
