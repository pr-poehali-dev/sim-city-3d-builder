import React from 'react';
import { CityStats as CityStatsType } from '@/types/game';
import Icon from '@/components/ui/icon';

interface CityStatsProps {
  stats: CityStatsType;
}

export default function CityStats({ stats }: CityStatsProps) {
  const happinessColor = stats.happiness > 70 ? '#56ab2f' : stats.happiness > 40 ? '#f6d365' : '#ff6b6b';
  const devPercent = Math.min(100, stats.development);

  return (
    <div className="panel animate-slide-left" style={{ minWidth: 220 }}>
      {/* Header */}
      <div className="px-4 py-2 border-b border-border flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-amber animate-pulse" />
        <span className="font-oswald text-xs tracking-widest text-amber uppercase">Статистика</span>
      </div>

      <div className="px-4 py-3 flex flex-col gap-3">
        {/* Time */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground">Нед. {stats.week} / {stats.year} год</span>
          <Icon name="Clock" size={12} className="text-muted-foreground" />
        </div>

        <div className="h-px bg-border" />

        {/* Population */}
        <StatRow
          icon="Users"
          label="Население"
          value={stats.population.toLocaleString('ru')}
          unit="чел."
          color="text-sky-400"
        />

        {/* Budget */}
        <StatRow
          icon="Landmark"
          label="Бюджет"
          value={`${stats.budget.toLocaleString('ru')}`}
          unit="₽"
          color={stats.budget >= 0 ? 'text-emerald-400' : 'text-red-400'}
        />

        {/* Income */}
        <StatRow
          icon="TrendingUp"
          label="Доход/нед."
          value={`${stats.income > 0 ? '+' : ''}${stats.income.toLocaleString('ru')}`}
          unit="₽"
          color={stats.income >= 0 ? 'text-emerald-400' : 'text-red-400'}
        />

        <div className="h-px bg-border" />

        {/* Happiness */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Icon name="Heart" size={12} className="text-pink-400" />
              <span className="font-plex text-xs text-muted-foreground">Счастье</span>
            </div>
            <span className="font-mono text-xs" style={{ color: happinessColor }}>{stats.happiness}%</span>
          </div>
          <div className="stat-bar">
            <div
              className="stat-bar-fill"
              style={{ width: `${stats.happiness}%`, background: happinessColor }}
            />
          </div>
        </div>

        {/* Development */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Icon name="BarChart2" size={12} className="text-amber" />
              <span className="font-plex text-xs text-muted-foreground">Развитие</span>
            </div>
            <span className="font-mono text-xs text-amber">{devPercent}%</span>
          </div>
          <div className="stat-bar">
            <div
              className="stat-bar-fill bg-amber"
              style={{ width: `${devPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatRowProps {
  icon: string;
  label: string;
  value: string;
  unit: string;
  color: string;
}

function StatRow({ icon, label, value, unit, color }: StatRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <Icon name={icon} fallback="Circle" size={12} className="text-muted-foreground" />
        <span className="font-plex text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`font-mono text-sm font-medium ${color}`}>{value}</span>
        <span className="font-mono text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}
