import React, { useState } from 'react';
import { ChallengeType, ChallengeDifficulty, ChallengeResult } from '../../types';
import { Zap, AlertCircle, CheckCircle, XCircle, Activity, Loader2 } from 'lucide-react';

interface ChallengeSystemProps {
  isChallengeActive: boolean;
  challengeProgress: number;
  lastResult: ChallengeResult | null;
  onTriggerChallenge: (type: ChallengeType, difficulty: ChallengeDifficulty) => void;
  onCancelChallenge: () => void;
  isCallActive: boolean;
}

export const ChallengeSystem: React.FC<ChallengeSystemProps> = ({
  isChallengeActive,
  challengeProgress,
  lastResult,
  onTriggerChallenge,
  onCancelChallenge,
  isCallActive,
}) => {
  const [challengeType, setChallengeType] = useState<ChallengeType>('pitch-glide');
  const [difficulty, setDifficulty] = useState<ChallengeDifficulty>('medium');

  const getStatusBadge = (res: ChallengeResult) => {
    if (res.status === 'passed') {
      return (
        <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded text-xs font-bold">
          <CheckCircle className="w-3.5 h-3.5" />
          PASS ({res.adaptationScore}%)
        </span>
      );
    }
    if (res.status === 'partial') {
      return (
        <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded text-xs font-bold">
          <AlertCircle className="w-3.5 h-3.5" />
          PARTIAL ({res.adaptationScore}%)
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded text-xs font-bold">
        <XCircle className="w-3.5 h-3.5" />
        FAIL ({res.adaptationScore}%)
      </span>
    );
  };

  return (
    <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800/90 rounded-2xl p-4 shadow-xl font-mono">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-3 border-b border-slate-800 pb-2">
        <span className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          ACOUSTIC LIVENESS CHALLENGE
        </span>
        <span className="text-[10px] text-cyan-400 uppercase">Interactive Probe</span>
      </div>

      {/* Trigger or Cancel Button */}
      {!isChallengeActive ? (
        <button
          onClick={() => onTriggerChallenge(challengeType, difficulty)}
          disabled={!isCallActive}
          className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-md mb-3 ${
            !isCallActive
              ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-cyan-600 to-teal-600 border-cyan-400/60 text-white hover:brightness-110 shadow-cyan-500/20'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>[+ Trigger Challenge]</span>
        </button>
      ) : (
        <button
          onClick={onCancelChallenge}
          className="w-full py-2.5 px-3 rounded-xl border border-rose-500/50 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 text-xs font-bold transition-all shadow-md mb-3 flex items-center justify-center gap-2"
        >
          <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
          <span>[Cancel Ongoing Challenge]</span>
        </button>
      )}

      {/* Progress Bar during active challenge */}
      {isChallengeActive && (
        <div className="mb-3 bg-slate-900 p-2.5 rounded-xl border border-cyan-500/40">
          <div className="flex justify-between items-center text-[11px] text-cyan-300 mb-1">
            <span>Injecting Acoustic Probe (500ms)...</span>
            <span>{Math.round(challengeProgress * 100)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-2 rounded-full transition-all duration-75"
              style={{ width: `${challengeProgress * 100}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Synthesizing probe frequency & analyzing tract adaptation latency...
          </div>
        </div>
      )}

      {/* Challenge Configuration */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Challenge Type:</label>
          <select
            value={challengeType}
            onChange={(e) => setChallengeType(e.target.value as ChallengeType)}
            disabled={isChallengeActive}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-[11px]"
          >
            <option value="pitch-glide">Pitch-Glide (Rec)</option>
            <option value="frequency-sweep">Frequency Sweep</option>
            <option value="vowel-transition">Vowel Transition</option>
            <option value="harmonic-analysis">Harmonic Analysis</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Difficulty:</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as ChallengeDifficulty)}
            disabled={isChallengeActive}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-[11px]"
          >
            <option value="easy">Easy (Narrow)</option>
            <option value="medium">Medium (Standard)</option>
            <option value="hard">Hard (Wide)</option>
          </select>
        </div>
      </div>

      {/* Challenge Result Meter & Card */}
      {lastResult ? (
        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-slate-400">Adaptation Capability:</span>
            {getStatusBadge(lastResult)}
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                lastResult.adaptationScore >= 80
                  ? 'bg-emerald-400'
                  : lastResult.adaptationScore >= 50
                  ? 'bg-amber-400'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${lastResult.adaptationScore}%` }}
            />
          </div>

          <div className="text-[10px] text-slate-300 leading-tight">
            {lastResult.verdictText}
          </div>

          <div className="flex justify-between items-center text-[9px] text-slate-400 mt-2 border-t border-slate-800/80 pt-1.5">
            <span>Latency: {lastResult.durationMs}ms</span>
            <span>Recorded: {lastResult.timestamp}</span>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800/60 text-center text-[11px] text-slate-400">
          No active challenge probe. Click Trigger to test acoustic liveness.
        </div>
      )}
    </div>
  );
};
