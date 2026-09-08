import React, { useState } from 'react';
import { MetricHistoryPoint } from '../../types';
import { ShieldAlert, AlertTriangle, ShieldCheck, HelpCircle, Maximize2 } from 'lucide-react';

interface CentralRiskMeterProps {
  metrics: MetricHistoryPoint;
  onExpand?: () => void;
}

export const CentralRiskMeter: React.FC<CentralRiskMeterProps> = ({ metrics, onExpand }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const score = metrics.riskScore;

  // Determine score styling
  const getScoreData = (val: number) => {
    if (val <= 20) {
      return {
        label: 'ABSOLUTELY SAFE',
        sublabel: 'Allow immediately',
        color: '#00f0ff',
        badgeBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
        ringStroke: '#00f0ff',
        dotColor: 'bg-cyan-400',
      };
    }
    if (val <= 40) {
      return {
        label: 'LOW RISK',
        sublabel: 'Monitor casually',
        color: '#10b981',
        badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        ringStroke: '#10b981',
        dotColor: 'bg-emerald-400',
      };
    }
    if (val <= 60) {
      return {
        label: 'MEDIUM RISK',
        sublabel: 'Watch closely, ready challenge',
        color: '#facc15',
        badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        ringStroke: '#facc15',
        dotColor: 'bg-amber-400',
      };
    }
    if (val <= 80) {
      return {
        label: 'HIGH RISK',
        sublabel: 'Prepare challenge or block',
        color: '#f97316',
        badgeBg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
        ringStroke: '#f97316',
        dotColor: 'bg-orange-400',
      };
    }
    return {
      label: 'CRITICAL THREAT',
      sublabel: 'Recommend immediate block',
      color: '#ef4444',
      badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      ringStroke: '#ef4444',
      dotColor: 'bg-rose-400',
    };
  };

  const scoreData = getScoreData(score);

  // SVG Gauge calculations
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Semi-circle or 270-degree arc: let's use a 240-degree sweep
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * score) / 100;

  // Breakdown percentages calculated from current biometrics
  const jitterImpact = Math.min(100, Math.round((metrics.jitter / 4.0) * 100));
  const shimmerImpact = Math.min(100, Math.round((metrics.shimmer / 5.0) * 100));
  const formantImpact = metrics.vowelZone === 'outlier' ? 88 : 22;
  const couplingDeficit = Math.round((1 - metrics.couplingScore) * 100);

  return (
    <div
      className="relative bg-slate-950/80 backdrop-blur-md border border-slate-800/90 rounded-2xl p-4 flex flex-col items-center justify-between shadow-2xl transition-all hover:border-slate-700 cursor-pointer group"
      onClick={onExpand}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Card Header */}
      <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${scoreData.dotColor} animate-ping`} />
          <span className="font-semibold text-slate-200">CENTRAL RISK GAUGE</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExpand?.();
          }}
          className="text-slate-400 hover:text-cyan-300 transition-colors p-1"
          title="Expand Full-Screen Breakdown"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Animated Gauge SVG */}
      <div className="relative flex items-center justify-center my-2">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={arcLength}
            strokeDashoffset={0}
            strokeLinecap="round"
          />
          {/* Active threat progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={scoreData.ringStroke}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Inner Counter */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold font-mono tracking-tight text-white drop-shadow-md">
            {score}%
          </span>
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mt-0.5">
            THREAT LEVEL
          </span>
        </div>
      </div>

      {/* Status Badge */}
      <div className={`w-full py-1.5 px-3 rounded-xl border text-center font-mono ${scoreData.badgeBg}`}>
        <div className="text-xs font-bold tracking-wide">{scoreData.label}</div>
        <div className="text-[10px] opacity-80">{scoreData.sublabel}</div>
      </div>

      {/* Hover Breakdown Tooltip */}
      {showTooltip && (
        <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 w-64 bg-slate-900/95 backdrop-blur-lg border border-slate-700 text-slate-200 p-3 rounded-xl shadow-2xl z-40 text-xs font-mono pointer-events-none">
          <div className="font-bold text-cyan-400 mb-1.5 flex items-center justify-between">
            <span>Risk Factor Breakdown</span>
            <span>{score}%</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Jitter Variance:</span>
              <span className="text-slate-200 font-bold">{jitterImpact}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1">
              <div className="bg-amber-400 h-1 rounded-full" style={{ width: `${jitterImpact}%` }} />
            </div>

            <div className="flex justify-between items-center text-[11px] pt-1">
              <span className="text-slate-400">Shimmer Instability:</span>
              <span className="text-slate-200 font-bold">{shimmerImpact}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1">
              <div className="bg-rose-400 h-1 rounded-full" style={{ width: `${shimmerImpact}%` }} />
            </div>

            <div className="flex justify-between items-center text-[11px] pt-1">
              <span className="text-slate-400">Formant Anomaly:</span>
              <span className="text-slate-200 font-bold">{formantImpact}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1">
              <div className="bg-purple-400 h-1 rounded-full" style={{ width: `${formantImpact}%` }} />
            </div>

            <div className="flex justify-between items-center text-[11px] pt-1">
              <span className="text-slate-400">Breath Decoupling:</span>
              <span className="text-slate-200 font-bold">{couplingDeficit}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1">
              <div className="bg-cyan-400 h-1 rounded-full" style={{ width: `${couplingDeficit}%` }} />
            </div>
          </div>
          <div className="text-[10px] text-cyan-300/80 mt-2 text-center">Click to expand deep historical telemetry</div>
        </div>
      )}
    </div>
  );
};
