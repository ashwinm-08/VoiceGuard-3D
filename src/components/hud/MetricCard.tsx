import React from 'react';
import { MetricHistoryPoint } from '../../types';
import { Maximize2, Activity, Play, Volume2 } from 'lucide-react';
import { audioSynth } from '../../services/audioSynth';

interface MetricCardProps {
  id: 'jitter' | 'shimmer' | 'formants' | 'breath';
  title: string;
  subtitle: string;
  valueDisplay: string;
  statusBadge: {
    text: string;
    color: string;
    bg: string;
    border: string;
  };
  metrics: MetricHistoryPoint;
  history: MetricHistoryPoint[];
  onExpand: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  subtitle,
  valueDisplay,
  statusBadge,
  metrics,
  history,
  onExpand,
  onContextMenu,
}) => {
  // Mini chart rendering
  const renderChart = () => {
    const recent = history.slice(-25);
    const width = 240;
    const height = 54;

    if (id === 'jitter') {
      // 2D wavy sparkline with red threshold
      const maxJitter = 5.0;
      const points = recent.map((pt, idx) => {
        const x = (idx / (recent.length - 1 || 1)) * width;
        const y = height - (pt.jitter / maxJitter) * height;
        return `${x.toFixed(1)},${Math.max(2, Math.min(height - 2, y)).toFixed(1)}`;
      }).join(' ');

      const threshY = height - (3.5 / maxJitter) * height;

      return (
        <div className="relative w-full h-14 bg-slate-950/60 rounded-lg overflow-hidden border border-slate-800/80 p-1">
          <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
            {/* Threshold Line (Red Dotted) */}
            <line
              x1="0"
              y1={threshY}
              x2={width}
              y2={threshY}
              stroke="#ef4444"
              strokeDasharray="3,3"
              strokeWidth="1"
            />
            {/* Jitter Area & Polyline */}
            <polyline
              fill="none"
              stroke={metrics.jitter > 3.5 ? '#ef4444' : metrics.jitter > 2.4 ? '#facc15' : '#10b981'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
          <div className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-500">
            3.5% Threshold
          </div>
        </div>
      );
    }

    if (id === 'shimmer') {
      // Overlaid bar chart of dB
      const maxDb = 6.0;
      return (
        <div className="w-full h-14 bg-slate-950/60 rounded-lg overflow-hidden border border-slate-800/80 p-1 flex items-end gap-1 px-2">
          {recent.map((pt, i) => {
            const hPercent = Math.min(100, Math.max(8, (pt.shimmer / maxDb) * 100));
            const barCol =
              pt.shimmer > 4.5
                ? 'bg-rose-500'
                : pt.shimmer > 3.5
                ? 'bg-amber-400'
                : 'bg-emerald-400';
            return (
              <div
                key={i}
                className={`flex-1 ${barCol} rounded-t transition-all duration-300 opacity-80 hover:opacity-100`}
                style={{ height: `${hPercent}%` }}
                title={`${pt.shimmer.toFixed(2)} dB`}
              />
            );
          })}
        </div>
      );
    }

    if (id === 'formants') {
      // 3 Resonance Bars F1, F2, F3 + Play audio button
      return (
        <div className="w-full h-14 bg-slate-950/60 rounded-lg border border-slate-800/80 p-2 flex flex-col justify-between font-mono text-[10px]">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400">F1: {metrics.f1} Hz</span>
            <span className="text-emerald-400">F2: {metrics.f2} Hz</span>
            <span className="text-purple-400">F3: {metrics.f3} Hz</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                audioSynth.playFormantTone(metrics.f1, metrics.f2, metrics.f3);
              }}
              className="px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 flex items-center gap-1"
              title="Hear Isolated Resonance Frequencies"
            >
              <Volume2 className="w-3 h-3" />
              <span>Listen</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden flex">
              <div className="bg-cyan-400 h-full" style={{ width: `${(metrics.f1 / 1000) * 100}%` }} />
            </div>
            <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden flex">
              <div className="bg-emerald-400 h-full" style={{ width: `${(metrics.f2 / 3000) * 100}%` }} />
            </div>
            <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden flex">
              <div className="bg-purple-400 h-full" style={{ width: `${(metrics.f3 / 4000) * 100}%` }} />
            </div>
          </div>
        </div>
      );
    }

    // Breath-Formant Coupling
    const cScore = metrics.couplingScore;
    return (
      <div className="w-full h-14 bg-slate-950/60 rounded-lg border border-slate-800/80 p-2 flex flex-col justify-between font-mono">
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-slate-400">Breath-Resonance Sync:</span>
          <span
            className={`font-bold ${
              cScore >= 0.8
                ? 'text-emerald-400'
                : cScore >= 0.4
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {(cScore * 100).toFixed(0)}% Synchronized
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              cScore >= 0.8 ? 'bg-emerald-400' : cScore >= 0.4 ? 'bg-amber-400' : 'bg-rose-500'
            }`}
            style={{ width: `${cScore * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-slate-500">
          <span>0.0 Decoupled</span>
          <span>1.0 Full Biological Coupling</span>
        </div>
      </div>
    );
  };

  return (
    <div
      onClick={onExpand}
      onContextMenu={onContextMenu}
      className="bg-slate-950/80 backdrop-blur-md border border-slate-800/90 hover:border-slate-700 rounded-2xl p-3.5 shadow-xl transition-all cursor-pointer group select-none flex flex-col justify-between"
    >
      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between text-xs font-mono mb-1">
          <span className="font-bold text-slate-200 group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            {title}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
            className="text-slate-500 hover:text-cyan-300 p-0.5 rounded transition-colors"
            title="Expand Full-Screen View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="text-[10px] text-slate-400 mb-2">{subtitle}</div>
      </div>

      {/* Main Value & Status Badge */}
      <div className="flex items-baseline justify-between mb-2 font-mono">
        <span className="text-xl font-extrabold text-white tracking-tight">{valueDisplay}</span>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${statusBadge.bg} ${statusBadge.color} ${statusBadge.border}`}
        >
          {statusBadge.text}
        </span>
      </div>

      {/* Embedded Chart / Sparkline */}
      {renderChart()}

      <div className="text-[9px] text-slate-500 mt-2 flex justify-between font-mono">
        <span>Right-click for options</span>
        <span>Click to inspect</span>
      </div>
    </div>
  );
};
