import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GameScreen, Cell, CityStats, SaveSlot, GameSettings, BuildingType } from '@/types/game';
import { BUILDINGS, GRID_COLS, GRID_ROWS } from '@/data/buildings';
import MainMenu from '@/components/game/MainMenu';
import GameGrid from '@/components/game/GameGrid';
import BuildingPanel from '@/components/game/BuildingPanel';
import CityStatsPanel from '@/components/game/CityStats';
import SavesScreen from '@/components/game/SavesScreen';
import SettingsScreen from '@/components/game/SettingsScreen';
import Icon from '@/components/ui/icon';

const SAVE_KEY = 'cityforge_saves';
const SETTINGS_KEY = 'cityforge_settings';
const STARTING_BUDGET = 25000;
const WEEK_MS = 8000;

function createGrid(): Cell[][] {
  return Array.from({ length: GRID_ROWS }, (_, r) =>
    Array.from({ length: GRID_COLS }, (_, c) => ({
      type: null,
      id: `${r}-${c}`,
    }))
  );
}

function calcStats(grid: Cell[][], week: number, year: number, budget: number): CityStats {
  let population = 0;
  let income = 0;
  let parks = 0;
  let hospitals = 0;
  let schools = 0;
  let buildings = 0;

  for (const row of grid) {
    for (const cell of row) {
      if (!cell.type) continue;
      const b = BUILDINGS[cell.type];
      if (!b) continue;
      population += b.population;
      income += b.income;
      if (cell.type === 'park') parks++;
      if (cell.type === 'hospital') hospitals++;
      if (cell.type === 'school') schools++;
      buildings++;
    }
  }

  const happiness = Math.min(100, Math.max(0,
    40 +
    parks * 8 +
    hospitals * 12 +
    schools * 10 +
    (budget > 0 ? 10 : -20) +
    (income > 0 ? 5 : -10)
  ));

  const development = Math.min(100, Math.floor(buildings * 2.5));

  return { population, budget, income, happiness, development, week, year };
}

function loadSaves(): SaveSlot[] {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY) || '[]');
  } catch {
    return [];
  }
}

function loadSettings(): GameSettings {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null') || defaultSettings();
  } catch {
    return defaultSettings();
  }
}

function defaultSettings(): GameSettings {
  return { volume: 70, sfxVolume: 50, graphicsQuality: 'high', showGrid: true, showFps: false };
}

export default function Index() {
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [grid, setGrid] = useState<Cell[][]>(createGrid);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingType | null>(null);
  const [budget, setBudget] = useState(STARTING_BUDGET);
  const [week, setWeek] = useState(1);
  const [year, setYear] = useState(2024);
  const [saves, setSaves] = useState<SaveSlot[]>(loadSaves);
  const [settings, setSettings] = useState<GameSettings>(loadSettings);
  const [isInGame, setIsInGame] = useState(false);
  const [fps, setFps] = useState(60);
  const weekRef = useRef(week);
  const yearRef = useRef(year);
  const budgetRef = useRef(budget);
  const gridRef = useRef(grid);
  const frameRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  weekRef.current = week;
  yearRef.current = year;
  budgetRef.current = budget;
  gridRef.current = grid;

  const stats = calcStats(grid, week, year, budget);

  // Weekly economy tick
  useEffect(() => {
    if (!isInGame) return;

    const interval = setInterval(() => {
      const income = calcStats(gridRef.current, weekRef.current, yearRef.current, budgetRef.current).income;
      setBudget(prev => prev + income);
      setWeek(prev => {
        if (prev >= 52) {
          setYear(y => y + 1);
          return 1;
        }
        return prev + 1;
      });
    }, WEEK_MS);

    return () => clearInterval(interval);
  }, [isInGame]);

  // FPS counter
  useEffect(() => {
    if (!settings.showFps) return;
    let running = true;

    const loop = (time: number) => {
      if (!running) return;
      frameCountRef.current++;
      if (time - lastTimeRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastTimeRef.current = time;
      }
      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(frameRef.current);
    };
  }, [settings.showFps]);

  const handleNavigate = useCallback((s: GameScreen) => {
    setScreen(s);
  }, []);

  const handleNewGame = useCallback(() => {
    setGrid(createGrid());
    setBudget(STARTING_BUDGET);
    setWeek(1);
    setYear(2024);
    setSelectedBuilding(null);
    setIsInGame(true);
    setScreen('game');
  }, []);

  const handleCellClick = useCallback((r: number, c: number) => {
    if (!selectedBuilding) return;

    setGrid(prev => {
      const next = prev.map(row => row.map(cell => ({ ...cell })));
      const cell = next[r][c];

      if (selectedBuilding === 'delete') {
        if (!cell.type) return prev;
        cell.type = null;
        return next;
      }

      if (cell.type) return prev;

      const building = BUILDINGS[selectedBuilding];
      if (!building) return prev;

      if (budgetRef.current < building.cost) return prev;

      cell.type = selectedBuilding;
      setBudget(b => b - building.cost);
      return next;
    });
  }, [selectedBuilding]);

  const handleSave = useCallback((slot: number, name: string) => {
    const newSave: SaveSlot = {
      id: slot,
      name,
      date: new Date().toLocaleString('ru'),
      population: stats.population,
      budget: budgetRef.current,
      week: weekRef.current,
      year: yearRef.current,
      grid: gridRef.current,
      stats: calcStats(gridRef.current, weekRef.current, yearRef.current, budgetRef.current),
    };

    setSaves(prev => {
      const next = prev.filter(s => s.id !== slot);
      const updated = [...next, newSave];
      localStorage.setItem(SAVE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [stats.population]);

  const handleLoad = useCallback((save: SaveSlot) => {
    setGrid(save.grid);
    setBudget(save.budget);
    setWeek(save.week);
    setYear(save.year);
    setSelectedBuilding(null);
    setIsInGame(true);
    setScreen('game');
  }, []);

  const handleDeleteSave = useCallback((id: number) => {
    setSaves(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem(SAVE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleSettingsChange = useCallback((s: GameSettings) => {
    setSettings(s);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  }, []);

  // Main menu: start new game button triggers handleNewGame
  const handleMenuNavigate = useCallback((s: GameScreen) => {
    if (s === 'game') {
      handleNewGame();
    } else {
      setScreen(s);
    }
  }, [handleNewGame]);

  if (screen === 'menu') {
    return <MainMenu onNavigate={handleMenuNavigate} />;
  }

  if (screen === 'saves') {
    return (
      <SavesScreen
        saves={saves}
        onLoad={handleLoad}
        onSave={handleSave}
        onDelete={handleDeleteSave}
        onBack={() => setScreen(isInGame ? 'game' : 'menu')}
        isInGame={isInGame}
      />
    );
  }

  if (screen === 'settings') {
    return (
      <SettingsScreen
        settings={settings}
        onChange={handleSettingsChange}
        onBack={() => setScreen(isInGame ? 'game' : 'menu')}
      />
    );
  }

  // Game screen
  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2 panel border-t-0 border-l-0 border-r-0">
        {/* Left: logo */}
        <div className="flex items-center gap-3">
          <span className="font-oswald text-amber tracking-widest text-sm">CITY<span className="text-foreground">FORGE</span></span>
          <div className="w-px h-4 bg-border" />
          <span className="font-mono text-xs text-muted-foreground">Нед. {week} · {year} год</span>
          {settings.showFps && (
            <span className="font-mono text-xs text-muted-foreground/50">{fps} fps</span>
          )}
        </div>

        {/* Center: budget */}
        <div className="flex items-center gap-2">
          <Icon name="Landmark" size={14} className="text-amber" />
          <span className={`font-mono text-sm font-medium ${budget >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {budget.toLocaleString('ru')} ₽
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            ({stats.income > 0 ? '+' : ''}{stats.income.toLocaleString('ru')}/нед.)
          </span>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1">
          <TopBarButton icon="Save" label="Сохранить" onClick={() => setScreen('saves')} />
          <TopBarButton icon="Settings" label="Настройки" onClick={() => setScreen('settings')} />
          <TopBarButton icon="Home" label="Меню" onClick={() => { setScreen('menu'); }} />
        </div>
      </div>

      {/* Game grid */}
      <div className="absolute inset-0 top-[48px]">
        <GameGrid
          grid={grid}
          selectedBuilding={selectedBuilding}
          onCellClick={handleCellClick}
          showGrid={settings.showGrid}
        />
      </div>

      {/* Left panel: stats */}
      <div className="absolute top-[60px] left-3 z-10">
        <CityStatsPanel stats={stats} />
      </div>

      {/* Right panel: buildings */}
      <div className="absolute top-[60px] right-3 z-10">
        <BuildingPanel
          selected={selectedBuilding}
          onSelect={setSelectedBuilding}
          budget={budget}
        />
      </div>

      {/* ESC hint */}
      {selectedBuilding && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 panel px-4 py-2 flex items-center gap-2 animate-fade-in">
          <span className="font-mono text-xs text-muted-foreground">
            {selectedBuilding === 'delete' ? 'Кликните на здание для сноса' : `Размещение: ${BUILDINGS[selectedBuilding]?.label}`}
          </span>
          <button
            onClick={() => setSelectedBuilding(null)}
            className="font-mono text-xs text-amber hover:text-foreground transition-colors"
          >
            [ESC]
          </button>
        </div>
      )}
    </div>
  );
}

function TopBarButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-muted-foreground hover:text-amber hover:bg-muted/50 transition-all duration-150 rounded-sm"
    >
      <Icon name={icon} fallback="Circle" size={14} />
      <span className="font-plex text-xs hidden sm:inline">{label}</span>
    </button>
  );
}
