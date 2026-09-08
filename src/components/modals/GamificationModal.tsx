import React, { useState } from 'react';
import { Award, Trophy, Target, Zap, Star, Shield, X, Check, Flame } from 'lucide-react';

interface GamificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GamificationModal: React.FC<GamificationModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'badges' | 'leaderboard' | 'skills' | 'challenge'>('badges');

  if (!isOpen) return null;

  const badges = [
    { id: 'b1', name: 'Accuracy Master', icon: '🏆', desc: 'Achieve 95%+ verdict accuracy on 100+ screened calls', unlocked: true },
    { id: 'b2', name: 'Quick Draw', icon: '🎯', desc: 'Average threat decision time under 20 seconds', unlocked: true },
    { id: 'b3', name: 'Eagle Eye', icon: '🔍', desc: 'Identify 50+ subtle borderline VoIP artifacts correctly', unlocked: true },
    { id: 'b4', name: 'Rapid Response', icon: '🚀', desc: 'Block synthetic clone attack within 5 seconds of connection', unlocked: true },
    { id: 'b5', name: 'Perfectionist', icon: '🌟', desc: '20 consecutive verified verdicts without any false positive', unlocked: false },
    { id: 'b6', name: 'Deepfake Hunter', icon: '💎', desc: 'Intercept and expose 25+ ElevenLabs / TTS voice clone fraud rings', unlocked: true },
  ];

  const leaderboard = [
    { rank: 1, name: 'Ashwin M. (You)', score: '98.4%', fraudPrevented: '₹42,50,000', badge: '🥇' },
    { rank: 2, name: 'Pooja Sundaram', score: '96.8%', fraudPrevented: '₹38,20,000', badge: '🥈' },
    { rank: 3, name: 'Karthik Raman', score: '95.2%', fraudPrevented: '₹31,00,000', badge: '🥉' },
    { rank: 4, name: 'Sneha Kulkarni', score: '94.6%', fraudPrevented: '₹26,80,000', badge: '4' },
    { rank: 5, name: 'Vikram Mehta', score: '93.9%', fraudPrevented: '₹22,10,000', badge: '5' },
  ];

  const skillTree = [
    { skill: 'Jitter & Micro-Perturbation Analysis', level: 'Level 5 (Master)', progress: 95 },
    { skill: '3D Formant Resonator Geometry', level: 'Level 4 (Expert)', progress: 82 },
    { skill: 'Active Acoustic Liveness Probe Mastery', level: 'Level 5 (Master)', progress: 100 },
    { skill: 'Emotional Manipulation & Social Engineering', level: 'Level 3 (Advanced)', progress: 68 },
    { skill: 'Diffusion & Vocoder Deepfake Fingerprinting', level: 'Level 4 (Expert)', progress: 88 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-mono">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                OPERATOR GAMIFICATION & PERFORMANCE HUB
              </h2>
              <div className="text-[11px] text-slate-400">
                Agent Certification • Skill Tree • Team Leaderboard
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-2 gap-2 text-xs">
          {[
            { id: 'badges', label: '🏆 Badges & Trophies' },
            { id: 'leaderboard', label: '🥇 Leaderboard' },
            { id: 'skills', label: '⚡ Skill Tree Progression' },
            { id: 'challenge', label: '🎯 Daily Challenge' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 border-b-2 font-bold transition-all ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'badges' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    b.unlocked
                      ? 'bg-slate-950 border-cyan-500/40 shadow-md shadow-cyan-950/30'
                      : 'bg-slate-950/40 border-slate-800/80 opacity-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-3xl">{b.icon}</span>
                    {b.unlocked ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                        UNLOCKED ✓
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold">
                        LOCKED 🔒
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-slate-100 text-sm">{b.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">{b.desc}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="space-y-2">
              <div className="text-[11px] text-slate-400 mb-2">
                Real-time operational rankings based on fraud prevented and verdict precision:
              </div>
              <div className="space-y-1.5">
                {leaderboard.map((row) => (
                  <div
                    key={row.rank}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      row.rank === 1
                        ? 'bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950 border-cyan-500/50 shadow-md'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold w-6 text-center">{row.badge}</span>
                      <div>
                        <div className="font-bold text-slate-100">{row.name}</div>
                        <div className="text-[10px] text-slate-400">Fraud Prevented: {row.fraudPrevented}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-bold text-sm">{row.score}</div>
                      <div className="text-[9px] text-slate-500">PRECISION SCORE</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-3">
              {skillTree.map((s, idx) => (
                <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-slate-200">{s.skill}</span>
                    <span className="text-cyan-400 font-semibold text-[11px]">{s.level}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-1">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-2 rounded-full"
                      style={{ width: `${s.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>XP Progress</span>
                    <span>{s.progress}% to next tier</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'challenge' && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-3">
              <Flame className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
              <div className="text-sm font-bold text-white">DAILY FRAUD SCENARIO #42</div>
              <p className="text-slate-300 text-xs max-w-md mx-auto leading-relaxed">
                A spoofed Tor SIP trunk caller pretending to be high-net-worth customer requesting ₹50,00,000 emergency fund transfer. Can you isolate the vocoder artifact within 15 seconds?
              </p>
              <div className="inline-block px-3 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                Reward: 500 XP + "Deepfake Hunter" Progress
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-500">Team BharatMind • BUILD WITH भारत 2.0</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
