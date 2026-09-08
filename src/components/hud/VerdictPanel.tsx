import React, { useState } from 'react';
import { VerdictChoice, VerdictSubmission } from '../../types';
import { CheckCircle2, HelpCircle, XCircle, Flag, Send, FileText } from 'lucide-react';

interface VerdictPanelProps {
  onVerdictSubmit: (
    verdict: VerdictChoice,
    confidence: number,
    notes: string,
    flagged: boolean
  ) => void;
  recentVerdicts: VerdictSubmission[];
}

export const VerdictPanel: React.FC<VerdictPanelProps> = ({
  onVerdictSubmit,
  recentVerdicts,
}) => {
  const [selectedVerdict, setSelectedVerdict] = useState<VerdictChoice>('safe');
  const [confidence, setConfidence] = useState<number>(75);
  const [note, setNote] = useState<string>('');
  const [isFlagged, setIsFlagged] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Confidence label interpretation
  const getConfidenceText = (val: number) => {
    if (val <= 30) return "I'm guessing (Low confidence)";
    if (val <= 70) return 'Reasonable doubt (Moderate confidence)';
    return 'Very confident (High weight in fraud database)';
  };

  const handleSubmit = (verdictOverride?: VerdictChoice) => {
    const verdict = verdictOverride || selectedVerdict;
    onVerdictSubmit(verdict, confidence, note, isFlagged);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setNote('');
    }, 2000);
  };

  return (
    <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800/90 rounded-2xl p-4 shadow-xl font-mono">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-3 border-b border-slate-800 pb-2">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          MAKE YOUR DECISION
        </span>
        <span className="text-[10px] text-slate-500 uppercase">Analyst Verdict</span>
      </div>

      {/* 3 Main Verdict Decision Buttons */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {/* SAFE */}
        <button
          onClick={() => {
            setSelectedVerdict('safe');
            handleSubmit('safe');
          }}
          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
            selectedVerdict === 'safe'
              ? 'bg-emerald-600/20 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-600/20 ring-1 ring-emerald-400/50'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-emerald-300 hover:border-emerald-500/40'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 mb-1 text-emerald-400" />
          <span className="text-xs font-bold">✓ SAFE</span>
          <span className="text-[9px] font-normal text-emerald-400/80 mt-0.5">Trust caller</span>
        </button>

        {/* UNCERTAIN */}
        <button
          onClick={() => {
            setSelectedVerdict('uncertain');
            handleSubmit('uncertain');
          }}
          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
            selectedVerdict === 'uncertain'
              ? 'bg-amber-600/20 border-amber-400 text-amber-300 shadow-lg shadow-amber-600/20 ring-1 ring-amber-400/50'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-amber-300 hover:border-amber-500/40'
          }`}
        >
          <HelpCircle className="w-5 h-5 mb-1 text-amber-400" />
          <span className="text-xs font-bold">? UNCERTAIN</span>
          <span className="text-[9px] font-normal text-amber-400/80 mt-0.5">Verify call</span>
        </button>

        {/* BLOCK */}
        <button
          onClick={() => {
            setSelectedVerdict('block');
            handleSubmit('block');
          }}
          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
            selectedVerdict === 'block'
              ? 'bg-rose-600/20 border-rose-400 text-rose-300 shadow-lg shadow-rose-600/20 ring-1 ring-rose-400/50'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-rose-300 hover:border-rose-500/40'
          }`}
        >
          <XCircle className="w-5 h-5 mb-1 text-rose-400" />
          <span className="text-xs font-bold">✗ BLOCK</span>
          <span className="text-[9px] font-normal text-rose-400/80 mt-0.5">Block now</span>
        </button>
      </div>

      {/* Confidence Level Slider */}
      <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 mb-3">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="text-slate-400">Confidence Level:</span>
          <span className="font-bold text-cyan-400 text-sm">{confidence}%</span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          value={confidence}
          onChange={(e) => setConfidence(Number(e.target.value))}
          className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />
        <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
          <span className="truncate">{getConfidenceText(confidence)}</span>
        </div>
      </div>

      {/* Optional Note & Flag for Review */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Add note: e.g. Formant pattern irregular..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="flex-1 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
          <button
            onClick={() => setIsFlagged(!isFlagged)}
            className={`p-2 rounded-lg border transition-colors flex items-center gap-1 text-xs ${
              isFlagged
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-400'
            }`}
            title="Flag For Review by Supervisor"
          >
            <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {isSubmitted && (
          <div className="py-1 px-2.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] text-center font-semibold">
            ✓ Verdict recorded into fraud database!
          </div>
        )}
      </div>

      {/* Audit Trail List (Last 2 Verdicts) */}
      {recentVerdicts.length > 0 && (
        <div className="border-t border-slate-800/80 pt-2">
          <div className="text-[10px] text-slate-500 uppercase mb-1">Recent Audit Log</div>
          <div className="space-y-1">
            {recentVerdicts.slice(0, 2).map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between text-[11px] bg-slate-900/60 px-2 py-1 rounded border border-slate-800/60"
              >
                <span
                  className={`font-bold ${
                    v.verdict === 'safe'
                      ? 'text-emerald-400'
                      : v.verdict === 'block'
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }`}
                >
                  {v.verdict.toUpperCase()} ({v.confidence}%)
                </span>
                <span className="text-slate-400">{v.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
