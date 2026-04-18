export type GameScreen = 'menu' | 'game' | 'settings' | 'saves';

export type BuildingType = 'house' | 'apartment' | 'shop' | 'office' | 'factory' | 'park' | 'hospital' | 'school' | 'road_h' | 'road_v' | 'road_cross' | 'delete';

export interface Building {
  type: BuildingType;
  label: string;
  emoji: string;
  cost: number;
  income: number;
  population: number;
  color: string;
  category: 'residential' | 'commercial' | 'industrial' | 'civic' | 'roads';
}

export interface Cell {
  type: BuildingType | null;
  id: string;
}

export interface CityStats {
  population: number;
  budget: number;
  income: number;
  happiness: number;
  development: number;
  week: number;
  year: number;
}

export interface SaveSlot {
  id: number;
  name: string;
  date: string;
  population: number;
  budget: number;
  week: number;
  year: number;
  grid: Cell[][];
  stats: CityStats;
}

export interface GameSettings {
  volume: number;
  sfxVolume: number;
  graphicsQuality: 'low' | 'medium' | 'high';
  showGrid: boolean;
  showFps: boolean;
}
