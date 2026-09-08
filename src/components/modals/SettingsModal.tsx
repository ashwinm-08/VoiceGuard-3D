import React from 'react';
import { AppSettings } from '../../types';
import { X, Settings, Volume2, Eye, Sliders, CheckCircle } from 'lucide-react';
import { audioSynth } from '../../services/audioSynth';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleTestAlert = () => {
    audioSynth.playAlert('warning');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-mono">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-wide">SYSTEM SETTINGS & PREFERENCES</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* 1. Display Configuration */}
          <div className="space-y-3">
            <div className="text-cyan-400 font-bold text-xs uppercase flex items-center gap-1.5 border-b border-slate-800 pb-1">
              <Sliders className="w-3.5 h-3.5" />
              <span>Display & Rendering</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Theme */}
              <div>
                <label className="text-slate-400 block mb-1">Theme Mode:</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => onUpdateSettings({ theme: 'dark' })}
                    className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold ${
                      settings.theme === 'dark'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Dark HUD ●
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ theme: 'light' })}
                    className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold ${
                      settings.theme === 'light'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Light Theme ○
                  </button>
                </div>
              </div>

              {/* 3D Quality */}
              <div>
                <label className="text-slate-400 block mb-1">3D Graphics Quality:</label>
                <select
                  value={settings.quality3D}
                  onChange={(e) => onUpdateSettings({ quality3D: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200"
                >
                  <option value="high">High (Anti-aliased, 60fps)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="low">Low (Power Saver)</option>
                </select>
              </div>

              {/* Animation Speed */}
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Animation Speed:</span>
                  <span className="text-cyan-400">{settings.animationSpeed}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={settings.animationSpeed}
                  onChange={(e) => onUpdateSettings({ animationSpeed: Number(e.target.value) })}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded"
                />
              </div>

              {/* Text Size */}
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>HUD Text Size:</span>
                  <span className="text-cyan-400">{settings.textSize}%</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="140"
                  value={settings.textSize}
                  onChange={(e) => onUpdateSettings({ textSize: Number(e.target.value) })}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded"
                />
              </div>
            </div>
          </div>

          {/* 2. Metrics Visibility */}
          <div className="space-y-3">
            <div className="text-cyan-400 font-bold text-xs uppercase flex items-center gap-1.5 border-b border-slate-800 pb-1">
              <Eye className="w-3.5 h-3.5" />
              <span>Visible Telemetry Modules</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Jitter (Wobble)', key: 'showJitter' as const },
                { label: 'Shimmer (dB)', key: 'showShimmer' as const },
                { label: 'Formants (3D)', key: 'showFormants' as const },
                { label: 'Breath Coupling', key: 'showBreathCoupling' as const },
              ].map((m) => (
                <label
                  key={m.key}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={settings[m.key]}
                    onChange={(e) => onUpdateSettings({ [m.key]: e.target.checked })}
                    className="accent-cyan-400 rounded"
                  />
                  <span className="text-slate-300 text-[11px]">{m.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 3. Audio & Alerts */}
          <div className="space-y-3">
            <div className="text-cyan-400 font-bold text-xs uppercase flex items-center gap-1.5 border-b border-slate-800 pb-1">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Acoustic Alerts & Feedback</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Alert Sound Volume:</span>
                  <span className="text-cyan-400">{settings.alertVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.alertVolume}
                  onChange={(e) => onUpdateSettings({ alertVolume: Number(e.target.value) })}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleTestAlert}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Test Audio Alert</span>
                </button>
                <label className="flex items-center gap-2 text-slate-300 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                    className="accent-cyan-400"
                  />
                  <span>Audio Alerts Enabled</span>
                </label>
              </div>
            </div>
          </div>

          {/* 4. Accessibility */}
          <div className="space-y-3">
            <div className="text-cyan-400 font-bold text-xs uppercase flex items-center gap-1.5 border-b border-slate-800 pb-1">
              <span>Accessibility & Ergonomics</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 block mb-1">Colorblind Accessibility Mode:</label>
                <select
                  value={settings.colorblindMode}
                  onChange={(e) => onUpdateSettings({ colorblindMode: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200"
                >
                  <option value="none">Standard Full Spectrum</option>
                  <option value="deuteranopia">Deuteranopia (Red-Green)</option>
                  <option value="protanopia">Protanopia (Red-Blind)</option>
                  <option value="tritanopia">Tritanopia (Blue-Yellow)</option>
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 text-slate-300 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.highContrast}
                    onChange={(e) => onUpdateSettings({ highContrast: e.target.checked })}
                    className="accent-cyan-400"
                  />
                  <span>High-Contrast Mode</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.largeTouchTargets}
                    onChange={(e) => onUpdateSettings({ largeTouchTargets: e.target.checked })}
                    className="accent-cyan-400"
                  />
                  <span>Large Touch Targets (Mobile & Tablet)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
