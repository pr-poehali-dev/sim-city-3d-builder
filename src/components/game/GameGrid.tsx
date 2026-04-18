import React, { useRef, useState, useCallback } from 'react';
import { Cell, BuildingType } from '@/types/game';
import { BUILDINGS, CELL_SIZE, GRID_COLS, GRID_ROWS } from '@/data/buildings';

interface GameGridProps {
  grid: Cell[][];
  selectedBuilding: BuildingType | null;
  onCellClick: (row: number, col: number) => void;
  showGrid: boolean;
}

const ROAD_TYPES = new Set(['road_h', 'road_v', 'road_cross']);

function getRoadStyle(type: BuildingType): React.CSSProperties {
  const base: React.CSSProperties = { background: '#2a2a2a', position: 'relative' };
  if (type === 'road_h') return { ...base, background: '#333' };
  if (type === 'road_v') return { ...base, background: '#333' };
  if (type === 'road_cross') return { ...base, background: '#2a2a2a' };
  return base;
}

export default function GameGrid({ grid, selectedBuilding, onCellClick, showGrid }: GameGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 40, y: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragMoved, setDragMoved] = useState(false);
  const [hovered, setHovered] = useState<{ r: number; c: number } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragMoved(false);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  }, [offset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const dx = Math.abs(e.clientX - (dragStart.x + offset.x));
      const dy = Math.abs(e.clientY - (dragStart.y + offset.y));
      if (dx > 4 || dy > 4) setDragMoved(true);
      setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  }, [isDragging, dragStart, offset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleCellClick = useCallback((r: number, c: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (dragMoved) return;
    onCellClick(r, c);
  }, [dragMoved, onCellClick]);

  const cursor = isDragging ? 'grabbing' : selectedBuilding ? 'crosshair' : 'grab';

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ cursor }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Grid background */}
      <div className="absolute inset-0 iso-grid" />

      {/* City grid */}
      <div
        className="absolute"
        style={{ left: offset.x, top: offset.y }}
      >
        {/* Grid border */}
        <div
          className="absolute border border-amber/20"
          style={{
            width: GRID_COLS * CELL_SIZE,
            height: GRID_ROWS * CELL_SIZE,
            top: -1,
            left: -1,
          }}
        />

        {grid.map((row, r) =>
          row.map((cell, c) => {
            const building = cell.type ? BUILDINGS[cell.type] : null;
            const isHovered = hovered?.r === r && hovered?.c === c;
            const isRoad = cell.type && ROAD_TYPES.has(cell.type);

            return (
              <div
                key={cell.id}
                className="absolute transition-all duration-100"
                style={{
                  left: c * CELL_SIZE,
                  top: r * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  border: showGrid ? '1px solid rgba(255,200,80,0.06)' : undefined,
                }}
                onMouseEnter={() => setHovered({ r, c })}
                onMouseLeave={() => setHovered(null)}
                onClick={e => handleCellClick(r, c, e)}
              >
                {/* Cell background */}
                <div
                  className="absolute inset-0 transition-all duration-100"
                  style={{
                    background: cell.type
                      ? isRoad
                        ? '#2a2c30'
                        : `${building?.color}18`
                      : isHovered && selectedBuilding
                        ? 'rgba(255,200,80,0.08)'
                        : 'transparent',
                    borderColor: isHovered && selectedBuilding
                      ? 'rgba(255,200,80,0.4)'
                      : cell.type ? `${building?.color}40` : 'transparent',
                    borderWidth: 1,
                    borderStyle: 'solid',
                  }}
                />

                {/* Building content */}
                {cell.type && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isRoad ? (
                      <RoadVisual type={cell.type} />
                    ) : (
                      <BuildingVisual building={building} type={cell.type} size={CELL_SIZE} />
                    )}
                  </div>
                )}

                {/* Hover preview */}
                {isHovered && selectedBuilding && !cell.type && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-50 pointer-events-none">
                    <span className="text-lg leading-none">
                      {selectedBuilding === 'delete' ? '🗑️' : BUILDINGS[selectedBuilding]?.emoji}
                    </span>
                  </div>
                )}

                {/* Delete hover */}
                {isHovered && selectedBuilding === 'delete' && cell.type && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 border border-red-500/40">
                    <span className="text-sm">✕</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Minimap */}
      <Minimap grid={grid} />
    </div>
  );
}

function RoadVisual({ type }: { type: BuildingType }) {
  return (
    <div className="w-full h-full relative" style={{ background: '#2e3035' }}>
      {(type === 'road_h' || type === 'road_cross') && (
        <div className="absolute left-0 right-0" style={{ top: '50%', height: 2, background: '#555', transform: 'translateY(-50%)' }} />
      )}
      {(type === 'road_v' || type === 'road_cross') && (
        <div className="absolute top-0 bottom-0" style={{ left: '50%', width: 2, background: '#555', transform: 'translateX(-50%)' }} />
      )}
      {/* Lane markers */}
      {type === 'road_h' && (
        <div className="absolute left-1/4 right-1/4" style={{ top: '50%', height: 1, background: '#666', transform: 'translateY(-50%)' }} />
      )}
    </div>
  );
}

function BuildingVisual({ building, type, size }: { building: Building | null; type: BuildingType; size: number }) {
  if (!building) return null;

  const s = size - 8;
  const floors = type === 'apartment' ? 5 : type === 'office' ? 4 : type === 'factory' ? 3 : 2;
  const h = Math.min(s * 0.7, floors * 8 + 8);

  return (
    <div className="relative flex flex-col items-center justify-end" style={{ width: s, height: s }}>
      {/* Shadow */}
      <div
        className="absolute"
        style={{
          bottom: 0,
          width: s * 0.6,
          height: 4,
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '50%',
          filter: 'blur(3px)',
        }}
      />
      {/* Building body */}
      <div
        style={{
          width: s * 0.55,
          height: h,
          background: `linear-gradient(160deg, ${building.color}cc, ${building.color}66)`,
          border: `1px solid ${building.color}80`,
          borderRadius: '2px 2px 0 0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Windows */}
        {Array.from({ length: Math.max(1, floors - 1) }).map((_, i) => (
          <div
            key={i}
            className="absolute flex gap-0.5 justify-center"
            style={{ bottom: (i + 1) * (h / floors), left: 0, right: 0, paddingTop: 2 }}
          >
            <div style={{ width: 4, height: 3, background: 'rgba(255,255,255,0.4)', borderRadius: 1 }} />
            <div style={{ width: 4, height: 3, background: 'rgba(255,200,80,0.5)', borderRadius: 1 }} />
          </div>
        ))}
      </div>
      {/* Roof */}
      {type === 'apartment' && (
        <div style={{
          position: 'absolute',
          bottom: h - 2,
          width: s * 0.2,
          height: 6,
          background: building.color,
          opacity: 0.8,
        }} />
      )}
    </div>
  );
}

function Minimap({ grid }: { grid: Cell[][] }) {
  const scale = 3;
  return (
    <div className="absolute bottom-4 right-4 panel p-2">
      <div className="font-mono text-xs text-muted-foreground mb-1 px-1">Карта</div>
      <div
        className="relative"
        style={{
          width: GRID_COLS * scale,
          height: GRID_ROWS * scale,
          background: '#0d1117',
          border: '1px solid hsl(var(--border))',
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            if (!cell.type) return null;
            const b = BUILDINGS[cell.type];
            return (
              <div
                key={cell.id}
                className="absolute"
                style={{
                  left: c * scale,
                  top: r * scale,
                  width: scale,
                  height: scale,
                  background: b?.color || '#555',
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
