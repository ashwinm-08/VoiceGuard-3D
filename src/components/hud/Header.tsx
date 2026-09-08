import React from 'react';
import { CallerInfo, ScenarioType } from '../../types';
import {
  ShieldAlert,
  ShieldCheck,
  Radio,
  Wifi,
  Volume2,
  VolumeX,
  Maximize,
  HelpCircle,
  Settings,
  BookOpen,
} from 'lucide-react';

interface HeaderProps {
  caller: CallerInfo;
  currentRiskScore: number;
  scenario: ScenarioType;
  onScenarioChange: (scenario: ScenarioType) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onToggleFullscreen: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  caller,
  currentRiskScore,
  scenario,
  onScenarioChange,
  soundEnabled,
  onToggleSound,
  onOpenSettings,
  onOpenGuide,
  onToggleFullscreen,
}) => {
  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = () => {
    if (caller.status === 'on_hold') {
      return <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40">ON HOLD</span>;
    }
    if (caller.status === 'disconnected') {
      return <span className="px-2 py-0.5 rounded text-xs bg-rose-500/20 text-rose-300 border border-rose-500/40">DISCONNECTED</span>;
    }
    if (caller.status === 'transferred') {
      return <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-300 border border-purple-500/40">TRANSFERRED</span>;
    }
    return (
      <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        CALL ACTIVE
      </span>
    );
  };

  return (
    <header className="w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-slate-100 z-20">
      {/* Brand & Project Info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-wide text-white">VoiceGuard 3D</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 font-mono">
              v2.0 • LIVE TELEMETRY
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span>Team BharatMind</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">BUILD WITH भारत 2.0</span>
          </div>
        </div>
      </div>

      {/* Live Caller Metadata HUD */}
      <div className="hidden lg:flex items-center gap-6 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-1.5 text-xs font-mono">
        <div>
          <div className="text-slate-400 text-[10px]">CALLER / IDENTITY</div>
          <div className="font-semibold text-slate-100 flex items-center gap-1.5">
            <span>{caller.name}</span>
            <span className="text-[10px] text-slate-400">({caller.id})</span>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800"></div>

        <div>
          <div className="text-slate-400 text-[10px]">PHONE & ORIGIN</div>
          <div className="text-slate-200">{caller.phone}</div>
        </div>

        <div className="h-6 w-px bg-slate-800"></div>

        <div>
          <div className="text-slate-400 text-[10px]">ACCOUNT TIER</div>
          <div className="text-cyan-400 font-medium">{caller.accountTier}</div>
        </div>

        <div className="h-6 w-px bg-slate-800"></div>

        <div>
          <div className="text-slate-400 text-[10px]">DURATION & LATENCY</div>
          <div className="flex items-center gap-2">
            <span className="text-slate-100 font-bold">{formatDuration(caller.duration)}</span>
            <span className="text-[11px] text-emerald-400 flex items-center gap-0.5">
              <Wifi className="w-3 h-3" />
              {caller.latencyMs}ms
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800"></div>

        <div>
          <div className="text-slate-400 text-[10px]">STATE</div>
          <div>{getStatusBadge()}</div>
        </div>
      </div>

      {/* Scenario Switcher & Controls */}
      <div className="flex items-center gap-2">
        {/* Scenario Selectors */}
        <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800 text-xs font-mono">
          <span className="text-slate-400 px-2 text-[11px] hidden xl:inline">SIMULATE:</span>
          <button
            onClick={() => onScenarioChange('safe')}
            className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
              scenario === 'safe'
                ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Verified Natural Human Customer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Safe Caller</span>
          </button>
          <button
            onClick={() => onScenarioChange('borderline')}
            className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
              scenario === 'borderline'
                ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Stressed Caller or VoIP Jitter"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Borderline</span>
          </button>
          <button
            onClick={() => onScenarioChange('deepfake')}
            className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
              scenario === 'deepfake'
                ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/30 animate-pulse'
                : 'text-slate-400 hover:text-rose-400'
            }`}
            title="AI Synthetic Voice Clone Attack"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Clone Attack</span>
          </button>
        </div>

        {/* Action Icon Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-lg border transition-colors ${
              soundEnabled
                ? 'bg-slate-900 border-slate-700 text-cyan-400 hover:bg-slate-800'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'
            }`}
            title={soundEnabled ? 'Mute Audio Alerts' : 'Unmute Audio Alerts'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenGuide}
            className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
            title="Open User Guide & Help (Press H)"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
            title="Settings & Accessibility (Ctrl+,)"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleFullscreen}
            className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 transition-colors hidden md:block"
            title="Toggle Fullscreen (Press F)"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
