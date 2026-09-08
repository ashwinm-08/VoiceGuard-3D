import React, { useState } from 'react';
import { SecurityQuestion } from '../../types';
import { HelpCircle, X, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { audioSynth } from '../../services/audioSynth';

interface KnowledgeQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: SecurityQuestion[];
}

export const KnowledgeQuestionsModal: React.FC<KnowledgeQuestionsModalProps> = ({
  isOpen,
  onClose,
  questions,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  if (!isOpen) return null;

  const currentQ = questions[currentIdx] || questions[0];

  const handleSelect = (idx: number) => {
    setSelectedOpt(idx);
    if (idx === currentQ.correctIndex) {
      setResult('correct');
      audioSynth.playAlert('safe');
    } else {
      setResult('incorrect');
      audioSynth.playAlert('critical');
    }
  };

  const handleNext = () => {
    setSelectedOpt(null);
    setResult(null);
    setCurrentIdx((prev) => (prev + 1) % questions.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-mono">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400 font-bold">
            <HelpCircle className="w-5 h-5" />
            <span>OUT-OF-BAND KNOWLEDGE VERIFICATION</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span>CATEGORY: {currentQ.category}</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 uppercase font-bold">
              Difficulty: {currentQ.difficulty}
            </span>
          </div>

          <div className="text-sm font-semibold text-slate-100 bg-slate-950 p-4 rounded-xl border border-slate-800 leading-relaxed">
            {currentQ.question}
          </div>

          <div className="space-y-2">
            {currentQ.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={result !== null}
                className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                  selectedOpt === i
                    ? i === currentQ.correctIndex
                      ? 'bg-emerald-600/20 border-emerald-400 text-emerald-300'
                      : 'bg-rose-600/20 border-rose-400 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-indigo-500/50 hover:bg-slate-800'
                }`}
              >
                <span>{opt}</span>
                {selectedOpt === i && (
                  <span>
                    {i === currentQ.correctIndex ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    )}
                  </span>
                )}
              </button>
            ))}
          </div>

          {result && (
            <div
              className={`p-3 rounded-xl border text-xs text-center font-bold ${
                result === 'correct'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              }`}
            >
              {result === 'correct'
                ? '✓ Identity Confirmed: Caller answered account question correctly!'
                : '🚨 Security Failure: Incorrect answer provided. Flagging account takeover pattern.'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
          <span className="text-[10px] text-slate-500">2FA Knowledge Module</span>
          <button
            onClick={handleNext}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
          >
            <span>Next Question</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
