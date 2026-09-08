import React from 'react';
import { CallerInfo } from '../../types';
import {
  Pause,
  Play,
  PhoneOff,
  UserCheck,
  Disc,
  Mic,
  MicOff,
  Share2,
} from 'lucide-react';

interface CallControlsProps {
  caller: CallerInfo;
  onToggleHold: () => void;
  onToggleMute: () => void;
  onToggleRecord: () => void;
  onInitiateDisconnect: () => void;
  onTransfer: () => void;
}

export const CallControls: React.FC<CallControlsProps> = ({
  caller,
  onToggleHold,
  onToggleMute,
  onToggleRecord,
  onInitiateDisconnect,
  onTransfer,
}) => {
  const isDisconnected = caller.status === 'disconnected';
  const isHold = caller.status === 'on_hold';

  return (
    <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800/90 rounded-2xl p-4 shadow-xl font-mono">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-3 border-b border-slate-800 pb-2">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          CALL MANAGEMENT
        </span>
        <span className="text-[10px] text-slate-500 uppercase">Operator Hub</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* HOLD / RESUME */}
        <button
          onClick={onToggleHold}
          disabled={isDisconnected}
          title={isHold ? 'Resume current call' : 'Pause the call (Hold)'}
          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-xs font-semibold ${
            isDisconnected
              ? 'opacity-40 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-500'
              : isHold
              ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-lg shadow-amber-500/20 animate-pulse'
              : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-cyan-300 hover:border-cyan-500/40'
          }`}
        >
          {isHold ? <Play className="w-5 h-5 mb-1" /> : <Pause className="w-5 h-5 mb-1" />}
          <span>{isHold ? 'RESUME' : 'HOLD'}</span>
          <span className="text-[9px] font-normal text-slate-400 mt-0.5">
            {isHold ? 'Continue' : 'Pause'}
          </span>
        </button>

        {/* RECORD */}
        <button
          onClick={onToggleRecord}
          disabled={isDisconnected}
          title="Capture speaker audio evidence"
          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-xs font-semibold ${
            isDisconnected
              ? 'opacity-40 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-500'
              : caller.isRecording
              ? 'bg-rose-500/20 border-rose-400/50 text-rose-300 shadow-md shadow-rose-500/20'
              : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-cyan-300 hover:border-cyan-500/40'
          }`}
        >
          <Disc className={`w-5 h-5 mb-1 ${caller.isRecording ? 'animate-spin text-rose-400' : ''}`} />
          <span>RECORD</span>
          <span className="text-[9px] font-normal text-slate-400 mt-0.5">
            {caller.isRecording ? 'Capturing' : 'Evidence'}
          </span>
        </button>

        {/* DISCONNECT */}
        <button
          onClick={onInitiateDisconnect}
          disabled={isDisconnected}
          title="End Call immediately (Confirmation required)"
          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-xs font-semibold ${
            isDisconnected
              ? 'opacity-40 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-500'
              : 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/60 hover:border-rose-500 hover:text-rose-100 shadow-md'
          }`}
        >
          <PhoneOff className="w-5 h-5 mb-1 text-rose-400" />
          <span>DISCONNECT</span>
          <span className="text-[9px] font-normal text-rose-400/80 mt-0.5">Confirm Req</span>
        </button>

        {/* MUTE */}
        <button
          onClick={onToggleMute}
          disabled={isDisconnected}
          title="Silence agent microphone"
          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-xs font-semibold ${
            isDisconnected
              ? 'opacity-40 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-500'
              : caller.isMuted
              ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-cyan-300 hover:border-cyan-500/40'
          }`}
        >
          {caller.isMuted ? <MicOff className="w-5 h-5 mb-1 text-cyan-400" /> : <Mic className="w-5 h-5 mb-1" />}
          <span>MUTE</span>
          <span className="text-[9px] font-normal text-slate-400 mt-0.5">
            {caller.isMuted ? 'Muted' : 'Microphone'}
          </span>
        </button>

        {/* TRANSFER */}
        <button
          onClick={onTransfer}
          disabled={isDisconnected}
          title="Transfer call to tier-2 fraud supervisor"
          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-xs font-semibold ${
            isDisconnected
              ? 'opacity-40 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-500'
              : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-cyan-300 hover:border-cyan-500/40'
          }`}
        >
          <Share2 className="w-5 h-5 mb-1 text-indigo-400" />
          <span>TRANSFER</span>
          <span className="text-[9px] font-normal text-slate-400 mt-0.5">Supervisor</span>
        </button>

        {/* RECONNECT / STATUS */}
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/50 border border-slate-800/80 text-slate-400 text-center">
          <div className="text-[10px] uppercase text-slate-500">VOIP ENCRYPT</div>
          <div className="text-emerald-400 text-[11px] font-bold mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            SRTP/TLS
          </div>
          <div className="text-[9px] text-slate-500">128-bit AES</div>
        </div>
      </div>
    </div>
  );
};
