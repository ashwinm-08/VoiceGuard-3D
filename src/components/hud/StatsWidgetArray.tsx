import React from 'react';
import { Clock, PhoneCall, CheckCircle, Activity, Gauge, PieChart } from 'lucide-react';

interface StatsWidgetArrayProps {
  durationSeconds: number;
}

export const StatsWidgetArray: React.FC<StatsWidgetArrayProps> = ({ durationSeconds }) => {
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono text-xs">
      {/* Widget 1: Session Duration */}
      <div className="bg-slate-950/80 backdrop-blur-md p-3 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-[10px]">
          <span>SESSION DURATION</span>
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="text-lg font-bold text-white my-1">{formatTime(durationSeconds)}</div>
        <div className="text-[9px] text-slate-500">Avg Target: 04:30</div>
      </div>

      {/* Widget 2: Daily Throughput */}
      <div className="bg-slate-950/80 backdrop-blur-md p-3 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-[10px]">
          <span>SCREENED TODAY</span>
          <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-lg font-bold text-emerald-300 my-1">248 Calls</div>
        <div className="text-[9px] text-emerald-400/80">↑ +12% vs Yesterday</div>
      </div>

      {/* Widget 3: Detection Rate */}
      <div className="bg-slate-950/80 backdrop-blur-md p-3 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-[10px]">
          <span>DETECTION ACCURACY</span>
          <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="text-lg font-bold text-cyan-300 my-1">94.3%</div>
        <div className="text-[9px] text-slate-400">FP Rate: 1.2%</div>
      </div>

      {/* Widget 4: Active Sessions */}
      <div className="bg-slate-950/80 backdrop-blur-md p-3 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-[10px]">
          <span>CONCURRENT CALLS</span>
          <Activity className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="text-lg font-bold text-purple-300 my-1">12 / 32</div>
        <div className="text-[9px] text-slate-400">Capacity: 37.5%</div>
      </div>

      {/* Widget 5: System Performance */}
      <div className="bg-slate-950/80 backdrop-blur-md p-3 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-[10px]">
          <span>INFERENCE LATENCY</span>
          <Gauge className="w-3.5 h-3.5 text-teal-400" />
        </div>
        <div className="text-lg font-bold text-teal-300 my-1">42 ms</div>
        <div className="text-[9px] text-teal-400/80">GPU Load: 34%</div>
      </div>

      {/* Widget 6: Risk Distribution */}
      <div className="bg-slate-950/80 backdrop-blur-md p-3 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-[10px]">
          <span>RISK BREAKDOWN</span>
          <PieChart className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="flex items-center gap-1.5 my-1 text-[11px] font-bold">
          <span className="text-emerald-400">80% 🟢</span>
          <span className="text-amber-400">15% 🟡</span>
          <span className="text-rose-400">5% 🔴</span>
        </div>
        <div className="text-[9px] text-slate-400">Model Accuracy: 96.8%</div>
      </div>
    </div>
  );
};
