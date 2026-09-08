import React, { useState } from 'react';
import { MetricHistoryPoint } from '../../types';
import {
  X,
  Download,
  FileSpreadsheet,
  Printer,
  Volume2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  GitCompare,
} from 'lucide-react';
import { audioSynth } from '../../services/audioSynth';

interface MetricDetailModalProps {
  isOpen: boolean;
  metricKey: string | null;
  history: MetricHistoryPoint[];
  currentMetrics: MetricHistoryPoint;
  onClose: () => void;
  onExportCsv: (key: string) => void;
}

export const MetricDetailModal: React.FC<MetricDetailModalProps> = ({
  isOpen,
  metricKey,
  history,
  currentMetrics,
  onClose,
  onExportCsv,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [compareMode, setCompareMode] = useState<boolean>(false);

  if (!isOpen || !metricKey) return null;

  const getMetricMetadata = () => {
    switch (metricKey) {
      case 'jitter':
        return {
          title: 'Vocal Frequency Jitter Tracking',
          unit: '% Wobble',
          desc: 'Measures cycle-to-cycle frequency perturbations in vocal fold vibration. Natural humans exhibit organic wobble (0.5% - 2.4%). Voice clones either show artificial flatlines (0.0% - 0.2%) or high erratic perturbation (>3.5%).',
          greenZone: '0.5% - 2.4%',
          yellowZone: '2.4% - 3.5%',
          redZone: '> 3.5%',
          currentVal: `${currentMetrics.jitter.toFixed(2)}%`,
          valAccessor: (p: MetricHistoryPoint) => p.jitter,
          maxScale: 6.0,
        };
      case 'shimmer':
        return {
          title: 'Vocal Amplitude Shimmer Instability',
          unit: 'dB Variation',
          desc: 'Measures micro-fluctuations in acoustic energy / loudness between consecutive vocal cycles. Natural human voice ranges between 0.6 and 3.5 dB. Text-to-speech synthesis models exhibit abnormal volume curves (>4.5 dB) or hyper-clean unnatural regularity.',
          greenZone: '0.6 - 3.5 dB',
          yellowZone: '3.5 - 4.5 dB',
          redZone: '> 4.5 dB',
          currentVal: `${currentMetrics.shimmer.toFixed(2)} dB`,
          valAccessor: (p: MetricHistoryPoint) => p.shimmer,
          maxScale: 7.0,
        };
      case 'formants':
        return {
          title: '3D Formant Resonator Frequencies (F1/F2/F3)',
          unit: 'Hz Resonances',
          desc: 'Formants correspond to physical resonant chambers of human vocal tracts (pharynx, oral cavity, lips). Authentic speech points cluster tightly in vowel space triangles (/i/, /u/, /a/). Voice deepfakes produce disconnected or unnatural formant jumps.',
          greenZone: 'Clustered inside vowel space',
          yellowZone: 'Peripheral boundary drift',
          redZone: 'Erratic outlier coordinates',
          currentVal: `F1:${currentMetrics.f1}Hz  F2:${currentMetrics.f2}Hz  F3:${currentMetrics.f3}Hz (${currentMetrics.vowelZone})`,
          valAccessor: (p: MetricHistoryPoint) => p.f1 / 100, // normalized proxy
          maxScale: 10,
        };
      case 'breath':
        return {
          title: 'Breath-Formant Bio-Coupling',
          unit: '0.0 - 1.0 Coupling Index',
          desc: 'Evaluates the physical coupling between subglottic lung pressure / breathing cycles and acoustic vocal resonance. AI voice clones generate audio without physical lungs, showing zero breath-formant coupling (score < 0.3).',
          greenZone: '0.8 - 1.0 (Strong biological sync)',
          yellowZone: '0.4 - 0.7 (Weak / partial sync)',
          redZone: '0.0 - 0.3 (Decoupled synthetic audio)',
          currentVal: `${(currentMetrics.couplingScore * 100).toFixed(0)}% Synchronized`,
          valAccessor: (p: MetricHistoryPoint) => p.couplingScore * 10,
          maxScale: 10,
        };
      default:
        return {
          title: 'Central Risk & Threat Score Analysis',
          unit: '0 - 100 Risk Score',
          desc: 'Comprehensive multi-factor neural risk evaluation blending jitter, shimmer, 3D formant stability, breath decoupling, and acoustic liveness challenge verdicts.',
          greenZone: '0 - 40% (Safe / Low Risk)',
          yellowZone: '41 - 60% (Medium Risk)',
          redZone: '61 - 100% (High to Critical Threat)',
          currentVal: `${currentMetrics.riskScore}% Threat`,
          valAccessor: (p: MetricHistoryPoint) => p.riskScore,
          maxScale: 100,
        };
    }
  };

  const meta = getMetricMetadata();

  // Chart coordinate points
  const points = history.map((pt, i) => {
    const x = (i / (history.length - 1 || 1)) * 750 * zoomLevel;
    const val = meta.valAccessor(pt);
    const y = 220 - (val / meta.maxScale) * 200;
    return `${x.toFixed(1)},${Math.max(10, Math.min(210, y)).toFixed(1)}`;
  }).join(' ');

  // Synthetic baseline comparison curve
  const compPoints = history.map((_, i) => {
    const x = (i / (history.length - 1 || 1)) * 750 * zoomLevel;
    const y = 220 - (0.15 + Math.sin(i * 0.2) * 0.05) * 200; // Flatline clone
    return `${x.toFixed(1)},${Math.max(10, Math.min(210, y)).toFixed(1)}`;
  }).join(' ');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-mono">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <h2 className="text-base font-bold text-white tracking-wide">{meta.title}</h2>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                DEEP DRILL-DOWN
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Live Biometric Telemetry • 60-Second Rolling Window
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onExportCsv(metricKey)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 border border-slate-700"
              title="Download CSV historical dataset"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 border border-slate-700"
              title="Print biometric report"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 ml-2"
              title="Close (Press Escape)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Top Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px]">CURRENT VALUE</div>
              <div className="text-lg font-bold text-cyan-300 mt-1">{meta.currentVal}</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-emerald-900/40">
              <div className="text-emerald-400 text-[10px]">GREEN / SAFE ZONE</div>
              <div className="text-xs font-semibold text-emerald-300 mt-1">{meta.greenZone}</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-amber-900/40">
              <div className="text-amber-400 text-[10px]">BORDERLINE ZONE</div>
              <div className="text-xs font-semibold text-amber-300 mt-1">{meta.yellowZone}</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-rose-900/40">
              <div className="text-rose-400 text-[10px]">SYNTHETIC ALERT ZONE</div>
              <div className="text-xs font-semibold text-rose-300 mt-1">{meta.redZone}</div>
            </div>
          </div>

          {/* Description & Explanation */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-slate-300 leading-relaxed text-[11px]">
            <strong className="text-cyan-300">Acoustic Forensic Analysis: </strong>
            {meta.desc}
          </div>

          {/* Large High-Resolution Chart View */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <span>HISTORICAL TIMELINE (Last 60 Seconds)</span>
                {compareMode && (
                  <span className="text-[10px] text-purple-400 bg-purple-950/60 border border-purple-800 px-1.5 py-0.5 rounded">
                    Comparing vs Synthetic Reference
                  </span>
                )}
              </span>

              {/* Chart Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCompareMode(!compareMode)}
                  className={`px-2 py-1 rounded border text-[11px] flex items-center gap-1 ${
                    compareMode
                      ? 'bg-purple-900/40 border-purple-500 text-purple-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                  title="Toggle side-by-side comparison with cloned reference model"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>Compare Reference</span>
                </button>

                <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.25))}
                    className="p-1 hover:text-cyan-300 text-slate-400"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] px-1 text-slate-400">{Math.round(zoomLevel * 100)}%</span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                    className="p-1 hover:text-cyan-300 text-slate-400"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="p-1 hover:text-cyan-300 text-slate-400 border-l border-slate-800"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable SVG Canvas */}
            <div className="w-full overflow-x-auto overflow-y-hidden rounded-xl border border-slate-800/80 bg-slate-950 p-2">
              <svg width={750 * zoomLevel} height={230} className="font-mono text-[10px]">
                {/* Horizontal Grid lines */}
                {[0, 50, 100, 150, 200].map((yVal, i) => (
                  <g key={i}>
                    <line x1="0" y1={yVal + 10} x2={750 * zoomLevel} y2={yVal + 10} stroke="#1e293b" strokeDasharray="4,4" />
                    <text x="5" y={yVal + 8} fill="#64748b">
                      {Math.round(((200 - yVal) / 200) * meta.maxScale)} {meta.unit}
                    </text>
                  </g>
                ))}

                {/* Primary Data Polyline */}
                <polyline
                  fill="none"
                  stroke="#00f0ff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                />

                {/* Comparison Polyline */}
                {compareMode && (
                  <polyline
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    points={compPoints}
                  />
                )}
              </svg>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2">
              <span>-60 Seconds (Past)</span>
              <span>Timeline: Rolling Buffer</span>
              <span>Present (0s)</span>
            </div>
          </div>

          {/* Formant Listen Preview (If formant modal) */}
          {metricKey === 'formants' && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-300 text-xs">
                Acoustic Frequency Synthesis: Listen to isolated harmonic formant filters:
              </div>
              <button
                onClick={() => audioSynth.playFormantTone(currentMetrics.f1, currentMetrics.f2, currentMetrics.f3)}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-cyan-600/30"
              >
                <Volume2 className="w-4 h-4" />
                <span>Synthesize Tone</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-500">VoiceGuard 3D Telemetry Inspection Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
          >
            Close View [Esc]
          </button>
        </div>
      </div>
    </div>
  );
};
