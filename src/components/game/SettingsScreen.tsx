import React from 'react';
import { GameSettings } from '@/types/game';
import Icon from '@/components/ui/icon';

interface SettingsScreenProps {
  settings: GameSettings;
  onChange: (s: GameSettings) => void;
  onBack: () => void;
}

export default function SettingsScreen({ settings, onChange, onBack }: SettingsScreenProps) {
  const update = (patch: Partial<GameSettings>) => onChange({ ...settings, ...patch });

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 px-6">
          <button onClick={onBack} className="text-muted-foreground hover:text-amber transition-colors">
            <Icon name="ArrowLeft" size={20} />
          </button>
          <h2 className="font-oswald text-2xl tracking-widest text-foreground">НАСТРОЙКИ</h2>
        </div>

        <div className="flex flex-col gap-1 px-6">
          {/* Sound */}
          <SectionLabel label="Звук" icon="Volume2" />

          <SettingRow label="Музыка">
            <SliderControl
              value={settings.volume}
              onChange={v => update({ volume: v })}
            />
          </SettingRow>

          <SettingRow label="Эффекты">
            <SliderControl
              value={settings.sfxVolume}
              onChange={v => update({ sfxVolume: v })}
            />
          </SettingRow>

          <div className="h-4" />

          {/* Graphics */}
          <SectionLabel label="Графика" icon="Monitor" />

          <SettingRow label="Качество">
            <div className="flex gap-1">
              {(['low', 'medium', 'high'] as const).map(q => (
                <button
                  key={q}
                  onClick={() => update({ graphicsQuality: q })}
                  className={`px-3 py-1 text-xs font-mono border transition-all duration-150 ${
                    settings.graphicsQuality === q
                      ? 'border-amber text-amber bg-amber/10'
                      : 'border-border text-muted-foreground hover:border-foreground/30'
                  }`}
                >
                  {q === 'low' ? 'Низкое' : q === 'medium' ? 'Среднее' : 'Высокое'}
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow label="Сетка карты">
            <ToggleControl
              value={settings.showGrid}
              onChange={v => update({ showGrid: v })}
            />
          </SettingRow>

          <SettingRow label="Показывать FPS">
            <ToggleControl
              value={settings.showFps}
              onChange={v => update({ showFps: v })}
            />
          </SettingRow>

          <div className="h-4" />

          {/* Controls hint */}
          <SectionLabel label="Управление" icon="Mouse" />
          <div className="panel px-4 py-3 text-xs font-mono text-muted-foreground space-y-1.5">
            <div className="flex justify-between"><span>Перемещение карты</span><span className="text-foreground">ЛКМ + перетаскивание</span></div>
            <div className="flex justify-between"><span>Разместить здание</span><span className="text-foreground">ЛКМ по клетке</span></div>
            <div className="flex justify-between"><span>Снести здание</span><span className="text-foreground">Инструмент "Снести"</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ label, icon }: { label: string; icon: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Icon name={icon} fallback="Circle" size={13} className="text-amber" />
      <span className="font-oswald text-xs tracking-widest text-amber uppercase">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="panel px-4 py-3 flex items-center justify-between mb-1">
      <span className="font-plex text-sm text-foreground">{label}</span>
      {children}
    </div>
  );
}

function SliderControl({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-28 accent-amber"
        style={{ accentColor: 'hsl(var(--amber))' }}
      />
      <span className="font-mono text-xs text-muted-foreground w-8 text-right">{value}%</span>
    </div>
  );
}

function ToggleControl({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full transition-all duration-200 ${value ? 'bg-amber' : 'bg-muted'}`}
    >
      <div
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-background transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  );
}
