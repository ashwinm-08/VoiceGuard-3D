import React, { useState } from 'react';
import {
  X,
  BookOpen,
  MousePointer,
  Smartphone,
  BarChart3,
  CheckSquare,
  Wrench,
  Keyboard,
  ShieldCheck,
  Search,
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    c1: true,
    c2: true,
    c3: false,
    c4: false,
    c5: false,
    c6: false,
    c7: false,
    c8: false,
    c9: false,
    c10: false,
    c11: false,
  });

  const toggleCheck = (id: string) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-mono">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                VoiceGuard 3D Interactive Model - Complete User Guide
              </h2>
              <div className="text-[11px] text-slate-400">
                Official Operational Manual • Team BharatMind | BUILD WITH भारत 2.0
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Layout: Navigation Sidebar + Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-56 bg-slate-950/70 border-r border-slate-800 p-3 space-y-1 overflow-y-auto text-xs">
            {[
              { id: 'overview', label: '📖 Overview & System', icon: BookOpen },
              { id: 'desktop', label: '🖥️ Desktop Controls', icon: MousePointer },
              { id: 'mobile', label: '📱 Mobile Touch', icon: Smartphone },
              { id: 'metrics', label: '📊 Understanding Metrics', icon: BarChart3 },
              { id: 'tasks', label: '🎯 Common Workflows', icon: ShieldCheck },
              { id: 'troubleshoot', label: '🔧 Troubleshooting', icon: Wrench },
              { id: 'shortcuts', label: '⌨️ Keyboard Shortcuts', icon: Keyboard },
              { id: 'training', label: '🎓 Operator Checklist', icon: CheckSquare },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center gap-2 font-medium ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}

            <div className="pt-4 mt-4 border-t border-slate-800 text-[10px] text-slate-500">
              <div>Build: v2.0-BharatMind</div>
              <div>Support: support@voiceguard.ai</div>
            </div>
          </div>

          {/* Content Pane */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/30">
                  <h3 className="text-sm font-bold text-cyan-300 mb-2">
                    Welcome to VoiceGuard 3D Interactive Model
                  </h3>
                  <p className="text-slate-300 mb-2">
                    VoiceGuard 3D provides real-time acoustic forensic monitoring to combat the threat of synthetic voice clones and AI deepfakes during high-value customer interactions.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono mt-3">
                    <div className="p-2 bg-slate-950 rounded border border-slate-800">
                      <span className="text-emerald-400 font-bold block">0 - 40% Risk</span>
                      <span>Verified Natural Human</span>
                    </div>
                    <div className="p-2 bg-slate-950 rounded border border-slate-800">
                      <span className="text-amber-400 font-bold block">41 - 60% Risk</span>
                      <span>Borderline (Acoustic Jitter)</span>
                    </div>
                    <div className="p-2 bg-slate-950 rounded border border-slate-800">
                      <span className="text-rose-400 font-bold block">61 - 100% Threat</span>
                      <span>AI Deepfake Attack Flagged</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Controls */}
            {activeTab === 'desktop' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                  🖥️ Desktop Controls & 3D Navigation
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="text-cyan-400 font-bold">Mouse Navigation</h4>
                    <ul className="space-y-1.5 text-[11px]">
                      <li><strong className="text-white">LEFT MOUSE DRAG:</strong> Rotate 3D scene 360°</li>
                      <li><strong className="text-white">MOUSE WHEEL:</strong> Zoom in and out smoothly</li>
                      <li><strong className="text-white">RIGHT MOUSE DRAG:</strong> Pan camera (up/down/left/right)</li>
                      <li><strong className="text-white">DOUBLE-CLICK:</strong> Reset to default front view</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="text-cyan-400 font-bold">Preset Views (Number Keys)</h4>
                    <ul className="space-y-1.5 text-[11px]">
                      <li><strong className="text-white">[1]:</strong> Front view (Default operational view)</li>
                      <li><strong className="text-white">[2]:</strong> Top view (All-metric spatial overview)</li>
                      <li><strong className="text-white">[3]:</strong> Side view (30-second timeline ribbon)</li>
                      <li><strong className="text-white">[4]:</strong> Free look (Exploration mode)</li>
                      <li><strong className="text-white">[5]:</strong> Call focus (Zoomed in on caller biometrics)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Touch */}
            {activeTab === 'mobile' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                  📱 Mobile & Touch Controls
                </h3>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-[11px]">
                  <div><strong className="text-white">One Finger Drag:</strong> Rotate 3D scene</div>
                  <div><strong className="text-white">Pinch:</strong> Smooth zoom in/out</div>
                  <div><strong className="text-white">Two-Finger Drag:</strong> Pan camera translation</div>
                  <div><strong className="text-white">Double-Tap:</strong> Reset view to default front orientation</div>
                  <div><strong className="text-white">Swipe Left / Right:</strong> Navigate through telemetry metric tabs</div>
                  <div><strong className="text-white">Bottom Bar Tabs:</strong> [Call] [Metrics] [Stats] [Controls]</div>
                  <div><strong className="text-white">Touch Target Standards:</strong> Minimum 44×44px hit-boxes with ≥12px padding</div>
                </div>
              </div>
            )}

            {/* Metrics */}
            {activeTab === 'metrics' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                  📊 Understanding Each Vocal Metric
                </h3>

                <div className="space-y-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <h4 className="text-cyan-300 font-bold mb-1">1. Central Risk Meter (Animated Gauge)</h4>
                    <p className="text-[11px] text-slate-400">
                      Real-time threat level (0-100%). Scores below 40% indicate natural human speech. Scores above 80% indicate critical synthetic threat. Hover reveals breakdown contributions.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <h4 className="text-emerald-300 font-bold mb-1">2. Jitter (Frequency Wobble)</h4>
                    <p className="text-[11px] text-slate-400">
                      Normal human vocal folds wobble between 0.5% - 2.4%. Synthetic models flatline (0.0% - 0.2%) or spike erratically (&gt;3.5%).
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <h4 className="text-amber-300 font-bold mb-1">3. Shimmer (Amplitude Variation)</h4>
                    <p className="text-[11px] text-slate-400">
                      Human voices exhibit micro-variations between 0.6 and 3.5 dB. Cloned speech produces dense particle clouds and severe amplitude drift (&gt;4.5 dB).
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <h4 className="text-purple-300 font-bold mb-1">4. Formant Tracking (3D Scatter Plot)</h4>
                    <p className="text-[11px] text-slate-400">
                      Natural speakers cluster inside the vowel triangle (/i/, /u/, /a/). Disconnected or erratic jumps represent deepfake speech artifacts.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <h4 className="text-teal-300 font-bold mb-1">5. Breath-Formant Coupling</h4>
                    <p className="text-[11px] text-slate-400">
                      Real human lungs synchronize pressure changes with acoustic formants (0.8 - 1.0). Synthesizers lack physical lungs, causing decoupling (0.0 - 0.3).
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <h4 className="text-rose-300 font-bold mb-1">6. Acoustic Liveness Challenge</h4>
                    <p className="text-[11px] text-slate-400">
                      Injects an acoustic probe requesting a micro-modulation. Real humans adapt pitch dynamically within 500ms (PASS); pre-rendered or streaming AI clones fail to modify live phonation (FAIL).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Common Tasks */}
            {activeTab === 'tasks' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                  🎯 Step-by-Step Operator Workflows
                </h3>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-emerald-400 font-bold">Task 1: Quick Assessment (30 Seconds)</h4>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                    <li>Check the Risk Meter: Is it in the green zone (0-40%)?</li>
                    <li>Verify Jitter & Shimmer are within baseline bounds.</li>
                    <li>If borderline (40-60%), click <strong className="text-cyan-300">[+ Trigger Challenge]</strong>.</li>
                    <li>If PASS: select <strong className="text-emerald-400">[✓ SAFE]</strong> and confirm.</li>
                  </ol>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-rose-400 font-bold">Task 2: High-Risk Call Analysis (2 Minutes)</h4>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                    <li>Red Alert appears: Risk score &gt; 80%.</li>
                    <li>Inspect Formant scatter plot (look for outlier points outside vowel space).</li>
                    <li>Verify Breath Coupling index (score &lt; 0.3 confirms synthetic speech).</li>
                    <li>Trigger Acoustic Challenge: Watch for immediate FAIL response.</li>
                    <li>Set Confidence Slider to 90%+, add note: "Decoupled breathing & failed pitch probe".</li>
                    <li>Click <strong className="text-rose-400">[✗ BLOCK]</strong> and terminate call.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Troubleshooting */}
            {activeTab === 'troubleshoot' && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                  🔧 Troubleshooting Guide
                </h3>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] space-y-1">
                  <strong className="text-cyan-300">Problem: 3D Scene Not Rendering</strong>
                  <p className="text-slate-400">Solution: Refresh page (Ctrl+R), or go to Settings and set 3D Quality to Medium or Low to disable heavy shaders.</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] space-y-1">
                  <strong className="text-cyan-300">Problem: Risk Meter Not Updating</strong>
                  <p className="text-slate-400">Solution: Check call status. If call is on HOLD or DISCONNECTED, telemetry is frozen for forensic review. Click RESUME or restart call.</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] space-y-1">
                  <strong className="text-cyan-300">Problem: Challenge Button Disabled</strong>
                  <p className="text-slate-400">Solution: Acoustic probes require an active call connection. Ensure call is not on hold.</p>
                </div>
              </div>
            )}

            {/* Keyboard Shortcuts */}
            {activeTab === 'shortcuts' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                  ⌨️ Complete Keyboard Shortcuts Reference
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {[
                    { key: '1 - 5', action: 'Camera Preset Views (Front, Top, Side, Free, Focus)' },
                    { key: 'S', action: 'Submit Verdict: [✓ SAFE]' },
                    { key: 'U', action: 'Submit Verdict: [? UNCERTAIN]' },
                    { key: 'B', action: 'Submit Verdict: [✗ BLOCK]' },
                    { key: 'P', action: 'Toggle HOLD / RESUME call' },
                    { key: 'M', action: 'Toggle MUTE microphone' },
                    { key: 'C', action: 'Trigger Acoustic Liveness Challenge' },
                    { key: 'R', action: 'Toggle Audio Evidence Recording' },
                    { key: 'D', action: 'Toggle Dark / Light Mode' },
                    { key: 'F', action: 'Toggle Fullscreen Mode' },
                    { key: 'A', action: 'Open BharatMind Mini AI Agent (Determines what you want)' },
                    { key: 'H', action: 'Open User Guide & Help Dialog' },
                    { key: 'Ctrl + ,', action: 'Open Settings & Preferences' },
                    { key: 'Esc', action: 'Close any active modal or menu' },
                  ].map((sc, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-bold">
                        {sc.key}
                      </span>
                      <span className="text-slate-300 text-right">{sc.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Operator Checklist */}
            {activeTab === 'training' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                  🎓 Operator Training Certification Checklist
                </h3>
                <p className="text-[11px] text-slate-400">
                  Ensure you complete and verify each operational milestone before handling live banking calls:
                </p>

                <div className="space-y-2">
                  {[
                    { id: 'c1', label: 'Navigate 3D scene with mouse rotation, panning, and zoom' },
                    { id: 'c2', label: 'Understand all 6 biometric metrics and their safe/threat zones' },
                    { id: 'c3', label: 'Switch between camera preset views 1 through 5' },
                    { id: 'c4', label: 'Interpret Central Risk Meter color transitions (Cyan to Red)' },
                    { id: 'c5', label: 'Trigger and interpret Acoustic Liveness Challenge probes' },
                    { id: 'c6', label: 'Perform rapid 30-second call threat assessments' },
                    { id: 'c7', label: 'Conduct deep forensic 2-minute high-risk call investigations' },
                    { id: 'c8', label: 'Adjust confidence level slider and submit verdict with notes' },
                    { id: 'c9', label: 'Configure display preferences, 3D quality, and audio volume' },
                    { id: 'c10', label: 'Export biometric telemetry datasets to CSV and PNG reports' },
                    { id: 'c11', label: 'Use keyboard shortcuts (S, U, B, C, P, M, 1-5) for rapid action' },
                  ].map((item) => (
                    <label
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-cyan-500/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={!!checklist[item.id]}
                        onChange={() => {}}
                        className="accent-cyan-400 w-4 h-4 rounded"
                      />
                      <span className={`text-xs ${checklist[item.id] ? 'text-cyan-300 font-semibold line-through opacity-80' : 'text-slate-200'}`}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-500">Team BharatMind • BUILD WITH भारत 2.0</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
          >
            Close Guide [Esc]
          </button>
        </div>
      </div>
    </div>
  );
};
