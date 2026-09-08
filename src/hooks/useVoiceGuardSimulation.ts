import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MetricHistoryPoint,
  ScenarioType,
  CallerInfo,
  ChallengeType,
  ChallengeDifficulty,
  ChallengeResult,
  VerdictSubmission,
  VerdictChoice,
} from '../types';
import { audioSynth } from '../services/audioSynth';
import confetti from 'canvas-confetti';

const INITIAL_CALLERS: Record<ScenarioType, CallerInfo> = {
  safe: {
    name: 'Rajesh Sharma',
    id: 'USR-8942-IND',
    phone: '+91 98201 44521',
    accountTier: 'Platinum HNI',
    location: 'Mumbai, Maharashtra',
    ipAddress: '103.21.14.82 (Direct Fiber)',
    latencyMs: 24,
    duration: 142,
    status: 'active',
    isRecording: true,
    isMuted: false,
  },
  borderline: {
    name: 'Priya Patel',
    id: 'USR-3109-IND',
    phone: '+91 97112 00984',
    accountTier: 'Gold Retail',
    location: 'Ahmedabad, Gujarat',
    ipAddress: '49.36.18.204 (Cellular 4G)',
    latencyMs: 68,
    duration: 85,
    status: 'active',
    isRecording: true,
    isMuted: false,
  },
  deepfake: {
    name: 'Spoofed: Rajesh Sharma',
    id: 'SUSP-0041-AI',
    phone: '+91 98201 44521 (SIP Trunk Spoof)',
    accountTier: 'Platinum HNI',
    location: 'Unknown (Tor Exit Node)',
    ipAddress: '185.220.101.5 (Proxy Relay)',
    latencyMs: 145,
    duration: 38,
    status: 'active',
    isRecording: true,
    isMuted: false,
  },
};

export const useVoiceGuardSimulation = (soundEnabled: boolean, alertVolume: number) => {
  const [scenario, setScenario] = useState<ScenarioType>('safe');
  const [caller, setCaller] = useState<CallerInfo>(INITIAL_CALLERS.safe);
  const [history, setHistory] = useState<MetricHistoryPoint[]>([]);
  const [isChallengeActive, setIsChallengeActive] = useState<boolean>(false);
  const [challengeProgress, setChallengeProgress] = useState<number>(0);
  const [lastChallengeResult, setLastChallengeResult] = useState<ChallengeResult | null>(null);
  const [verdicts, setVerdicts] = useState<VerdictSubmission[]>([]);
  const [showDisconnectModal, setShowDisconnectModal] = useState<boolean>(false);

  // Sync audio synth config
  useEffect(() => {
    audioSynth.setConfig(soundEnabled, alertVolume);
  }, [soundEnabled, alertVolume]);

  // Generate a telemetry sample based on scenario
  const generateSample = useCallback(
    (currentTime: number, currentScenario: ScenarioType): MetricHistoryPoint => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString();

      if (currentScenario === 'safe') {
        // Natural human speech biometrics
        const jitter = 0.9 + Math.random() * 0.9; // 0.9 - 1.8% (green)
        const shimmer = 1.4 + Math.random() * 1.2; // 1.4 - 2.6 dB (green)
        const vowels = ['/i/', '/u/', '/a/'];
        const vowelZone = vowels[Math.floor(Math.random() * vowels.length)];

        let f1 = 500, f2 = 1800, f3 = 2500;
        if (vowelZone === '/i/') { f1 = 320 + Math.random() * 50; f2 = 2200 + Math.random() * 150; f3 = 2800 + Math.random() * 100; }
        else if (vowelZone === '/u/') { f1 = 360 + Math.random() * 50; f2 = 850 + Math.random() * 80; f3 = 2300 + Math.random() * 100; }
        else { f1 = 720 + Math.random() * 60; f2 = 1250 + Math.random() * 100; f3 = 2550 + Math.random() * 100; }

        const breathEnergy = 0.6 + Math.sin(currentTime * 0.8) * 0.35;
        const formantStability = breathEnergy * 0.9 + (Math.random() - 0.5) * 0.1;
        const couplingScore = 0.88 + Math.random() * 0.1; // 0.88 - 0.98
        const riskScore = Math.round(10 + Math.random() * 12); // 10 - 22%

        return {
          time: currentTime,
          timestamp: timeStr,
          jitter,
          shimmer,
          f1: Math.round(f1),
          f2: Math.round(f2),
          f3: Math.round(f3),
          vowelZone,
          breathEnergy: Math.max(0.1, Math.min(1, breathEnergy)),
          formantStability: Math.max(0.1, Math.min(1, formantStability)),
          couplingScore,
          riskScore,
        };
      } else if (currentScenario === 'borderline') {
        // Stressed or VoIP compressed speech
        const jitter = 2.4 + Math.random() * 0.9; // 2.4 - 3.3% (yellow)
        const shimmer = 3.6 + Math.random() * 0.8; // 3.6 - 4.4 dB (yellow)
        const vowels = ['/i/', '/u/', '/a/', 'outlier'];
        const vowelZone = vowels[Math.floor(Math.random() * vowels.length)];

        const f1 = 450 + Math.random() * 300;
        const f2 = 1100 + Math.random() * 900;
        const f3 = 2100 + Math.random() * 700;

        const breathEnergy = 0.5 + Math.sin(currentTime * 1.5) * 0.4;
        const formantStability = 0.4 + Math.random() * 0.4;
        const couplingScore = 0.48 + Math.random() * 0.2; // 0.48 - 0.68
        const riskScore = Math.round(45 + Math.random() * 14); // 45 - 59%

        return {
          time: currentTime,
          timestamp: timeStr,
          jitter,
          shimmer,
          f1: Math.round(f1),
          f2: Math.round(f2),
          f3: Math.round(f3),
          vowelZone,
          breathEnergy: Math.max(0.1, Math.min(1, breathEnergy)),
          formantStability: Math.max(0.1, Math.min(1, formantStability)),
          couplingScore,
          riskScore,
        };
      } else {
        // AI Voice Clone / Deepfake Synthetic Attack
        // Either flatline or wild jitter
        const isFlatline = Math.random() > 0.4;
        const jitter = isFlatline ? 0.08 + Math.random() * 0.12 : 3.9 + Math.random() * 1.1; // flatline or >3.9%
        const shimmer = 4.8 + Math.random() * 1.4; // >4.8 dB (red alert)
        const vowelZone = 'outlier';

        // Erratic frequency jumps
        const f1 = 200 + Math.random() * 700;
        const f2 = 500 + Math.random() * 2200;
        const f3 = 1000 + Math.random() * 2500;

        const breathEnergy = 0.2 + Math.random() * 0.2;
        const formantStability = 0.95; // Unnaturally static or erratic
        const couplingScore = 0.08 + Math.random() * 0.16; // 0.08 - 0.24 (decoupled)
        const riskScore = Math.round(86 + Math.random() * 12); // 86 - 98% (Critical)

        return {
          time: currentTime,
          timestamp: timeStr,
          jitter,
          shimmer,
          f1: Math.round(f1),
          f2: Math.round(f2),
          f3: Math.round(f3),
          vowelZone,
          breathEnergy,
          formantStability,
          couplingScore,
          riskScore,
        };
      }
    },
    []
  );

  // Initialize seed history
  useEffect(() => {
    const initial: MetricHistoryPoint[] = [];
    for (let i = 30; i >= 0; i--) {
      initial.push(generateSample(140 - i, scenario));
    }
    setHistory(initial);
  }, [scenario, generateSample]);

  // Main real-time clock & telemetry ticker
  const scenarioRef = useRef(scenario);
  scenarioRef.current = scenario;
  const callerRef = useRef(caller);
  callerRef.current = caller;

  useEffect(() => {
    const interval = setInterval(() => {
      if (callerRef.current.status !== 'active') return;

      setCaller((prev) => ({
        ...prev,
        duration: prev.duration + 1,
      }));

      setHistory((prev) => {
        const last = prev[prev.length - 1];
        const nextTime = last ? last.time + 1 : 1;
        const newPoint = generateSample(nextTime, scenarioRef.current);
        const updated = [...prev.slice(-59), newPoint]; // Keep last 60 samples
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [generateSample]);

  // Handle Scenario Switch
  const switchScenario = useCallback((newScenario: ScenarioType) => {
    setScenario(newScenario);
    setCaller({
      ...INITIAL_CALLERS[newScenario],
      duration: 1,
    });
    audioSynth.playClick();
    if (newScenario === 'deepfake') {
      audioSynth.playAlert('critical');
    } else if (newScenario === 'borderline') {
      audioSynth.playAlert('warning');
    } else {
      audioSynth.playAlert('safe');
    }
  }, []);

  // Call Management Controls
  const toggleHold = useCallback(() => {
    audioSynth.playClick();
    setCaller((prev) => ({
      ...prev,
      status: prev.status === 'on_hold' ? 'active' : 'on_hold',
    }));
  }, []);

  const toggleMute = useCallback(() => {
    audioSynth.playClick();
    setCaller((prev) => ({
      ...prev,
      isMuted: !prev.isMuted,
    }));
  }, []);

  const toggleRecord = useCallback(() => {
    audioSynth.playClick();
    setCaller((prev) => ({
      ...prev,
      isRecording: !prev.isRecording,
    }));
  }, []);

  const initiateDisconnect = useCallback(() => {
    audioSynth.playClick();
    setShowDisconnectModal(true);
  }, []);

  const confirmDisconnect = useCallback(() => {
    audioSynth.playClick();
    setCaller((prev) => ({
      ...prev,
      status: 'disconnected',
    }));
    setShowDisconnectModal(false);
  }, []);

  const transferCall = useCallback((targetAgent: string) => {
    audioSynth.playClick();
    setCaller((prev) => ({
      ...prev,
      status: 'transferred',
      location: `Transferred to: ${targetAgent}`,
    }));
  }, []);

  const restartCall = useCallback(() => {
    audioSynth.playClick();
    setCaller({
      ...INITIAL_CALLERS[scenario],
      duration: 1,
      status: 'active',
    });
  }, [scenario]);

  // Acoustic Liveness Challenge execution
  const triggerChallenge = useCallback(
    (type: ChallengeType = 'pitch-glide', difficulty: ChallengeDifficulty = 'medium') => {
      if (caller.status !== 'active' || isChallengeActive) return;

      setIsChallengeActive(true);
      setChallengeProgress(0);

      // Play challenge probe sound
      audioSynth.playChallengeTone(type, difficulty);

      const startTime = performance.now();
      const targetDurationMs = 500; // 500ms realistic probe analysis

      const animInterval = setInterval(() => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / targetDurationMs);
        setChallengeProgress(progress);

        if (progress >= 1) {
          clearInterval(animInterval);
          setIsChallengeActive(false);

          // Calculate adaptation score based on current scenario
          let score = 0;
          let status: ChallengeResult['status'] = 'failed';
          let text = '';

          if (scenarioRef.current === 'safe') {
            score = Math.round(85 + Math.random() * 12); // 85 - 97%
            status = 'passed';
            text = 'Acoustic challenge passed. Caller voice tract adapted pitch dynamically.';
            audioSynth.playAlert('safe');
            confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
          } else if (scenarioRef.current === 'borderline') {
            score = Math.round(55 + Math.random() * 20); // 55 - 75%
            status = 'partial';
            text = 'Inconclusive adaptation. Slight latency in formant shift.';
            audioSynth.playAlert('warning');
          } else {
            score = Math.round(8 + Math.random() * 22); // 8 - 30%
            status = 'failed';
            text = 'SYNTHETIC FAILURE: Inability to execute acoustic pitch modulation in real-time.';
            audioSynth.playAlert('critical');
          }

          setLastChallengeResult({
            status,
            adaptationScore: score,
            durationMs: targetDurationMs,
            verdictText: text,
            timestamp: new Date().toLocaleTimeString(),
            type,
          });
        }
      }, 30);
    },
    [caller.status, isChallengeActive]
  );

  const cancelChallenge = useCallback(() => {
    setIsChallengeActive(false);
    setChallengeProgress(0);
    audioSynth.playClick();
  }, []);

  // Submit Fraud/Liveness Verdict
  const submitVerdict = useCallback(
    (verdict: VerdictChoice, confidence: number, notes: string, flaggedForReview: boolean) => {
      audioSynth.playClick();
      const currentRisk = history.length > 0 ? history[history.length - 1].riskScore : 50;

      const submission: VerdictSubmission = {
        id: `VRD-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toLocaleTimeString(),
        verdict,
        confidence,
        notes,
        flaggedForReview,
        callerId: caller.id,
        riskScoreAtVerdict: currentRisk,
      };

      setVerdicts((prev) => [submission, ...prev]);

      if (verdict === 'safe') {
        audioSynth.playAlert('safe');
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      } else if (verdict === 'block') {
        audioSynth.playAlert('critical');
      } else {
        audioSynth.playAlert('warning');
      }

      return submission;
    },
    [caller.id, history]
  );

  const currentMetrics: MetricHistoryPoint = history[history.length - 1] || {
    time: 0,
    timestamp: '00:00:00',
    jitter: 1.2,
    shimmer: 1.8,
    f1: 520,
    f2: 1850,
    f3: 2600,
    vowelZone: '/i/',
    breathEnergy: 0.7,
    formantStability: 0.7,
    couplingScore: 0.9,
    riskScore: 15,
  };

  return {
    scenario,
    switchScenario,
    caller,
    currentMetrics,
    history,
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
    restartCall,
    showDisconnectModal,
    setShowDisconnectModal,
    verdicts,
    submitVerdict,
  };
};
