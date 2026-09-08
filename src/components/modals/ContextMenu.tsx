import React, { useEffect, useRef } from 'react';
import { Download, FileSpreadsheet, Edit3, GitCompare, X } from 'lucide-react';
import { ContextMenuState } from '../../types';

interface ContextMenuProps {
  state: ContextMenuState;
  onClose: () => void;
  onExportCsv: (metricKey: string) => void;
  onExportPng: (metricKey: string) => void;
  onAnnotate: (metricKey: string) => void;
  onCompare: (metricKey: string) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  state,
  onClose,
  onExportCsv,
  onExportPng,
  onAnnotate,
  onCompare,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!state.visible || !state.metricKey) return null;

  return (
    <div
      ref={menuRef}
      style={{ left: Math.min(window.innerWidth - 200, state.x), top: Math.min(window.innerHeight - 220, state.y) }}
      className="fixed z-50 w-48 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl py-1 text-xs font-mono text-slate-200 select-none animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="px-3 py-1.5 text-[10px] text-cyan-400 font-bold uppercase border-b border-slate-800 flex items-center justify-between">
        <span>Options: {state.metricKey}</span>
        <button onClick={onClose} className="hover:text-white">
          <X className="w-3 h-3" />
        </button>
      </div>

      <button
        onClick={() => {
          onExportCsv(state.metricKey!);
          onClose();
        }}
        className="w-full px-3 py-2 text-left hover:bg-slate-800 hover:text-cyan-300 flex items-center gap-2"
      >
        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
        <span>Export as CSV</span>
      </button>

      <button
        onClick={() => {
          onExportPng(state.metricKey!);
          onClose();
        }}
        className="w-full px-3 py-2 text-left hover:bg-slate-800 hover:text-cyan-300 flex items-center gap-2"
      >
        <Download className="w-3.5 h-3.5 text-cyan-400" />
        <span>Export as PNG</span>
      </button>

      <button
        onClick={() => {
          onAnnotate(state.metricKey!);
          onClose();
        }}
        className="w-full px-3 py-2 text-left hover:bg-slate-800 hover:text-amber-300 flex items-center gap-2"
      >
        <Edit3 className="w-3.5 h-3.5 text-amber-400" />
        <span>Add Annotation</span>
      </button>

      <button
        onClick={() => {
          onCompare(state.metricKey!);
          onClose();
        }}
        className="w-full px-3 py-2 text-left hover:bg-slate-800 hover:text-purple-300 flex items-center gap-2 border-t border-slate-800 mt-1"
      >
        <GitCompare className="w-3.5 h-3.5 text-purple-400" />
        <span>Side-by-Side Compare</span>
      </button>
    </div>
  );
};
