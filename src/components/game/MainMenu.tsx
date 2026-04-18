import React from 'react';
import { GameScreen } from '@/types/game';
import Icon from '@/components/ui/icon';

interface MainMenuProps {
  onNavigate: (screen: GameScreen) => void;
}

const CITY_IMAGE = 'https://cdn.poehali.dev/projects/8d4123ec-8b8a-44e8-b81d-f88d091f300a/files/44e7b4b8-89e5-4ccf-8cb5-85872daf4c21.jpg';

export default function MainMenu({ onNavigate }: MainMenuProps) {
  return (
    <div className="relative w-full h-screen menu-backdrop overflow-hidden flex flex-col items-center justify-center scanlines">
      {/* Background city image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: `url(${CITY_IMAGE})` }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />

      {/* Grid lines */}
      <div className="absolute inset-0 iso-grid opacity-30" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center gap-3 justify-center mb-2">
            <div className="w-8 h-1 bg-amber" />
            <span className="font-mono text-amber text-xs tracking-[0.3em] uppercase opacity-70">v 0.1.0</span>
            <div className="w-8 h-1 bg-amber" />
          </div>
          <h1 className="font-oswald text-7xl font-bold tracking-tight text-foreground amber-glow-text">
            CITY<span className="text-amber">FORGE</span>
          </h1>
          <p className="font-plex text-steel text-sm tracking-[0.2em] uppercase mt-2">
            Симулятор строительства города
          </p>
        </div>

        {/* Menu items */}
        <nav className="flex flex-col gap-3 w-72">
          <MenuButton
            icon="Play"
            label="НОВАЯ ИГРА"
            onClick={() => onNavigate('game')}
            primary
          />
          <MenuButton
            icon="FolderOpen"
            label="ЗАГРУЗИТЬ"
            onClick={() => onNavigate('saves')}
          />
          <MenuButton
            icon="Settings"
            label="НАСТРОЙКИ"
            onClick={() => onNavigate('settings')}
          />
        </nav>

        {/* Bottom version info */}
        <div className="flex items-center gap-6 opacity-40">
          <span className="font-mono text-xs text-steel">BUILD 2024.04</span>
          <span className="w-1 h-1 rounded-full bg-steel inline-block" />
          <span className="font-mono text-xs text-steel">CITYFORGE ENGINE</span>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-6 left-6 border-l-2 border-t-2 border-amber/30 w-12 h-12" />
      <div className="absolute top-6 right-6 border-r-2 border-t-2 border-amber/30 w-12 h-12" />
      <div className="absolute bottom-6 left-6 border-l-2 border-b-2 border-amber/30 w-12 h-12" />
      <div className="absolute bottom-6 right-6 border-r-2 border-b-2 border-amber/30 w-12 h-12" />
    </div>
  );
}

interface MenuButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  primary?: boolean;
}

function MenuButton({ icon, label, onClick, primary }: MenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative flex items-center gap-4 px-6 py-4 w-full
        border transition-all duration-200 font-oswald tracking-widest text-sm
        ${primary
          ? 'bg-amber text-background border-amber hover:bg-amber/90 animate-pulse-amber'
          : 'bg-transparent text-foreground border-border hover:border-amber/60 hover:bg-muted/50'
        }
      `}
    >
      <Icon name={icon} fallback="Circle" size={18} className={primary ? 'text-background' : 'text-amber'} />
      <span>{label}</span>
      <div className={`absolute right-4 transition-transform duration-200 group-hover:translate-x-1 ${primary ? 'text-background' : 'text-amber/60'}`}>
        <Icon name="ChevronRight" size={16} />
      </div>
    </button>
  );
}