import React, { useState } from 'react';
import { Mic, MicOff, Volume2, Sparkles } from 'lucide-react';
import { audioSynth } from '../../services/audioSynth';

interface VoiceCommandBarProps {
  onTriggerChallenge: () => void;
  onSubmitVerdict: (verdict: 'safe' | 'block') => void;
  onFocusMetric: (metric: string) => void;
  currentRisk: number;
}

export const VoiceCommandBar: React.FC<VoiceCommandBarProps> = ({
  onTriggerChallenge,
  onSubmitVerdict,
  onFocusMetric,
  currentRisk,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);

  const executeCommand = (cmd: string, action: () => void) => {
    audioSynth.playClick();
    setLastCommand(cmd);
    action();
    setTimeout(() => setLastCommand(null), 3500);
  };

  return (
    <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-xl px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-300">
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setIsListening(!isListening);
            audioSynth.playClick();
          }}
          className={`p-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
            isListening
              ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
              : 'bg-slate-900 border-slate-700 text-cyan-400 hover:bg-slate-800'
          }`}
          title="Toggle Hands-Free Voice Control"
        >
          {isListening ? <Mic className="w-3.5 h-3.5 text-rose-400" /> : <MicOff className="w-3.5 h-3.5" />}
          <span className="text-[10px] font-bold uppercase">{isListening ? 'LISTENING' : 'VOICE HUD'}</span>
        </button>

        {lastCommand ? (
          <span className="text-[11px] text-cyan-300 flex items-center gap-1 font-bold animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            "{lastCommand}" Recognized!
          </span>
        ) : (
          <span className="text-[10px] text-slate-500 hidden md:inline">
            Say or click voice commands:
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() =>
            executeCommand(`Current risk threat is ${currentRisk}%`, () => {
              audioSynth.playTone(600, 0.2);
            })
          }
          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-[10px] text-slate-300 hover:text-white"
        >
          "What's the risk?"
        </button>

        <button
          onClick={() => executeCommand('Triggering acoustic challenge...', onTriggerChallenge)}
          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-[10px] text-slate-300 hover:text-white"
        >
          "Trigger challenge"
        </button>

        <button
          onClick={() => executeCommand('Marking caller as SAFE', () => onSubmitVerdict('safe'))}
          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-[10px] text-emerald-400 hover:text-emerald-300"
        >
          "Mark safe"
        </button>

        <button
          onClick={() => executeCommand('BLOCKING active session immediately', () => onSubmitVerdict('block'))}
          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-[10px] text-rose-400 hover:text-rose-300"
        >
          "Block call"
        </button>

        <button
          onClick={() => executeCommand('Focusing Jitter ribbon', () => onFocusMetric('jitter'))}
          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-[10px] text-cyan-400 hover:text-cyan-300 hidden sm:inline"
        >
          "Show jitter"
        </button>
      </div>
    </div>
  );
};
