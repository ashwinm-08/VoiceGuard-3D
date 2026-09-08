import modelData from './bharatMindWeights.json';
import { MetricHistoryPoint, CallerInfo, TTSEngineAnalysis, SentimentAnalysis, AISupervisorCoach } from '../../types';

export interface BharatMindInferenceResult {
  query: string;
  intent: string;
  confidence: number;
  explanation: string;
  suggestedAction?: {
    type: 'trigger_challenge' | 'verdict_block' | 'verdict_safe' | 'change_mode' | 'inspect_metric' | 'purge_privacy' | 'call_action' | 'open_knowledge' | 'switch_scenario';
    payload?: any;
    label: string;
  };
  reasoning: string[];
}

interface ModelWeights {
  modelName: string;
  architecture: string;
  trainedAt: string;
  datasetSize: number;
  vocabSize: number;
  numClasses: number;
  vocab: Record<string, number>;
  intents: string[];
  weights: number[][];
  bias: number[];
}

const model = modelData as unknown as ModelWeights;

function tokenize(str: string): string[] {
  return str.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
}

export class BharatMindAgent {
  public static modelName = model.modelName;
  public static architecture = model.architecture;
  public static trainedAt = model.trainedAt;

  public static predictIntent(query: string): { intent: string; confidence: number; topIntents: { intent: string; prob: number }[] } {
    const tokens = tokenize(query);
    const vec = new Float64Array(model.vocabSize).fill(0);
    tokens.forEach((t) => {
      const id = model.vocab[t] || 0;
      vec[id] += 1.0;
    });
    let norm = 0;
    for (let j = 0; j < model.vocabSize; j++) norm += vec[j] * vec[j];
    norm = Math.sqrt(norm) || 1;
    for (let j = 0; j < model.vocabSize; j++) vec[j] /= norm;

    const logits = new Float64Array(model.numClasses);
    let maxLogit = -Infinity;
    for (let c = 0; c < model.numClasses; c++) {
      let sum = model.bias[c];
      for (let j = 0; j < model.vocabSize; j++) {
        sum += model.weights[c][j] * vec[j];
      }
      logits[c] = sum;
      if (sum > maxLogit) maxLogit = sum;
    }

    let sumExp = 0;
    const probs = new Float64Array(model.numClasses);
    for (let c = 0; c < model.numClasses; c++) {
      probs[c] = Math.exp(logits[c] - maxLogit);
      sumExp += probs[c];
    }
    for (let c = 0; c < model.numClasses; c++) {
      probs[c] /= sumExp;
    }

    const intentProbList = model.intents.map((intent, idx) => ({
      intent,
      prob: probs[idx],
    })).sort((a, b) => b.prob - a.prob);

    return {
      intent: intentProbList[0]?.intent || 'explain_risk',
      confidence: intentProbList[0]?.prob || 0.5,
      topIntents: intentProbList.slice(0, 3),
    };
  }

  public static processQuery(
    query: string,
    context: {
      metrics: MetricHistoryPoint;
      caller: CallerInfo;
      tts: TTSEngineAnalysis;
      sentiment: SentimentAnalysis;
      coach: AISupervisorCoach;
    }
  ): BharatMindInferenceResult {
    const { intent, confidence } = this.predictIntent(query);
    const confPct = (confidence * 100).toFixed(1);

    const result: BharatMindInferenceResult = {
      query,
      intent,
      confidence,
      explanation: '',
      reasoning: [
        `Local BharatMind Model Inference: Classified intent as '${intent}' with ${confPct}% certainty.`,
        `Acoustic Telemetry: Jitter=${context.metrics.jitter.toFixed(2)}%, Shimmer=${context.metrics.shimmer.toFixed(2)}dB, Composite Risk=${context.metrics.riskScore}.`,
        `Caller Details: ${context.caller.name} (${context.caller.id}), Latency: ${context.caller.latencyMs}ms.`
      ]
    };

    switch (intent) {
      case 'trigger_challenge':
        result.explanation = `I determined you want to challenge the caller's acoustic liveness. Synthetic clones created via ${context.tts.detectedEngine} cannot sustain continuous micro-pitch variations. Initiating a dynamic acoustic probe will reveal phase discontinuities instantly.`;
        result.suggestedAction = {
          type: 'trigger_challenge',
          payload: { probeType: 'pitch-glide', difficulty: 'medium' },
          label: 'Run Pitch-Glide Acoustic Probe'
        };
        break;

      case 'verdict_block':
        result.explanation = `I determined you want to block this call immediately. With a risk score of ${context.metrics.riskScore}/100 and ${context.tts.engineConfidence}% probability of synthetic ${context.tts.detectedEngine} spoofing, immediate termination is recommended.`;
        result.suggestedAction = {
          type: 'verdict_block',
          payload: { reason: 'BharatMind automated neural defense block' },
          label: 'Execute Emergency Block & Ban'
        };
        break;

      case 'verdict_safe':
        result.explanation = `I determined you want to mark this caller as verified human. Current risk is ${context.metrics.riskScore}. Ensure secondary knowledge questions pass before final release.`;
        result.suggestedAction = {
          type: 'verdict_safe',
          payload: { reason: 'Verified human voice' },
          label: 'Approve & Mark Call Safe'
        };
        break;

      case 'change_mode_dna':
        result.explanation = `I determined you want to switch to the 3D Voice Signature DNA Helix view to inspect acoustic strand continuity.`;
        result.suggestedAction = { type: 'change_mode', payload: 'dna-helix', label: 'Switch to DNA Helix 3D' };
        break;

      case 'change_mode_freq':
        result.explanation = `I determined you want to view the 3D Frequency Heatmap Tower to examine vertical frequency energy distribution.`;
        result.suggestedAction = { type: 'change_mode', payload: 'frequency-tower', label: 'Switch to Frequency Tower 3D' };
        break;

      case 'change_mode_neural':
        result.explanation = `I determined you want to observe Neural Confidence Flow to track real-time probability routing.`;
        result.suggestedAction = { type: 'change_mode', payload: 'neural-network', label: 'Switch to Neural Flow 3D' };
        break;

      case 'change_mode_fraud':
        result.explanation = `I determined you want to inspect Fraud Syndicate Ring connections and linked spoofed callers.`;
        result.suggestedAction = { type: 'change_mode', payload: 'fraud-ring', label: 'Switch to Fraud Ring 3D' };
        break;

      case 'change_mode_biometrics':
        result.explanation = `I determined you want to return to the core 3D Holographic Biometric Orb.`;
        result.suggestedAction = { type: 'change_mode', payload: 'biometrics', label: 'Switch to Hologram 3D' };
        break;

      case 'inspect_jitter':
        result.explanation = `I determined you want to inspect Jitter. Current frequency perturbation is ${context.metrics.jitter.toFixed(2)}% (${context.metrics.jitter > 3.5 ? 'CRITICAL SYNTHETIC CUT' : 'NATURAL VARIATION'}).`;
        result.suggestedAction = { type: 'inspect_metric', payload: 'jitter', label: 'Open Jitter Modal' };
        break;

      case 'inspect_shimmer':
        result.explanation = `I determined you want to inspect Shimmer. Current amplitude fluctuation is ${context.metrics.shimmer.toFixed(2)} dB.`;
        result.suggestedAction = { type: 'inspect_metric', payload: 'shimmer', label: 'Open Shimmer Modal' };
        break;

      case 'inspect_formants':
        result.explanation = `I determined you want to inspect Formants (vocal tract resonance). Current vowel cluster is categorized as '${context.metrics.vowelZone}'.`;
        result.suggestedAction = { type: 'inspect_metric', payload: 'formants', label: 'Open Formant Modal' };
        break;

      case 'inspect_breath':
        result.explanation = `I determined you want to check breath coupling. Current subglottic coupling score is ${(context.metrics.couplingScore * 100).toFixed(0)}%.`;
        result.suggestedAction = { type: 'inspect_metric', payload: 'breath', label: 'Open Breath Modal' };
        break;

      case 'explain_risk':
        result.explanation = `Current Composite Risk Score is ${context.metrics.riskScore}/100. Tactical Recommendation: ${context.coach.recommendation}`;
        result.suggestedAction = { type: 'inspect_metric', payload: 'risk', label: 'Open Risk Details' };
        break;

      case 'call_hold':
        result.explanation = `I determined you want to place this call on hold for supervisor verification.`;
        result.suggestedAction = { type: 'call_action', payload: 'hold', label: 'Toggle Call Hold' };
        break;

      case 'call_mute':
        result.explanation = `I determined you want to mute your operator microphone.`;
        result.suggestedAction = { type: 'call_action', payload: 'mute', label: 'Toggle Mute' };
        break;

      case 'call_transfer':
        result.explanation = `I determined you want to escalate and transfer this call to a fraud supervisor.`;
        result.suggestedAction = { type: 'call_action', payload: 'transfer', label: 'Transfer Call' };
        break;

      case 'purge_privacy':
        result.explanation = `I determined you want to trigger an immediate cryptographic purge of all biometric buffers.`;
        result.suggestedAction = { type: 'purge_privacy', label: 'Purge Biometrics Now' };
        break;

      case 'open_knowledge':
        result.explanation = `I determined you want to trigger out-of-band security knowledge questions to challenge caller identity.`;
        result.suggestedAction = { type: 'open_knowledge', label: 'Open Knowledge Challenge' };
        break;

      case 'switch_scenario_safe':
        result.explanation = `I determined you want to simulate a verified human caller scenario.`;
        result.suggestedAction = { type: 'switch_scenario', payload: 'safe', label: 'Simulate Safe Scenario' };
        break;

      case 'switch_scenario_borderline':
        result.explanation = `I determined you want to simulate a borderline jitter caller scenario.`;
        result.suggestedAction = { type: 'switch_scenario', payload: 'borderline', label: 'Simulate Borderline' };
        break;

      case 'switch_scenario_deepfake':
        result.explanation = `I determined you want to simulate an AI voice clone deepfake attack.`;
        result.suggestedAction = { type: 'switch_scenario', payload: 'deepfake', label: 'Simulate Clone Attack' };
        break;

      default:
        result.explanation = `BharatMind determined your intent based on acoustic patterns. Recommendation: ${context.coach.recommendation}`;
        result.suggestedAction = { type: 'trigger_challenge', payload: { probeType: 'pitch-glide', difficulty: 'medium' }, label: 'Run Acoustic Challenge' };
        break;
    }

    return result;
  }
}
