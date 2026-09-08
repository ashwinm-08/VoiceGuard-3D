import React, { useState, useEffect } from 'react';
import { useVoiceGuardSimulation } from './hooks/useVoiceGuardSimulation';
import { VoiceGuardScene3D } from './components/3d/VoiceGuardScene3D';
import { Header } from './components/hud/Header';
import { AIForensicsBar } from './components/hud/AIForensicsBar';
import { CentralRiskMeter } from './components/hud/CentralRiskMeter';
import { CallControls } from './components/hud/CallControls';
import { VerdictPanel } from './components/hud/VerdictPanel';
import { ChallengeSystem } from './components/hud/ChallengeSystem';
import { MetricCard } from './components/hud/MetricCard';
import { LiveTranscriptPanel } from './components/hud/LiveTranscriptPanel';
import { StatsWidgetArray } from './components/hud/StatsWidgetArray';
import { TimeRewindScrubber } from './components/hud/TimeRewindScrubber';
import { VoiceCommandBar } from './components/hud/VoiceCommandBar';
import { MetricDetailModal } from './components/modals/MetricDetailModal';
import { DisconnectConfirmModal } from './components/modals/DisconnectConfirmModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { UserGuideModal } from './components/modals/UserGuideModal';
import { KnowledgeQuestionsModal } from './components/modals/KnowledgeQuestionsModal';
import { GamificationModal } from './components/modals/GamificationModal';
import { ContextMenu } from './components/modals/ContextMenu';
import { AppSettings, CameraPreset, ContextMenuState, Visualization3DMode } from './types';
import { audioSynth } from './services/audioSynth';
import { Phone, BarChart2, Sliders, Box, Award, Shield } from 'lucide-react';

export const App: React.FC = () => {
  // Application Settings
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    quality3D: 'high',
    animationSpeed: 100,
    textSize: 100,
    showJitter: true,
    showShimmer: true,
    showFormants: true,
    showBreathCoupling: true,
    soundEnabled: true,
    alertVolume: 50,
    alertType: 'visual_sound',
    highContrast: false,
    screenReaderAnnouncements: true,
    colorblindMode: 'none',
    largeTouchTargets: false,
  });

  // Camera preset view
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>(1);

  // 3D Visualization Mode
  const [active3DMode, setActive3DMode] = useState<Visualization3DMode>('biometrics');

  // Modals state
  const [activeModalMetric, setActiveModalMetric] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState<boolean>(false);
  const [isGamificationOpen, setIsGamificationOpen] = useState<boolean>(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    x: 0,
    y: 0,
    metricKey: null,
    visible: false,
  });

  // Mobile navigation active tab
  const [mobileTab, setMobileTab] = useState<'call' | 'metrics' | '3d' | 'controls'>('call');

  // Simulation Engine
  const {
    scenario,
    switchScenario,
    caller,
    currentMetrics,
    history,
    rewindIndex,
    setRewindIndex,
    isChallengeActive,
    challengeProgress,
    lastChallengeResult,
    triggerChallenge,
    cancelChallenge,
    toggleHold,
    toggleMute,
    toggleRecord,
    initiateDisconnect,
    confirmDisconnect,
    transferCall,
    showDisconnectModal,
    setShowDisconnectModal,
    verdicts,
    submitVerdict,
    ttsAnalysis,
    sentimentAnalysis,
    supervisorCoach,
    transcript,
    purgeCountdown,
    isSessionPurged,
    triggerInstantPurge,
    securityQuestions,
  } = useVoiceGuardSimulation(settings.soundEnabled, settings.alertVolume);

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleExportCsv = (key: string) => {
    const headers = ['Timestamp', 'TimeSec', 'RiskScore', 'JitterPercent', 'ShimmerDb', 'F1_Hz', 'F2_Hz', 'F3_Hz', 'VowelZone', 'BreathEnergy', 'CouplingScore'];
    const rows = history.map((pt) => [
      pt.timestamp,
      pt.time,
      pt.riskScore,
      pt.jitter.toFixed(2),
      pt.shimmer.toFixed(2),
      pt.f1,
      pt.f2,
      pt.f3,
      pt.vowelZone,
      pt.breathEnergy.toFixed(2),
      pt.couplingScore.toFixed(2),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `VoiceGuard_Telemetry_${key.toUpperCase()}_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPng = (key: string) => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `VoiceGuard_${key}_3D_Capture_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleMetricContextMenu = (e: React.MouseEvent, key: 'risk' | 'jitter' | 'shimmer' | 'formants' | 'breath') => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, metricKey: key, visible: true });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        setCameraPreset(Number(e.key) as CameraPreset);
        audioSynth.playClick();
        return;
      }

      if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        setIsSettingsOpen(true);
        return;
      }

      if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        handleExportCsv('full_dataset');
        return;
      }

      if (e.key === 'Escape') {
        setActiveModalMetric(null);
        setIsSettingsOpen(false);
        setIsGuideOpen(false);
        setIsKnowledgeOpen(false);
        setIsGamificationOpen(false);
        setShowDisconnectModal(false);
        setContextMenu((prev) => ({ ...prev, visible: false }));
        return;
      }

      const keyLower = e.key.toLowerCase();
      if (keyLower === 'h') { setIsGuideOpen(true); return; }
      if (keyLower === 's') { submitVerdict('safe', 85, 'Shortcut: Safe', false); return; }
      if (keyLower === 'u') { submitVerdict('uncertain', 50, 'Shortcut: Uncertain', true); return; }
      if (keyLower === 'b') { submitVerdict('block', 95, 'Shortcut: Block', true); return; }
      if (keyLower === 'p') { toggleHold(); return; }
      if (keyLower === 'm') { toggleMute(); return; }
      if (keyLower === 'c') { triggerChallenge('pitch-glide', 'medium'); return; }
      if (keyLower === 'r') { toggleRecord(); return; }
      if (keyLower === 'd') { setSettings((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' })); return; }
      if (keyLower === 'f') { toggleFullscreen(); return; }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [submitVerdict, toggleHold, toggleMute, triggerChallenge, toggleRecord]);

  return (
    <div
      className={`w-screen h-screen flex flex-col overflow-hidden select-none font-mono ${
        settings.theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
      } ${settings.highContrast ? 'contrast-125' : ''}`}
      style={{ fontSize: `${settings.textSize}%` }}
    >
      {/* 1. Top Header HUD */}
      <Header
        caller={caller}
        currentRiskScore={currentMetrics.riskScore}
        scenario={scenario}
        onScenarioChange={switchScenario}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => handleUpdateSettings({ soundEnabled: !settings.soundEnabled })}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenGamification={() => setIsGamificationOpen(true)}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* 2. AI Forensics & Biometric Privacy Sub-Bar (Features 2.1, 1.10, 3.1, 6.2) */}
      <AIForensicsBar
        tts={ttsAnalysis}
        sentiment={sentimentAnalysis}
        coach={supervisorCoach}
        purgeCountdown={purgeCountdown}
        isPurged={isSessionPurged}
        onInstantPurge={triggerInstantPurge}
        onOpenKnowledgeQuestion={() => setIsKnowledgeOpen(true)}
      />

      {/* 3. Main Workspace Body */}
      <div className="flex-1 relative flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT / CENTER VIEWPORT (3D Canvas + Overlays + Telemetry Row) */}
        <div
          className={`flex-1 relative flex flex-col h-full overflow-hidden ${
            mobileTab === '3d' || mobileTab === 'metrics' || mobileTab === 'call' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* 3D WebGL Scene */}
          <div className="flex-1 w-full h-full relative">
            <VoiceGuardScene3D
              currentMetrics={currentMetrics}
              history={history}
              cameraPreset={cameraPreset}
              onPresetChange={setCameraPreset}
              isChallengeActive={isChallengeActive}
              challengeProgress={challengeProgress}
              settings={settings}
              onMetricSelect={(key) => setActiveModalMetric(key)}
              active3DMode={active3DMode}
              onModeChange={setActive3DMode}
            />

            {/* Critical Alert Floating Banner */}
            {currentMetrics.riskScore >= 80 && (
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-20 bg-rose-950/95 border border-rose-500 text-rose-100 px-4 py-2 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce text-xs font-bold font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <span>🚨 SYNTHETIC VOICE CLONE ATTACK FLAGGED ({ttsAnalysis.detectedEngine})</span>
              </div>
            )}
          </div>

          {/* Bottom Telemetry HUD Stack (Scrubber + Metrics + Widgets + Voice Commands) */}
          <div
            className={`p-3 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent border-t border-slate-800/80 space-y-2.5 z-10 ${
              mobileTab === 'metrics' || mobileTab === 'call' ? 'block' : 'hidden md:block'
            }`}
          >
            {/* Hands-Free Voice Command Bar (Feature 8.3) */}
            <VoiceCommandBar
              onTriggerChallenge={() => triggerChallenge('pitch-glide', 'medium')}
              onSubmitVerdict={(v) => submitVerdict(v, 90, 'Voice command verdict', v === 'block')}
              onFocusMetric={(m) => setActiveModalMetric(m)}
              currentRisk={currentMetrics.riskScore}
            />

            {/* VR Time-Rewind Scrubber (Feature 1.9) */}
            <TimeRewindScrubber
              history={history}
              rewindIndex={rewindIndex}
              onRewindChange={setRewindIndex}
            />

            {/* Live Telemetry Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 max-w-7xl mx-auto">
              {settings.showJitter && (
                <MetricCard
                  id="jitter"
                  title="JITTER"
                  subtitle="Frequency Wobble"
                  valueDisplay={`${currentMetrics.jitter.toFixed(2)}%`}
                  statusBadge={
                    currentMetrics.jitter > 3.5
                      ? { text: 'SYNTHETIC', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' }
                      : currentMetrics.jitter > 2.4
                      ? { text: 'BORDERLINE', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' }
                      : { text: 'NATURAL', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' }
                  }
                  metrics={currentMetrics}
                  history={history}
                  onExpand={() => setActiveModalMetric('jitter')}
                  onContextMenu={(e) => handleMetricContextMenu(e, 'jitter')}
                />
              )}

              {settings.showShimmer && (
                <MetricCard
                  id="shimmer"
                  title="SHIMMER"
                  subtitle="Amplitude Variation"
                  valueDisplay={`${currentMetrics.shimmer.toFixed(2)} dB`}
                  statusBadge={
                    currentMetrics.shimmer > 4.5
                      ? { text: 'DENSE ALERT', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' }
                      : currentMetrics.shimmer > 3.5
                      ? { text: 'ELEVATED', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' }
                      : { text: 'SPARSE SAFE', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' }
                  }
                  metrics={currentMetrics}
                  history={history}
                  onExpand={() => setActiveModalMetric('shimmer')}
                  onContextMenu={(e) => handleMetricContextMenu(e, 'shimmer')}
                />
              )}

              {settings.showFormants && (
                <MetricCard
                  id="formants"
                  title="FORMANTS"
                  subtitle="Resonant Tract (F1-F3)"
                  valueDisplay={currentMetrics.vowelZone}
                  statusBadge={
                    currentMetrics.vowelZone === 'outlier'
                      ? { text: 'OUTLIER', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' }
                      : { text: 'VOWEL SPACE', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' }
                  }
                  metrics={currentMetrics}
                  history={history}
                  onExpand={() => setActiveModalMetric('formants')}
                  onContextMenu={(e) => handleMetricContextMenu(e, 'formants')}
                />
              )}

              {settings.showBreathCoupling && (
                <MetricCard
                  id="breath"
                  title="BREATH SYNC"
                  subtitle="Subglottic Bio-Coupling"
                  valueDisplay={(currentMetrics.couplingScore * 100).toFixed(0) + '%'}
                  statusBadge={
                    currentMetrics.couplingScore < 0.35
                      ? { text: 'DECOUPLED', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' }
                      : currentMetrics.couplingScore < 0.75
                      ? { text: 'PARTIAL', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' }
                      : { text: 'COUPLED', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' }
                  }
                  metrics={currentMetrics}
                  history={history}
                  onExpand={() => setActiveModalMetric('breath')}
                  onContextMenu={(e) => handleMetricContextMenu(e, 'breath')}
                />
              )}
            </div>

            {/* Real-Time Stats Widget Array (Section 4.1) */}
            <StatsWidgetArray durationSeconds={caller.duration} />
          </div>
        </div>

        {/* RIGHT SIDE PANEL (Central Gauge + Active Challenge + Call Controls + Decision Suite + Transcript) */}
        <div
          className={`w-full lg:w-96 p-3 lg:p-4 bg-slate-950/95 border-l border-slate-800/80 overflow-y-auto space-y-3.5 z-20 ${
            mobileTab === 'controls' || mobileTab === 'call' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Central Risk Gauge */}
          <CentralRiskMeter
            metrics={currentMetrics}
            onExpand={() => setActiveModalMetric('risk')}
          />

          {/* Real-time Transcription Panel (Feature 2.8) */}
          <LiveTranscriptPanel transcript={transcript} />

          {/* Acoustic Liveness Challenge System */}
          <ChallengeSystem
            isChallengeActive={isChallengeActive}
            challengeProgress={challengeProgress}
            lastResult={lastChallengeResult}
            onTriggerChallenge={triggerChallenge}
            onCancelChallenge={cancelChallenge}
            isCallActive={caller.status === 'active'}
          />

          {/* Call Management Controls */}
          <CallControls
            caller={caller}
            onToggleHold={toggleHold}
            onToggleMute={toggleMute}
            onToggleRecord={toggleRecord}
            onInitiateDisconnect={initiateDisconnect}
            onTransfer={() => transferCall('Supervisor ID: AGT-992')}
          />

          {/* Risk Assessment Verdict Suite */}
          <VerdictPanel
            onVerdictSubmit={submitVerdict}
            recentVerdicts={verdicts}
          />
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="lg:hidden w-full bg-slate-950 border-t border-slate-800 flex items-center justify-around py-2 z-30 font-mono text-xs">
        <button
          onClick={() => setMobileTab('call')}
          className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg ${
            mobileTab === 'call' ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-400'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>Call</span>
        </button>
        <button
          onClick={() => setMobileTab('metrics')}
          className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg ${
            mobileTab === 'metrics' ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-400'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Metrics</span>
        </button>
        <button
          onClick={() => setMobileTab('3d')}
          className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg ${
            mobileTab === '3d' ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-400'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>3D View</span>
        </button>
        <button
          onClick={() => setMobileTab('controls')}
          className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg ${
            mobileTab === 'controls' ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-400'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Controls</span>
        </button>
      </nav>

      {/* MODALS */}
      <MetricDetailModal
        isOpen={!!activeModalMetric}
        metricKey={activeModalMetric}
        history={history}
        currentMetrics={currentMetrics}
        onClose={() => setActiveModalMetric(null)}
        onExportCsv={handleExportCsv}
      />

      <DisconnectConfirmModal
        isOpen={showDisconnectModal}
        caller={caller}
        onConfirm={confirmDisconnect}
        onCancel={() => setShowDisconnectModal(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onClose={() => setIsSettingsOpen(false)}
      />

      <UserGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <KnowledgeQuestionsModal
        isOpen={isKnowledgeOpen}
        onClose={() => setIsKnowledgeOpen(false)}
        questions={securityQuestions}
      />

      <GamificationModal
        isOpen={isGamificationOpen}
        onClose={() => setIsGamificationOpen(false)}
      />

      <ContextMenu
        state={contextMenu}
        onClose={() => setContextMenu((prev) => ({ ...prev, visible: false }))}
        onExportCsv={handleExportCsv}
        onExportPng={handleExportPng}
        onAnnotate={(key) => setActiveModalMetric(key)}
        onCompare={(key) => setActiveModalMetric(key)}
      />
    </div>
  );
};

export default App;
