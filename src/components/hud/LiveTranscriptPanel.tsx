import React, { useState } from 'react';
import { TranscriptLine } from '../../types';
import { MessageSquare, ChevronDown, ChevronUp, Download, ShieldAlert, Sparkles } from 'lucide-react';

interface LiveTranscriptPanelProps {
  transcript: TranscriptLine[];
}

export const LiveTranscriptPanel: React.FC<LiveTranscriptPanelProps> = ({ transcript }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const exportTranscript = () => {
    const text = transcript
      .map((t) => `[${t.timestamp}] ${t.speaker}: ${t.text}`)
      .join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VoiceGuard_Transcript_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderHighlightedText = (line: TranscriptLine) => {
    if (!line.keywords || line.keywords.length === 0) {
      return <span>{line.text}</span>;
    }

    let remaining = line.text;
    const elements: React.ReactNode[] = [];
    let keyIdx = 0;

    // Highlight keywords
    line.keywords.forEach((kw) => {
      const idx = remaining.toLowerCase().indexOf(kw.word.toLowerCase());
      if (idx !== -1) {
        const before = remaining.substring(0, idx);
        const match = remaining.substring(idx, idx + kw.word.length);
        remaining = remaining.substring(idx + kw.word.length);

        if (before) elements.push(<span key={`b-${keyIdx++}`}>{before}</span>);
        elements.push(
          <span
            key={`m-${keyIdx++}`}
            className={`px-1 py-0.5 rounded font-bold ${
              kw.severity === 'red'
                ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                : kw.severity === 'orange'
                ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                : 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/50'
            }`}
          >
            {match}
          </span>
        );
      }
    });

    if (remaining) elements.push(<span key={`r-${keyIdx}`}>{remaining}</span>);
    return <>{elements}</>;
  };

  return (
    <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl font-mono text-xs">
      {/* Header */}
      <div
        className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 text-slate-300 font-bold">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span>REAL-TIME TRANSCRIPTION & SOCIAL ENGINEERING AUDIT</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
            NLP Active
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              exportTranscript();
            }}
            className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
            title="Download Transcript (TXT)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button className="text-slate-400 hover:text-white">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body */}
      {isExpanded && (
        <div className="p-3 max-h-48 overflow-y-auto space-y-2.5 text-xs">
          {transcript.map((line) => (
            <div
              key={line.id}
              className={`p-2 rounded-xl border ${
                line.speaker === 'Caller'
                  ? 'bg-slate-900/60 border-slate-800'
                  : line.speaker === 'Agent'
                  ? 'bg-slate-900/30 border-slate-800/60'
                  : 'bg-rose-950/20 border-rose-900/40 text-rose-300'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span
                  className={`font-bold ${
                    line.speaker === 'Caller'
                      ? 'text-cyan-300'
                      : line.speaker === 'Agent'
                      ? 'text-emerald-300'
                      : 'text-amber-400 flex items-center gap-1'
                  }`}
                >
                  {line.speaker === 'AI-Coach' && <Sparkles className="w-3 h-3" />}
                  {line.speaker}
                </span>
                <span>{line.timestamp}</span>
              </div>
              <div className="text-slate-200 leading-relaxed">
                {renderHighlightedText(line)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
