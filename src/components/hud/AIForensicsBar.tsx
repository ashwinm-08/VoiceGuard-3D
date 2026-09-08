import React from 'react';
import { TTSEngineAnalysis, SentimentAnalysis, AISupervisorCoach } from '../../types';
import {
  Cpu,
  Heart,
  Smile,
  ShieldCheck,
  Lock,
  Flame,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

interface AIForensicsBarProps {
  tts: TTSEngineAnalysis;
  sentiment: SentimentAnalysis;
  coach: AISupervisorCoach;
  purgeCountdown: number;
  isPurged: boolean;
  onInstantPurge: () => void;
  onOpenKnowledgeQuestion: () => void;
}

export const AIForensicsBar: React.FC<AIForensicsBarProps> = ({
  tts,
  sentiment,
  coach,
  purgeCountdown,
  isPurged,
  onInstantPurge,
  onOpenKnowledgeQuestion,
}) => {
  return (
    <div className="w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-200 z-10">
      {/* TTS Engine Detection (Feature 2.1) */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-700/60 text-cyan-400 flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5" />
          <span className="text-[10px] uppercase font-bold text-slate-400">TTS MODEL:</span>
          <span
            className={`font-bold ${
              tts.isClone ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
            }`}
          >
            {tts.detectedEngine}
          </span>
          {tts.isClone && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-900/60 text-rose-300 font-bold border border-rose-700">
              {tts.engineConfidence}% CONFIDENCE
            </span>
          )}
        </div>
      </div>

      {/* Sentiment & Psychological Emotion (Feature 1.10 & 2.6) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
          <Smile className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400 text-[10px]">EMOTION:</span>
          <span className={`font-semibold ${sentiment.isManipulative ? 'text-rose-400' : 'text-slate-200'}`}>
            {sentiment.emotion}
          </span>
          <span className="text-[10px] text-cyan-400">({sentiment.authenticityScore}% Authentic)</span>
        </div>

        {sentiment.heartRateBpm > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px]">
            <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span className="text-slate-400 text-[10px]">PULSE:</span>
            <span className="text-rose-300 font-bold">{sentiment.heartRateBpm} BPM</span>
          </div>
        )}
      </div>

      {/* AI Supervisor Real-Time Coach Suggestion (Feature 3.1) */}
      <div className="hidden xl:flex items-center gap-2 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800 max-w-md">
        <Lightbulb
          className={`w-4 h-4 flex-shrink-0 ${
            coach.severity === 'alert'
              ? 'text-rose-400 animate-bounce'
              : coach.severity === 'warning'
              ? 'text-amber-400'
              : 'text-emerald-400'
          }`}
        />
        <div className="truncate text-[11px]">
          <span className="text-slate-400 font-semibold mr-1">AI Coach:</span>
          <span
            className={
              coach.severity === 'alert'
                ? 'text-rose-300 font-semibold'
                : coach.severity === 'warning'
                ? 'text-amber-300 font-semibold'
                : 'text-slate-300'
            }
          >
            {coach.recommendation}
          </span>
        </div>
      </div>

      {/* Knowledge Question & Biometric Privacy Shield (Feature 2.10 & 6.2) */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenKnowledgeQuestion}
          className="px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 hover:bg-indigo-900/80 flex items-center gap-1.5 text-xs font-semibold shadow-sm transition-all"
          title="Ask caller system-generated security knowledge questions"
        >
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Ask Knowledge Q</span>
        </button>

        {/* Privacy Purge Shield */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-lg text-xs">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400 text-[10px]">AES-256</span>
          <span className="text-slate-500">•</span>
          <span className="text-cyan-400 font-bold">⏱️ {purgeCountdown}s</span>
          <button
            onClick={onInstantPurge}
            className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 border border-slate-700 transition-colors"
            title="Instantly purge in-memory acoustic biometrics (GDPR Article 17)"
          >
            {isPurged ? '✓ PURGED' : 'Purge'}
          </button>
        </div>
      </div>
    </div>
  );
};
