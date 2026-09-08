import React, { useState } from 'react';
import { BharatMindAgent, BharatMindInferenceResult } from '../../services/ai/BharatMindAgent';
import { MetricHistoryPoint, CallerInfo, TTSEngineAnalysis, SentimentAnalysis, AISupervisorCoach } from '../../types';
import { Bot, Sparkles, Send, ArrowRight, Cpu, Zap, Activity, X } from 'lucide-react';

interface BharatMindModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: MetricHistoryPoint;
  caller: CallerInfo;
  tts: TTSEngineAnalysis;
  sentiment: SentimentAnalysis;
  coach: AISupervisorCoach;
  onExecuteAction: (action: BharatMindInferenceResult['suggestedAction']) => void;
}

export const BharatMindModal: React.FC<BharatMindModalProps> = ({
  isOpen,
  onClose,
  metrics,
  caller,
  tts,
  sentiment,
  coach,
  onExecuteAction,
}) => {
  const [query, setQuery] = useState<string>('');
  const [history, setHistory] = useState<BharatMindInferenceResult[]>([
    {
      query: 'System Initialized',
      intent: 'explain_risk',
      confidence: 0.99,
      explanation: 'BharatMind Neural Mini Agent is loaded on-device in your browser. Ask or type what you want to do (e.g. test the voice, block call, show DNA helix, what is the risk). I determine your exact intent and deliver the answer and direct action execution.',
      reasoning: [
        'Model: BharatMind-Core-Neural-Mini-v2 (Zero-latency local tensor execution)',
        'Coupled with live acoustic telemetry, Web Audio synthesizers, and fraud classifiers'
      ]
    }
  ]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleAsk = (textToAsk?: string) => {
    const q = (textToAsk || query).trim();
    if (!q) return;

    setIsProcessing(true);
    setTimeout(() => {
      const res = BharatMindAgent.processQuery(q, {
        metrics,
        caller,
        tts,
        sentiment,
        coach
      });
      setHistory((prev) => [res, ...prev]);
      setIsProcessing(false);
      setQuery('');
    }, 120);
  };

  const samplePrompts = [
    'Test the voice for liveness',
    'Block this call immediately',
    'Show me DNA helix view',
    'What is the current risk score?',
    'Purge all biometric data now',
    'Inspect jitter anomalies'
  ];

  const riskColor = metrics.riskScore > 75 ? 'text-rose-400' : metrics.riskScore > 35 ? 'text-amber-400' : 'text-emerald-400';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 font-mono">
      <div className="bg-slate-900 border border-cyan-500/40 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-900 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bot className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">BharatMind Mini AI Agent</h2>
                <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-cyan-400" /> LOCAL NEURAL MODEL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Real-Time Intent Reasoning & Instant Answer Engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors text-lg font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Context Telemetry Bar */}
        <div className="bg-slate-950/70 border-b border-slate-800 px-6 py-2.5 flex items-center justify-between text-xs text-slate-300 overflow-x-auto gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">CALLER:</span>
            <span className="text-cyan-400 font-semibold">{caller.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">RISK SCORE:</span>
            <span className={`font-bold ${riskColor}`}>
              {metrics.riskScore}/100
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">TTS SIGNATURE:</span>
            <span className="text-purple-300">{tts.detectedEngine} ({tts.engineConfidence.toFixed(0)}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">INFERENCE:</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <Zap className="w-3 h-3" /> 0ms On-Device
            </span>
          </div>
        </div>

        {/* Chat / Thought Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
          {history.map((item, idx) => (
            <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              {/* User Prompt */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 pb-2 gap-2">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>YOU WANTED:</span>
                  <span className="text-slate-200 bg-slate-800 px-2 py-0.5 rounded text-xs">{item.query}</span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span>Determined Intent:</span>
                  <span className="text-amber-300 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50">
                    {item.intent}
                  </span>
                  <span className="text-emerald-400 text-[11px]">
                    ({(item.confidence * 100).toFixed(0)}% match)
                  </span>
                </div>
              </div>

              {/* BharatMind Answer & Explanation */}
              <div className="text-slate-200 text-sm leading-relaxed pl-3 border-l-2 border-cyan-500">
                {item.explanation}
              </div>

              {/* Reasoning Chain */}
              {item.reasoning && item.reasoning.length > 0 && (
                <div className="bg-slate-900/80 rounded-lg p-2.5 text-xs text-slate-400 space-y-1">
                  <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Activity className="w-3 h-3 text-cyan-400" /> BharatMind Neural Decision Chain:
                  </div>
                  {item.reasoning.map((r, rIdx) => (
                    <div key={rIdx} className="text-slate-300 pl-2">
                      • {r}
                    </div>
                  ))}
                </div>
              )}

              {/* One-Click Action Execution */}
              {item.suggestedAction && (
                <div className="pt-1 flex items-center justify-end">
                  <button
                    onClick={() => {
                      onExecuteAction(item.suggestedAction);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2 hover:from-cyan-400 hover:to-emerald-400 transition-all shadow-md shadow-cyan-500/20"
                  >
                    <span>Execute Action: {item.suggestedAction.label}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sample Quick Prompts */}
        <div className="px-6 py-2 bg-slate-950 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-500 whitespace-nowrap">Quick Prompts:</span>
          {samplePrompts.map((p, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleAsk(p)}
              className="px-2.5 py-1 rounded bg-slate-800/80 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 transition-colors whitespace-nowrap border border-slate-700/60"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Tell BharatMind what you want (test caller voice, switch to DNA view, block call)..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <button
            onClick={() => handleAsk()}
            disabled={isProcessing || !query.trim()}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all"
          >
            {isProcessing ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Ask</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
