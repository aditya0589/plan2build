import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  Grid,
  Sky,
  ContactShadows,
} from '@react-three/drei';
import * as THREE from 'three';
import { useFloorPlanStore } from '../../stores/floorplanStore';
import { useViewerStore } from '../../stores/viewerStore';
import { Wall, Door, Window, Room, FurnitureItem } from '../../types';

// --- PARAMETRIC WALL MESH WITH OPENING CUTOUTS ---
const WallMesh3D: React.FC<{
  wall: Wall;
  doors: Door[];
  windows: Window[];
  materialColor: string;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ wall, doors, windows, materialColor, isSelected, onSelect }) => {
  const length = Math.hypot(wall.end.x - wall.start.x, wall.end.y - wall.start.y);
  const angle = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x);

  const midX = (wall.start.x + wall.end.x) / 2;
  const midZ = -(wall.start.y + wall.end.y) / 2; // Y in 2D maps to -Z in 3D Three.js

  // Filter openings on this wall
  const wallDoors = doors.filter((d) => d.wall_id === wall.id);
  const wallWindows = windows.filter((w) => w.wall_id === wall.id);

  // If no openings, render clean solid extruded wall box
  if (wallDoors.length === 0 && wallWindows.length === 0) {
    return (
      <group position={[midX, wall.height / 2, midZ]} rotation={[0, -angle, 0]}>
        <mesh
          castShadow
          receiveShadow
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          <boxGeometry args={[length, wall.height, wall.thickness]} />
          <meshStandardMaterial
            color={isSelected ? '#3B82F6' : materialColor}
            roughness={0.7}
            metalness={0.05}
          />
        </mesh>
      </group>
    );
  }

  // With openings: render subdivided wall segments (left, right, lintel headers, sills)
  // Gather opening intervals [start, end]
  const intervals: { start: number; end: number; type: 'door' | 'window'; obj: any }[] = [];
  wallDoors.forEach((d) => {
    intervals.push({ start: d.position, end: d.position + d.width, type: 'door', obj: d });
  });
  wallWindows.forEach((w) => {
    intervals.push({ start: w.position, end: w.position + w.width, type: 'window', obj: w });
  });
  intervals.sort((a, b) => a.start - b.start);

  return (
    <group position={[wall.start.x, 0, -wall.start.y]} rotation={[0, -angle, 0]}>
      {/* Wall Segments */}
      {(() => {
        const segments: JSX.Element[] = [];
        let curr = 0;

        intervals.forEach((interval, idx) => {
          // Left solid segment before opening
          if (interval.start > curr + 0.01) {
            const segLen = interval.start - curr;
            const segCenterX = curr + segLen / 2;
            segments.push(
              <mesh
                key={`seg_${idx}_${curr}`}
                position={[segCenterX, wall.height / 2, 0]}
                castShadow
                receiveShadow
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
              >
                <boxGeometry args={[segLen, wall.height, wall.thickness]} />
                <meshStandardMaterial
                  color={isSelected ? '#3B82F6' : materialColor}
                  roughness={0.7}
                />
              </mesh>
            );
          }

          // Top Header over door/window
          const openLen = interval.end - interval.start;
          const openCenterX = interval.start + openLen / 2;
          const openTop =
            interval.type === 'door'
              ? interval.obj.height
              : interval.obj.sill_height + interval.obj.height;
          const headerH = Math.max(wall.height - openTop, 0.05);

          segments.push(
            <mesh
              key={`header_${idx}`}
              position={[openCenterX, wall.height - headerH / 2, 0]}
              castShadow
              receiveShadow
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              <boxGeometry args={[openLen, headerH, wall.thickness]} />
              <meshStandardMaterial
                color={isSelected ? '#3B82F6' : materialColor}
                roughness={0.7}
              />
            </mesh>
          );

          // Bottom Sill under window
          if (interval.type === 'window') {
            const sillH = interval.obj.sill_height;
            if (sillH > 0.05) {
              segments.push(
                <mesh
                  key={`sill_${idx}`}
                  position={[openCenterX, sillH / 2, 0]}
                  castShadow
                  receiveShadow
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect();
                  }}
                >
                  <boxGeometry args={[openLen, sillH, wall.thickness]} />
                  <meshStandardMaterial
                    color={isSelected ? '#3B82F6' : materialColor}
                    roughness={0.7}
                  />
                </mesh>
              );
            }
          }

          curr = interval.end;
        });

        // Final solid wall segment
        if (curr < length - 0.01) {
          const segLen = length - curr;
          const segCenterX = curr + segLen / 2;
          segments.push(
            <mesh
              key="seg_final"
              position={[segCenterX, wall.height / 2, 0]}
              castShadow
              receiveShadow
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              <boxGeometry args={[segLen, wall.height, wall.thickness]} />
              <meshStandardMaterial
                color={isSelected ? '#3B82F6' : materialColor}
                roughness={0.7}
              />
            </mesh>
          );
        }

        return segments;
      })()}
    </group>
  );
};

// --- PARAMETRIC DOOR MESH ---
const DoorMesh3D: React.FC<{ door: Door; wall: Wall; isSelected: boolean; onSelect: () => void }> = ({
  door,
  wall,
  isSelected,
  onSelect,
}) => {
  const angle = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x);
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);

  const posX = wall.start.x + dx * (door.position + door.width / 2);
  const posZ = -(wall.start.y + dy * (door.position + door.width / 2));

  return (
    <group position={[posX, door.height / 2, posZ]} rotation={[0, -angle, 0]}>
      {/* Wooden Door Slab (Swung open slightly) */}
      <mesh
        castShadow
        receiveShadow
        position={[-door.width * 0.2, 0, 0.15]}
        rotation={[0, 0.45, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <boxGeometry args={[door.width * 0.95, door.height * 0.98, 0.045]} />
        <meshStandardMaterial
          color={isSelected ? '#F59E0B' : '#B8860B'}
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>

      {/* Door Handle */}
      <mesh position={[-door.width * 0.4, 0, 0.2]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
};

// --- PARAMETRIC WINDOW MESH ---
const WindowMesh3D: React.FC<{
  window: Window;
  wall: Wall;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ window: win, wall, isSelected, onSelect }) => {
  const angle = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x);
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);

  const posX = wall.start.x + dx * (win.position + win.width / 2);
  const posZ = -(wall.start.y + dy * (win.position + win.width / 2));
  const posY = win.sill_height + win.height / 2;

  return (
    <group position={[posX, posY, posZ]} rotation={[0, -angle, 0]}>
      {/* Translucent Glass Pane */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <boxGeometry args={[win.width * 0.96, win.height * 0.96, 0.02]} />
        <meshStandardMaterial
          color={isSelected ? '#06B6D4' : '#BAE6FD'}
          roughness={0.1}
          metalness={0.1}
          opacity={0.35}
          transparent
        />
      </mesh>

      {/* Architectural Window Frame */}
      <mesh>
        <boxGeometry args={[win.width, win.height, wall.thickness * 0.8]} />
        <meshStandardMaterial color="#334155" wireframe={false} roughness={0.4} />
      </mesh>
    </group>
  );
};

// --- PARAMETRIC FLOOR SLAB ---
const FloorMesh3D: React.FC<{ room: Room; isSelected: boolean; onSelect: () => void }> = ({
  room,
  isSelected,
  onSelect,
}) => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    if (room.polygon.length < 3) return s;
    s.moveTo(room.polygon[0].x, -room.polygon[0].y);
    for (let i = 1; i < room.polygon.length; i++) {
      s.lineTo(room.polygon[i].x, -room.polygon[i].y);
    }
    s.closePath();
    return s;
  }, [room.polygon]);

  return (
    <mesh
      receiveShadow
      position={[0, -0.05, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <extrudeGeometry args={[shape, { depth: 0.1, bevelEnabled: false }]} />
      <meshStandardMaterial
        color={isSelected ? '#3B82F6' : room.type === 'bathroom' ? '#CBD5E1' : '#C89D66'}
        roughness={0.6}
        metalness={0.05}
      />
    </mesh>
  );
};

// --- PARAMETRIC FURNITURE ITEM ---
const FurnitureMesh3D: React.FC<{
  item: FurnitureItem;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ item, isSelected, onSelect }) => {
  return (
    <group
      position={[item.position.x, item.position.z + item.dimensions.height / 2, -item.position.y]}
      rotation={[item.rotation.x, item.rotation.y, item.rotation.z]}
    >
      <mesh
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <boxGeometry
          args={[item.dimensions.width, item.dimensions.height, item.dimensions.depth]}
        />
        <meshStandardMaterial
          color={
            isSelected
              ? '#6366F1'
              : item.category === 'bedroom'
              ? '#475569'
              : item.category === 'living'
              ? '#334155'
              : '#64748B'
          }
          roughness={0.7}
        />
      </mesh>
    </group>
  );
};

// --- MAIN 3D VIEWER CONTAINER ---
export const Viewer3D: React.FC = () => {
  const { plan, selection, setSelection } = useFloorPlanStore();
  const { layers, lightingPreset, cameraPreset } = useViewerStore();

  return (
    <div className="w-full h-full relative bg-studio-900">
      <Canvas
        shadows
        camera={{
          position:
            cameraPreset === 'top'
              ? [6, 22, -4]
              : cameraPreset === 'front'
              ? [6, 3, 14]
              : [12, 14, 14],
          fov: 45,
        }}
      >
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={cameraPreset === 'top' ? 0.05 : Math.PI / 2 - 0.05}
          target={[5, 1, -4]}
        />

        {/* Dynamic Sun & Lighting Presets */}
        {lightingPreset === 'day' && (
          <>
            <ambientLight intensity={0.65} />
            <directionalLight
              castShadow
              position={[15, 25, 12]}
              intensity={1.2}
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-near={0.5}
              shadow-camera-far={60}
              shadow-camera-left={-15}
              shadow-camera-right={15}
              shadow-camera-top={15}
              shadow-camera-bottom={-15}
            />
            <Sky sunPosition={[100, 45, 100]} />
          </>
        )}

        {lightingPreset === 'golden_hour' && (
          <>
            <ambientLight intensity={0.5} color="#FFEDD5" />
            <directionalLight
              castShadow
              position={[20, 10, 8]}
              intensity={1.8}
              color="#FDBA74"
            />
            <Sky sunPosition={[100, 12, 50]} />
          </>
        )}

        {lightingPreset === 'night' && (
          <>
            <ambientLight intensity={0.2} color="#1E1B4B" />
            <directionalLight position={[-10, 15, -10]} intensity={0.4} color="#818CF8" />
          </>
        )}

        {/* Contact Shadow & Reference Ground Grid */}
        <ContactShadows
          position={[0, -0.06, 0]}
          opacity={0.55}
          scale={40}
          blur={1.5}
          far={10}
        />
        {layers.grid && (
          <Grid
            renderOrder={-1}
            position={[0, -0.05, 0]}
            infiniteGrid
            cellSize={1}
            cellThickness={0.6}
            cellColor="#1E2332"
            sectionSize={5}
            sectionThickness={1.2}
            sectionColor="#343E56"
            fadeDistance={50}
          />
        )}

        {/* 1. WALLS */}
        {layers.walls &&
          plan.walls.map((wall) => {
            const mat = plan.materials[wall.material_id || ''] || { color: '#F1F3F5' };
            const isSelected = selection.type === 'wall' && selection.id === wall.id;
            return (
              <WallMesh3D
                key={wall.id}
                wall={wall}
                doors={plan.doors}
                windows={plan.windows}
                materialColor={mat.color}
                isSelected={isSelected}
                onSelect={() => setSelection({ type: 'wall', id: wall.id })}
              />
            );
          })}

        {/* 2. DOORS */}
        {layers.doors &&
          plan.doors.map((door) => {
            const hostWall = plan.walls.find((w) => w.id === door.wall_id);
            if (!hostWall) return null;
            const isSelected = selection.type === 'door' && selection.id === door.id;
            return (
              <DoorMesh3D
                key={door.id}
                door={door}
                wall={hostWall}
                isSelected={isSelected}
                onSelect={() => setSelection({ type: 'door', id: door.id })}
              />
            );
          })}

        {/* 3. WINDOWS */}
        {layers.windows &&
          plan.windows.map((win) => {
            const hostWall = plan.walls.find((w) => w.id === win.wall_id);
            if (!hostWall) return null;
            const isSelected = selection.type === 'window' && selection.id === win.id;
            return (
              <WindowMesh3D
                key={win.id}
                window={win}
                wall={hostWall}
                isSelected={isSelected}
                onSelect={() => setSelection({ type: 'window', id: win.id })}
              />
            );
          })}

        {/* 4. FLOOR SLABS */}
        {layers.floors &&
          plan.rooms.map((room) => {
            const isSelected = selection.type === 'room' && selection.id === room.id;
            return (
              <FloorMesh3D
                key={room.id}
                room={room}
                isSelected={isSelected}
                onSelect={() => setSelection({ type: 'room', id: room.id })}
              />
            );
          })}

        {/* 5. COLUMNS */}
        {layers.columns &&
          plan.columns.map((col) => (
            <mesh
              key={col.id}
              position={[col.position.x, col.height / 2, -col.position.y]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[col.width, col.height, col.depth]} />
              <meshStandardMaterial color="#94A3B8" roughness={0.85} />
            </mesh>
          ))}

        {/* 6. FURNITURE */}
        {layers.furniture &&
          plan.furniture.map((furn) => {
            const isSelected = selection.type === 'furniture' && selection.id === furn.id;
            return (
              <FurnitureMesh3D
                key={furn.id}
                item={furn}
                isSelected={isSelected}
                onSelect={() => setSelection({ type: 'furniture', id: furn.id })}
              />
            );
          })}
      </Canvas>
    </div>
  );
};
