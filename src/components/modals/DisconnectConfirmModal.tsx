import React from 'react';
import { PhoneOff, AlertTriangle, X } from 'lucide-react';
import { CallerInfo } from '../../types';

interface DisconnectConfirmModalProps {
  isOpen: boolean;
  caller: CallerInfo;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DisconnectConfirmModal: React.FC<DisconnectConfirmModalProps> = ({
  isOpen,
  caller,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-rose-600/50 rounded-2xl shadow-2xl p-6 font-mono text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>CONFIRM IMMEDIATE DISCONNECTION</span>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 text-xs space-y-2">
          <p className="text-slate-300">
            Are you sure you want to terminate this live call with caller{' '}
            <strong className="text-white">{caller.name}</strong> ({caller.phone})?
          </p>
          <div className="p-3 bg-rose-950/30 border border-rose-900/60 rounded-xl text-rose-300 text-[11px]">
            ⚠️ Disconnecting this call will lock biometric telemetry, log a call-termination fraud event, and drop audio packet routing.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Confirm Disconnect</span>
          </button>
        </div>
      </div>
    </div>
  );
};
