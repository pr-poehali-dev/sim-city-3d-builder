import React from 'react';
import { BuildingType, Building } from '@/types/game';
import { BUILDINGS } from '@/data/buildings';
import Icon from '@/components/ui/icon';

interface BuildingPanelProps {
  selected: BuildingType | null;
  onSelect: (type: BuildingType | null) => void;
  budget: number;
}

const CATEGORIES = [
  { key: 'residential', label: 'Жильё', icon: 'Home' },
  { key: 'commercial', label: 'Торговля', icon: 'ShoppingBag' },
  { key: 'industrial', label: 'Пром.', icon: 'Factory' },
  { key: 'civic', label: 'Соц.', icon: 'Heart' },
  { key: 'roads', label: 'Дороги', icon: 'Route' },
] as const;

export default function BuildingPanel({ selected, onSelect, budget }: BuildingPanelProps) {
  const [activeCategory, setActiveCategory] = React.useState<string>('residential');

  const filtered = Object.values(BUILDINGS).filter(b => b.category === activeCategory);

  return (
    <div className="panel animate-slide-right flex flex-col" style={{ width: 260 }}>
      {/* Header */}
      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
        <span className="font-oswald text-xs tracking-widest text-amber uppercase">Постройки</span>
        {selected && (
          <button
            onClick={() => onSelect(null)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="X" size={14} />
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1 transition-all duration-150 text-xs min-w-[42px] ${
              activeCategory === cat.key
                ? 'text-amber border-b-2 border-amber bg-amber/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={cat.icon} fallback="Circle" size={13} />
            <span className="font-plex" style={{ fontSize: 10 }}>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Building list */}
      <div className="overflow-y-auto flex-1 p-2 flex flex-col gap-1.5" style={{ maxHeight: 320 }}>
        {/* Delete tool */}
        {activeCategory === 'residential' && (
          <BuildingCard
            building={{ type: 'delete', label: 'Снести', emoji: '🗑️', cost: 0, income: 0, population: 0, color: '#ff6b6b', category: 'residential' }}
            isSelected={selected === 'delete'}
            canAfford={true}
            onClick={() => onSelect(selected === 'delete' ? null : 'delete')}
          />
        )}
        {filtered.map(building => (
          <BuildingCard
            key={building.type}
            building={building}
            isSelected={selected === building.type}
            canAfford={budget >= building.cost}
            onClick={() => onSelect(selected === building.type ? null : building.type)}
          />
        ))}
      </div>

      {/* Selected info */}
      {selected && selected !== 'delete' && BUILDINGS[selected] && (
        <SelectedInfo building={BUILDINGS[selected]} />
      )}
    </div>
  );
}

interface BuildingCardProps {
  building: Building;
  isSelected: boolean;
  canAfford: boolean;
  onClick: () => void;
}

function BuildingCard({ building, isSelected, canAfford, onClick }: BuildingCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={!canAfford && building.cost > 0}
      className={`
        flex items-center gap-3 px-3 py-2 w-full text-left transition-all duration-150
        border rounded-sm
        ${isSelected
          ? 'border-amber bg-amber/10 text-foreground'
          : canAfford || building.cost === 0
            ? 'border-transparent hover:border-border hover:bg-muted/50 text-foreground'
            : 'border-transparent opacity-40 cursor-not-allowed text-muted-foreground'
        }
      `}
    >
      <span className="text-xl leading-none">{building.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="font-plex text-xs font-medium truncate">{building.label}</div>
        {building.cost > 0 && (
          <div className={`font-mono text-xs ${canAfford ? 'text-amber' : 'text-red-400'}`}>
            {building.cost.toLocaleString('ru')} ₽
          </div>
        )}
      </div>
      {isSelected && <Icon name="Check" size={12} className="text-amber flex-shrink-0" />}
    </button>
  );
}

function SelectedInfo({ building }: { building: Building }) {
  return (
    <div className="border-t border-border px-4 py-3 bg-muted/30">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{building.emoji}</span>
        <span className="font-oswald text-sm text-foreground">{building.label}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {building.income > 0 && (
          <InfoLine label="Доход" value={`+${building.income} ₽/нед.`} color="text-emerald-400" />
        )}
        {building.population > 0 && (
          <InfoLine label="Жители" value={`+${building.population}`} color="text-sky-400" />
        )}
      </div>
    </div>
  );
}

function InfoLine({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div className="font-plex text-xs text-muted-foreground">{label}</div>
      <div className={`font-mono text-xs ${color}`}>{value}</div>
    </div>
  );
}
