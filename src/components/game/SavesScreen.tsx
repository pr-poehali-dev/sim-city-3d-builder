import React, { useState } from 'react';
import { SaveSlot, GameScreen } from '@/types/game';
import Icon from '@/components/ui/icon';

interface SavesScreenProps {
  saves: SaveSlot[];
  onLoad: (save: SaveSlot) => void;
  onSave: (slot: number, name: string) => void;
  onDelete: (id: number) => void;
  onBack: () => void;
  isInGame: boolean;
}

export default function SavesScreen({ saves, onLoad, onSave, onDelete, onBack, isInGame }: SavesScreenProps) {
  const [savingSlot, setSavingSlot] = useState<number | null>(null);
  const [saveName, setSaveName] = useState('');

  const slots = [0, 1, 2, 3, 4];

  const getSave = (id: number) => saves.find(s => s.id === id);

  const handleSave = (slot: number) => {
    if (savingSlot === slot) {
      onSave(slot, saveName || `Сохранение ${slot + 1}`);
      setSavingSlot(null);
      setSaveName('');
    } else {
      setSavingSlot(slot);
      setSaveName(`Сохранение ${slot + 1}`);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 px-6">
          <button
            onClick={onBack}
            className="text-muted-foreground hover:text-amber transition-colors"
          >
            <Icon name="ArrowLeft" size={20} />
          </button>
          <h2 className="font-oswald text-2xl tracking-widest text-foreground">СОХРАНЕНИЯ</h2>
        </div>

        {/* Save slots */}
        <div className="flex flex-col gap-2 px-6">
          {slots.map(slot => {
            const save = getSave(slot);
            const isSaving = savingSlot === slot;

            return (
              <div
                key={slot}
                className="panel flex items-stretch overflow-hidden"
              >
                {/* Slot number */}
                <div className="flex items-center justify-center w-12 border-r border-border bg-muted/30">
                  <span className="font-mono text-lg text-muted-foreground">{slot + 1}</span>
                </div>

                {/* Content */}
                <div className="flex-1 px-4 py-3">
                  {isSaving ? (
                    <input
                      autoFocus
                      value={saveName}
                      onChange={e => setSaveName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSave(slot);
                        if (e.key === 'Escape') { setSavingSlot(null); setSaveName(''); }
                      }}
                      className="bg-transparent border-b border-amber text-foreground font-plex text-sm w-full outline-none py-0.5"
                      placeholder="Название сохранения..."
                    />
                  ) : save ? (
                    <div>
                      <div className="font-plex text-sm text-foreground">{save.name}</div>
                      <div className="flex gap-4 mt-0.5">
                        <span className="font-mono text-xs text-muted-foreground">
                          {save.population.toLocaleString('ru')} чел.
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {save.budget.toLocaleString('ru')} ₽
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          Нед. {save.week} / {save.year} год
                        </span>
                      </div>
                      <div className="font-mono text-xs text-muted-foreground/50 mt-0.5">{save.date}</div>
                    </div>
                  ) : (
                    <div className="font-plex text-sm text-muted-foreground/40 italic">Пустой слот</div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 px-3 border-l border-border">
                  {save && !isSaving && (
                    <button
                      onClick={() => onLoad(save)}
                      className="p-1.5 text-muted-foreground hover:text-amber transition-colors"
                      title="Загрузить"
                    >
                      <Icon name="Play" size={14} />
                    </button>
                  )}
                  {isInGame && (
                    <button
                      onClick={() => handleSave(slot)}
                      className={`p-1.5 transition-colors ${isSaving ? 'text-amber' : 'text-muted-foreground hover:text-amber'}`}
                      title={isSaving ? 'Сохранить' : 'Записать'}
                    >
                      <Icon name={isSaving ? 'Check' : 'Save'} size={14} />
                    </button>
                  )}
                  {save && !isSaving && (
                    <button
                      onClick={() => onDelete(slot)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                      title="Удалить"
                    >
                      <Icon name="Trash2" size={14} />
                    </button>
                  )}
                  {isSaving && (
                    <button
                      onClick={() => { setSavingSlot(null); setSaveName(''); }}
                      className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Icon name="X" size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!isInGame && (
          <p className="text-center text-xs text-muted-foreground/40 mt-6 font-plex">
            Запустите игру, чтобы сохранить прогресс
          </p>
        )}
      </div>
    </div>
  );
}
