import { pipeline, env } from '@huggingface/transformers';
import { OdysseyReportStats, ConceptItem } from '../hooks/useOdysseyReport';

if (typeof window !== 'undefined') {
  env.allowLocalModels = false;
}

export type MentorStatus = 'idle' | 'downloading' | 'ready' | 'generating' | 'error';

export interface MentorDebrief {
  verdict: string;
  priorityFocus: string;
  recommendedProject: string;
  isModelGenerated: boolean;
  modelName: string;
}

export interface OracleTutorAnswer {
  answer: string;
  isModelGenerated: boolean;
  question: string;
  timestamp: string;
}

export class AIMentorService {
  private static instance: AIMentorService;
  private generator: any = null;
  private status: MentorStatus = 'idle';
  private progress: number = 0;
  private statusMessage: string = 'Oracle AI Mentor ready (Instant mode active)';
  private listeners: Set<() => void> = new Set();
  private modelName = 'onnx-community/Qwen2.5-0.5B-Instruct';

  private constructor() {}

  public static getInstance(): AIMentorService {
    if (!AIMentorService.instance) {
      AIMentorService.instance = new AIMentorService();
    }
    return AIMentorService.instance;
  }

  public getStatus() {
    return {
      status: this.status,
      progress: this.progress,
      statusMessage: this.statusMessage,
      modelName: this.modelName
    };
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  // Pre-load the instruction-tuned lightweight model on demand
  public async loadModel(): Promise<void> {
    if (this.generator) return;
    if (this.status === 'downloading') return;

    this.status = 'downloading';
    this.progress = 10;
    this.statusMessage = 'Connecting to Hugging Face CDN for Qwen2.5-0.5B...';
    this.notify();

    try {
      this.generator = await pipeline('text-generation', this.modelName, {
        dtype: 'q4',
        progress_callback: (data: any) => {
          if (data.status === 'progress' && data.progress !== undefined) {
            this.progress = Math.min(99, Math.round(data.progress));
            this.statusMessage = `Downloading Oracle Neural Core (${this.progress}%)...`;
            this.notify();
          }
        }
      });

      this.status = 'ready';
      this.progress = 100;
      this.statusMessage = 'Oracle Neural Core Active (In-Browser Qwen2.5-0.5B)';
      this.notify();
    } catch (err) {
      console.warn('AI Mentor using high-fidelity local synthesis:', err);
      this.status = 'ready';
      this.statusMessage = 'Oracle High-Fidelity Synthesis Active (Fast deterministic engine)';
      this.notify();
    }
  }

  // --- 1. Deterministic Fast Template Debrief ---
  // Guaranteed immediate zero-latency rendering grounded in genuine telemetry
  public generateDeterministicDebrief(report: OdysseyReportStats): MentorDebrief {
    const s1 = report.strongestConcepts[0]?.title || 'Statistical Inference';
    const s2 = report.strongestConcepts[1]?.title || 'Neural Representation';
    const w1 = report.weakestConcepts[0];
    const profile = report.learningProfile;

    // 1. Voyage Verdict
    let verdict = `Navigator, your journey across the Archipelago yielded a ${report.masteryPct}% mastery index, earning the designation of ${report.rankTitle}. `;
    if (profile.archetype === 'Precision Sprinter') {
      verdict += `Your ${profile.firstTryRate}% first-try success rate and rapid ${profile.avgZoneTimeSec}s average checkpoint convergence demonstrate sharp analytical intuition. You swiftly bypassed local minima and localized target solutions with minimal parameter hunting.`;
    } else if (profile.archetype === 'Resilient Debugger') {
      verdict += `Your persistence stands out: even when encountering multi-attempt checkpoints, you methodically revised hypotheses, achieving a ${profile.bossTrialResilience}% success rating on high-stakes Boss Trials. You do not panic under distribution shift.`;
    } else if (profile.archetype === 'Methodical Explorer') {
      verdict += `You took an exhaustive, deliberate approach across all ${report.completedZones} checkpoints, investing time to inspect weight curves, feature maps, and loss landscapes thoroughly before confirming gate verifications.`;
    } else {
      verdict += `Your progression across supervised modeling, vision feature maps, self-attention routing, and policy iteration shows well-rounded algorithmic adaptability with strong conceptual retention.`;
    }

    // 2. Priority Focus Area
    let priorityFocus = '';
    if (w1) {
      priorityFocus = `Your primary growth area is in "${w1.title}" (${w1.islandTitle}), where you took ${w1.attempts} verification attempts. ${w1.misconceptionTested} To solidify this concept: ${w1.remediationCue}`;
    } else {
      priorityFocus = `All completed zones achieved immediate convergence with no severe parameter variance detected. For further advancement, investigate how high-dimensional state representations scale when deployed under distributed asynchronous parallel workers.`;
    }

    // 3. Recommended Capstone Project
    let recommendedProject = '';
    if (s1.includes('Token') || s1.includes('Embedding') || s1.includes('Attention') || s1.includes('Transformer')) {
      if (s2.includes('Segmentation') || s2.includes('Tensors') || s2.includes('Detection') || s2.includes('CLIP')) {
        recommendedProject = `Build an "Autonomous Multimodal Maritime Reconnaissance Drone": Marry your mastery in "${s1}" with "${s2}" by deploying a CLIP-guided zero-shot visual detector paired with an on-device local SLM that answers tactical radio queries regarding ocean hazards in real time.`;
      } else if (s2.includes('Bandit') || s2.includes('Bellman') || s2.includes('CartPole') || s2.includes('Policy')) {
        recommendedProject = `Develop an "RLHF Guided Narrative Agent": Synthesize your high proficiency in "${s1}" with "${s2}" by implementing a Policy Gradient / PPO alignment loop that optimizes text generation rewards using human preference pairwise rankings.`;
      } else {
        recommendedProject = `Engineer a "Semantic Hybrid Retrieval Engine": Combine dense vector hyperspheres (${s1}) with cross-encoder re-ranking and subword tokenization to index thousands of maritime navigational logs with zero hallucinations.`;
      }
    } else if (s1.includes('Segmentation') || s1.includes('Detection') || s1.includes('Kernel') || s1.includes('Vision')) {
      if (s2.includes('Bandit') || s2.includes('Bellman') || s2.includes('CartPole') || s2.includes('Policy')) {
        recommendedProject = `Construct a "Vision-Based Deep RL Obstacle Avoidance Vessel": Combine spatial feature extraction (${s1}) with continuous Actor-Critic policy gradients (${s2}) to navigate an autonomous craft through narrow reef archipelagoes at 60fps.`;
      } else {
        recommendedProject = `Deploy a "Real-Time Edge Multi-Object Segmenter": Optimize lightweight Vision Transformers (${s1}) with dynamic quantization and data augmentation pipelines (${s2}) capable of segmenting live webcam streams in browser WebAssembly.`;
      }
    } else {
      recommendedProject = `Implement an "Adaptive Auto-Calibrating Decision Core": Fuse your strong foundation in "${s1}" with regularized gradient optimization from "${s2}" to predict fluctuating oceanic currents while self-tuning hyperparameters during active deployment.`;
    }

    return {
      verdict,
      priorityFocus,
      recommendedProject,
      isModelGenerated: false,
      modelName: 'Odyssey Deterministic Synthesis'
    };
  }

  // --- 2. Live In-Browser Neural Model Generation ---
  public async generateNeuralDebrief(report: OdysseyReportStats): Promise<MentorDebrief> {
    const fallback = this.generateDeterministicDebrief(report);
    if (!this.generator) {
      await this.loadModel();
    }
    if (!this.generator) {
      return fallback;
    }

    this.status = 'generating';
    this.statusMessage = 'Synthesizing personalized neural critique in browser...';
    this.notify();

    try {
      const prompt = `You are the Oracle of Odyssey, an encouraging expert AI mentor debriefing a student navigator.
Student Telemetry:
- Mastery Score: ${report.masteryPct}% (${report.rankTitle})
- Learning Style: ${report.learningProfile.archetype} (${report.learningProfile.tagline})
- Top Strengths: ${report.strongestConcepts.map((c) => c.title).join(', ')}
- Primary Growth Area: ${report.weakestConcepts[0]?.title || 'None'} (Misconception: ${report.weakestConcepts[0]?.misconceptionTested || 'None'})

Write a concise 3-part debrief. Respond strictly with:
VERDICT: (2-3 sentences on what stood out in their voyage)
FOCUS: (2 sentences explaining their growth area and a 3-step mental model)
PROJECT: (1-2 sentences proposing a capstone AI project combining their top 2 strengths)
`;

      const output = await this.generator(prompt, {
        max_new_tokens: 180,
        temperature: 0.7,
        do_sample: true,
        top_k: 40
      });

      const generatedText = output[0]?.generated_text || '';
      const reply = generatedText.slice(prompt.length).trim();

      // Parse structured sections
      let verdict = fallback.verdict;
      let focus = fallback.priorityFocus;
      let project = fallback.recommendedProject;

      if (reply.includes('VERDICT:') && reply.includes('FOCUS:')) {
        const verdictMatch = reply.match(/VERDICT:\s*([\s\S]*?)(?=FOCUS:|$)/i);
        const focusMatch = reply.match(/FOCUS:\s*([\s\S]*?)(?=PROJECT:|$)/i);
        const projectMatch = reply.match(/PROJECT:\s*([\s\S]*?)$/i);

        if (verdictMatch && verdictMatch[1].trim()) verdict = verdictMatch[1].trim();
        if (focusMatch && focusMatch[1].trim()) focus = focusMatch[1].trim();
        if (projectMatch && projectMatch[1].trim()) project = projectMatch[1].trim();
      }

      this.status = 'ready';
      this.statusMessage = 'Oracle Neural Core Active';
      this.notify();

      return {
        verdict,
        priorityFocus: focus,
        recommendedProject: project,
        isModelGenerated: true,
        modelName: this.modelName
      };
    } catch (err) {
      console.warn('Neural generation error, returning calibrated template:', err);
      this.status = 'ready';
      this.notify();
      return fallback;
    }
  }

  // --- 3. Interactive "Ask the Oracle" Weak-Concept Tutor ---
  public async askOracleTutor(
    question: string,
    report: OdysseyReportStats,
    targetConcept?: ConceptItem
  ): Promise<OracleTutorAnswer> {
    const concept = targetConcept || report.weakestConcepts[0] || report.strongestConcepts[0];

    // High-quality contextual deterministic answer
    let answer = '';
    const qLower = question.toLowerCase();

    if (qLower.includes('struggle') || qLower.includes('why') || qLower.includes('mental model')) {
      answer = `You encountered friction on "${concept?.title || 'this trial'}" primarily because of: ${concept?.misconceptionTested || 'parameter boundary variance'}.
Here is a 3-step mental model to master this permanently:
1. Ground the Objective: Identify whether the loss gradient rewards classification accuracy, residual minimization, or cumulative return.
2. Observe the Divergence: ${concept?.remediationCue || 'Check cross-validation loss versus training loss to detect generalization collapse.'}
3. Apply Targeted Invariance: Ensure your hyperparameter tuning preserves inductive bias (e.g., using ReLU for non-saturating gradients or IoU over raw pixel accuracy under severe class imbalance).`;
    } else if (qLower.includes('combine') || qLower.includes('production') || qLower.includes('project')) {
      const s1 = report.strongestConcepts[0]?.title || 'Visual Feature Extraction';
      const s2 = report.strongestConcepts[1]?.title || 'Policy Optimization';
      answer = `In production architectures, combining "${s1}" and "${s2}" follows a decoupled two-stage pipeline:
1. Feature Encoding Head: Use the pre-trained weights from ${s1} as a frozen backbone to extract dense spatial or contextual embeddings without re-training from scratch.
2. Downstream Controller / Policy Head: Feed those normalized vectors into a lightweight ${s2} head trained with Adam or PPO.
This eliminates catastrophic forgetting while running inference at under 15ms per sample.`;
    } else if (qLower.includes('geometric') || qLower.includes('intuitive') || qLower.includes('visualize')) {
      answer = `Geometrically, think of "${concept?.title || 'this domain'}" as an optimization landscape:
- The parameter weights define coordinates on a high-dimensional loss manifold.
- ${concept?.coreConcept || 'The objective is finding the global minimum without falling into local valleys.'}
- When validation error rises while training loss plummets, your model is memorizing noise spikes rather than tracing the underlying manifold contour. Regularize to smooth the surface!`;
    } else {
      answer = `Regarding "${question}": In the context of ${concept?.title || 'AI system architecture'}, remember: ${concept?.coreConcept || 'Model capacity must match distribution complexity.'} ${concept?.remediationCue || 'Focus on holdout validation performance rather than training loss.'}`;
    }

    // Try model generation if ready
    if (this.generator && this.status === 'ready') {
      try {
        const prompt = `You are the Oracle AI tutor for Odyssey. Answer this question concisely for the student based on their telemetry:
Question: "${question}"
Target Domain: ${concept?.title}
Tested Concept: ${concept?.coreConcept}
Misconception: ${concept?.misconceptionTested}
Remediation: ${concept?.remediationCue}

Provide an encouraging, clear pedagogical answer with numbered steps:`;

        const output = await this.generator(prompt, {
          max_new_tokens: 180,
          temperature: 0.6
        });
        const gen = output[0]?.generated_text || '';
        const neuralReply = gen.slice(prompt.length).trim();
        if (neuralReply.length > 30) {
          return {
            answer: neuralReply,
            isModelGenerated: true,
            question,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
      } catch (e) {
        console.warn('Neural tutor generation fallback:', e);
      }
    }

    return {
      answer,
      isModelGenerated: false,
      question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }
}
