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
  TTSEngineAnalysis,
  SentimentAnalysis,
  TranscriptLine,
  AISupervisorCoach,
  SecurityQuestion,
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
    languageDetected: 'English (Indian Accent) / Hindi',
    environmentalNoise: 'Quiet Domestic Living Room (32 dB SPL)',
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
    languageDetected: 'Gujarati / English',
    environmentalNoise: 'Moderate Traffic & Commuter Noise (54 dB SPL)',
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
    languageDetected: 'English (Synthesized Latent Space Accent)',
    environmentalNoise: 'Synthetic Reverb & Pre-recorded Office Loop (Fake)',
  },
};

const SAMPLE_SECURITY_QUESTIONS: SecurityQuestion[] = [
  {
    id: 'SQ-1',
    question: 'Which of the following was your last registered payment beneficiary?',
    options: ['Tata Power Utilities', 'Airtel Broadband', 'HDFC Mutual Fund', 'Apollo Pharmacy'],
    correctIndex: 0,
    category: 'Recent Transaction',
    difficulty: 'medium',
  },
  {
    id: 'SQ-2',
    question: 'What is the year of opening for your primary Platinum savings account?',
    options: ['2016', '2019', '2021', '2023'],
    correctIndex: 1,
    category: 'Identity',
    difficulty: 'hard',
  },
  {
    id: 'SQ-3',
    question: 'Which branch holds your registered locker facility?',
    options: ['Nariman Point, Mumbai', 'Connaught Place, Delhi', 'Indiranagar, Bengaluru', 'Salt Lake, Kolkata'],
    correctIndex: 0,
    category: 'Banking',
    difficulty: 'medium',
  },
];

export const useVoiceGuardSimulation = (soundEnabled: boolean, alertVolume: number) => {
  const [scenario, setScenario] = useState<ScenarioType>('safe');
  const [caller, setCaller] = useState<CallerInfo>(INITIAL_CALLERS.safe);
  const [history, setHistory] = useState<MetricHistoryPoint[]>([]);
  const [isChallengeActive, setIsChallengeActive] = useState<boolean>(false);
  const [challengeProgress, setChallengeProgress] = useState<number>(0);
  const [lastChallengeResult, setLastChallengeResult] = useState<ChallengeResult | null>(null);
  const [verdicts, setVerdicts] = useState<VerdictSubmission[]>([]);
  const [showDisconnectModal, setShowDisconnectModal] = useState<boolean>(false);

  // Time-rewind index (null = live, number = historical index)
  const [rewindIndex, setRewindIndex] = useState<number | null>(null);

  // Biometric Privacy Purge Countdown (seconds)
  const [purgeCountdown, setPurgeCountdown] = useState<number>(30);
  const [isSessionPurged, setIsSessionPurged] = useState<boolean>(false);

  // Live Transcription Feed
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);

  // Sync audio synth config
  useEffect(() => {
    audioSynth.setConfig(soundEnabled, alertVolume);
  }, [soundEnabled, alertVolume]);

  // Generate Telemetry Sample
  const generateSample = useCallback(
    (currentTime: number, currentScenario: ScenarioType, prevRisk: number = 20): MetricHistoryPoint => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString();

      if (currentScenario === 'safe') {
        const jitter = 0.9 + Math.random() * 0.9; // 0.9 - 1.8%
        const shimmer = 1.4 + Math.random() * 1.2; // 1.4 - 2.6 dB
        const vowels = ['/i/', '/u/', '/a/'];
        const vowelZone = vowels[Math.floor(Math.random() * vowels.length)];

        let f1 = 500, f2 = 1800, f3 = 2500;
        if (vowelZone === '/i/') { f1 = 320 + Math.random() * 50; f2 = 2200 + Math.random() * 150; f3 = 2800 + Math.random() * 100; }
        else if (vowelZone === '/u/') { f1 = 360 + Math.random() * 50; f2 = 850 + Math.random() * 80; f3 = 2300 + Math.random() * 100; }
        else { f1 = 720 + Math.random() * 60; f2 = 1250 + Math.random() * 100; f3 = 2550 + Math.random() * 100; }

        const breathEnergy = 0.6 + Math.sin(currentTime * 0.8) * 0.35;
        const formantStability = breathEnergy * 0.9 + (Math.random() - 0.5) * 0.1;
        const couplingScore = 0.88 + Math.random() * 0.1;
        const riskScore = Math.round(10 + Math.random() * 12);

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
          predictedRiskIn10s: Math.max(8, riskScore - 2),
          trendDirection: 'stable',
        };
      } else if (currentScenario === 'borderline') {
        const jitter = 2.4 + Math.random() * 0.9;
        const shimmer = 3.6 + Math.random() * 0.8;
        const vowels = ['/i/', '/u/', '/a/', 'outlier'];
        const vowelZone = vowels[Math.floor(Math.random() * vowels.length)];

        const f1 = 450 + Math.random() * 300;
        const f2 = 1100 + Math.random() * 900;
        const f3 = 2100 + Math.random() * 700;

        const breathEnergy = 0.5 + Math.sin(currentTime * 1.5) * 0.4;
        const formantStability = 0.4 + Math.random() * 0.4;
        const couplingScore = 0.48 + Math.random() * 0.2;
        const riskScore = Math.round(45 + Math.random() * 14);

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
          predictedRiskIn10s: Math.min(85, riskScore + 6),
          trendDirection: riskScore > prevRisk ? 'up' : 'stable',
        };
      } else {
        // Deepfake attack
        const isFlatline = Math.random() > 0.4;
        const jitter = isFlatline ? 0.08 + Math.random() * 0.12 : 3.9 + Math.random() * 1.1;
        const shimmer = 4.8 + Math.random() * 1.4;
        const vowelZone = 'outlier';

        const f1 = 200 + Math.random() * 700;
        const f2 = 500 + Math.random() * 2200;
        const f3 = 1000 + Math.random() * 2500;

        const breathEnergy = 0.2 + Math.random() * 0.2;
        const formantStability = 0.95;
        const couplingScore = 0.08 + Math.random() * 0.16;
        const riskScore = Math.round(88 + Math.random() * 10);

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
          predictedRiskIn10s: 98,
          trendDirection: 'up',
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

  // Main real-time ticker
  const scenarioRef = useRef(scenario);
  scenarioRef.current = scenario;
  const callerRef = useRef(caller);
  callerRef.current = caller;

  useEffect(() => {
    const interval = setInterval(() => {
      if (callerRef.current.status !== 'active') return;

      // Update call duration & privacy countdown
      setCaller((prev) => ({
        ...prev,
        duration: prev.duration + 1,
      }));

      setPurgeCountdown((prev) => {
        if (prev <= 1) return 30; // auto cycle
        return prev - 1;
      });

      setHistory((prev) => {
        const last = prev[prev.length - 1];
        const nextTime = last ? last.time + 1 : 1;
        const prevRisk = last ? last.riskScore : 20;
        const newPoint = generateSample(nextTime, scenarioRef.current, prevRisk);
        return [...prev.slice(-59), newPoint];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [generateSample]);

  // Populate dynamic transcription according to scenario
  useEffect(() => {
    if (scenario === 'safe') {
      setTranscript([
        {
          id: 't-1',
          timestamp: '00:05',
          speaker: 'Agent',
          text: 'Thank you for calling Bharat Financial Services. How may I assist you today?',
          keywords: [],
        },
        {
          id: 't-2',
          timestamp: '00:12',
          speaker: 'Caller',
          text: 'Hello, this is Rajesh. I would like to check the status of my fixed deposit renewal.',
          keywords: [],
        },
        {
          id: 't-3',
          timestamp: '00:24',
          speaker: 'Agent',
          text: 'Certainly, Mr. Sharma. Let me verify your account balance and tenure details.',
          keywords: [],
        },
      ]);
    } else if (scenario === 'borderline') {
      setTranscript([
        {
          id: 't-1',
          timestamp: '00:04',
          speaker: 'Agent',
          text: 'VoiceGuard Security Desk. Please state your query.',
          keywords: [],
        },
        {
          id: 't-2',
          timestamp: '00:15',
          speaker: 'Caller',
          text: 'I have been trying to make an urgent transfer for my daughter’s university fees, but the network keeps dropping!',
          keywords: [{ word: 'urgent', severity: 'orange' }],
        },
        {
          id: 't-3',
          timestamp: '00:28',
          speaker: 'AI-Coach',
          text: 'Slight acoustic jitter detected due to cellular packet drops. Recommend initiating subtle liveness challenge.',
          keywords: [],
        },
      ]);
    } else {
      setTranscript([
        {
          id: 't-1',
          timestamp: '00:03',
          speaker: 'Agent',
          text: 'Fraud Monitoring Desk. How may I verify your identity?',
          keywords: [],
        },
        {
          id: 't-2',
          timestamp: '00:10',
          speaker: 'Caller',
          text: 'I need you to immediately bypass the OTP on my registered phone number and approve an urgent wire transfer to an overseas account right now!',
          keywords: [
            { word: 'immediately', severity: 'orange' },
            { word: 'bypass the OTP', severity: 'red' },
            { word: 'urgent wire transfer', severity: 'red' },
            { word: 'overseas account', severity: 'orange' },
          ],
        },
        {
          id: 't-3',
          timestamp: '00:18',
          speaker: 'AI-Coach',
          text: 'ALERT: Social engineering pressure script detected. Decoupled vocal tract biometrics indicate ElevenLabs synthetic voice clone.',
          keywords: [{ word: 'ALERT', severity: 'red' }],
        },
      ]);
    }
  }, [scenario]);

  // Derived AI / Forensics states
  const ttsAnalysis: TTSEngineAnalysis = {
    isClone: scenario === 'deepfake',
    detectedEngine:
      scenario === 'deepfake'
        ? 'ElevenLabs Multi-Lingual v2.5 (High Latency Diffusion)'
        : scenario === 'borderline'
        ? 'No Synthetic Model (Natural Vocal Folds)'
        : 'Biological Human Phonation',
    engineConfidence: scenario === 'deepfake' ? 96.8 : scenario === 'borderline' ? 14.2 : 1.5,
    modelVersionAge: 'Trained on 45s public YouTube audio sample',
    targetMatch: scenario === 'deepfake' ? '98.4% Match to Cloned Rajesh Sharma Profile' : 'Authentic Registered Acoustic Profile',
    artifactsDetected:
      scenario === 'deepfake'
        ? ['Vocoder spectral phase mismatch', 'Zero subglottic breath pressure', 'Flatline jitter micro-interval']
        : [],
  };

  const sentimentAnalysis: SentimentAnalysis = {
    emotion:
      scenario === 'safe'
        ? 'Calm & Authentic'
        : scenario === 'borderline'
        ? 'Mild Distress & Stress'
        : 'High Urgency / Forced Pressure',
    authenticityScore: scenario === 'safe' ? 96 : scenario === 'borderline' ? 78 : 12,
    heartRateBpm: scenario === 'safe' ? 72 : scenario === 'borderline' ? 94 : 0, // 0 for synthetic AI
    stressLevel: scenario === 'safe' ? 'low' : scenario === 'borderline' ? 'moderate' : 'high',
    isManipulative: scenario === 'deepfake',
  };

  const supervisorCoach: AISupervisorCoach = {
    recommendation:
      scenario === 'safe'
        ? 'Biometric consistency verified across all 6 vocal tract indices. Safe to proceed.'
        : scenario === 'borderline'
        ? 'Elevated acoustic jitter due to VoIP loss. Recommend triggering Acoustic Liveness Challenge.'
        : 'CRITICAL: Synthetic voice clone attack detected! High social engineering urgency. Recommend immediate BLOCK.',
    severity: scenario === 'safe' ? 'safe' : scenario === 'borderline' ? 'warning' : 'alert',
    confidence: scenario === 'deepfake' ? 98 : 84,
    reason:
      scenario === 'deepfake'
        ? 'Vocal formants land outside vowel triangle; subglottic coupling index is 0.12 (decoupled).'
        : 'All biometric harmonics follow natural glottal opening and closing waveforms.',
  };

  // Scenario switch
  const switchScenario = useCallback((newScenario: ScenarioType) => {
    setScenario(newScenario);
    setCaller({
      ...INITIAL_CALLERS[newScenario],
      duration: 1,
    });
    setRewindIndex(null);
    audioSynth.playClick();
    if (newScenario === 'deepfake') {
      audioSynth.playAlert('critical');
    } else if (newScenario === 'borderline') {
      audioSynth.playAlert('warning');
    } else {
      audioSynth.playAlert('safe');
    }
  }, []);

  // Call Controls
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

  // Acoustic Liveness Challenge execution
  const triggerChallenge = useCallback(
    (type: ChallengeType = 'pitch-glide', difficulty: ChallengeDifficulty = 'medium') => {
      if (caller.status !== 'active' || isChallengeActive) return;

      setIsChallengeActive(true);
      setChallengeProgress(0);

      audioSynth.playChallengeTone(type, difficulty);

      const startTime = performance.now();
      const targetDurationMs = 500;

      const animInterval = setInterval(() => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / targetDurationMs);
        setChallengeProgress(progress);

        if (progress >= 1) {
          clearInterval(animInterval);
          setIsChallengeActive(false);

          let score = 0;
          let status: ChallengeResult['status'] = 'failed';
          let text = '';

          if (scenarioRef.current === 'safe') {
            score = Math.round(86 + Math.random() * 11);
            status = 'passed';
            text = 'Acoustic challenge passed. Caller voice tract adapted pitch dynamically within 380ms.';
            audioSynth.playAlert('safe');
            confetti({ particleCount: 40, spread: 65, origin: { y: 0.65 } });
          } else if (scenarioRef.current === 'borderline') {
            score = Math.round(56 + Math.random() * 18);
            status = 'partial';
            text = 'Inconclusive adaptation. Slight delay in vocal tract acoustic response.';
            audioSynth.playAlert('warning');
          } else {
            score = Math.round(9 + Math.random() * 18);
            status = 'failed';
            text = 'SYNTHETIC FAILURE: Audio synthesizer incapable of executing real-time pitch glide request.';
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

  // Instant Biometric Purge
  const triggerInstantPurge = useCallback(() => {
    audioSynth.playClick();
    setIsSessionPurged(true);
    setPurgeCountdown(30);
    setTimeout(() => setIsSessionPurged(false), 2500);
  }, []);

  // Submit Verdict
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

  // Active or rewound current metrics
  const activeMetrics: MetricHistoryPoint =
    rewindIndex !== null && history[rewindIndex]
      ? history[rewindIndex]
      : history[history.length - 1] || {
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
          predictedRiskIn10s: 14,
          trendDirection: 'stable',
        };

  return {
    scenario,
    switchScenario,
    caller,
    currentMetrics: activeMetrics,
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
    securityQuestions: SAMPLE_SECURITY_QUESTIONS,
  };
};
