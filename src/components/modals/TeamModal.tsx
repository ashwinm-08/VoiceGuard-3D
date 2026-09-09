import React from 'react';
import { Users, X, Crown, CheckCircle2, Shield, Sparkles } from 'lucide-react';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeamModal: React.FC<TeamModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const teamMembers = [
    {
      role: 'Team Lead',
      name: 'Ashwin M',
      title: 'System Architect & Acoustic Forensics Lead',
      focus: 'System Architecture, WebGL 3D Visualization, Web Audio Probe Synthesizer, Real-Time DSP',
      tag: 'LEAD',
      tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      iconColor: 'from-amber-500 to-orange-500'
    },
    {
      role: 'Team Member 1',
      name: 'G Mahitha Reddy',
      title: 'Core AI Engineer & Biometrics Forensics Lead',
      focus: 'Voice Biometrics Algorithms, Micro-Perturbation Jitter/Shimmer Extraction, BharatMind Neural Intent Engine',
      tag: 'RESEARCH & CORE AI',
      tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      iconColor: 'from-cyan-500 to-blue-500'
    },
    {
      role: 'Team Member 2',
      name: 'Kanimozhi A',
      title: 'Security Analyst & UX/System Integration Engineer',
      focus: 'Fraud Pattern Analysis, Zero-Knowledge Privacy Protocols, Threat Radar UX & Audio Evaluation',
      tag: 'SECURITY & UX',
      tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      iconColor: 'from-emerald-500 to-teal-500'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-mono">
      <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-900 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                TEAMS
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60">
                  Team BharatMind
                </span>
              </h2>
              <div className="text-xs text-slate-400">
                BUILD WITH भारत 2.0 • Project Contributors
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors text-lg font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Members List */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${member.iconColor} p-0.5 shadow-md flex-shrink-0`}>
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-white font-bold text-base">
                    {idx === 0 ? <Crown className="w-5 h-5 text-amber-400" /> : member.name.charAt(0)}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{member.role}:</span>
                    <h3 className="text-base font-bold text-white tracking-wide">{member.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${member.tagColor}`}>
                      {member.tag}
                    </span>
                  </div>
                  <p className="text-xs text-cyan-400 font-medium">{member.title}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed max-w-xl">{member.focus}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Active Team Roster • Team BharatMind</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-md shadow-cyan-600/20"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
