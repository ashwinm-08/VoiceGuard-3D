export type ThreatLevel = 'safe' | 'low' | 'medium' | 'high' | 'critical';

export type Visualization3DMode = 
  | 'biometrics' 
  | 'dna-helix' 
  | 'frequency-tower' 
  | 'neural-network' 
  | 'fraud-ring';

export interface MetricHistoryPoint {
  time: number; // seconds relative to start
  timestamp: string;
  jitter: number; // percentage, e.g. 1.2%
  shimmer: number; // dB, e.g. 2.1 dB
  f1: number; // Hz, e.g. 520
  f2: number; // Hz, e.g. 1850
  f3: number; // Hz, e.g. 2600
  vowelZone: string; // e.g. '/i/', '/a/', '/u/', or 'outlier'
  breathEnergy: number; // 0 - 1
  formantStability: number; // 0 - 1
  couplingScore: number; // 0 - 1
  riskScore: number; // 0 - 100
  // Predictive trending
  predictedRiskIn10s: number;
  trendDirection: 'up' | 'stable' | 'down';
}

export type ScenarioType = 'safe' | 'borderline' | 'deepfake';

export interface CallerInfo {
  name: string;
  id: string;
  phone: string;
  accountTier: 'Platinum HNI' | 'Gold Retail' | 'Standard' | 'Unverified New';
  location: string;
  ipAddress: string;
  latencyMs: number;
  duration: number; // in seconds
  status: 'active' | 'on_hold' | 'disconnected' | 'transferred';
  isRecording: boolean;
  isMuted: boolean;
  languageDetected: string;
  environmentalNoise: string; // 'Office Environment', 'Car Acoustics', 'Synthetic Reverb', etc.
}

export type ChallengeType = 
  | 'pitch-glide' 
  | 'frequency-sweep' 
  | 'vowel-transition' 
  | 'harmonic-analysis';

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';

export type ChallengeStatus = 'idle' | 'in_progress' | 'passed' | 'partial' | 'failed';

export interface ChallengeResult {
  status: ChallengeStatus;
  adaptationScore: number; // 0 - 100
  durationMs: number;
  verdictText: string;
  timestamp: string;
  type: ChallengeType;
}

export type VerdictChoice = 'safe' | 'uncertain' | 'block';

export interface VerdictSubmission {
  id: string;
  timestamp: string;
  verdict: VerdictChoice;
  confidence: number;
  notes: string;
  flaggedForReview: boolean;
  callerId: string;
  riskScoreAtVerdict: number;
}

export interface TTSEngineAnalysis {
  isClone: boolean;
  detectedEngine: string; // 'ElevenLabs Voice Engine v2', 'Amazon Polly Neural', etc.
  engineConfidence: number; // 0 - 100
  modelVersionAge: string; // 'Released Q4 2024'
  targetMatch: string; // 'Impersonation of Rajesh Sharma voice sample'
  artifactsDetected: string[];
}

export interface SentimentAnalysis {
  emotion: string; // 'Calm / Composed', 'Agitated / Stressed', 'Emotionally Manipulative'
  authenticityScore: number; // 0 - 100
  heartRateBpm: number;
  stressLevel: 'low' | 'moderate' | 'high';
  isManipulative: boolean;
}

export interface TranscriptKeyword {
  word: string;
  severity: 'red' | 'orange' | 'yellow';
}

export interface TranscriptLine {
  id: string;
  timestamp: string;
  speaker: 'Caller' | 'Agent' | 'AI-Coach';
  text: string;
  keywords: TranscriptKeyword[];
}

export interface AISupervisorCoach {
  recommendation: string;
  severity: 'safe' | 'warning' | 'alert';
  confidence: number;
  reason: string;
}

export interface SecurityQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  category: 'Banking' | 'Identity' | 'Recent Transaction';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AppSettings {
  theme: 'dark' | 'light';
  quality3D: 'high' | 'medium' | 'low';
  animationSpeed: number; // 50 to 150%
  textSize: number; // 80 to 150%
  showJitter: boolean;
  showShimmer: boolean;
  showFormants: boolean;
  showBreathCoupling: boolean;
  soundEnabled: boolean;
  alertVolume: number; // 0 - 100
  alertType: 'visual_sound' | 'sound_only' | 'haptic';
  highContrast: boolean;
  screenReaderAnnouncements: boolean;
  colorblindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
  largeTouchTargets: boolean;
}

export type CameraPreset = 1 | 2 | 3 | 4 | 5;

export interface ContextMenuState {
  x: number;
  y: number;
  metricKey: 'risk' | 'jitter' | 'shimmer' | 'formants' | 'breath' | 'challenge' | null;
  visible: boolean;
}
