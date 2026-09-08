import React from 'react';
import { History, Play, RotateCcw } from 'lucide-react';
import { MetricHistoryPoint } from '../../types';

interface TimeRewindScrubberProps {
  history: MetricHistoryPoint[];
  rewindIndex: number | null;
  onRewindChange: (index: number | null) => void;
}

export const TimeRewindScrubber: React.FC<TimeRewindScrubberProps> = ({
  history,
  rewindIndex,
  onRewindChange,
}) => {
  const currentIndex = rewindIndex !== null ? rewindIndex : history.length - 1;
  const currentPoint = history[currentIndex] || history[history.length - 1];

  return (
    <div className="w-full bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-xl px-4 py-2 flex items-center justify-between gap-3 text-xs font-mono text-slate-300">
      <div className="flex items-center gap-2">
        <History className="w-4 h-4 text-cyan-400" />
        <span className="font-bold text-slate-200">VR TIME-REWIND:</span>
        <span className="text-[11px] text-slate-400">
          {rewindIndex !== null ? (
            <span className="text-amber-400 font-bold">
              REWOUND TO {currentPoint?.timestamp || '00:00:00'} (Risk: {currentPoint?.riskScore}%)
            </span>
          ) : (
            <span className="text-emerald-400 flex items-center gap-1 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              STREAMING LIVE
            </span>
          )}
        </span>
      </div>

      {/* Slider */}
      <div className="flex-1 max-w-md mx-4 flex items-center gap-2">
        <span className="text-[10px] text-slate-500">-60s</span>
        <input
          type="range"
          min="0"
          max={Math.max(0, history.length - 1)}
          value={currentIndex}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val >= history.length - 1) {
              onRewindChange(null); // live
            } else {
              onRewindChange(val);
            }
          }}
          className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
        />
        <span className="text-[10px] text-slate-500">Now</span>
      </div>

      {/* Reset to live button */}
      {rewindIndex !== null && (
        <button
          onClick={() => onRewindChange(null)}
          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-md shadow-emerald-600/30"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Return to Live</span>
        </button>
      )}
    </div>
  );
};
